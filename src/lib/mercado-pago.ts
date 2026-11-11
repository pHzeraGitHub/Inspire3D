import "server-only";
import { createHmac, timingSafeEqual } from "node:crypto";

const api = "https://api.mercadopago.com";

export type MercadoPagoOrder = {
  id: string; type: string; status: string; status_detail: string;
  external_reference: string; total_amount: string; total_paid_amount: string;
  transactions?: { payments?: { id: string; status: string; status_detail: string;
    payment_method?: { id?: string; type?: string } }[] };
};

function accessToken() {
  const token = process.env.MERCADO_PAGO_ACCESS_TOKEN;
  if (!token) throw new Error("Mercado Pago não configurado.");
  return token;
}

export function paymentConfigured() {
  return Boolean(process.env.MERCADO_PAGO_ACCESS_TOKEN && process.env.MERCADO_PAGO_WEBHOOK_SECRET);
}

export async function createPaymentOrder(input: {
  saleId: string; productName: string; quantity: number; unitPrice: number;
  shipping: number; customerName: string; customerEmail: string; returnUrl: string;
}) {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "");
  if (!baseUrl?.startsWith("https://")) throw new Error("URL pública do site não configurada para pagamentos.");
  const response = await fetch(`${api}/v1/orders`, {
    method: "POST",
    headers: { Authorization: `Bearer ${accessToken()}`, "Content-Type": "application/json",
      Accept: "application/json", "X-Idempotency-Key": input.saleId },
    body: JSON.stringify({
      type: "online", processing_mode: "manual",
      total_amount: (input.unitPrice * input.quantity + input.shipping).toFixed(2),
      external_reference: input.saleId,
      description: input.productName,
      items: [
        { external_code: input.saleId, title: input.productName, quantity: input.quantity, unit_price: input.unitPrice.toFixed(2) },
        ...(input.shipping > 0 ? [{ external_code: `${input.saleId}-shipping`, title: "Frete", quantity: 1, unit_price: input.shipping.toFixed(2) }] : []),
      ],
      payer: { email: input.customerEmail },
      config: {
        online: { success_url: input.returnUrl, pending_url: input.returnUrl,
          failure_url: input.returnUrl, auto_return: "approved" },
        payment_method: { not_allowed_types: ["ticket", "account_money"] },
      },
    }),
    cache: "no-store",
    signal: AbortSignal.timeout(12000),
  });
  if (!response.ok) throw new Error(`Mercado Pago recusou a criação do checkout (${response.status}).`);
  const result = await response.json() as { id?: string; checkout_url?: string };
  if (!result.id || !result.checkout_url) throw new Error("Mercado Pago não retornou o checkout.");
  const url = new URL(result.checkout_url);
  if (url.protocol !== "https:" || !/(^|\.)mercadopago\.com(\.br)?$/.test(url.hostname)) {
    throw new Error("URL de pagamento inválida.");
  }
  return { orderId: result.id, checkoutUrl: url.toString() };
}

export async function getMercadoPagoOrder(id: string): Promise<MercadoPagoOrder> {
  if (!/^[A-Z0-9]{10,80}$/.test(id)) throw new Error("Identificador de order inválido.");
  const response = await fetch(`${api}/v1/orders/${id}`, {
    headers: { Authorization: `Bearer ${accessToken()}` },
    cache: "no-store",
    signal: AbortSignal.timeout(10000),
  });
  if (!response.ok) throw new Error(`Não foi possível consultar a order (${response.status}).`);
  return response.json() as Promise<MercadoPagoOrder>;
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
