import { NextRequest, NextResponse } from "next/server";
import { apiError, requireAdminApi, sameOrigin } from "@/lib/admin-api";
import { advanceOnlineOrder } from "@/lib/commerce";
import { SaleError } from "@/lib/sales";

export const runtime = "nodejs";

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireAdminApi();
  if (auth.response) return auth.response;
  if (!sameOrigin(request)) return NextResponse.json({ error: "Origem inválida." }, { status: 403 });
  try {
    const { id } = await params;
    const body = await request.json();
    const stage = await advanceOnlineOrder(id, body?.trackingCode, body?.trackingUrl);
    return NextResponse.json({ ok: true, stage });
  } catch (error) {
    if (error instanceof SaleError) return NextResponse.json({ error: error.message }, { status: error.status });
    return apiError(error);
  }
}
