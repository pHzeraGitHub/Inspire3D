-- Estrutura aditiva: preserva produtos, pedidos e IDs existentes.
-- A aplicação não publica ofertas digitais antes de checkout, armazenamento
-- privado e autorização de downloads estarem completos.
ALTER TABLE products
  ADD COLUMN IF NOT EXISTS product_kind TEXT NOT NULL DEFAULT 'physical'
  CHECK (product_kind IN ('physical', 'digital', 'hybrid'));

CREATE TABLE IF NOT EXISTS digital_offers (
  id TEXT PRIMARY KEY,
  product_id TEXT NOT NULL REFERENCES products(id),
  family TEXT NOT NULL CHECK (family IN ('silhouette', '3d-print')),
  license_code TEXT NOT NULL,
  license_version TEXT NOT NULL,
  license_text TEXT NOT NULL,
  price NUMERIC(12,2) NOT NULL CHECK (price >= 0),
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'archived')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT digital_offers_product_license_key UNIQUE (product_id, license_code)
);

CREATE INDEX IF NOT EXISTS digital_offers_status_idx ON digital_offers(status);

CREATE TABLE IF NOT EXISTS digital_asset_versions (
  id TEXT PRIMARY KEY,
  offer_id TEXT NOT NULL REFERENCES digital_offers(id),
  version TEXT NOT NULL,
  format TEXT NOT NULL,
  display_name TEXT NOT NULL,
  object_key TEXT NOT NULL,
  byte_size BIGINT NOT NULL CHECK (byte_size > 0),
  sha256 CHAR(64) NOT NULL CHECK (sha256 ~ '^[0-9a-f]{64}$'),
  active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT digital_asset_versions_object_key_key UNIQUE (object_key)
);

CREATE INDEX IF NOT EXISTS digital_asset_versions_offer_active_idx
  ON digital_asset_versions(offer_id, active);
