import { randomBytes } from "node:crypto";
import { spawn } from "node:child_process";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";

const project = "31b64860-f2a3-43ce-be2d-a8261a441d72";
const service = "inspire3d-web";
const environment = "staging";
const credentialPath = path.resolve(".data/railway-staging-admin.json");
const railway = process.env.RAILWAY_CLI_PATH || (process.platform === "win32"
  ? path.join(process.env.APPDATA || "", "npm", "node_modules", "@railway", "cli", "bin", "railway.exe")
  : "railway");

async function credentials() {
  try {
    return JSON.parse(await readFile(credentialPath, "utf8"));
  } catch (error) {
    if (error.code !== "ENOENT") throw error;
    const result = {
      email: "admin-staging@inspire3d.local",
      password: randomBytes(24).toString("base64url"),
      sessionSecret: randomBytes(48).toString("base64url"),
    };
    await mkdir(path.dirname(credentialPath), { recursive: true });
    await writeFile(credentialPath, JSON.stringify(result, null, 2), { flag: "wx", mode: 0o600 });
    return result;
  }
}

async function setVariable(key, value) {
  await new Promise((resolve, reject) => {
    const child = spawn(railway, ["variable", "set", "--project", project, "--environment", environment,
      "--service", service, "--skip-deploys", "--stdin", key], { stdio: ["pipe", "pipe", "pipe"] });
    let output = "";
    child.stdout.on("data", (chunk) => { output += chunk; });
    child.stderr.on("data", (chunk) => { output += chunk; });
    child.on("error", reject);
    child.on("exit", (code) => code === 0 ? resolve() : reject(new Error(`Falha ao definir ${key}: ${output.slice(-600)}`)));
    child.stdin.end(value);
  });
  console.log(`${key}: definido`);
}

async function main() {
  const admin = await credentials();
  const variables = {
    DATABASE_URL: "${{Postgres.DATABASE_URL}}",
    DATABASE_SSL: "true",
    ADMIN_EMAIL: admin.email,
    ADMIN_PASSWORD: admin.password,
    ADMIN_SESSION_SECRET: admin.sessionSecret,
    NEXT_PUBLIC_SITE_URL: "https://${{RAILWAY_PUBLIC_DOMAIN}}",
  };
  for (const [key, value] of Object.entries(variables)) await setVariable(key, value);
  console.log(`Credenciais de staging guardadas localmente em ${credentialPath}`);
}

main().catch((error) => {
  console.error(error.message);
  process.exitCode = 1;
});
