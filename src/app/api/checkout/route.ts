import { NextRequest, NextResponse } from "next/server";
import { sameOrigin } from "@/lib/admin-api";
import { createOnlineOrder } from "@/lib/commerce";
import { SaleError } from "@/lib/sales";
import { clientIp, rateLimit } from "@/lib/rate-limit";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  if (!sameOrigin(request)) return NextResponse.json({ error: "Origem inválida." }, { status: 403 });
  if (Number(request.headers.get("content-length") ?? 0) > 12000) return NextResponse.json({ error: "Pedido muito grande." }, { status: 413 });
  const limit = rateLimit(`checkout:${clientIp(request)}`, { limit: 8, windowMs: 15 * 60 * 1000 });
  if (!limit.ok) return NextResponse.json({ error: "Muitas tentativas. Aguarde alguns minutos." }, { status: 429 });
  try {
    const result = await createOnlineOrder(await request.json());
    return NextResponse.json(result, { status: 201, headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    if (error instanceof SaleError) return NextResponse.json({ error: error.message }, { status: error.status });
    if (error instanceof SyntaxError) return NextResponse.json({ error: "Dados do pedido inválidos." }, { status: 400 });
    console.error("Checkout error:", error);
    return NextResponse.json({ error: "Não foi possível iniciar o pagamento. Tente novamente." }, { status: 503 });
  }
}
