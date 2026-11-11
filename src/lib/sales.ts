import "server-only";
import { randomUUID } from "node:crypto";
import { query, transaction, type DbExecutor } from "@/lib/db";

export type SaleStatus = "draft" | "confirmed" | "delivered" | "cancelled";
export type PaymentStatus = "pending" | "paid" | "refunded";
export type Fulfillment = "stock" | "made_to_order" | "custom";

export type SaleItemRecord = {
  id: string;
  productId: string | null;
  name: string;
  fulfillment: Fulfillment;
  quantity: number;
  unitPrice: number;
  unitCostEstimate: number | null;
  producedQuantity: number;
  options: Record<string, string>;
};

export type SaleRecord = {
  id: string;
  customerName: string;
  customerContact: string;
  channel: string;
  status: SaleStatus;
  paymentStatus: PaymentStatus;
  paymentMethod: string;
  subtotal: number;
  discount: number;
  shipping: number;
  total: number;
  notes: string;
  createdAt: string;
  onlineStage: string | null;
  trackingCode: string;
  items: SaleItemRecord[];
};

export class SaleError extends Error {
  constructor(message: string, public status = 400) { super(message); }
}

const money = (value: number) => Math.round((value + Number.EPSILON) * 100) / 100;
const number = (value: unknown) => Number(value ?? 0);
const code = (id: string) => `VEN-${id.slice(0, 8).toUpperCase()}`;
export { code as saleCode };

export async function getAdminSales(): Promise<SaleRecord[]> {
  const sales = await query(
    `SELECT s.id, s.customer_name, s.customer_contact, s.channel, s.status, s.payment_status,
      s.payment_method, s.subtotal, s.discount, s.shipping, s.total, s.notes, s.created_at,
      o.stage AS online_stage, o.tracking_code
     FROM sales s LEFT JOIN online_orders o ON o.sale_id=s.id ORDER BY s.created_at DESC`,
  );
  if (!sales.rows.length) return [];
  const ids = sales.rows.map((row) => String(row.id));
  const items = await query(
    `SELECT si.id, si.sale_id, si.product_id, si.name_snapshot, si.fulfillment,
      si.quantity, si.unit_price, si.unit_cost_estimate, si.options_snapshot,
      COALESCE(SUM(pr.quantity), 0) AS produced_quantity
     FROM sale_items si LEFT JOIN production_runs pr ON pr.sale_id=si.sale_id AND pr.product_id=si.product_id
     WHERE si.sale_id=ANY($1::text[])
     GROUP BY si.id ORDER BY si.name_snapshot`,
    [ids],
  );
  const bySale = new Map<string, SaleItemRecord[]>();
  for (const row of items.rows) {
    const list = bySale.get(String(row.sale_id)) ?? [];
    list.push({
      id: String(row.id), productId: row.product_id ? String(row.product_id) : null,
      name: String(row.name_snapshot), fulfillment: row.fulfillment as Fulfillment,
      quantity: number(row.quantity), unitPrice: number(row.unit_price),
      unitCostEstimate: row.unit_cost_estimate === null ? null : number(row.unit_cost_estimate),
      producedQuantity: number(row.produced_quantity),
      options: row.options_snapshot ?? {},
    });
    bySale.set(String(row.sale_id), list);
  }
  return sales.rows.map((row) => ({
    id: String(row.id), customerName: String(row.customer_name),
    customerContact: String(row.customer_contact), channel: String(row.channel),
    status: row.status as SaleStatus, paymentStatus: row.payment_status as PaymentStatus,
    paymentMethod: String(row.payment_method), subtotal: number(row.subtotal),
    discount: number(row.discount), shipping: number(row.shipping), total: number(row.total),
    notes: String(row.notes), createdAt: new Date(row.created_at).toISOString(),
    onlineStage: row.online_stage ? String(row.online_stage) : null,
    trackingCode: String(row.tracking_code ?? ""),
    items: bySale.get(String(row.id)) ?? [],
  }));
}

export async function getReservedProductQuantities(): Promise<Record<string, number>> {
  const result = await query(
    `SELECT si.product_id, SUM(si.quantity) AS quantity
     FROM sale_items si JOIN sales s ON s.id=si.sale_id
     WHERE s.status='confirmed' AND si.fulfillment='stock'
     GROUP BY si.product_id`,
  );
  return Object.fromEntries(result.rows.map((row) => [String(row.product_id), number(row.quantity)]));
}

export type FinishedStockMovement = {
  id: string; productName: string; saleId: string | null; kind: "production" | "sale";
  quantityDelta: number; note: string; createdAt: string;
};

export async function getFinishedStockMovements(): Promise<FinishedStockMovement[]> {
  const result = await query(
    `SELECT m.id, p.name AS product_name, m.sale_id, m.kind, m.quantity_delta, m.note, m.created_at
     FROM finished_stock_movements m JOIN products p ON p.id=m.product_id
     ORDER BY m.created_at DESC LIMIT 40`,
  );
  return result.rows.map((row) => ({ id: String(row.id), productName: String(row.product_name),
    saleId: row.sale_id ? String(row.sale_id) : null, kind: row.kind as "production" | "sale",
    quantityDelta: number(row.quantity_delta), note: String(row.note),
    createdAt: new Date(row.created_at).toISOString() }));
}

export async function getSalesOverview() {
  const result = await query(
    `SELECT COUNT(*) FILTER (WHERE status='confirmed') AS open_orders,
      COUNT(*) FILTER (WHERE status='delivered') AS delivered_orders,
      COALESCE(SUM(total) FILTER (WHERE payment_status='paid'), 0) AS received_total
     FROM sales`,
  );
  const row = result.rows[0];
  return { openOrders: number(row.open_orders), deliveredOrders: number(row.delivered_orders),
    receivedTotal: number(row.received_total) };
}

type DraftItem = { productId: string | null; name: string; fulfillment: Fulfillment; quantity: number; unitPrice: number };
type Draft = {
  customerName: string; customerContact: string; channel: string; paymentMethod: string;
  discount: number; shipping: number; notes: string; items: DraftItem[];
};

function parseDraft(value: unknown): Draft {
  if (!value || typeof value !== "object") throw new SaleError("Preencha os dados da venda.");
  const body = value as Record<string, unknown>;
  const customerName = String(body.customerName ?? "").trim();
  const customerContact = String(body.customerContact ?? "").trim();
  const channel = String(body.channel ?? "");
  const paymentMethod = String(body.paymentMethod ?? "").trim();
  const notes = String(body.notes ?? "").trim();
  const discount = Number(body.discount ?? 0);
  const shipping = Number(body.shipping ?? 0);
  if (!customerName || customerName.length > 120 || customerContact.length > 180 ||
    !["whatsapp", "instagram", "site", "outro"].includes(channel) ||
    paymentMethod.length > 80 || notes.length > 1000) {
    throw new SaleError("Confira o cliente, canal e informações do pedido.");
  }
  if (![discount, shipping].every((amount) => Number.isFinite(amount) && amount >= 0 && amount <= 1_000_000)) {
    throw new SaleError("Desconto e frete precisam ser valores válidos.");
  }
  if (!Array.isArray(body.items) || body.items.length < 1 || body.items.length > 20) {
    throw new SaleError("Adicione de 1 a 20 itens à venda.");
  }
  const items = body.items.map((raw): DraftItem => {
    if (!raw || typeof raw !== "object") throw new SaleError("Confira os itens da venda.");
    const item = raw as Record<string, unknown>;
    const fulfillment = String(item.fulfillment ?? "") as Fulfillment;
    const productId = typeof item.productId === "string" && item.productId ? item.productId : null;
    const name = String(item.name ?? "").trim();
    const quantity = Number(item.quantity);
    const unitPrice = Number(item.unitPrice);
    if (!["stock", "made_to_order", "custom"].includes(fulfillment) ||
      (fulfillment === "custom" ? (!name || name.length > 160 || productId !== null) : !productId) ||
      !Number.isInteger(quantity) || quantity <= 0 || quantity > 10_000 ||
      !Number.isFinite(unitPrice) || unitPrice < 0 || unitPrice > 1_000_000) {
      throw new SaleError("Confira produto, tipo, quantidade e preço de cada item.");
    }
    return { productId, name, fulfillment, quantity, unitPrice: money(unitPrice) };
  });
  const productKeys = items.filter((item) => item.productId)
    .map((item) => `${item.productId}:${item.fulfillment}`);
  if (new Set(productKeys).size !== productKeys.length) {
    throw new SaleError("Adicione cada produto uma vez por tipo de entrega e ajuste a quantidade na mesma linha.");
  }
  const subtotal = money(items.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0));
  if (discount > subtotal) throw new SaleError("O desconto não pode superar o subtotal dos itens.");
  return { customerName, customerContact, channel, paymentMethod, discount: money(discount),
    shipping: money(shipping), notes, items };
}

export async function saveSaleDraft(value: unknown, saleId?: string) {
  const draft = parseDraft(value);
  const id = saleId ?? randomUUID();
  const subtotal = money(draft.items.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0));
  const total = money(subtotal - draft.discount + draft.shipping);
  await transaction(async (client) => {
    if (saleId) {
      const existing = await client.query("SELECT status FROM sales WHERE id=$1 FOR UPDATE", [id]);
      if (!existing.rowCount) throw new SaleError("Venda não encontrada.", 404);
      if (existing.rows[0].status !== "draft") throw new SaleError("Somente rascunhos podem ser editados.", 409);
      const online = await client.query("SELECT 1 FROM online_orders WHERE sale_id=$1", [id]);
      if (online.rowCount) throw new SaleError("Compras online não podem ser editadas manualmente.", 409);
      await client.query(
        `UPDATE sales SET customer_name=$2, customer_contact=$3, channel=$4, payment_method=$5,
          subtotal=$6, discount=$7, shipping=$8, total=$9, notes=$10, updated_at=NOW() WHERE id=$1`,
        [id, draft.customerName, draft.customerContact, draft.channel, draft.paymentMethod,
          subtotal, draft.discount, draft.shipping, total, draft.notes],
      );
      await client.query("DELETE FROM sale_items WHERE sale_id=$1", [id]);
    } else {
      await client.query(
        `INSERT INTO sales (id, customer_name, customer_contact, channel, payment_method,
          subtotal, discount, shipping, total, notes) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)`,
        [id, draft.customerName, draft.customerContact, draft.channel, draft.paymentMethod,
          subtotal, draft.discount, draft.shipping, total, draft.notes],
      );
    }
    for (const item of draft.items) {
      let name = item.name;
      let cost: number | null = null;
      if (item.productId) {
        const product = await client.query(
          `SELECT p.name, p.estimated_labor_cost, p.estimated_energy_cost,
            p.estimated_packaging_cost, p.estimated_other_cost,
            p.estimated_tax_percent, p.estimated_payment_fee_percent,
            COALESCE(SUM(pm.quantity_per_unit * m.unit_cost), 0) AS material_cost
           FROM products p LEFT JOIN product_materials pm ON pm.product_id=p.id
           LEFT JOIN inventory_materials m ON m.id=pm.material_id
           WHERE p.id=$1 GROUP BY p.id`,
          [item.productId],
        );
        if (!product.rowCount) throw new SaleError("Um dos produtos não foi encontrado.", 409);
        const row = product.rows[0];
        name = String(row.name);
        cost = money(number(row.material_cost) + number(row.estimated_labor_cost) +
          number(row.estimated_energy_cost) + number(row.estimated_packaging_cost) +
          number(row.estimated_other_cost) + item.unitPrice *
          (number(row.estimated_tax_percent) + number(row.estimated_payment_fee_percent)) / 100);
      }
      await client.query(
        `INSERT INTO sale_items (id, sale_id, product_id, name_snapshot, fulfillment,
          quantity, unit_price, unit_cost_estimate) VALUES ($1,$2,$3,$4,$5,$6,$7,$8)`,
        [randomUUID(), id, item.productId, name, item.fulfillment, item.quantity, item.unitPrice, cost],
      );
    }
  });
  return { id, total };
}

async function lockProducts(client: DbExecutor, ids: string[]) {
  if (!ids.length) return new Map<string, number>();
  const locked = await client.query(
    "SELECT id, finished_stock FROM products WHERE id=ANY($1::text[]) ORDER BY id FOR UPDATE",
    [ids],
  );
  if (locked.rows.length !== ids.length) throw new SaleError("Um produto do pedido não existe mais.", 409);
  return new Map(locked.rows.map((row) => [String(row.id), number(row.finished_stock)]));
}

async function otherReservations(client: DbExecutor, ids: string[], excludeSaleId?: string) {
  if (!ids.length) return new Map<string, number>();
  const result = await client.query(
    `SELECT si.product_id, SUM(si.quantity) AS quantity
     FROM sale_items si JOIN sales s ON s.id=si.sale_id
     WHERE s.status='confirmed' AND si.fulfillment='stock'
       AND si.product_id=ANY($1::text[]) AND ($2::text IS NULL OR s.id<>$2)
     GROUP BY si.product_id`,
    [ids, excludeSaleId ?? null],
  );
  return new Map(result.rows.map((row) => [String(row.product_id), number(row.quantity)]));
}

export async function changeSaleStatusInTransaction(client: DbExecutor, id: string, action: "confirm" | "deliver" | "cancel", fromOnlineFlow = false) {
    const sale = await client.query("SELECT status FROM sales WHERE id=$1 FOR UPDATE", [id]);
    if (!sale.rowCount) throw new SaleError("Venda não encontrada.", 404);
    const status = sale.rows[0].status as SaleStatus;
    const onlineOrder = await client.query("SELECT stage FROM online_orders WHERE sale_id=$1", [id]);
    if (onlineOrder.rowCount && (!fromOnlineFlow || action !== "deliver")) {
      throw new SaleError("Pedido online: pagamento e entrega seguem o fluxo de acompanhamento.", 409);
    }
    const items = await client.query("SELECT product_id, fulfillment, quantity FROM sale_items WHERE sale_id=$1", [id]);
    if (action === "confirm" && status !== "draft") throw new SaleError("Somente rascunhos podem ser confirmados.", 409);
    if (action === "deliver" && status !== "confirmed") throw new SaleError("Confirme o pedido antes de registrar a entrega.", 409);
    if (action === "cancel" && !["draft", "confirmed"].includes(status)) {
      throw new SaleError("Somente pedidos ainda não entregues podem ser cancelados.", 409);
    }
    if (action !== "cancel") {
      if (action === "deliver") {
        const madeToOrder = new Map<string, number>();
        for (const item of items.rows) {
          if (item.fulfillment !== "made_to_order") continue;
          const productId = String(item.product_id);
          madeToOrder.set(productId, (madeToOrder.get(productId) ?? 0) + number(item.quantity));
        }
        if (madeToOrder.size) {
          const produced = await client.query(
            `SELECT product_id, COALESCE(SUM(quantity), 0) AS quantity
             FROM production_runs WHERE sale_id=$1 GROUP BY product_id`,
            [id],
          );
          const completed = new Map(produced.rows.map((row) => [String(row.product_id), number(row.quantity)]));
          for (const [productId, quantity] of madeToOrder) {
            if ((completed.get(productId) ?? 0) < quantity) {
              throw new SaleError("Registre toda a produção desta encomenda antes de entregar.", 409);
            }
          }
        }
      }
      const required = new Map<string, number>();
      for (const item of items.rows) {
        if (!item.product_id || action === "confirm" && item.fulfillment !== "stock") continue;
        const productId = String(item.product_id);
        required.set(productId, (required.get(productId) ?? 0) + number(item.quantity));
      }
      const ids = [...required.keys()].sort();
      const stocks = await lockProducts(client, ids);
      const reserved = await otherReservations(client, ids, action === "deliver" ? id : undefined);
      for (const [productId, quantity] of required) {
        if ((stocks.get(productId) ?? 0) - (reserved.get(productId) ?? 0) < quantity) {
          throw new SaleError(action === "confirm"
            ? "Estoque disponível insuficiente para reservar este pedido. Use 'Sob encomenda' ou produza primeiro."
            : "Estoque disponível insuficiente para entregar. Registre a produção primeiro.", 409);
        }
      }
      if (action === "deliver") {
        for (const [productId, quantity] of required) {
          await client.query("UPDATE products SET finished_stock=finished_stock-$2, updated_at=NOW() WHERE id=$1", [productId, quantity]);
          await client.query(
            `INSERT INTO finished_stock_movements (id, product_id, sale_id, kind, quantity_delta, note)
             VALUES ($1,$2,$3,'sale',$4,$5)`,
            [randomUUID(), productId, id, -quantity, `Entrega do pedido ${code(id)}`],
          );
        }
      }
    }
    const next = action === "confirm" ? "confirmed" : action === "deliver" ? "delivered" : "cancelled";
    const timestamp = action === "confirm" ? "confirmed_at" : action === "deliver" ? "delivered_at" : "cancelled_at";
    await client.query(`UPDATE sales SET status=$2, ${timestamp}=NOW(), updated_at=NOW() WHERE id=$1`, [id, next]);
    if (action === "cancel") {
      const online = await client.query("UPDATE online_orders SET stage='cancelled', updated_at=NOW() WHERE sale_id=$1 RETURNING sale_id", [id]);
      if (online.rowCount) await client.query("INSERT INTO order_events (id,sale_id,kind,title) VALUES ($1,$2,'cancelled','Pedido cancelado')", [randomUUID(), id]);
    }
}

export async function changeSaleStatus(id: string, action: "confirm" | "deliver" | "cancel") {
  await transaction((client) => changeSaleStatusInTransaction(client, id, action));
}

export async function changeSalePayment(id: string, action: "paid" | "refunded", method?: string) {
  const paymentMethod = String(method ?? "").trim();
  await transaction(async (client) => {
    const sale = await client.query("SELECT status, payment_status FROM sales WHERE id=$1 FOR UPDATE", [id]);
    if (!sale.rowCount) throw new SaleError("Venda não encontrada.", 404);
    const online = await client.query("SELECT 1 FROM online_orders WHERE sale_id=$1", [id]);
    if (online.rowCount) throw new SaleError("O pagamento online é atualizado pelo Mercado Pago.", 409);
    const row = sale.rows[0];
    if (action === "paid" && (!["confirmed", "delivered"].includes(row.status) || row.payment_status !== "pending")) {
      throw new SaleError("Confirme o pedido antes de registrar o pagamento.", 409);
    }
    if (action === "paid" && (!paymentMethod || paymentMethod.length > 80)) {
      throw new SaleError("Informe a forma de pagamento.");
    }
    if (action === "refunded" && (row.status !== "cancelled" || row.payment_status !== "paid")) {
      throw new SaleError("O estorno pode ser marcado após cancelar um pedido pago.", 409);
    }
    await client.query(
      "UPDATE sales SET payment_status=$2, payment_method=CASE WHEN $2='paid' THEN $3 ELSE payment_method END, updated_at=NOW() WHERE id=$1",
      [id, action, paymentMethod],
    );
  });
}
