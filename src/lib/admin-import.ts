import "server-only";

import ExcelJS from "exceljs";
import JSZip from "jszip";
import { randomUUID } from "node:crypto";
import { transaction } from "@/lib/db";

type CellValue = string | number | boolean | null;
type SheetRow = { rowNumber: number; values: Record<string, CellValue> };
type MaterialInput = { sku: string; name: string; category: string; unit: string; quantity: number; unitCost: number; minimumQuantity: number; rowNumber: number };
type ProductInput = {
  slug: string; name: string; shortDescription: string; description: string; collection: string; category: string;
  price: number | null; availability: string; launchStatus: string; leadTime: string; dimensions: string;
  images: string[]; technicalCharacteristics: string[]; personalizationOptions: string[];
  estimatedLaborCost: number; estimatedEnergyCost: number; estimatedPackagingCost: number; estimatedOtherCost: number;
  estimatedTaxPercent: number; estimatedPaymentFeePercent: number; featured: boolean; published: boolean;
  seoTitle: string; seoDescription: string; rowNumber: number;
};
type RecipeInput = { productSlug: string; materialSku: string; quantityPerUnit: number; rowNumber: number };
type VariantInput = { productSlug: string; label: string; options: string[]; rowNumber: number };

export class ImportValidationError extends Error {
  constructor(readonly details: string[]) {
    super("A planilha tem dados para corrigir.");
    this.name = "ImportValidationError";
  }
}

const normalizeToken = (value: string) => value.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().trim().replace(/[\s_]+/g, "-");
const normalizeHeader = (value: string) => normalizeToken(value).replace(/[^a-z0-9-]/g, "").replace(/-/g, "_");
const slugify = (value: string) => value.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 90);

function readCell(cell: ExcelJS.Cell): CellValue {
  const value = cell.value;
  if (value === null || value === undefined) return null;
  if (typeof value === "string" || typeof value === "number" || typeof value === "boolean") return value;
  if (typeof value === "object") {
    if ("formula" in value || "sharedFormula" in value) throw new Error("remova fórmulas e cole valores antes de importar.");
    if ("richText" in value) return value.richText.map((part) => part.text).join("");
    if ("text" in value && typeof value.text === "string") return value.text;
    if ("result" in value && (typeof value.result === "string" || typeof value.result === "number" || typeof value.result === "boolean")) return value.result;
  }
  return null;
}

function readSheetRows(workbook: ExcelJS.Workbook, sheetName: string, requiredHeaders: string[], errors: string[]): SheetRow[] {
  const sheet = workbook.getWorksheet(sheetName);
  if (!sheet) return [];
  if (sheet.rowCount > 502 || sheet.columnCount > 40) {
    errors.push(`${sheetName}: limite de 500 linhas de dados ou 40 colunas excedido.`);
    return [];
  }

  const headers = new Map<string, number>();
  sheet.getRow(1).eachCell((cell, column) => {
    const header = readCell(cell);
    if (typeof header === "string" && header.trim()) headers.set(normalizeHeader(header), column);
  });
  const missing = requiredHeaders.filter((header) => !headers.has(header));
  if (missing.length) {
    errors.push(`${sheetName}: cabeçalhos ausentes: ${missing.join(", ")}.`);
    return [];
  }

  const rows: SheetRow[] = [];
  for (let rowNumber = 2; rowNumber <= sheet.rowCount; rowNumber++) {
    const row = sheet.getRow(rowNumber);
    const values: Record<string, CellValue> = {};
    try {
      for (const [header, column] of headers) values[header] = readCell(row.getCell(column));
      if (Object.values(values).every((value) => value === null || String(value).trim() === "")) continue;
      rows.push({ rowNumber, values });
    } catch (error) {
      errors.push(`${sheetName} linha ${rowNumber}: ${error instanceof Error ? error.message : "célula inválida."}`);
    }
  }
  return rows;
}

function textField(row: SheetRow, key: string, label: string, required = false, maxLength = 2000) {
  const raw = row.values[key];
  const value = raw === null ? "" : String(raw).trim();
  if (required && !value) throw new Error(`${label} é obrigatório.`);
  if (value.length > maxLength) throw new Error(`${label} excede ${maxLength} caracteres.`);
  return value;
}

function parseNumber(row: SheetRow, key: string, label: string, defaultValue = 0) {
  const raw = row.values[key];
  if (raw === null || String(raw).trim() === "") return defaultValue;
  if (typeof raw === "number") {
    if (Number.isFinite(raw)) return raw;
    throw new Error(`${label} precisa ser número.`);
  }
  let text = String(raw).trim().replace(/\s/g, "").replace(/[R$%]/gi, "");
  if (text.includes(",") && text.includes(".")) {
    text = text.lastIndexOf(",") > text.lastIndexOf(".") ? text.replace(/\./g, "").replace(",", ".") : text.replace(/,/g, "");
  } else if (text.includes(",")) {
    text = text.replace(",", ".");
  }
  const value = Number(text);
  if (!Number.isFinite(value)) throw new Error(`${label} precisa ser número.`);
  return value;
}

function parseBoolean(row: SheetRow, key: string, label: string, fallback = false) {
  const raw = row.values[key];
  if (raw === null || String(raw).trim() === "") return fallback;
  if (typeof raw === "boolean") return raw;
  const value = normalizeToken(String(raw));
  if (["s", "sim", "yes", "y", "true", "1"].includes(value)) return true;
  if (["n", "nao", "no", "false", "0"].includes(value)) return false;
  throw new Error(`${label} use S ou N.`);
}

function parseList(row: SheetRow, key: string, label: string, maxItems = 30) {
  const value = textField(row, key, label, false, 8000);
  const items = value.split(/[|;\n]/).map((item) => item.trim()).filter(Boolean);
  if (items.length > maxItems) throw new Error(`${label} aceita até ${maxItems} itens.`);
  return items;
}

function parseEnum(row: SheetRow, key: string, label: string, values: Record<string, string>, fallback: string) {
  const raw = textField(row, key, label);
  if (!raw) return fallback;
  const normalized = normalizeToken(raw);
  const result = values[normalized];
  if (!result) throw new Error(`${label} inválido. Use: ${Object.keys(values).slice(0, 4).join(", ")}.`);
  return result;
}

function parseMaterials(rows: SheetRow[], errors: string[]) {
  const output: MaterialInput[] = [];
  const seen = new Set<string>();
  for (const row of rows) {
    try {
      const sku = textField(row, "sku", "SKU", true, 80);
      const name = textField(row, "nome", "Nome", true, 120);
      const category = textField(row, "categoria", "Categoria", true, 80);
      const unit = textField(row, "unidade", "Unidade", true, 24).toLowerCase();
      if (!new Set(["g", "kg", "ml", "l", "un", "cm", "m", "folha", "rolo", "caixa"]).has(unit)) throw new Error("Unidade inválida. Use g, kg, ml, l, un, cm, m, folha, rolo ou caixa.");
      const quantity = parseNumber(row, "saldo_inicial", "Saldo inicial");
      const unitCost = parseNumber(row, "custo_unitario", "Custo unitário");
      const minimumQuantity = parseNumber(row, "estoque_minimo", "Estoque mínimo");
      if (quantity < 0 || unitCost < 0 || minimumQuantity < 0) throw new Error("Saldo, custo e mínimo não podem ser negativos.");
      if (quantity > 0 && unitCost <= 0) throw new Error("Informe o custo unitário quando houver saldo inicial.");
      const key = sku.toLowerCase();
      if (seen.has(key)) throw new Error(`SKU duplicado na planilha: ${sku}.`);
      seen.add(key);
      output.push({ sku, name, category, unit, quantity, unitCost, minimumQuantity, rowNumber: row.rowNumber });
    } catch (error) {
      errors.push(`Materiais linha ${row.rowNumber}: ${error instanceof Error ? error.message : "dados inválidos."}`);
    }
  }
  return output;
}

const collectionValues: Record<string, string> = {
  "inspire-gifts": "inspire-gifts",
  "inspire-collectibles": "inspire-collectibles",
  "inspire-games": "inspire-games",
  "inspire-solutions": "inspire-solutions",
};
const availabilityValues: Record<string, string> = {
  "not-announced": "not-announced", "nao-anunciada": "not-announced",
  available: "available", disponivel: "available", indisponivel: "unavailable", unavailable: "unavailable",
};
const launchValues: Record<string, string> = {
  "in-development": "in-development", "em-desenvolvimento": "in-development",
  "coming-soon": "coming-soon", "em-breve": "coming-soon", released: "released", lancado: "released",
};

function parseProducts(rows: SheetRow[], errors: string[]) {
  const output: ProductInput[] = [];
  const seen = new Set<string>();
  for (const row of rows) {
    try {
      const name = textField(row, "nome", "Nome", true, 120);
      const slug = slugify(textField(row, "slug", "Slug", false, 100) || name);
      if (!slug) throw new Error("Não foi possível gerar um slug a partir do nome.");
      if (seen.has(slug)) throw new Error(`Slug duplicado na planilha: ${slug}.`);
      seen.add(slug);
      const shortDescription = textField(row, "resumo", "Resumo", true, 400);
      const description = textField(row, "descricao", "Descrição", true, 8000);
      const collection = parseEnum(row, "colecao", "Coleção", collectionValues, "inspire-gifts");
      const category = textField(row, "categoria", "Categoria", true, 80);
      const rawPrice = row.values.preco_venda;
      const price = rawPrice === null || String(rawPrice).trim() === "" ? null : parseNumber(row, "preco_venda", "Preço de venda");
      if (price !== null && price < 0) throw new Error("Preço de venda não pode ser negativo.");
      const availability = parseEnum(row, "disponibilidade", "Disponibilidade", availabilityValues, "not-announced");
      const launchStatus = parseEnum(row, "lancamento", "Lançamento", launchValues, "in-development");
      const images = parseList(row, "imagens", "Imagens", 8);
      if (images.some((image) => !image.startsWith("/") || image.startsWith("//") || image.includes(".."))) throw new Error("Imagens devem usar caminhos locais, como /produtos/vaso.jpg.");
      const estimatedLaborCost = parseNumber(row, "mao_de_obra", "Mão de obra");
      const estimatedEnergyCost = parseNumber(row, "energia", "Energia");
      const estimatedPackagingCost = parseNumber(row, "embalagem", "Embalagem");
      const estimatedOtherCost = parseNumber(row, "outros_custos", "Outros custos");
      const estimatedTaxPercent = parseNumber(row, "imposto_percentual", "Imposto percentual");
      const estimatedPaymentFeePercent = parseNumber(row, "taxa_pagamento_percentual", "Taxa de pagamento percentual");
      if ([estimatedLaborCost, estimatedEnergyCost, estimatedPackagingCost, estimatedOtherCost].some((value) => value < 0)) throw new Error("Custos estimados não podem ser negativos.");
      if ([estimatedTaxPercent, estimatedPaymentFeePercent].some((value) => value < 0 || value > 100)) throw new Error("Taxas percentuais devem ficar entre 0 e 100.");
      output.push({
        slug, name, shortDescription, description, collection, category, price, availability, launchStatus,
        leadTime: textField(row, "prazo_estimado", "Prazo estimado", false, 120),
        dimensions: textField(row, "dimensoes", "Dimensões", false, 200), images,
        technicalCharacteristics: parseList(row, "caracteristicas", "Características"),
        personalizationOptions: parseList(row, "personalizacao", "Personalização"),
        estimatedLaborCost, estimatedEnergyCost, estimatedPackagingCost, estimatedOtherCost,
        estimatedTaxPercent, estimatedPaymentFeePercent,
        featured: parseBoolean(row, "destaque", "Destaque"), published: parseBoolean(row, "publicar", "Publicar"),
        seoTitle: textField(row, "seo_titulo", "Título SEO", false, 150) || name,
        seoDescription: textField(row, "seo_descricao", "Descrição SEO", false, 300) || shortDescription,
        rowNumber: row.rowNumber,
      });
    } catch (error) {
      errors.push(`Produtos linha ${row.rowNumber}: ${error instanceof Error ? error.message : "dados inválidos."}`);
    }
  }
  return output;
}

function parseRecipes(rows: SheetRow[], errors: string[]) {
  const output: RecipeInput[] = [];
  const seen = new Set<string>();
  for (const row of rows) {
    try {
      const productSlug = slugify(textField(row, "produto_slug", "Slug do produto", true, 100));
      const materialSku = textField(row, "material_sku", "SKU do material", true, 80);
      const quantityPerUnit = parseNumber(row, "consumo_por_unidade", "Consumo por unidade", 0);
      if (!productSlug || quantityPerUnit <= 0) throw new Error("Informe produto e consumo por unidade maior que zero.");
      const key = `${productSlug}::${materialSku.toLowerCase()}`;
      if (seen.has(key)) throw new Error("Este material está repetido na ficha técnica do produto.");
      seen.add(key);
      output.push({ productSlug, materialSku, quantityPerUnit, rowNumber: row.rowNumber });
    } catch (error) {
      errors.push(`FichaTecnica linha ${row.rowNumber}: ${error instanceof Error ? error.message : "dados inválidos."}`);
    }
  }
  return output;
}

function parseVariants(rows: SheetRow[], errors: string[]) {
  const output: VariantInput[] = [];
  const seen = new Set<string>();
  for (const row of rows) {
    try {
      const productSlug = slugify(textField(row, "produto_slug", "Slug do produto", true, 100));
      const label = textField(row, "rotulo", "Rótulo", true, 80);
      const options = parseList(row, "opcoes", "Opções", 30);
      if (!productSlug || !options.length) throw new Error("Informe o produto e ao menos uma opção.");
      const key = `${productSlug}::${label.toLowerCase()}`;
      if (seen.has(key)) throw new Error("Rótulo de variação repetido neste produto.");
      seen.add(key);
      output.push({ productSlug, label, options, rowNumber: row.rowNumber });
    } catch (error) {
      errors.push(`Variacoes linha ${row.rowNumber}: ${error instanceof Error ? error.message : "dados inválidos."}`);
    }
  }
  return output;
}

export async function importAdminWorkbook(file: File) {
  if (!file.name.toLowerCase().endsWith(".xlsx")) throw new ImportValidationError(["Envie um arquivo .xlsx do modelo Inspire 3D."]);
  if (file.size <= 0 || file.size > 8 * 1024 * 1024) throw new ImportValidationError(["O arquivo precisa ter até 8 MB."]);

  const workbook = new ExcelJS.Workbook();
  try {
    const archive = await JSZip.loadAsync(await file.arrayBuffer(), { checkCRC32: true });
    if (Object.keys(archive.files).length > 500) throw new Error("O arquivo contém estrutura demais para importar.");
    for (const [name, entry] of Object.entries(archive.files)) {
      if (entry.dir || !name.startsWith("xl/") || !name.endsWith(".xml")) continue;
      let xml = await entry.async("string");
      const mainNamespace = "http://schemas.openxmlformats.org/spreadsheetml/2006/main";
      if (xml.includes(`xmlns:x=\"${mainNamespace}\"`)) {
        xml = xml.replace(`xmlns:x=\"${mainNamespace}\"`, `xmlns=\"${mainNamespace}\"`).replace(/(<\/?)(?:x):/g, "$1");
        archive.file(name, xml);
      }
    }
    const normalized = await archive.generateAsync({ type: "nodebuffer" });
    await workbook.xlsx.load(normalized as unknown as Parameters<typeof workbook.xlsx.load>[0]);
  } catch {
    throw new ImportValidationError(["Não consegui ler o arquivo. Salve novamente como Pasta de Trabalho do Excel (.xlsx)."]);
  }

  const errors: string[] = [];
  const materialRows = parseMaterials(readSheetRows(workbook, "Materiais", ["sku", "nome", "categoria", "unidade"], errors), errors);
  const productRows = parseProducts(readSheetRows(workbook, "Produtos", ["nome", "resumo", "descricao", "colecao", "categoria"], errors), errors);
  const recipeRows = parseRecipes(readSheetRows(workbook, "FichaTecnica", ["produto_slug", "material_sku", "consumo_por_unidade"], errors), errors);
  const variantRows = parseVariants(readSheetRows(workbook, "Variacoes", ["produto_slug", "rotulo", "opcoes"], errors), errors);
  const totalRows = materialRows.length + productRows.length + recipeRows.length + variantRows.length;
  if (!totalRows && !errors.length) errors.push("Preencha ao menos uma linha em Materiais, Produtos, FichaTecnica ou Variacoes.");
  if (errors.length) throw new ImportValidationError(errors.slice(0, 40));

  const result = { materialsCreated: 0, materialsSkipped: 0, productsCreated: 0, productsUpdated: 0, recipesUpdated: 0, variantsUpdated: 0 };
  await transaction(async (client) => {
    for (const item of materialRows) {
      const existing = await client.query<{ id: string }>("SELECT id FROM inventory_materials WHERE lower(sku)=lower($1) LIMIT 1", [item.sku]);
      if (existing.rows[0]) {
        result.materialsSkipped++;
        continue;
      }
      const id = randomUUID();
      await client.query(
        `INSERT INTO inventory_materials (id,name,sku,category,unit,quantity,unit_cost,minimum_quantity)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8)`,
        [id, item.name, item.sku, item.category, item.unit, item.quantity, item.unitCost, item.minimumQuantity],
      );
      if (item.quantity > 0) {
        await client.query(
          `INSERT INTO inventory_movements (id,material_id,kind,quantity_delta,unit_cost,note)
           VALUES ($1,$2,'entrada',$3,$4,'Saldo inicial importado pela planilha')`,
          [randomUUID(), id, item.quantity, item.unitCost],
        );
      }
      result.materialsCreated++;
    }

    const productIds = new Map<string, string>();
    for (const item of productRows) {
      const previous = await client.query<{ id: string }>("SELECT id FROM products WHERE slug=$1 LIMIT 1", [item.slug]);
      const id = previous.rows[0]?.id ?? randomUUID();
      const saved = await client.query<{ id: string }>(
        `INSERT INTO products (id,slug,name,short_description,description,collection,category,images,
          technical_characteristics,dimensions,variants,personalization_options,price,availability,launch_status,
          lead_time,estimated_labor_cost,estimated_energy_cost,estimated_packaging_cost,estimated_other_cost,
          estimated_tax_percent,estimated_payment_fee_percent,featured,published,seo_title,seo_description)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8::jsonb,$9::jsonb,$10,'[]'::jsonb,$11::jsonb,$12,$13,$14,$15,$16,$17,$18,$19,$20,$21,$22,$23,$24,$25)
         ON CONFLICT (slug) DO UPDATE SET name=EXCLUDED.name,short_description=EXCLUDED.short_description,
          description=EXCLUDED.description,collection=EXCLUDED.collection,category=EXCLUDED.category,
          images=EXCLUDED.images,technical_characteristics=EXCLUDED.technical_characteristics,
          dimensions=EXCLUDED.dimensions,personalization_options=EXCLUDED.personalization_options,price=EXCLUDED.price,
          availability=EXCLUDED.availability,launch_status=EXCLUDED.launch_status,lead_time=EXCLUDED.lead_time,
          estimated_labor_cost=EXCLUDED.estimated_labor_cost,estimated_energy_cost=EXCLUDED.estimated_energy_cost,
          estimated_packaging_cost=EXCLUDED.estimated_packaging_cost,estimated_other_cost=EXCLUDED.estimated_other_cost,
          estimated_tax_percent=EXCLUDED.estimated_tax_percent,estimated_payment_fee_percent=EXCLUDED.estimated_payment_fee_percent,
          featured=EXCLUDED.featured,published=EXCLUDED.published,seo_title=EXCLUDED.seo_title,
          seo_description=EXCLUDED.seo_description,updated_at=NOW()
         RETURNING id`,
        [id,item.slug,item.name,item.shortDescription,item.description,item.collection,item.category,
          JSON.stringify(item.images),JSON.stringify(item.technicalCharacteristics),item.dimensions || null,
          JSON.stringify(item.personalizationOptions),item.price,item.availability,item.launchStatus,item.leadTime || null,
          item.estimatedLaborCost,item.estimatedEnergyCost,item.estimatedPackagingCost,item.estimatedOtherCost,
          item.estimatedTaxPercent,item.estimatedPaymentFeePercent,item.featured,item.published,item.seoTitle,item.seoDescription],
      );
      productIds.set(item.slug, saved.rows[0]?.id ?? id);
      if (previous.rows[0]) result.productsUpdated++; else result.productsCreated++;
    }

    const referencedSlugs = [...new Set([...recipeRows.map((item) => item.productSlug), ...variantRows.map((item) => item.productSlug)])];
    for (const slug of referencedSlugs) {
      if (productIds.has(slug)) continue;
      const product = await client.query<{ id: string }>("SELECT id FROM products WHERE slug=$1", [slug]);
      if (product.rows[0]) productIds.set(slug, product.rows[0].id);
      else throw new ImportValidationError([`Ficha técnica/variação: o produto ${slug} não existe nesta planilha nem no cadastro.`]);
    }

    const skuIds = new Map<string, string>();
    for (const item of recipeRows) {
      const skuKey = item.materialSku.toLowerCase();
      if (skuIds.has(skuKey)) continue;
      const material = await client.query<{ id: string }>("SELECT id FROM inventory_materials WHERE lower(sku)=lower($1) AND archived=FALSE", [item.materialSku]);
      if (material.rows[0]) skuIds.set(skuKey, material.rows[0].id);
      else throw new ImportValidationError([`FichaTecnica linha ${item.rowNumber}: o SKU ${item.materialSku} não existe ou está arquivado.`]);
    }

    const recipeGroups = new Map<string, RecipeInput[]>();
    for (const item of recipeRows) recipeGroups.set(item.productSlug, [...(recipeGroups.get(item.productSlug) ?? []), item]);
    for (const [slug, lines] of recipeGroups) {
      const productId = productIds.get(slug)!;
      await client.query("DELETE FROM product_materials WHERE product_id=$1", [productId]);
      for (const line of lines) {
        await client.query("INSERT INTO product_materials (product_id,material_id,quantity_per_unit) VALUES ($1,$2,$3)", [productId, skuIds.get(line.materialSku.toLowerCase()), line.quantityPerUnit]);
      }
      result.recipesUpdated++;
    }

    const variantGroups = new Map<string, VariantInput[]>();
    for (const item of variantRows) variantGroups.set(item.productSlug, [...(variantGroups.get(item.productSlug) ?? []), item]);
    for (const [slug, variants] of variantGroups) {
      await client.query("UPDATE products SET variants=$2::jsonb,updated_at=NOW() WHERE id=$1", [productIds.get(slug), JSON.stringify(variants.map(({ label, options }) => ({ label, options })))]);
      result.variantsUpdated++;
    }
  });
  return result;
}
