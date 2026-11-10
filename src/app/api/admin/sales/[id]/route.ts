import { NextRequest, NextResponse } from "next/server";
import { apiError, requireAdminApi, sameOrigin } from "@/lib/admin-api";
import { changeSalePayment, changeSaleStatus, SaleError, saveSaleDraft } from "@/lib/sales";

export const runtime = "nodejs";
type Context = { params: Promise<{ id: string }> };

export async function PUT(request: NextRequest, { params }: Context) {
  const auth = await requireAdminApi();
  if (auth.response) return auth.response;
  if (!sameOrigin(request)) return NextResponse.json({ error: "Origem inválida." }, { status: 403 });
  try {
    const { id } = await params;
    return NextResponse.json(await saveSaleDraft(await request.json(), id));
  } catch (error) {
    if (error instanceof SaleError) return NextResponse.json({ error: error.message }, { status: error.status });
    if (error instanceof SyntaxError) return NextResponse.json({ error: "Dados da venda inválidos." }, { status: 400 });
    return apiError(error);
  }
}

export async function PATCH(request: NextRequest, { params }: Context) {
  const auth = await requireAdminApi();
  if (auth.response) return auth.response;
  if (!sameOrigin(request)) return NextResponse.json({ error: "Origem inválida." }, { status: 403 });
  try {
    const { id } = await params;
    const body = await request.json();
    const action = body?.action;
    if (["confirm", "deliver", "cancel"].includes(action)) {
      await changeSaleStatus(id, action);
    } else if (["paid", "refunded"].includes(action)) {
      await changeSalePayment(id, action, body.paymentMethod);
    } else {
      return NextResponse.json({ error: "Ação inválida para esta venda." }, { status: 400 });
    }
    return NextResponse.json({ ok: true });
  } catch (error) {
    if (error instanceof SaleError) return NextResponse.json({ error: error.message }, { status: error.status });
    if (error instanceof SyntaxError) return NextResponse.json({ error: "Dados da venda inválidos." }, { status: 400 });
    return apiError(error);
  }
}
