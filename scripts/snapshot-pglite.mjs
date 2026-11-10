import { createHash } from "node:crypto";
import { mkdir, readFile, rename, rm, stat, writeFile } from "node:fs/promises";
import path from "node:path";
import { PGlite } from "@electric-sql/pglite";

const tables = [
  ["inventory_materials", "id"],
  ["products", "id"],
  ["sales", "id"],
  ["inventory_purchases", "id"],
  ["product_materials", "product_id, material_id"],
  ["inventory_movements", "id"],
  ["sale_items", "id"],
  ["production_runs", "id"],
  ["finished_stock_movements", "id"],
];

const sha256 = (value) => createHash("sha256").update(value).digest("hex");
const source = path.resolve(process.env.PGLITE_DATA_DIR || ".data/inspire3d");
const backupRoot = path.resolve(".data/backups");
const stamp = new Date().toISOString().replace(/[:.]/g, "-");
const destination = path.join(backupRoot, `pglite-${stamp}`);
const staging = `${destination}.partial`;

function insideBackupRoot(target) {
  const relative = path.relative(backupRoot, target);
  return relative !== "" && relative !== ".." && !relative.startsWith(`..${path.sep}`) && !path.isAbsolute(relative);
}

async function readInventory(db) {
  const snapshot = { format: 1, tables: {} };
  await db.query("SET TIME ZONE 'UTC'");
  await db.query("SET DateStyle = 'ISO, MDY'");
  for (const [table, orderBy] of tables) {
    const columns = await db.query(
      "SELECT column_name, data_type FROM information_schema.columns WHERE table_schema='public' AND table_name=$1 ORDER BY ordinal_position",
      [table],
    );
    if (!columns.rows.length || columns.rows.some((row) => !/^[a-z_]+$/.test(row.column_name))) {
      throw new Error(`Esquema inesperado em ${table}.`);
    }
    const projection = columns.rows.map((row) => row.data_type === "timestamp with time zone"
      ? `"${row.column_name}"::text AS "${row.column_name}"`
      : `"${row.column_name}"`).join(",");
    const result = await db.query(`SELECT ${projection} FROM ${table} ORDER BY ${orderBy}`);
    snapshot.tables[table] = result.rows;
  }
  return snapshot;
}

async function main() {
  if (!process.argv.includes("--source-stopped")) {
    throw new Error("Pare o servidor que usa este PGlite e execute com --source-stopped.");
  }
  if (!insideBackupRoot(destination) || !insideBackupRoot(staging)) {
    throw new Error("Destino de backup fora de .data/backups.");
  }
  if (!(await stat(path.join(source, "PG_VERSION")).catch(() => null))) {
    throw new Error(`PGlite não encontrado em ${source}`);
  }
  await mkdir(backupRoot, { recursive: true, mode: 0o700 });
  await mkdir(staging, { mode: 0o700 });

  let db;
  let restored;
  try {
    db = await PGlite.create(source);
    const snapshot = await readInventory(db);
    const logicalBytes = Buffer.from(JSON.stringify(snapshot));
    const physicalBlob = await db.dumpDataDir("gzip");
    const physicalBytes = Buffer.from(await physicalBlob.arrayBuffer());
    await writeFile(path.join(staging, "legacy-data.json"), logicalBytes, { flag: "wx", mode: 0o600 });
    await writeFile(path.join(staging, "pglite-data.tar.gz"), physicalBytes, { flag: "wx", mode: 0o600 });

    const seedPath = path.resolve(".data/inspire3d-purchases.json");
    const purchaseSeed = source === path.resolve(".data/inspire3d")
      ? await readFile(seedPath).catch((error) => {
        if (error.code === "ENOENT") return null;
        throw error;
      })
      : null;
    if (purchaseSeed) {
      await writeFile(path.join(staging, "inspire3d-purchases.json"), purchaseSeed, { flag: "wx", mode: 0o600 });
    }

    restored = await PGlite.create({ loadDataDir: new Blob([physicalBytes]) });
    const restoredSnapshot = await readInventory(restored);
    const restoredBytes = Buffer.from(JSON.stringify(restoredSnapshot));
    if (sha256(logicalBytes) !== sha256(restoredBytes)) {
      throw new Error("A restauração de teste não corresponde à exportação lógica.");
    }

    const manifest = {
      format: 1,
      createdAt: new Date().toISOString(),
      source,
      logicalSha256: sha256(logicalBytes),
      physicalSha256: sha256(physicalBytes),
      purchaseSeedSha256: purchaseSeed ? sha256(purchaseSeed) : null,
      counts: Object.fromEntries(tables.map(([table]) => [table, snapshot.tables[table].length])),
      restored: true,
    };
    await writeFile(path.join(staging, "manifest.json"), JSON.stringify(manifest, null, 2), { flag: "wx", mode: 0o600 });
    await restored.close();
    restored = null;
    await db.close();
    db = null;
    await rename(staging, destination);
    console.log(JSON.stringify({ backup: destination, counts: manifest.counts, restored: true }, null, 2));
  } catch (error) {
    await restored?.close().catch(() => {});
    await db?.close().catch(() => {});
    await rm(staging, { recursive: true, force: true });
    throw error;
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
