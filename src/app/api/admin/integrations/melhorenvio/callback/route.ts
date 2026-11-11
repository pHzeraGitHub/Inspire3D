import { timingSafeEqual } from "node:crypto";
import { NextRequest, NextResponse } from "next/server";
import { saveMelhorEnvioAuthorization } from "@/lib/melhor-envio-oauth";

export const runtime = "nodejs";

export async function GET(request: NextRequest) {
  const received = request.nextUrl.searchParams.get("state") ?? "";
  const expected = request.cookies.get("inspire3d_me_state")?.value ?? "";
  const a = Buffer.from(received);
  const b = Buffer.from(expected);
  if (!a.length || a.length !== b.length || !timingSafeEqual(a, b)) {
    return NextResponse.json({ error: "Autorização inválida ou expirada." }, { status: 403 });
  }

  let status = "erro";
  const code = request.nextUrl.searchParams.get("code") ?? "";
  if (!request.nextUrl.searchParams.has("error") && code.length > 10 && code.length < 2048) {
    try {
      await saveMelhorEnvioAuthorization(code);
      status = "conectado";
    } catch (error) {
      console.error("Melhor Envio authorization failed:", error);
    }
  }
  const response = NextResponse.redirect(new URL(`/admin/integracoes?status=${status}`, process.env.NEXT_PUBLIC_SITE_URL));
  response.cookies.set("inspire3d_me_state", "", {
    httpOnly: true, secure: process.env.NODE_ENV === "production", sameSite: "lax",
    path: "/api/admin/integrations/melhorenvio/callback", maxAge: 0,
  });
  response.headers.set("Cache-Control", "no-store");
  return response;
}
