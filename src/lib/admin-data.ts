import "server-only";
import { query } from "@/lib/db";

export type MaterialRecord = {
  id: string;
  name: string;
  sku: string | null;
  category: string;
  unit: string;
  quantity: number;
  unitCost: number;
  minimumQuantity: number;
  archived: boolean;
};

export type RecipeLine = { materialId: string; quantityPerUnit: number };

export type AdminProductRecord = {
  id: string;
  slug: string;
  name: string;
  shortDescription: string;
  description: string;
  collection: string;
  category: string;
  price: number | null;
  estimatedLaborCost: number;
  estimatedEnergyCost: number;
  estimatedPackagingCost: number;
  estimatedOtherCost: number;
  estimatedTaxPercent: number;
  estimatedPaymentFeePercent: number;
  availability: string;
  launchStatus: string;
  leadTime: string;
  productionDays: number;
  images: string[];
  technicalCharacteristics: string[];
  dimensions: string;
  variants: { label: string; options: string[] }[];
  personalizationOptions: string[];
  featured: boolean;
  published: boolean;
  finishedStock: number;
  seoTitle: string;
  seoDescription: string;
  materialCost: number;
  recipe: (RecipeLine & { materialName: string; unit: string; unitCost: number })[];
};

const n = (value: string | number | null | undefined) => value == null ? 0 : Number(value);

export async function getAdminMaterials(): Promise<MaterialRecord[]> {
  const result = await query(
    `SELECT id, name, sku, category, unit, quantity, unit_cost, minimum_quantity, archived
     FROM inventory_materials ORDER BY archived, name`,
  );
  return result.rows.map((row) => ({
    id: row.id, name: row.name, sku: row.sku, category: row.category, unit: row.unit,
    quantity: n(row.quantity), unitCost: n(row.unit_cost), minimumQuantity: n(row.minimum_quantity),
    archived: row.archived,
  }));
}

export async function getAdminProducts(): Promise<AdminProductRecord[]> {
  const products = await query(
    `SELECT p.id, p.slug, p.name, p.short_description, p.description, p.collection, p.category,
      p.price, p.estimated_labor_cost, p.estimated_energy_cost, p.estimated_packaging_cost,
      p.estimated_other_cost, p.estimated_tax_percent, p.estimated_payment_fee_percent,
      p.availability, p.launch_status, p.lead_time, p.production_days, p.images,
      p.technical_characteristics, p.dimensions, p.variants, p.personalization_options,
      p.featured, p.published, p.finished_stock, p.seo_title, p.seo_description,
      COALESCE(SUM(pm.quantity_per_unit * m.unit_cost), 0) AS material_cost
     FROM products p
     LEFT JOIN product_materials pm ON pm.product_id = p.id
     LEFT JOIN inventory_materials m ON m.id = pm.material_id
     GROUP BY p.id ORDER BY p.updated_at DESC`,
  );
  const recipeResult = await query(
    `SELECT pm.product_id, pm.material_id, pm.quantity_per_unit, m.name AS material_name,
      m.unit, m.unit_cost
     FROM product_materials pm JOIN inventory_materials m ON m.id = pm.material_id
     ORDER BY m.name`,
  );
  const recipes = new Map<string, AdminProductRecord["recipe"]>();
  for (const row of recipeResult.rows) {
    const list = recipes.get(row.product_id) ?? [];
    list.push({
      materialId: row.material_id, quantityPerUnit: n(row.quantity_per_unit),
      materialName: row.material_name, unit: row.unit, unitCost: n(row.unit_cost),
    });
    recipes.set(row.product_id, list);
  }
  return products.rows.map((row) => ({
    id: row.id, slug: row.slug, name: row.name, shortDescription: row.short_description,
    description: row.description, collection: row.collection, category: row.category,
    price: row.price === null ? null : n(row.price),
    estimatedLaborCost: n(row.estimated_labor_cost), estimatedEnergyCost: n(row.estimated_energy_cost),
    estimatedPackagingCost: n(row.estimated_packaging_cost), estimatedOtherCost: n(row.estimated_other_cost),
    estimatedTaxPercent: n(row.estimated_tax_percent), estimatedPaymentFeePercent: n(row.estimated_payment_fee_percent),
    availability: row.availability,
    launchStatus: row.launch_status, leadTime: row.lead_time ?? "", productionDays: n(row.production_days), images: row.images ?? [],
    technicalCharacteristics: row.technical_characteristics ?? [], dimensions: row.dimensions ?? "",
    variants: row.variants ?? [], personalizationOptions: row.personalization_options ?? [],
    featured: row.featured, published: row.published, finishedStock: n(row.finished_stock),
    seoTitle: row.seo_title, seoDescription: row.seo_description, materialCost: n(row.material_cost),
    recipe: recipes.get(row.id) ?? [],
  }));
}

export async function getAdminMovements(limit = 40) {
  const result = await query(
    `SELECT mv.id, mv.kind, mv.quantity_delta, mv.unit_cost, mv.note, mv.created_at,
       m.name AS material_name, m.unit, p.name AS product_name
     FROM inventory_movements mv
     JOIN inventory_materials m ON m.id = mv.material_id
     LEFT JOIN products p ON p.id = mv.product_id
     ORDER BY mv.created_at DESC LIMIT $1`,
    [limit],
  );
  return result.rows.map((row) => ({
    id: row.id, kind: row.kind, quantityDelta: n(row.quantity_delta), unitCost: n(row.unit_cost),
    note: row.note, createdAt: new Date(row.created_at).toISOString(), materialName: row.material_name,
    unit: row.unit, productName: row.product_name as string | null,
  }));
}

export type ImportedPurchaseRecord = {
  id: string;
  card: string;
  store: string;
  description: string;
  category: string;
  amount: number;
  installments: number;
  source: string;
};

export async function getImportedPurchases(): Promise<ImportedPurchaseRecord[]> {
  const result = await query(
    `SELECT id, card, store, description, category, amount, installments, source
     FROM inventory_purchases ORDER BY id`,
  );
  return result.rows.map((row): ImportedPurchaseRecord => ({
    id: String(row.id), card: String(row.card), store: String(row.store),
    description: String(row.description), category: String(row.category), amount: n(row.amount),
    installments: n(row.installments), source: String(row.source),
  }));
}

export async function getAdminOverview() {
  const [materials, products, purchases, movements] = await Promise.all([
    getAdminMaterials(),
    getAdminProducts(),
    getImportedPurchases(),
    getAdminMovements(8),
  ]);
  const totalPurchases = purchases.reduce((sum, row) => sum + row.amount, 0);
  const materialPurchases = purchases.filter((row) => row.category !== "Máquinas").reduce((sum, row) => sum + row.amount, 0);
  const machinePurchases = purchases.filter((row) => row.category === "Máquinas").reduce((sum, row) => sum + row.amount, 0);
  const stockValue = materials.reduce((sum, row) => sum + row.quantity * row.unitCost, 0);
  const lowStock = materials.filter((row) => !row.archived && row.quantity <= row.minimumQuantity);
  return {
    totalPurchases, materialPurchases, machinePurchases, stockValue,
    purchaseCount: purchases.length,
    materialCount: materials.filter((row) => !row.archived).length,
    productCount: products.length,
    publishedCount: products.filter((row) => row.published).length,
    lowStock: lowStock.slice(0, 6), movements,
    needsInventoryCount: materials.filter((row) => !row.archived && row.quantity === 0).length,
  };
}
