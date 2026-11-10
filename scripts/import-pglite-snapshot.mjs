import { createHash } from "node:crypto";
import { readFile } from "node:fs/promises";
import path from "node:path";
import pg from "pg";

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
const jsonColumns = new Set(["images", "technical_characteristics", "variants", "personalization_options"]);
const sha256 = (value) => createHash("sha256").update(value).digest("hex");

function canonical(value) {
  if (value instanceof Date) return value.toISOString();
  if (Array.isArray(value)) return value.map(canonical);
  if (value && typeof value === "object") {
    return Object.fromEntries(Object.keys(value).sort().map((key) => [key, canonical(value[key])]));
  }
  return value;
}

async function loadSnapshot(directory) {
  const [manifestBytes, dataBytes, physicalBytes] = await Promise.all([
    readFile(path.join(directory, "manifest.json")),
    readFile(path.join(directory, "legacy-data.json")),
    readFile(path.join(directory, "pglite-data.tar.gz")),
  ]);
  const manifest = JSON.parse(manifestBytes.toString("utf8"));
  const data = JSON.parse(dataBytes.toString("utf8"));
  if (manifest.format !== 1 || data.format !== 1 || manifest.restored !== true ||
      sha256(dataBytes) !== manifest.logicalSha256 || sha256(physicalBytes) !== manifest.physicalSha256) {
    throw new Error("Snapshot incompleto ou hashes divergentes.");
  }
  for (const [table] of tables) {
    if (!Array.isArray(data.tables?.[table]) || data.tables[table].length !== manifest.counts?.[table]) {
      throw new Error(`Contagem divergente no snapshot: ${table}`);
    }
  }
  if (Object.keys(data.tables).length !== tables.length) throw new Error("O snapshot contém tabelas inesperadas.");
  if (manifest.purchaseSeedSha256) {
    const seedBytes = await readFile(path.join(directory, "inspire3d-purchases.json"));
    if (sha256(seedBytes) !== manifest.purchaseSeedSha256) throw new Error("Histórico privado de compras divergente.");
  }
  return { manifest, data };
}

async function readTargetRows(client, table, orderBy) {
  const columns = await client.query(
    "SELECT column_name, data_type FROM information_schema.columns WHERE table_schema='public' AND table_name=$1 ORDER BY ordinal_position",
    [table],
  );
  const projection = columns.rows.map((row) => row.data_type === "timestamp with time zone"
    ? `"${row.column_name}"::text AS "${row.column_name}"`
    : `"${row.column_name}"`).join(",");
  return (await client.query(`SELECT ${projection} FROM "${table}" ORDER BY ${orderBy}`)).rows;
}

async function importRows(client, table, rows) {
  if (!rows.length) return;
  const columns = Object.keys(rows[0]);
  if (!columns.length || columns.some((column) => !/^[a-z_]+$/.test(column))) {
    throw new Error(`Colunas inválidas em ${table}.`);
  }
  const targetColumns = await client.query(
    "SELECT column_name FROM information_schema.columns WHERE table_schema='public' AND table_name=$1",
    [table],
  );
  const allowed = new Set(targetColumns.rows.map((row) => row.column_name));
  if (columns.some((column) => !allowed.has(column))) throw new Error(`Colunas de ${table} não correspondem ao destino.`);
  const fields = columns.map((column) => `"${column}"`).join(",");
  const placeholders = columns.map((_, index) => `$${index + 1}`).join(",");
  for (const row of rows) {
    if (Object.keys(row).length !== columns.length || columns.some((column) => !(column in row))) {
      throw new Error(`Linha irregular em ${table}.`);
    }
    const values = columns.map((column) => jsonColumns.has(column) ? JSON.stringify(row[column]) : row[column]);
    await client.query(`INSERT INTO "${table}" (${fields}) VALUES (${placeholders})`, values);
  }
}

async function main() {
  const snapshotIndex = process.argv.indexOf("--snapshot");
  if (snapshotIndex < 0 || !process.argv[snapshotIndex + 1]) {
    throw new Error("Informe --snapshot com o diretório do backup validado.");
  }
  const directory = path.resolve(process.argv[snapshotIndex + 1]);
  const { manifest, data } = await loadSnapshot(directory);
  if (!process.argv.includes("--apply")) {
    console.log(JSON.stringify({ checked: true, snapshot: directory, counts: manifest.counts }, null, 2));
    return;
  }
  const connectionString = process.env.MIGRATION_TARGET_DATABASE_URL;
  if (!connectionString) throw new Error("MIGRATION_TARGET_DATABASE_URL é obrigatória para --apply.");

  const client = new pg.Client({ connectionString });
  await client.connect();
  try {
    await client.query("BEGIN ISOLATION LEVEL SERIALIZABLE");
    await client.query("SELECT pg_advisory_xact_lock(273003001)");
    await client.query("SET LOCAL TIME ZONE 'UTC'");
    await client.query("SET LOCAL DateStyle = 'ISO, MDY'");
    const baseline = await client.query(
      "SELECT 1 FROM _prisma_migrations WHERE migration_name=$1 AND finished_at IS NOT NULL AND rolled_back_at IS NULL",
      ["0_legacy_baseline"],
    );
    if (baseline.rowCount !== 1) throw new Error("Aplique primeiro o baseline Prisma em um PostgreSQL vazio.");

    for (const [table] of tables) {
      const count = await client.query(`SELECT COUNT(*)::int AS count FROM "${table}"`);
      if (count.rows[0].count !== 0) throw new Error(`Destino não vazio: ${table}.`);
    }
    for (const [table] of tables) await importRows(client, table, data.tables[table]);
    for (const [table, orderBy] of tables) {
      const rows = await readTargetRows(client, table, orderBy);
      if (JSON.stringify(canonical(rows)) !== JSON.stringify(canonical(data.tables[table]))) {
        throw new Error(`Reconciliação falhou em ${table}.`);
      }
    }
    await client.query("COMMIT");
    console.log(JSON.stringify({ imported: true, counts: manifest.counts }, null, 2));
  } catch (error) {
    await client.query("ROLLBACK").catch(() => {});
    throw error;
  } finally {
    await client.end();
  }
}

main().catch((error) => {
  console.error(error.message);
  process.exitCode = 1;
});
