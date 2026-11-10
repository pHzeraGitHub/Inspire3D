import { spawn } from "node:child_process";
import { existsSync } from "node:fs";
import path from "node:path";
import { setTimeout as delay } from "node:timers/promises";
import pg from "pg";

const projectIndex = process.argv.indexOf("--project");
const snapshotIndex = process.argv.indexOf("--snapshot");
const project = projectIndex < 0 ? null : process.argv[projectIndex + 1];
const snapshot = snapshotIndex < 0 ? null : process.argv[snapshotIndex + 1];
const environment = process.argv.includes("--environment")
  ? process.argv[process.argv.indexOf("--environment") + 1]
  : "staging";
if (!project || project.startsWith("--") || !snapshot || snapshot.startsWith("--")) {
  throw new Error("Informe --project ID --snapshot DIRETORIO [--environment staging].");
}
const snapshotPath = path.resolve(snapshot);
if (!existsSync(path.join(snapshotPath, "manifest.json"))) throw new Error("Snapshot não encontrado.");

const railway = process.env.RAILWAY_CLI_PATH || (process.platform === "win32"
  ? path.join(process.env.APPDATA || "", "npm", "node_modules", "@railway", "cli", "bin", "railway.exe")
  : "railway");
const cli = process.execPath;
const prisma = path.resolve("node_modules/prisma/build/index.js");
const importer = path.resolve("scripts/import-pglite-snapshot.mjs");

function run(command, args, environmentVariables) {
  return new Promise((resolve, reject) => {
    const child = spawn(command, args, { cwd: process.cwd(), env: environmentVariables, stdio: ["ignore", "pipe", "pipe"] });
    let output = "";
    child.stdout.on("data", (chunk) => { output += chunk; });
    child.stderr.on("data", (chunk) => { output += chunk; });
    child.on("error", reject);
    child.on("exit", (code) => code === 0 ? resolve(output) : reject(new Error(`${path.basename(command)} falhou (código ${code}): ${output.slice(-1500)}`)));
  });
}

function clean(value) {
  return value.replace(/\x1b\[[0-9;]*m/g, "").replace(/\x1b\][^\x07]*\x07/g, "");
}

async function waitForTunnel(child) {
  let output = "";
  let exited = false;
  let failure;
  child.on("error", (error) => { failure = error; });
  child.on("exit", () => { exited = true; });
  child.stdout.on("data", (chunk) => { output += chunk; });
  child.stderr.on("data", (chunk) => { output += chunk; });
  for (let attempt = 0; attempt < 100; attempt++) {
    if (failure) throw failure;
    const match = clean(output).match(/postgres(?:ql)?:\/\/[^\s"'<>]+/i);
    if (match) {
      const url = new URL(match[0]);
      if (!["localhost", "127.0.0.1", "[::1]"].includes(url.hostname)) {
        throw new Error("A URL do túnel não aponta para esta máquina.");
      }
      if (!url.port) throw new Error("A URL do túnel não contém uma porta local.");
      return url.toString();
    }
    if (exited) throw new Error(`Túnel SSH encerrou antes de conectar: ${clean(output).replace(/postgres(?:ql)?:\/\/\S+/gi, "[URL removida]").slice(-600)}`);
    await delay(300);
  }
  throw new Error("Túnel SSH não ficou pronto em 30 segundos.");
}

async function main() {
  const tunnel = spawn(railway, ["connect", "Postgres", "--tunnel-only", "--project", project, "--environment", environment], {
    cwd: process.cwd(), env: process.env, stdio: ["ignore", "pipe", "pipe"],
  });
  try {
    const url = await waitForTunnel(tunnel);
    const database = new pg.Client({ connectionString: url });
    await database.connect();
    try {
      const result = await database.query("SELECT COUNT(*)::int AS count FROM information_schema.tables WHERE table_schema='public'");
      if (result.rows[0].count !== 0) throw new Error("Destino não está vazio; migração cancelada.");
    } finally {
      await database.end();
    }
    console.log("Túnel privado ativo; PostgreSQL vazio confirmado.");
    const prismaOutput = await run(cli, [prisma, "migrate", "deploy"], { ...process.env, DATABASE_URL: url });
    console.log(prismaOutput.replaceAll(url, "[URL removida]").trim());
    const importOutput = await run(cli, [importer, "--snapshot", snapshotPath, "--apply"], {
      ...process.env, MIGRATION_TARGET_DATABASE_URL: url,
    });
    console.log(importOutput.replaceAll(url, "[URL removida]").trim());
  } finally {
    tunnel.kill();
    tunnel.stdout.destroy();
    tunnel.stderr.destroy();
    tunnel.unref();
  }
}

main().catch((error) => {
  console.error(error.message.replace(/postgres(?:ql)?:\/\/\S+/gi, "[URL removida]"));
  process.exitCode = 1;
});
