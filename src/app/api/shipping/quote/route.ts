import { NextRequest, NextResponse } from "next/server";
import { sameOrigin } from "@/lib/admin-api";
import { clientIp, rateLimit } from "@/lib/rate-limit";
import { SaleError } from "@/lib/sales";
import { getShippableProduct, quoteShipping } from "@/lib/shipping";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  if (!sameOrigin(request)) return NextResponse.json({ error: "Origem inválida." }, { status: 403 });
  if (Number(request.headers.get("content-length") ?? 0) > 2000) return NextResponse.json({ error: "Cotação muito grande." }, { status: 413 });
  const limit = rateLimit(`shipping:${clientIp(request)}`, { limit: 30, windowMs: 15 * 60 * 1000 });
  if (!limit.ok) return NextResponse.json({ error: "Muitas cotações. Aguarde alguns minutos." }, { status: 429 });
  try {
    const body = await request.json() as Record<string, unknown>;
    const productId = typeof body.productId === "string" ? body.productId.trim() : "";
    const quantity = Number(body.quantity);
    const postalCode = typeof body.postalCode === "string" ? body.postalCode : "";
    if (!productId || productId.length > 100) throw new SaleError("Produto inválido.");
    const product = await getShippableProduct(productId);
    const options = await quoteShipping(product, quantity, postalCode);
    return NextResponse.json({ options }, { headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    if (error instanceof SaleError) return NextResponse.json({ error: error.message }, { status: error.status });
    if (error instanceof SyntaxError) return NextResponse.json({ error: "Dados da cotação inválidos." }, { status: 400 });
    console.error("Shipping quote error:", error);
    return NextResponse.json({ error: "Não foi possível calcular o frete agora. Tente novamente." }, { status: 503 });
  }
}
