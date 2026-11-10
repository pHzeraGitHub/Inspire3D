import { randomUUID } from "node:crypto";
import { NextRequest, NextResponse } from "next/server";
import { apiError, badRequest, requireAdminApi, sameOrigin } from "@/lib/admin-api";
import { transaction } from "@/lib/db";
import { SaleError, saleCode } from "@/lib/sales";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  const auth = await requireAdminApi();
  if (auth.response) return auth.response;
  if (!sameOrigin(request)) return NextResponse.json({ error: "Origem inválida." }, { status: 403 });
  try {
    const body = await request.json();
    const productId = body.productId;
    const quantity = body.quantity;
    const saleId = body.saleId === undefined ? null : body.saleId;
    if (typeof productId !== "string" || typeof quantity !== "number" || !Number.isInteger(quantity) || quantity <= 0 || quantity > 10000) {
      return badRequest("Informe um produto e uma quantidade inteira maior que zero.");
    }
    if (saleId !== null && (typeof saleId !== "string" || !saleId)) return badRequest("Pedido inválido para esta produção.");
    const runId = randomUUID();
    let totalCost = 0;
    await transaction(async (client) => {
      if (saleId) {
        const sale = await client.query("SELECT status FROM sales WHERE id=$1 FOR UPDATE", [saleId]);
        if (!sale.rowCount || sale.rows[0].status !== "confirmed") {
          throw new SaleError("A encomenda precisa estar confirmada para registrar a produção.", 409);
        }
        const ordered = await client.query(
          `SELECT COALESCE(SUM(quantity), 0) AS quantity FROM sale_items
           WHERE sale_id=$1 AND product_id=$2 AND fulfillment='made_to_order'`,
          [saleId, productId],
        );
        const produced = await client.query(
          "SELECT COALESCE(SUM(quantity), 0) AS quantity FROM production_runs WHERE sale_id=$1 AND product_id=$2",
          [saleId, productId],
        );
        if (Number(ordered.rows[0].quantity) < Number(produced.rows[0].quantity) + quantity) {
          throw new SaleError("A quantidade ultrapassa o saldo a produzir desta encomenda.", 409);
        }
      }
      const product = await client.query("SELECT id FROM products WHERE id=$1 FOR UPDATE", [productId]);
      if (!product.rowCount) throw new Error("Produto não encontrado.");
      const recipe = await client.query(
        `SELECT m.id, m.name, m.unit, m.quantity, m.unit_cost, pm.quantity_per_unit
         FROM product_materials pm JOIN inventory_materials m ON m.id=pm.material_id
         WHERE pm.product_id=$1 AND m.archived=FALSE FOR UPDATE OF m`,
        [productId],
      );
      if (!recipe.rowCount) throw new Error("Cadastre os insumos e quantidades na ficha técnica antes de registrar uma produção.");
      const deductions = recipe.rows.map((row) => ({
        id: row.id as string, name: row.name as string, unit: row.unit as string,
        available: Number(row.quantity), unitCost: Number(row.unit_cost),
        amount: Number(row.quantity_per_unit) * quantity,
      }));
      const shortage = deductions.find((line) => line.available + 1e-9 < line.amount);
      if (shortage) throw new Error(`Estoque insuficiente: ${shortage.name} tem ${shortage.available} ${shortage.unit}; são necessários ${shortage.amount.toFixed(3)} ${shortage.unit}.`);
      const unknownCost = deductions.find((line) => line.unitCost <= 0);
      if (unknownCost) throw new Error(`Cadastre o custo médio de ${unknownCost.name} antes de produzir para manter o custo correto.`);
      for (const line of deductions) {
        const itemCost = line.amount * line.unitCost;
        totalCost += itemCost;
        await client.query("UPDATE inventory_materials SET quantity=quantity-$2, updated_at=NOW() WHERE id=$1", [line.id, line.amount]);
        await client.query(
          `INSERT INTO inventory_movements (id,material_id,kind,quantity_delta,unit_cost,product_id,note)
           VALUES ($1,$2,'producao',$3,$4,$5,$6)`,
          [randomUUID(), line.id, -line.amount, line.unitCost, productId, `Produção de ${quantity} unidade(s)`],
        );
      }
      await client.query("UPDATE products SET finished_stock=finished_stock+$2, updated_at=NOW() WHERE id=$1", [productId, quantity]);
      await client.query(
        "INSERT INTO production_runs (id,product_id,quantity,material_cost,note,sale_id) VALUES ($1,$2,$3,$4,$5,$6)",
        [runId, productId, quantity, totalCost, String(body.note ?? "").slice(0, 400), saleId],
      );
      await client.query(
        `INSERT INTO finished_stock_movements (id,product_id,sale_id,kind,quantity_delta,note)
         VALUES ($1,$2,$3,'production',$4,$5)`,
        [randomUUID(), productId, saleId, quantity,
          saleId ? `Produção para ${saleCode(saleId)}` : "Produção registrada no painel"],
      );
    });
    return NextResponse.json({ id: runId, materialCost: totalCost }, { status: 201 });
  } catch (error) {
    if (error instanceof SaleError) return NextResponse.json({ error: error.message }, { status: error.status });
    if (error instanceof Error && ["não encontrado", "Cadastre", "Estoque insuficiente"].some((part) => error.message.includes(part))) {
      return NextResponse.json({ error: error.message }, { status: 409 });
    }
    return apiError(error);
  }
}
