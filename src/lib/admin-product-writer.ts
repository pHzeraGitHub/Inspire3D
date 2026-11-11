import "server-only";
import { randomUUID } from "node:crypto";
import { NextResponse, type NextRequest } from "next/server";
import { apiError, badRequest, requireAdminApi, sameOrigin } from "@/lib/admin-api";
import { transaction } from "@/lib/db";
import type { CollectionSlug } from "@/types";

const collections: CollectionSlug[] = ["inspire-gifts", "inspire-collectibles", "inspire-games", "inspire-solutions"];
const availabilities = ["not-announced", "available", "unavailable"];
const launchStatuses = ["in-development", "coming-soon", "released"];
const slugify = (value: string) => value.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 90);

function parseProduct(body: Record<string, unknown>) {
  const name = typeof body.name === "string" ? body.name.trim() : "";
  const description = typeof body.description === "string" ? body.description.trim() : "";
  const shortDescription = typeof body.shortDescription === "string" ? body.shortDescription.trim() : "";
  const collection = body.collection;
  const category = typeof body.category === "string" ? body.category.trim() : "";
  const slug = slugify(typeof body.slug === "string" && body.slug.trim() ? body.slug : name);
  const recipe = Array.isArray(body.recipe) ? body.recipe as { materialId: string; quantityPerUnit: number }[] : [];
  const price = body.price === "" || body.price === null || body.price === undefined ? null : Number(body.price);
  const estimatedLaborCost = Number(body.estimatedLaborCost ?? 0);
  const estimatedEnergyCost = Number(body.estimatedEnergyCost ?? 0);
  const estimatedPackagingCost = Number(body.estimatedPackagingCost ?? 0);
  const estimatedOtherCost = Number(body.estimatedOtherCost ?? 0);
  const estimatedTaxPercent = Number(body.estimatedTaxPercent ?? 0);
  const estimatedPaymentFeePercent = Number(body.estimatedPaymentFeePercent ?? 0);
  const productionDays = Number(body.productionDays ?? 7);
  const packageFields = ["packageWeightKg", "packageWidthCm", "packageHeightCm", "packageLengthCm"] as const;
  const packageValues = packageFields.map((field) => body[field] === "" || body[field] === null || body[field] === undefined ? null : Number(body[field]));
  if (!name || !slug || !description || !shortDescription || !category || !collections.includes(collection as CollectionSlug)) throw new Error("Confira nome, resumo, descrição, coleção e categoria do produto.");
  if (name.length > 120 || slug.length > 100 || shortDescription.length > 400 || description.length > 8000 || category.length > 80) throw new Error("Algum campo excede o tamanho permitido.");
  if (!availabilities.includes(String(body.availability)) || !launchStatuses.includes(String(body.launchStatus))) throw new Error("Status de disponibilidade inválido.");
  if (price !== null && (!Number.isFinite(price) || price < 0)) throw new Error("O preço deve ser igual ou maior que zero.");
  const estimatedCosts = [estimatedLaborCost, estimatedEnergyCost, estimatedPackagingCost, estimatedOtherCost];
  const estimatedRates = [estimatedTaxPercent, estimatedPaymentFeePercent];
  if (estimatedCosts.some((value) => !Number.isFinite(value) || value < 0)) throw new Error("Os custos estimados precisam ser números iguais ou maiores que zero.");
  if (estimatedRates.some((value) => !Number.isFinite(value) || value < 0 || value > 100)) throw new Error("Taxas e impostos precisam ficar entre 0 e 100%.");
  if (!Number.isInteger(productionDays) || productionDays < 1 || productionDays > 90) throw new Error("Informe um prazo de produção entre 1 e 90 dias úteis.");
  if (packageValues.some((value) => value !== null) && packageValues.some((value) => value === null)) throw new Error("Informe peso e as três dimensões da embalagem para vender online.");
  if (packageValues.some((value, index) => value !== null && (!Number.isFinite(value) || value <= 0 || value > (index === 0 ? 50 : 200)))) throw new Error("Confira peso e dimensões da embalagem para o frete.");
  if (!Array.isArray(body.images) || !Array.isArray(body.technicalCharacteristics) || !Array.isArray(body.personalizationOptions)) throw new Error("Confira imagens e especificações.");
  const images = body.images.filter((item): item is string => typeof item === "string").map((item) => item.trim()).filter(Boolean).slice(0, 8);
  if (images.some((image) => !image.startsWith("/") || image.startsWith("//") || image.includes(".."))) throw new Error("Use caminhos locais de imagem, como /produtos/vaso.jpg. Salve o arquivo na pasta public/.");
  for (const line of recipe) {
    if (typeof line.materialId !== "string" || typeof line.quantityPerUnit !== "number" || !Number.isFinite(line.quantityPerUnit) || line.quantityPerUnit <= 0) throw new Error("Confira os insumos e quantidades da ficha técnica.");
  }
  if (new Set(recipe.map((line) => line.materialId)).size !== recipe.length) throw new Error("Cada insumo só pode aparecer uma vez na ficha técnica.");
  return {
    name, slug, shortDescription, description, collection: collection as CollectionSlug, category, price,
    estimatedLaborCost, estimatedEnergyCost, estimatedPackagingCost, estimatedOtherCost,
    estimatedTaxPercent, estimatedPaymentFeePercent,
    productionDays,
    packageWeightKg: packageValues[0], packageWidthCm: packageValues[1],
    packageHeightCm: packageValues[2], packageLengthCm: packageValues[3],
    availability: String(body.availability), launchStatus: String(body.launchStatus),
    leadTime: typeof body.leadTime === "string" ? body.leadTime.trim().slice(0, 120) : "",
    images,
    technicalCharacteristics: body.technicalCharacteristics.filter((item): item is string => typeof item === "string").map((item) => item.trim()).filter(Boolean).slice(0, 30),
    dimensions: typeof body.dimensions === "string" ? body.dimensions.trim().slice(0, 200) : "",
    variants: Array.isArray(body.variants) ? body.variants : [],
    personalizationOptions: body.personalizationOptions.filter((item): item is string => typeof item === "string").map((item) => item.trim()).filter(Boolean).slice(0, 30),
    featured: body.featured === true, published: body.published === true,
    seoTitle: typeof body.seoTitle === "string" && body.seoTitle.trim() ? body.seoTitle.trim().slice(0, 150) : name,
    seoDescription: typeof body.seoDescription === "string" && body.seoDescription.trim() ? body.seoDescription.trim().slice(0, 300) : shortDescription,
    recipe,
  };
}

export async function saveProduct(request: NextRequest, id?: string) {
  const auth = await requireAdminApi();
  if (auth.response) return auth.response;
  if (!sameOrigin(request)) return NextResponse.json({ error: "Origem inválida." }, { status: 403 });
  try {
    const input = parseProduct(await request.json());
    const productId = id ?? randomUUID();
    await transaction(async (client) => {
      if (input.recipe.length) {
        const materialIds = input.recipe.map((line) => line.materialId);
        const materials = await client.query("SELECT id FROM inventory_materials WHERE id=ANY($1::text[]) AND archived=FALSE", [materialIds]);
        if (materials.rowCount !== materialIds.length) throw new Error("Um ou mais insumos da ficha técnica não existem ou foram arquivados.");
      }
      await client.query(
        `INSERT INTO products (id,slug,name,short_description,description,collection,category,images,
          technical_characteristics,dimensions,variants,personalization_options,price,availability,
          launch_status,lead_time,estimated_labor_cost,estimated_energy_cost,estimated_packaging_cost,
          estimated_other_cost,estimated_tax_percent,estimated_payment_fee_percent,featured,published,seo_title,seo_description,production_days,
          package_weight_kg,package_width_cm,package_height_cm,package_length_cm)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8::jsonb,$9::jsonb,$10,$11::jsonb,$12::jsonb,$13,$14,$15,$16,$17,$18,$19,$20,$21,$22,$23,$24,$25,$26,$27,$28,$29,$30,$31)
         ON CONFLICT (id) DO UPDATE SET slug=EXCLUDED.slug,name=EXCLUDED.name,
          short_description=EXCLUDED.short_description,description=EXCLUDED.description,
          collection=EXCLUDED.collection,category=EXCLUDED.category,images=EXCLUDED.images,
          technical_characteristics=EXCLUDED.technical_characteristics,dimensions=EXCLUDED.dimensions,
          variants=EXCLUDED.variants,personalization_options=EXCLUDED.personalization_options,
          price=EXCLUDED.price,availability=EXCLUDED.availability,launch_status=EXCLUDED.launch_status,
          lead_time=EXCLUDED.lead_time,estimated_labor_cost=EXCLUDED.estimated_labor_cost,
          estimated_energy_cost=EXCLUDED.estimated_energy_cost,estimated_packaging_cost=EXCLUDED.estimated_packaging_cost,
          estimated_other_cost=EXCLUDED.estimated_other_cost,estimated_tax_percent=EXCLUDED.estimated_tax_percent,
          estimated_payment_fee_percent=EXCLUDED.estimated_payment_fee_percent,
          featured=EXCLUDED.featured,published=EXCLUDED.published,
          seo_title=EXCLUDED.seo_title,seo_description=EXCLUDED.seo_description,
          production_days=EXCLUDED.production_days,
          package_weight_kg=EXCLUDED.package_weight_kg,package_width_cm=EXCLUDED.package_width_cm,
          package_height_cm=EXCLUDED.package_height_cm,package_length_cm=EXCLUDED.package_length_cm,updated_at=NOW()`,
        [productId,input.slug,input.name,input.shortDescription,input.description,input.collection,input.category,
          JSON.stringify(input.images),JSON.stringify(input.technicalCharacteristics),input.dimensions || null,
          JSON.stringify(input.variants),JSON.stringify(input.personalizationOptions),input.price,input.availability,
          input.launchStatus,input.leadTime || null,input.estimatedLaborCost,input.estimatedEnergyCost,
          input.estimatedPackagingCost,input.estimatedOtherCost,input.estimatedTaxPercent,
          input.estimatedPaymentFeePercent,input.featured,input.published,input.seoTitle,input.seoDescription,input.productionDays,
          input.packageWeightKg,input.packageWidthCm,input.packageHeightCm,input.packageLengthCm],
      );
      await client.query("DELETE FROM product_materials WHERE product_id=$1", [productId]);
      for (const line of input.recipe) {
        await client.query("INSERT INTO product_materials (product_id,material_id,quantity_per_unit) VALUES ($1,$2,$3)", [productId,line.materialId,line.quantityPerUnit]);
      }
    });
    return NextResponse.json({ id: productId }, { status: id ? 200 : 201 });
  } catch (error) {
    if (error instanceof Error && ["Confira", "Cada insumo", "Um ou mais", "Use caminhos", "Algum campo", "Os custos", "Taxas e impostos", "Informe"].some((part) => error.message.startsWith(part))) return badRequest(error.message);
    return apiError(error);
  }
}
