import "server-only";
import { createHash, randomBytes, randomUUID, timingSafeEqual } from "node:crypto";
import { query, transaction } from "@/lib/db";
import { changeSaleStatusInTransaction, SaleError, saleCode } from "@/lib/sales";
import { createPaymentOrder, type MercadoPagoOrder, paymentConfigured } from "@/lib/mercado-pago";
import { sendOrderLink } from "@/lib/order-mail";
import { getShippableProduct, quoteShipping, shippingConfigured } from "@/lib/shipping";

const hashToken = (value: string) => createHash("sha256").update(value).digest("hex");
const money = (value: number) => Math.round((value + Number.EPSILON) * 100) / 100;
const number = (value: unknown) => Number(value ?? 0);

export type ShippingAddress = {
  postalCode: string; street: string; number: string; complement: string;
  neighborhood: string; city: string; state: string;
};
export type OnlineStage = "awaiting_payment" | "queued" | "production" | "quality" | "packed" | "shipped" | "delivered" | "cancelled";

export function commerceConfigured() {
  return paymentConfigured() && shippingConfigured() && Boolean(process.env.NEXT_PUBLIC_SITE_URL?.startsWith("https://"));
}

function productionDate(days: number) {
  const parts = new Intl.DateTimeFormat("en-US", { timeZone: "America/Sao_Paulo", year: "numeric", month: "numeric", day: "numeric" })
    .formatToParts(new Date());
  const part = (type: string) => Number(parts.find((item) => item.type === type)?.value);
  const date = new Date(Date.UTC(part("year"), part("month") - 1, part("day"), 12));
  let remaining = days;
  while (remaining > 0) {
    date.setUTCDate(date.getUTCDate() + 1);
    if (date.getUTCDay() !== 0 && date.getUTCDay() !== 6) remaining--;
  }
  return date.toISOString();
}

function deliveryDate(productionAt: string, transitDays: number) {
  const date = new Date(productionAt);
  // The parcel is posted on the first available posting day after production.
  do { date.setUTCDate(date.getUTCDate() + 1); }
  while (![1, 2, 4].includes(date.getUTCDay()));
  let remaining = transitDays;
  while (remaining > 0) {
    date.setUTCDate(date.getUTCDate() + 1);
    if (date.getUTCDay() !== 0 && date.getUTCDay() !== 6) remaining--;
  }
  return date.toISOString();
}

function parseCheckout(value: unknown) {
  if (!value || typeof value !== "object") throw new SaleError("Preencha os dados da compra.");
  const body = value as Record<string, unknown>;
  const productId = String(body.productId ?? "").trim();
  const quantity = Number(body.quantity);
  const customerName = String(body.customerName ?? "").trim();
  const customerEmail = String(body.customerEmail ?? "").trim().toLowerCase();
  const customerPhone = String(body.customerPhone ?? "").trim();
  const shippingServiceId = String(body.shippingServiceId ?? "");
  const expectedShipping = Number(body.expectedShipping);
  const expectedUnitPrice = Number(body.expectedUnitPrice);
  const rawChoices = body.choices && typeof body.choices === "object" && !Array.isArray(body.choices)
    ? body.choices as Record<string, unknown> : {};
  const rawAddress = body.address && typeof body.address === "object" ? body.address as Record<string, unknown> : {};
  const address: ShippingAddress = {
    postalCode: String(rawAddress.postalCode ?? "").replace(/\D/g, ""),
    street: String(rawAddress.street ?? "").trim(), number: String(rawAddress.number ?? "").trim(),
    complement: String(rawAddress.complement ?? "").trim(), neighborhood: String(rawAddress.neighborhood ?? "").trim(),
    city: String(rawAddress.city ?? "").trim(), state: String(rawAddress.state ?? "").trim().toUpperCase(),
  };
  if (!productId || productId.length > 100 || !Number.isInteger(quantity) || quantity < 1 || quantity > 20) throw new SaleError("Confira o produto e a quantidade.");
  if (!/^\d{1,8}$/.test(shippingServiceId) || !Number.isFinite(expectedShipping) || expectedShipping < 0 ||
    !Number.isFinite(expectedUnitPrice) || expectedUnitPrice <= 0) throw new SaleError("Selecione uma entrega e confira o total.");
  if (!customerName || customerName.length > 120 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(customerEmail) || customerEmail.length > 180 || customerPhone.length > 30) throw new SaleError("Confira nome, e-mail e telefone.");
  if (address.postalCode.length !== 8 || !address.street || !address.number || !address.neighborhood || !address.city || !/^[A-Z]{2}$/.test(address.state) ||
    [address.street, address.number, address.neighborhood, address.city].some((field) => field.length > 120) || address.complement.length > 120) {
    throw new SaleError("Confira o endereço de entrega e o CEP.");
  }
  if (Object.keys(rawChoices).length > 20 || Object.values(rawChoices).some((choice) => typeof choice !== "string" || choice.length > 120)) {
    throw new SaleError("Confira as opções de personalização.");
  }
  const choices = Object.fromEntries(Object.entries(rawChoices).map(([key, choice]) => [key, String(choice).trim()]));
  return { productId, quantity, customerName, customerEmail, customerPhone, address, choices,
    shippingServiceId, expectedShipping, expectedUnitPrice };
}

export async function createOnlineOrder(value: unknown) {
  if (!commerceConfigured()) throw new SaleError("Checkout ainda não configurado. Entre em contato com o estúdio.", 503);
  const input = parseCheckout(value);
  const product = await getShippableProduct(input.productId);
  const variants = product.variants;
  const personalization = product.personalizationOptions;
  const allowed = new Set([...variants.map((variant) => variant.label), ...personalization]);
  if (Object.keys(input.choices).some((key) => !allowed.has(key)) ||
    variants.some((variant) => !variant.options.includes(input.choices[variant.label] ?? ""))) {
    throw new SaleError("Escolha as opções disponíveis para este produto.");
  }
  const unitPrice = product.price;
  if (money(input.expectedUnitPrice) !== unitPrice) throw new SaleError("O preço do produto mudou. Atualize a página para conferir o total.", 409);
  const subtotal = money(unitPrice * input.quantity);
  const options = await quoteShipping(product, input.quantity, input.address.postalCode);
  const selected = options.find((option) => option.id === input.shippingServiceId);
  if (!selected) throw new SaleError("Esta modalidade de entrega não está mais disponível. Faça uma nova cotação.", 409);
  if (selected.price !== money(input.expectedShipping)) throw new SaleError("O valor do frete mudou. Faça uma nova cotação antes de pagar.", 409);
  const shipping = selected.price;
  const total = money(subtotal + shipping);
  const id = randomUUID();
  const token = randomBytes(32).toString("base64url");
  const estimatedAt = productionDate(product.productionDays);
  const estimatedDeliveryAt = deliveryDate(estimatedAt, selected.deliveryDays);
  await transaction(async (client) => {
    await client.query(
      `INSERT INTO sales (id, customer_name, customer_contact, channel, subtotal, shipping, total)
       VALUES ($1,$2,$3,'site',$4,$5,$6)`,
      [id, input.customerName, input.customerEmail, subtotal, shipping, total],
    );
    await client.query(
      `INSERT INTO sale_items (id,sale_id,product_id,name_snapshot,fulfillment,quantity,unit_price,options_snapshot)
       VALUES ($1,$2,$3,$4,'made_to_order',$5,$6,$7::jsonb)`,
      [randomUUID(), id, input.productId, product.name, input.quantity, unitPrice, JSON.stringify(input.choices)],
    );
    await client.query(
      `INSERT INTO online_orders (sale_id,access_token_hash,customer_email,customer_phone,shipping_address,estimated_production_at,
        shipping_service_id,shipping_method,shipping_carrier,shipping_delivery_days,estimated_delivery_at)
       VALUES ($1,$2,$3,$4,$5::jsonb,$6,$7,$8,$9,$10,$11)`,
      [id, hashToken(token), input.customerEmail, input.customerPhone, JSON.stringify(input.address), estimatedAt,
        selected.id, selected.name, selected.carrier, selected.deliveryDays, estimatedDeliveryAt],
    );
    await client.query(
      `INSERT INTO order_events (id,sale_id,kind,title,detail) VALUES ($1,$2,'created','Pedido iniciado','Aguardando pagamento.')`,
      [randomUUID(), id],
    );
  });
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL!.replace(/\/$/, "");
  const returnUrl = `${baseUrl}/pedido/${id}?chave=${encodeURIComponent(token)}`;
  try {
    const paymentOrder = await createPaymentOrder({ saleId: id, productName: product.name, quantity: input.quantity,
      unitPrice, shipping, customerName: input.customerName, customerEmail: input.customerEmail, returnUrl });
    await query("UPDATE online_orders SET payment_order_id=$2, payment_checkout_url=$3, updated_at=NOW() WHERE sale_id=$1", [id, paymentOrder.orderId, paymentOrder.checkoutUrl]);
    await sendOrderLink({ email: input.customerEmail, name: input.customerName, code: saleCode(id), url: returnUrl });
    return { id, code: saleCode(id), checkoutUrl: paymentOrder.checkoutUrl, trackingUrl: returnUrl };
  } catch (error) {
    await transaction(async (client) => {
      await client.query("UPDATE sales SET status='cancelled', cancelled_at=NOW(), updated_at=NOW() WHERE id=$1", [id]);
      await client.query("UPDATE online_orders SET stage='cancelled', updated_at=NOW() WHERE sale_id=$1", [id]);
    });
    throw error;
  }
}

function tokenMatches(provided: string, expectedHash: string) {
  if (!provided || provided.length > 100) return false;
  const a = Buffer.from(hashToken(provided), "hex");
  const b = Buffer.from(expectedHash, "hex");
  return a.length === b.length && timingSafeEqual(a, b);
}

export async function getOnlineOrder(id: string, token: string) {
  const result = await query(
    `SELECT s.id, s.customer_name, s.status, s.payment_status, s.payment_method,
      s.subtotal, s.shipping, s.total, s.created_at,
      o.access_token_hash, o.stage, o.estimated_production_at, o.shipping_address,
      o.tracking_code, o.tracking_url, o.shipped_at, o.payment_checkout_url, o.payment_order_id,
      o.shipping_method, o.shipping_carrier, o.shipping_delivery_days, o.estimated_delivery_at
     FROM sales s JOIN online_orders o ON o.sale_id=s.id WHERE s.id=$1`, [id],
  );
  const row = result.rows[0];
  if (!row || !tokenMatches(token, String(row.access_token_hash))) return null;
  const [items, events] = await Promise.all([
    query("SELECT name_snapshot, quantity, unit_price, options_snapshot FROM sale_items WHERE sale_id=$1 ORDER BY name_snapshot", [id]),
    query("SELECT kind,title,detail,created_at FROM order_events WHERE sale_id=$1 ORDER BY created_at ASC", [id]),
  ]);
  return {
    id: String(row.id), code: saleCode(String(row.id)), customerName: String(row.customer_name),
    status: String(row.status), paymentStatus: String(row.payment_status), paymentMethod: String(row.payment_method),
    subtotal: number(row.subtotal), shipping: number(row.shipping), total: number(row.total),
    createdAt: new Date(row.created_at).toISOString(), stage: row.stage as OnlineStage,
    estimatedProductionAt: row.estimated_production_at ? new Date(row.estimated_production_at).toISOString() : null,
    estimatedDeliveryAt: row.estimated_delivery_at ? new Date(row.estimated_delivery_at).toISOString() : null,
    shippingMethod: String(row.shipping_method), shippingCarrier: String(row.shipping_carrier),
    shippingDeliveryDays: number(row.shipping_delivery_days),
    address: row.shipping_address as ShippingAddress, trackingCode: String(row.tracking_code),
    trackingUrl: String(row.tracking_url), shippedAt: row.shipped_at ? new Date(row.shipped_at).toISOString() : null,
    paymentCheckoutUrl: row.payment_status === "pending" ? String(row.payment_checkout_url) : "",
    paymentOrderId: String(row.payment_order_id ?? ""),
    items: items.rows.map((item) => ({ name: String(item.name_snapshot), quantity: number(item.quantity), unitPrice: number(item.unit_price), options: item.options_snapshot as Record<string, string> })),
    events: events.rows.map((event) => ({ kind: String(event.kind), title: String(event.title), detail: String(event.detail), createdAt: new Date(event.created_at).toISOString() })),
  };
}

export async function reconcileMercadoPagoOrder(order: MercadoPagoOrder) {
  const id = order.external_reference;
  if (!id || !/^[0-9a-f-]{36}$/i.test(id) || !/^[A-Z0-9]{10,80}$/.test(order.id) || order.type !== "online") return;
  await transaction(async (client) => {
    const result = await client.query(
      `SELECT s.id, s.status, s.payment_status, s.total, o.stage, o.shipping_delivery_days, o.payment_order_id
       FROM sales s JOIN online_orders o ON o.sale_id=s.id WHERE s.id=$1 FOR UPDATE OF s, o`, [id],
    );
    const row = result.rows[0];
    if (!row || row.payment_order_id !== order.id || money(number(order.total_amount)) !== money(number(row.total))) return;
    const approved = order.status === "processed" && order.status_detail === "accredited" &&
      money(number(order.total_paid_amount)) >= money(number(row.total));
    const payment = order.transactions?.payments?.find((item) => item.status === "processed" && item.status_detail === "accredited");
    if (approved && row.payment_status === "pending" && row.status === "draft") {
      const lead = await client.query(
        `SELECT COALESCE(MAX(p.production_days), 7) AS days
         FROM sale_items si JOIN products p ON p.id=si.product_id WHERE si.sale_id=$1`, [id],
      );
      const estimatedAt = productionDate(number(lead.rows[0]?.days) || 7);
      await client.query(
        `UPDATE sales SET status='confirmed', payment_status='paid', payment_method=$2,
          confirmed_at=NOW(), updated_at=NOW() WHERE id=$1`, [id, payment?.payment_method?.id || "Mercado Pago"],
      );
      await client.query("UPDATE online_orders SET stage='queued', payment_id=$2, estimated_production_at=$3, estimated_delivery_at=$4, updated_at=NOW() WHERE sale_id=$1",
        [id, payment?.id || order.id, estimatedAt, deliveryDate(estimatedAt, number(row.shipping_delivery_days))]);
      await client.query(
        `INSERT INTO order_events (id,sale_id,kind,title,detail)
         VALUES ($1,$2,'paid','Pagamento aprovado','Pedido enviado para a fila de produção.')`, [randomUUID(), id],
      );
    } else if (order.status === "refunded" && row.payment_status === "paid") {
      await client.query("UPDATE sales SET payment_status='refunded', updated_at=NOW() WHERE id=$1", [id]);
      await client.query("INSERT INTO order_events (id,sale_id,kind,title) VALUES ($1,$2,'refunded','Pagamento estornado')", [randomUUID(), id]);
    }
  });
}

const nextStage: Partial<Record<OnlineStage, OnlineStage>> = {
  queued: "production", production: "quality", quality: "packed", packed: "shipped", shipped: "delivered",
};
const stageTitle: Record<OnlineStage, string> = {
  awaiting_payment: "Aguardando pagamento", queued: "Na fila de produção", production: "Em produção",
  quality: "Em conferência", packed: "Embalado", shipped: "Enviado", delivered: "Entregue", cancelled: "Cancelado",
};

export async function advanceOnlineOrder(id: string, trackingCode?: string, trackingUrl?: string) {
  const existing = await query("SELECT stage FROM online_orders WHERE sale_id=$1", [id]);
  if (!existing.rowCount) throw new SaleError("Pedido online não encontrado.", 404);
  const current = existing.rows[0].stage as OnlineStage;
  const next = nextStage[current];
  if (!next) throw new SaleError("Este pedido não pode avançar de etapa.", 409);
  if (current === "production") {
    const missing = await query(
      `SELECT si.quantity - COALESCE(SUM(pr.quantity),0) AS remaining
       FROM sale_items si LEFT JOIN production_runs pr ON pr.sale_id=si.sale_id AND pr.product_id=si.product_id
       WHERE si.sale_id=$1 AND si.fulfillment='made_to_order' GROUP BY si.id`, [id],
    );
    if (missing.rows.some((row) => number(row.remaining) > 0)) throw new SaleError("Registre toda a produção antes de iniciar a conferência.", 409);
  }
  if (next === "shipped" && !String(trackingCode ?? "").trim()) throw new SaleError("Informe o código de rastreio antes de enviar.");
  if (next === "shipped" && trackingUrl) {
    try { if (new URL(trackingUrl).protocol !== "https:") throw new Error(); }
    catch { throw new SaleError("O link de rastreio precisa usar HTTPS."); }
  }
  await transaction(async (client) => {
    const result = await client.query(
      "SELECT o.stage, s.payment_status FROM sales s JOIN online_orders o ON o.sale_id=s.id WHERE s.id=$1 FOR UPDATE OF s, o", [id],
    );
    if (result.rows[0]?.stage !== current) throw new SaleError("A etapa do pedido mudou. Atualize a página.", 409);
    if (result.rows[0]?.payment_status !== "paid") throw new SaleError("Aguarde a confirmação do pagamento para avançar o pedido.", 409);
    if (next === "delivered") await changeSaleStatusInTransaction(client, id, "deliver", true);
    await client.query(
      `UPDATE online_orders SET stage=$2, tracking_code=CASE WHEN $2='shipped' THEN $3 ELSE tracking_code END,
        tracking_url=CASE WHEN $2='shipped' THEN $4 ELSE tracking_url END,
        shipped_at=CASE WHEN $2='shipped' THEN NOW() ELSE shipped_at END, updated_at=NOW() WHERE sale_id=$1`,
      [id, next, String(trackingCode ?? "").trim().slice(0, 120), String(trackingUrl ?? "").trim().slice(0, 500)],
    );
    await client.query("INSERT INTO order_events (id,sale_id,kind,title) VALUES ($1,$2,$3,$4)", [randomUUID(), id, next, stageTitle[next]]);
  });
  return next;
}
