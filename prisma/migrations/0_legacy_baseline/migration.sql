-- Baseline do SQL legado em src/lib/db.ts (SCHEMA_VERSION sales-v1).
-- Em banco com dados, conferir o esquema e marcar como aplicada; não executar novamente.
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
