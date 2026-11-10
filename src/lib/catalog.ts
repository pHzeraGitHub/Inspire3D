import "server-only";
import type { Product } from "@/types";
import { query } from "@/lib/db";
import { products as starterProducts } from "@/content/products";

type ProductRow = {
  id: string;
  slug: string;
  name: string;
  short_description: string;
  description: string;
  collection: Product["collection"];
  category: string;
  images: string[];
  technical_characteristics: string[];
  dimensions: string | null;
  variants: Product["variants"];
  personalization_options: string[];
  price: string | null;
  availability: Product["availability"];
  launch_status: Product["launchStatus"];
  lead_time: string | null;
  featured: boolean;
  seo_title: string;
  seo_description: string;
};

export function mapProduct(row: ProductRow): Product {
  return {
    id: row.id,
    slug: row.slug,
    name: row.name,
    shortDescription: row.short_description,
    description: row.description,
    collection: row.collection,
    category: row.category,
    images: row.images ?? [],
    technicalCharacteristics: row.technical_characteristics ?? [],
    dimensions: row.dimensions ?? undefined,
    variants: row.variants ?? [],
    personalizationOptions: row.personalization_options ?? [],
    priceFrom: row.price === null ? undefined : Number(row.price),
    availability: row.availability,
    launchStatus: row.launch_status,
    leadTime: row.lead_time ?? undefined,
    featured: row.featured,
    seo: { title: row.seo_title, description: row.seo_description },
    available: row.availability === "available" && row.launch_status === "released",
  };
}

export async function getCatalogProducts(): Promise<Product[]> {
  // Previews can show the starter catalog before a persistent database is connected.
  // Admin data still requires PostgreSQL; PGlite cannot persist in Vercel Functions.
  if (process.env.VERCEL && !process.env.DATABASE_URL) return starterProducts;

  const result = await query<ProductRow>(
    `SELECT id, slug, name, short_description, description, collection, category, images,
      technical_characteristics, dimensions, variants, personalization_options, price,
      availability, launch_status, lead_time, featured, seo_title, seo_description
     FROM products WHERE published = TRUE ORDER BY featured DESC, updated_at DESC`,
  );
  return result.rows.map(mapProduct);
}
