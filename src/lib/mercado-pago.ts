import "server-only";
import { createHmac, timingSafeEqual } from "node:crypto";

const api = "https://api.mercadopago.com";

export type MercadoPagoPayment = {
  id: number;
  status: string;
  external_reference: string;
  transaction_amount: number;
  payment_method_id: string;
};
export type MercadoPagoMerchantOrder = {
  id: number; external_reference: string; preference_id: string;
  total_amount: number; paid_amount: number; refunded_amount: number;
  payments: { id: number; status: string; payment_method_id?: string }[];
};

function accessToken() {
  const token = process.env.MERCADO_PAGO_ACCESS_TOKEN;
  if (!token) throw new Error("Mercado Pago não configurado.");
  return token;
}

export function paymentConfigured() {
  return Boolean(process.env.MERCADO_PAGO_ACCESS_TOKEN && process.env.MERCADO_PAGO_WEBHOOK_SECRET);
}

export async function createPaymentPreference(input: {
  saleId: string; productName: string; quantity: number; unitPrice: number;
  shipping: number; customerName: string; customerEmail: string; returnUrl: string;
}) {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "");
  if (!baseUrl?.startsWith("https://")) throw new Error("URL pública do site não configurada para pagamentos.");
  const response = await fetch(`${api}/checkout/preferences`, {
    method: "POST",
    headers: { Authorization: `Bearer ${accessToken()}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      items: [
        { id: input.saleId, title: input.productName, quantity: input.quantity, currency_id: "BRL", unit_price: input.unitPrice },
        ...(input.shipping > 0 ? [{ id: `${input.saleId}-shipping`, title: "Frete", quantity: 1, currency_id: "BRL", unit_price: input.shipping }] : []),
      ],
      payer: { name: input.customerName, email: input.customerEmail },
      external_reference: input.saleId,
      back_urls: { success: input.returnUrl, pending: input.returnUrl, failure: input.returnUrl },
      auto_return: "approved",
      notification_url: `${baseUrl}/api/webhooks/mercadopago`,
      payment_methods: { excluded_payment_types: [{ id: "ticket" }, { id: "atm" }] },
    }),
    cache: "no-store",
    signal: AbortSignal.timeout(12000),
  });
  if (!response.ok) throw new Error(`Mercado Pago recusou a criação do checkout (${response.status}).`);
  const result = await response.json() as { id?: string; init_point?: string };
  if (!result.id || !result.init_point) throw new Error("Mercado Pago não retornou o checkout.");
  const url = new URL(result.init_point);
  if (url.protocol !== "https:" || !/(^|\.)mercadopago\.com(\.br)?$/.test(url.hostname)) {
    throw new Error("URL de pagamento inválida.");
  }
  return { preferenceId: result.id, checkoutUrl: url.toString() };
}

export async function getMercadoPagoPayment(id: string): Promise<MercadoPagoPayment> {
  if (!/^\d{1,30}$/.test(id)) throw new Error("Identificador de pagamento inválido.");
  const response = await fetch(`${api}/v1/payments/${id}`, {
    headers: { Authorization: `Bearer ${accessToken()}` },
    cache: "no-store",
    signal: AbortSignal.timeout(10000),
  });
  if (!response.ok) throw new Error(`Não foi possível consultar o pagamento (${response.status}).`);
  return response.json() as Promise<MercadoPagoPayment>;
}

export async function getMercadoPagoMerchantOrder(id: string): Promise<MercadoPagoMerchantOrder> {
  if (!/^\d{1,30}$/.test(id)) throw new Error("Identificador de pedido comercial inválido.");
  const response = await fetch(`${api}/merchant_orders/${id}`, {
    headers: { Authorization: `Bearer ${accessToken()}` }, cache: "no-store", signal: AbortSignal.timeout(10000),
  });
  if (!response.ok) throw new Error(`Não foi possível consultar o pedido comercial (${response.status}).`);
  return response.json() as Promise<MercadoPagoMerchantOrder>;
}

export function validMercadoPagoSignature(input: {
  signature: string | null; requestId: string | null; dataId: string | null;
}) {
  const secret = process.env.MERCADO_PAGO_WEBHOOK_SECRET;
  if (!secret || !input.signature || !input.requestId || !input.dataId) return false;
  const parts = Object.fromEntries(input.signature.split(",").map((part) => part.trim().split("=", 2)));
  if (!parts.ts || !/^[a-f0-9]{64}$/i.test(parts.v1 ?? "")) return false;
  const timestamp = Number(parts.ts);
  if (!Number.isFinite(timestamp)) return false;
  const timeMs = timestamp < 1e12 ? timestamp * 1000 : timestamp;
  if (Math.abs(Date.now() - timeMs) > 10 * 60 * 1000) return false;
  const manifest = `id:${input.dataId};request-id:${input.requestId};ts:${parts.ts};`;
  const expected = createHmac("sha256", secret).update(manifest).digest("hex");
  return timingSafeEqual(Buffer.from(expected, "hex"), Buffer.from(parts.v1!, "hex"));
}
