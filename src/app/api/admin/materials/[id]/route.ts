import { NextRequest, NextResponse } from "next/server";
import { apiError, badRequest, requireAdminApi, sameOrigin } from "@/lib/admin-api";
import { transaction } from "@/lib/db";

export const runtime = "nodejs";

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireAdminApi();
  if (auth.response) return auth.response;
  if (!sameOrigin(request)) return NextResponse.json({ error: "Origem inválida." }, { status: 403 });
  try {
    const { id } = await params;
    const body = await request.json();
    if (typeof body.archived === "boolean") {
      await transaction(async (client) => {
        if (body.archived) {
          const used = await client.query("SELECT 1 FROM product_materials WHERE material_id=$1 LIMIT 1", [id]);
          if (used.rowCount) throw new Error("Este material está em uma ficha técnica. Remova-o dos produtos antes de arquivar.");
        }
        await client.query("UPDATE inventory_materials SET archived=$2, updated_at=NOW() WHERE id=$1", [id, body.archived]);
      });
      return NextResponse.json({ ok: true });
    }
    const name = typeof body.name === "string" ? body.name.trim() : "";
    const category = typeof body.category === "string" ? body.category.trim() : "";
    const unit = typeof body.unit === "string" ? body.unit.trim() : "";
    const unitCost = body.unitCost;
    const minimumQuantity = body.minimumQuantity;
    if (!name || !category || !unit || !Number.isFinite(unitCost) || unitCost < 0 || !Number.isFinite(minimumQuantity) || minimumQuantity < 0) {
      return badRequest("Confira nome, categoria, unidade, custo unitário e estoque mínimo.");
    }
    await transaction(async (client) => {
      const result = await client.query(
        `UPDATE inventory_materials SET name=$2, sku=$3, category=$4, unit=$5, unit_cost=$6,
          minimum_quantity=$7, updated_at=NOW() WHERE id=$1 RETURNING id`,
        [id, name, body.sku?.trim() || null, category, unit, unitCost, minimumQuantity],
      );
      if (!result.rowCount) throw new Error("Insumo não encontrado.");
    });
    return NextResponse.json({ ok: true });
  } catch (error) {
    if (error instanceof Error && error.message.startsWith("Este material")) return NextResponse.json({ error: error.message }, { status: 409 });
    return apiError(error);
  }
}
