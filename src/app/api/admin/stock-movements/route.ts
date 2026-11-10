import { randomUUID } from "node:crypto";
import { NextRequest, NextResponse } from "next/server";
import { apiError, badRequest, requireAdminApi, sameOrigin } from "@/lib/admin-api";
import { getAdminMovements } from "@/lib/admin-data";
import { transaction } from "@/lib/db";

export const runtime = "nodejs";

export async function GET() {
  const auth = await requireAdminApi();
  if (auth.response) return auth.response;
  try {
    return NextResponse.json(await getAdminMovements(100));
  } catch (error) {
    return apiError(error);
  }
}

export async function POST(request: NextRequest) {
  const auth = await requireAdminApi();
  if (auth.response) return auth.response;
  if (!sameOrigin(request)) return NextResponse.json({ error: "Origem inválida." }, { status: 403 });
  try {
    const body = await request.json();
    const { materialId, kind, quantity, unitCost, note = "" } = body;
    if (typeof materialId !== "string" || !["entrada", "saida", "contagem"].includes(kind)) return badRequest("Escolha um insumo e o tipo de movimentação.");
    if (typeof quantity !== "number" || !Number.isFinite(quantity) || quantity < 0 || quantity === 0 && kind !== "contagem") {
      return badRequest("Informe uma quantidade válida maior que zero.");
    }
    if (unitCost !== undefined && (typeof unitCost !== "number" || !Number.isFinite(unitCost) || unitCost < 0)) return badRequest("O custo unitário precisa ser igual ou maior que zero.");
    if (kind === "entrada" && !(typeof unitCost === "number" && unitCost > 0)) return badRequest("Informe o custo por unidade nesta entrada.");
    const id = randomUUID();
    await transaction(async (client) => {
      const locked = await client.query(
        "SELECT quantity, unit_cost, archived FROM inventory_materials WHERE id=$1 FOR UPDATE",
        [materialId],
      );
      if (!locked.rowCount || locked.rows[0].archived) throw new Error("Insumo não encontrado ou arquivado.");
      const current = Number(locked.rows[0].quantity);
      const currentCost = Number(locked.rows[0].unit_cost);
      let delta = quantity;
      if (kind === "saida") delta = -quantity;
      if (kind === "contagem") delta = quantity - current;
      const nextQuantity = current + delta;
      if (nextQuantity < 0) throw new Error("O saldo atual não permite essa baixa.");
      if (kind === "contagem" && delta > 0 && currentCost <= 0 && !(typeof unitCost === "number" && unitCost > 0)) {
        throw new Error("Informe o custo unitário para contar um saldo novo.");
      }
      const entryCost = typeof unitCost === "number" ? unitCost : currentCost;
      const nextCost = kind === "entrada" && nextQuantity > 0
        ? (current * currentCost + quantity * entryCost) / nextQuantity
        : (kind === "contagem" && delta > 0 && typeof unitCost === "number" && nextQuantity > 0
          ? (current * currentCost + delta * entryCost) / nextQuantity
          : currentCost);
      await client.query(
        "UPDATE inventory_materials SET quantity=$2, unit_cost=$3, updated_at=NOW() WHERE id=$1",
        [materialId, nextQuantity, nextCost],
      );
      await client.query(
        `INSERT INTO inventory_movements (id,material_id,kind,quantity_delta,unit_cost,note)
         VALUES ($1,$2,$3,$4,$5,$6)`,
        [id, materialId, kind, delta, entryCost, String(note).slice(0, 400)],
      );
    });
    return NextResponse.json({ id }, { status: 201 });
  } catch (error) {
    if (error instanceof Error && (error.message.includes("saldo") || error.message.includes("arquivado"))) {
      return NextResponse.json({ error: error.message }, { status: 409 });
    }
    if (error instanceof Error && error.message.includes("custo unitário")) return badRequest(error.message);
    return apiError(error);
  }
}
