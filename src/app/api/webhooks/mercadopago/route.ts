import { NextRequest, NextResponse } from "next/server";
import { getMercadoPagoOrder, validMercadoPagoSignature } from "@/lib/mercado-pago";
import { reconcileMercadoPagoOrder } from "@/lib/commerce";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  const dataId = request.nextUrl.searchParams.get("data.id");
  const valid = validMercadoPagoSignature({
    signature: request.headers.get("x-signature"), requestId: request.headers.get("x-request-id"), dataId,
  });
  if (!valid) return NextResponse.json({ error: "Assinatura inválida." }, { status: 401 });
  const type = request.nextUrl.searchParams.get("type");
  if (!dataId || type !== "order") return NextResponse.json({ ok: true });
  try {
    await reconcileMercadoPagoOrder(await getMercadoPagoOrder(dataId));
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Mercado Pago webhook error:", error);
    return NextResponse.json({ error: "Falha ao processar notificação." }, { status: 503 });
  }
}
