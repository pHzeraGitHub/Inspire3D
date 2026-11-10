import { randomUUID } from "node:crypto";
import { NextRequest, NextResponse } from "next/server";
import { badRequest, requireAdminApi, apiError, sameOrigin } from "@/lib/admin-api";
import { getAdminMaterials } from "@/lib/admin-data";
import { transaction } from "@/lib/db";

export const runtime = "nodejs";

const nonnegative = (value: unknown) => typeof value === "number" && Number.isFinite(value) && value >= 0;

export async function GET() {
  const auth = await requireAdminApi();
  if (auth.response) return auth.response;
  try {
    return NextResponse.json(await getAdminMaterials());
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
    const name = typeof body.name === "string" ? body.name.trim() : "";
    const category = typeof body.category === "string" ? body.category.trim() : "";
    const unit = typeof body.unit === "string" ? body.unit.trim() : "";
    const quantity = body.quantity ?? 0;
    const unitCost = body.unitCost ?? 0;
    const minimumQuantity = body.minimumQuantity ?? 0;
    if (!name || !category || !unit || name.length > 120 || category.length > 80 || unit.length > 24) {
      return badRequest("Preencha nome, categoria e unidade do insumo.");
    }
    if (![quantity, unitCost, minimumQuantity].every(nonnegative)) return badRequest("Quantidade e custos precisam ser números iguais ou maiores que zero.");
    if (quantity > 0 && unitCost <= 0) return badRequest("Informe o custo unitário para cadastrar um saldo inicial.");

    const id = randomUUID();
    await transaction(async (client) => {
      await client.query(
        `INSERT INTO inventory_materials (id,name,sku,category,unit,quantity,unit_cost,minimum_quantity)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8)`,
        [id, name, body.sku?.trim() || null, category, unit, quantity, unitCost, minimumQuantity],
      );
      if (quantity > 0) {
        await client.query(
          `INSERT INTO inventory_movements (id,material_id,kind,quantity_delta,unit_cost,note)
           VALUES ($1,$2,'entrada',$3,$4,'Saldo inicial cadastrado')`,
          [randomUUID(), id, quantity, unitCost],
        );
      }
    });
    return NextResponse.json({ id }, { status: 201 });
  } catch (error) {
    return apiError(error);
  }
}
