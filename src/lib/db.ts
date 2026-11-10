import "server-only";
import { mkdir, readFile } from "node:fs/promises";
import path from "node:path";
import { PGlite } from "@electric-sql/pglite";
import { Pool, type QueryResult, type QueryResultRow } from "pg";
import { products as starterProducts } from "@/content/products";

declare global {
  var inspireDbPool: Pool | undefined;
  var inspireDbReady: Promise<void> | undefined;
  var inspireDbReadyVersion: string | undefined;
  var inspireLocalDb: Promise<PGlite> | undefined;
}

export const remoteDatabaseConfigured = Boolean(process.env.DATABASE_URL);
const SCHEMA_VERSION = "sales-v1";

type DbResult<T extends QueryResultRow = QueryResultRow> = { rows: T[]; rowCount: number | null };
export type DbExecutor = {
  query<T extends QueryResultRow = QueryResultRow>(sql: string, values?: unknown[]): Promise<DbResult<T>>;
  exec?: (sql: string) => Promise<unknown>;
};

type PurchaseSeed = {
  id: string;
  card: string;
  store: string;
  description: string;
  category: string;
  amount: number;
  installments: number;
  source: string;
};

async function readPurchaseSeed(): Promise<PurchaseSeed[]> {
  try {
    const contents = await readFile(path.join(process.cwd(), ".data", "inspire3d-purchases.json"), "utf8");
    const parsed: unknown = JSON.parse(contents);
    if (!Array.isArray(parsed)) throw new Error("O arquivo local de compras precisa conter uma lista.");
    return parsed as PurchaseSeed[];
  } catch (error) {
    if (error && typeof error === "object" && "code" in error && error.code === "ENOENT") return [];
    throw error;
  }
}

function pool() {
  if (!process.env.DATABASE_URL) throw new Error("DATABASE_URL não configurada para PostgreSQL remoto.");
  globalThis.inspireDbPool ??= new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.DATABASE_SSL === "true" ? { rejectUnauthorized: false } : undefined,
    max: 5,
    idleTimeoutMillis: 30_000,
    connectionTimeoutMillis: 8_000,
  });
  return globalThis.inspireDbPool;
}

async function localDatabase() {
  if (process.env.VERCEL) {
    throw new Error("DATABASE_URL precisa apontar para um PostgreSQL persistente na Vercel.");
  }
  const configuredPath = process.env.PGLITE_DATA_DIR || path.join(process.cwd(), ".data", "inspire3d");
  const dataDir = path.resolve(configuredPath);
  await mkdir(path.dirname(dataDir), { recursive: true });
  globalThis.inspireLocalDb ??= PGlite.create(dataDir).catch((error) => {
    globalThis.inspireLocalDb = undefined;
    throw error;
  });
  return globalThis.inspireLocalDb;
}

function localExecutor(database: PGlite): DbExecutor {
  return {
    async query<T extends QueryResultRow = QueryResultRow>(sql: string, values?: unknown[]) {
      const result = await database.query<T>(sql, values as never[] | undefined);
      return { rows: result.rows, rowCount: result.rowCount ?? null };
    },
    async exec(sql: string) {
      return database.exec(sql);
    },
  };
}

const schema = `
CREATE TABLE IF NOT EXISTS inventory_materials (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  sku TEXT UNIQUE,
  category TEXT NOT NULL,
  unit TEXT NOT NULL,
  quantity NUMERIC(14,3) NOT NULL DEFAULT 0 CHECK (quantity >= 0),
  unit_cost NUMERIC(14,4) NOT NULL DEFAULT 0 CHECK (unit_cost >= 0),
  minimum_quantity NUMERIC(14,3) NOT NULL DEFAULT 0 CHECK (minimum_quantity >= 0),
  archived BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE TABLE IF NOT EXISTS products (
  id TEXT PRIMARY KEY,
  slug TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  short_description TEXT NOT NULL,
  description TEXT NOT NULL,
  collection TEXT NOT NULL,
  category TEXT NOT NULL,
  images JSONB NOT NULL DEFAULT '[]'::jsonb,
  technical_characteristics JSONB NOT NULL DEFAULT '[]'::jsonb,
  dimensions TEXT,
  variants JSONB NOT NULL DEFAULT '[]'::jsonb,
  personalization_options JSONB NOT NULL DEFAULT '[]'::jsonb,
  price NUMERIC(12,2),
  availability TEXT NOT NULL DEFAULT 'not-announced',
  launch_status TEXT NOT NULL DEFAULT 'in-development',
  lead_time TEXT,
  estimated_labor_cost NUMERIC(12,2) NOT NULL DEFAULT 0 CHECK (estimated_labor_cost >= 0),
  estimated_energy_cost NUMERIC(12,2) NOT NULL DEFAULT 0 CHECK (estimated_energy_cost >= 0),
  estimated_packaging_cost NUMERIC(12,2) NOT NULL DEFAULT 0 CHECK (estimated_packaging_cost >= 0),
  estimated_other_cost NUMERIC(12,2) NOT NULL DEFAULT 0 CHECK (estimated_other_cost >= 0),
  estimated_tax_percent NUMERIC(6,3) NOT NULL DEFAULT 0 CHECK (estimated_tax_percent BETWEEN 0 AND 100),
  estimated_payment_fee_percent NUMERIC(6,3) NOT NULL DEFAULT 0 CHECK (estimated_payment_fee_percent BETWEEN 0 AND 100),
  featured BOOLEAN NOT NULL DEFAULT FALSE,
  published BOOLEAN NOT NULL DEFAULT FALSE,
  finished_stock NUMERIC(14,3) NOT NULL DEFAULT 0 CHECK (finished_stock >= 0),
  seo_title TEXT NOT NULL,
  seo_description TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE TABLE IF NOT EXISTS product_materials (
  product_id TEXT NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  material_id TEXT NOT NULL REFERENCES inventory_materials(id),
  quantity_per_unit NUMERIC(14,3) NOT NULL CHECK (quantity_per_unit > 0),
  PRIMARY KEY (product_id, material_id)
);
CREATE TABLE IF NOT EXISTS inventory_movements (
  id TEXT PRIMARY KEY,
  material_id TEXT NOT NULL REFERENCES inventory_materials(id),
  kind TEXT NOT NULL CHECK (kind IN ('entrada', 'saida', 'producao', 'contagem')),
  quantity_delta NUMERIC(14,3) NOT NULL,
  unit_cost NUMERIC(14,4) NOT NULL DEFAULT 0,
  product_id TEXT REFERENCES products(id),
  note TEXT NOT NULL DEFAULT '',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE TABLE IF NOT EXISTS inventory_purchases (
  id TEXT PRIMARY KEY,
  card TEXT NOT NULL,
  store TEXT NOT NULL,
  description TEXT NOT NULL,
  category TEXT NOT NULL,
  amount NUMERIC(12,2) NOT NULL,
  installments INTEGER NOT NULL,
  source TEXT NOT NULL,
  imported_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE TABLE IF NOT EXISTS sales (
  id TEXT PRIMARY KEY,
  customer_name TEXT NOT NULL,
  customer_contact TEXT NOT NULL DEFAULT '',
  channel TEXT NOT NULL CHECK (channel IN ('whatsapp', 'instagram', 'site', 'outro')),
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'confirmed', 'delivered', 'cancelled')),
  payment_status TEXT NOT NULL DEFAULT 'pending' CHECK (payment_status IN ('pending', 'paid', 'refunded')),
  payment_method TEXT NOT NULL DEFAULT '',
  subtotal NUMERIC(12,2) NOT NULL CHECK (subtotal >= 0),
  discount NUMERIC(12,2) NOT NULL DEFAULT 0 CHECK (discount >= 0),
  shipping NUMERIC(12,2) NOT NULL DEFAULT 0 CHECK (shipping >= 0),
  total NUMERIC(12,2) NOT NULL CHECK (total >= 0),
  notes TEXT NOT NULL DEFAULT '',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  confirmed_at TIMESTAMPTZ,
  delivered_at TIMESTAMPTZ,
  cancelled_at TIMESTAMPTZ
);
CREATE TABLE IF NOT EXISTS sale_items (
  id TEXT PRIMARY KEY,
  sale_id TEXT NOT NULL REFERENCES sales(id) ON DELETE CASCADE,
  product_id TEXT REFERENCES products(id),
  name_snapshot TEXT NOT NULL,
  fulfillment TEXT NOT NULL CHECK (fulfillment IN ('stock', 'made_to_order', 'custom')),
  quantity INTEGER NOT NULL CHECK (quantity > 0),
  unit_price NUMERIC(12,2) NOT NULL CHECK (unit_price >= 0),
  unit_cost_estimate NUMERIC(12,2),
  CHECK ((fulfillment = 'custom' AND product_id IS NULL) OR (fulfillment <> 'custom' AND product_id IS NOT NULL))
);
CREATE TABLE IF NOT EXISTS production_runs (
  id TEXT PRIMARY KEY,
  product_id TEXT NOT NULL REFERENCES products(id),
  quantity NUMERIC(14,3) NOT NULL CHECK (quantity > 0),
  material_cost NUMERIC(12,2) NOT NULL DEFAULT 0,
  note TEXT NOT NULL DEFAULT '',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE TABLE IF NOT EXISTS finished_stock_movements (
  id TEXT PRIMARY KEY,
  product_id TEXT NOT NULL REFERENCES products(id),
  sale_id TEXT REFERENCES sales(id),
  kind TEXT NOT NULL CHECK (kind IN ('production', 'sale')),
  quantity_delta INTEGER NOT NULL,
  note TEXT NOT NULL DEFAULT '',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS inventory_movements_created_at_idx ON inventory_movements(created_at DESC);
CREATE INDEX IF NOT EXISTS products_published_idx ON products(published, featured);
CREATE INDEX IF NOT EXISTS sales_created_at_idx ON sales(created_at DESC);
CREATE INDEX IF NOT EXISTS sales_status_idx ON sales(status);
CREATE INDEX IF NOT EXISTS sale_items_sale_idx ON sale_items(sale_id);
CREATE INDEX IF NOT EXISTS sale_items_product_idx ON sale_items(product_id);
ALTER TABLE production_runs ADD COLUMN IF NOT EXISTS sale_id TEXT REFERENCES sales(id);
ALTER TABLE products ADD COLUMN IF NOT EXISTS estimated_labor_cost NUMERIC(12,2) NOT NULL DEFAULT 0 CHECK (estimated_labor_cost >= 0);
ALTER TABLE products ADD COLUMN IF NOT EXISTS estimated_energy_cost NUMERIC(12,2) NOT NULL DEFAULT 0 CHECK (estimated_energy_cost >= 0);
ALTER TABLE products ADD COLUMN IF NOT EXISTS estimated_packaging_cost NUMERIC(12,2) NOT NULL DEFAULT 0 CHECK (estimated_packaging_cost >= 0);
ALTER TABLE products ADD COLUMN IF NOT EXISTS estimated_other_cost NUMERIC(12,2) NOT NULL DEFAULT 0 CHECK (estimated_other_cost >= 0);
ALTER TABLE products ADD COLUMN IF NOT EXISTS estimated_tax_percent NUMERIC(6,3) NOT NULL DEFAULT 0 CHECK (estimated_tax_percent BETWEEN 0 AND 100);
ALTER TABLE products ADD COLUMN IF NOT EXISTS estimated_payment_fee_percent NUMERIC(6,3) NOT NULL DEFAULT 0 CHECK (estimated_payment_fee_percent BETWEEN 0 AND 100);
`;

async function initialize(client: DbExecutor) {
  if (client.exec) await client.exec(schema);
  else await client.query(schema);

  for (const product of starterProducts) {
    await client.query(
      `INSERT INTO products
        (id, slug, name, short_description, description, collection, category, images,
         technical_characteristics, dimensions, variants, personalization_options,
         price, availability, launch_status, lead_time, featured, published, seo_title, seo_description)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8::jsonb,'[]'::jsonb,NULL,'[]'::jsonb,'[]'::jsonb,
         NULL,$9,$10,NULL,$11,TRUE,$3,$12)
       ON CONFLICT (id) DO NOTHING`,
      [
        product.id, product.slug, product.name, product.shortDescription, product.description,
        product.collection, product.category, JSON.stringify(product.images), product.availability,
        product.launchStatus, product.featured, product.seo.description,
      ],
    );
  }

  for (const purchase of await readPurchaseSeed()) {
    await client.query(
      `INSERT INTO inventory_purchases (id, card, store, description, category, amount, installments, source)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8) ON CONFLICT (id) DO NOTHING`,
      [purchase.id, purchase.card, purchase.store, purchase.description, purchase.category,
        purchase.amount, purchase.installments, purchase.source],
    );
  }
}

export async function ensureDatabase() {
  if (!globalThis.inspireDbReady || globalThis.inspireDbReadyVersion !== SCHEMA_VERSION) {
    globalThis.inspireDbReadyVersion = SCHEMA_VERSION;
    globalThis.inspireDbReady = (async () => {
      if (process.env.DATABASE_URL) {
        await initialize(pool() as unknown as DbExecutor);
        return;
      }
      await initialize(localExecutor(await localDatabase()));
    })().catch((error) => {
      globalThis.inspireDbReady = undefined;
      globalThis.inspireDbReadyVersion = undefined;
      throw error;
    });
  }
  await globalThis.inspireDbReady;
}

export async function query<T extends QueryResultRow = QueryResultRow>(sql: string, values?: unknown[]): Promise<DbResult<T>> {
  await ensureDatabase();
  if (process.env.DATABASE_URL) {
    const result: QueryResult<T> = await pool().query<T>(sql, values);
    return { rows: result.rows, rowCount: result.rowCount };
  }
  return localExecutor(await localDatabase()).query<T>(sql, values);
}

export async function transaction<T>(callback: (client: DbExecutor) => Promise<T>): Promise<T> {
  await ensureDatabase();
  if (!process.env.DATABASE_URL) {
    const database = await localDatabase();
    return database.transaction(async (tx) => callback({
      async query<R extends QueryResultRow = QueryResultRow>(sql: string, values?: unknown[]) {
        const result = await tx.query<R>(sql, values as never[] | undefined);
        return { rows: result.rows, rowCount: result.rowCount ?? null };
      },
    }));
  }
  const client = await pool().connect();
  try {
    await client.query("BEGIN");
    const result = await callback(client);
    await client.query("COMMIT");
    return result;
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
}
