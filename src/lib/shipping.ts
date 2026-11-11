import "server-only";
import { query } from "@/lib/db";
import { SaleError } from "@/lib/sales";
import { getMelhorEnvioAccessToken, melhorEnvioAuthorizationStatus, melhorEnvioBaseUrl } from "@/lib/melhor-envio-oauth";

export type ShippingOption = {
  id: string;
  name: string;
  carrier: string;
  price: number;
  deliveryDays: number;
};

export type ShippableProduct = {
  id: string;
  name: string;
  price: number;
  productionDays: number;
  variants: { label: string; options: string[] }[];
  personalizationOptions: string[];
  weight: number;
  width: number;
  height: number;
  length: number;
};

const postalCode = (value: string) => value.replace(/\D/g, "");
const money = (value: number) => Math.round((value + Number.EPSILON) * 100) / 100;
const technicalEmail = () => process.env.MELHOR_ENVIO_CONTACT_EMAIL?.trim() || process.env.ADMIN_EMAIL?.trim() || "";

export async function shippingConfigured() {
  if (!/^\d{8}$/.test(postalCode(process.env.SHOP_SHIPPING_ORIGIN_CEP ?? "")) ||
    !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(technicalEmail())) return false;
  return (await melhorEnvioAuthorizationStatus()).connected;
}

export async function getShippableProduct(id: string): Promise<ShippableProduct> {
  const result = await query(
    `SELECT id,name,price,production_days,variants,personalization_options,
      package_weight_kg,package_width_cm,package_height_cm,package_length_cm,
      EXISTS(SELECT 1 FROM product_materials pm WHERE pm.product_id=products.id) AS production_ready
     FROM products WHERE id=$1 AND published=TRUE AND availability='available' AND launch_status='released'`,
    [id],
  );
  const row = result.rows[0];
  if (!row || !row.production_ready || Number(row.price) <= 0 ||
    [row.package_weight_kg,row.package_width_cm,row.package_height_cm,row.package_length_cm].some((value) => !Number.isFinite(Number(value)) || Number(value) <= 0)) {
    throw new SaleError("Este produto ainda não está pronto para compra e envio online.", 409);
  }
  return {
    id: String(row.id), name: String(row.name), price: money(Number(row.price)),
    productionDays: Number(row.production_days) || 7,
    variants: row.variants as ShippableProduct["variants"],
    personalizationOptions: row.personalization_options as string[],
    weight: Number(row.package_weight_kg), width: Number(row.package_width_cm),
    height: Number(row.package_height_cm), length: Number(row.package_length_cm),
  };
}

export async function quoteShipping(product: ShippableProduct, quantity: number, destination: string, onProviderError?: (details: unknown) => void): Promise<ShippingOption[]> {
  if (!(await shippingConfigured())) throw new SaleError("Cotação de frete ainda não configurada.", 503);
  if (!Number.isInteger(quantity) || quantity < 1 || quantity > 20 || !/^\d{8}$/.test(postalCode(destination))) {
    throw new SaleError("Informe uma quantidade e um CEP válidos.");
  }
  const host = melhorEnvioBaseUrl();
  const serviceIds = process.env.MELHOR_ENVIO_SERVICE_IDS?.trim();
  const calculate = (token: string) => fetch(`${host}/api/v2/me/shipment/calculate`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json", Accept: "application/json",
      "User-Agent": `Inspire3D (${technicalEmail()})`,
    },
    body: JSON.stringify({
      from: { postal_code: postalCode(process.env.SHOP_SHIPPING_ORIGIN_CEP!) },
      to: { postal_code: postalCode(destination) },
      products: [{ id: product.id, width: product.width, height: product.height,
        length: product.length, weight: product.weight, insurance_value: product.price, quantity }],
      options: { receipt: false, own_hand: false },
      ...(serviceIds && /^\d+(,\d+)*$/.test(serviceIds) ? { services: serviceIds } : {}),
    }),
    cache: "no-store", signal: AbortSignal.timeout(12000),
  });
  let response = await calculate(await getMelhorEnvioAccessToken());
  if (response.status === 401 && !process.env.MELHOR_ENVIO_TOKEN?.trim()) {
    response = await calculate(await getMelhorEnvioAccessToken(true));
  }
  if (!response.ok) {
    console.error("Melhor Envio quote failed:", response.status);
    if (onProviderError) {
      const body = await response.json().catch(() => null) as unknown;
      onProviderError({ status: response.status, body });
    }
    throw new SaleError(response.status === 422 ? "Confira o CEP e a embalagem do produto." : "Não foi possível calcular o frete agora. Tente novamente.", 503);
  }
  const data: unknown = await response.json();
  if (!Array.isArray(data)) throw new SaleError("Resposta de frete inválida. Tente novamente.", 503);
  const options = data.flatMap((entry: unknown): ShippingOption[] => {
    if (!entry || typeof entry !== "object") return [];
    const item = entry as Record<string, unknown>;
    const company = item.company && typeof item.company === "object" ? item.company as Record<string, unknown> : {};
    const price = Number(item.custom_price);
    const deliveryDays = Number(item.custom_delivery_time);
    const id = String(item.id ?? "");
    if (item.error || !/^\d+$/.test(id) || !Number.isFinite(price) || price < 0 || price > 10000 ||
      !Number.isInteger(deliveryDays) || deliveryDays < 1 || deliveryDays > 90) return [];
    return [{ id, name: String(item.name ?? "Entrega").slice(0, 100),
      carrier: String(company.name ?? "Transportadora").slice(0, 100), price: money(price), deliveryDays }];
  }).sort((a, b) => a.price - b.price).slice(0, 12);
  if (!options.length) throw new SaleError("Não há modalidade de entrega disponível para este CEP e produto.", 409);
  return options;
}
