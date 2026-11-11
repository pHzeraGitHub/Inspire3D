import { NextResponse } from "next/server";
import { getAdminSession } from "@/lib/admin-auth";
import { SaleError } from "@/lib/sales";
import { quoteShipping, type ShippableProduct } from "@/lib/shipping";

export const runtime = "nodejs";

const sample: ShippableProduct = {
  id: "inspire3d-test-package", name: "Pacote de teste", price: 100,
  productionDays: 0, variants: [], personalizationOptions: [],
  weight: 0.5, width: 15, height: 10, length: 20,
};

export async function GET() {
  if (!(await getAdminSession())) return NextResponse.json({ error: "Entre no painel administrativo." }, { status: 401 });
  try {
    const options = await quoteShipping(sample, 1, "01001000");
    return NextResponse.json({ ok: true, destination: "01001000", options: options.length,
      cheapest: options[0] }, { headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    if (error instanceof SaleError) return NextResponse.json({ error: error.message }, { status: error.status });
    console.error("Melhor Envio test quote failed:", error);
    return NextResponse.json({ error: "Não foi possível testar a cotação." }, { status: 503 });
  }
}
