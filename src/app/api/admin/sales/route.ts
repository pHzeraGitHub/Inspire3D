import { NextRequest, NextResponse } from "next/server";
import { apiError, requireAdminApi, sameOrigin } from "@/lib/admin-api";
import { getAdminSales, SaleError, saveSaleDraft } from "@/lib/sales";

export const runtime = "nodejs";

export async function GET() {
  const auth = await requireAdminApi();
  if (auth.response) return auth.response;
  try { return NextResponse.json(await getAdminSales()); }
  catch (error) { return apiError(error); }
}

export async function POST(request: NextRequest) {
  const auth = await requireAdminApi();
  if (auth.response) return auth.response;
  if (!sameOrigin(request)) return NextResponse.json({ error: "Origem inválida." }, { status: 403 });
  try {
    return NextResponse.json(await saveSaleDraft(await request.json()), { status: 201 });
  } catch (error) {
    if (error instanceof SaleError) return NextResponse.json({ error: error.message }, { status: error.status });
    if (error instanceof SyntaxError) return NextResponse.json({ error: "Dados da venda inválidos." }, { status: 400 });
    return apiError(error);
  }
}
