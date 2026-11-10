import { NextRequest, NextResponse } from "next/server";
import { clearAdminCookie, createSessionToken, credentialsAreValid, setAdminCookie, adminIsConfigured } from "@/lib/admin-auth";
import { clientIp, rateLimit } from "@/lib/rate-limit";
import { ensureDatabase } from "@/lib/db";
import { sameOrigin } from "@/lib/admin-api";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  if (!sameOrigin(request)) return NextResponse.json({ error: "Origem inválida." }, { status: 403 });
  const limit = rateLimit(`admin-login:${clientIp(request)}`, { limit: 5, windowMs: 15 * 60 * 1000 });
  if (!limit.ok) {
    return NextResponse.json({ error: "Muitas tentativas. Aguarde alguns minutos e tente novamente." }, { status: 429 });
  }
  if (!adminIsConfigured()) {
    return NextResponse.json({ error: "Configure ADMIN_EMAIL, ADMIN_PASSWORD e ADMIN_SESSION_SECRET no ambiente do servidor." }, { status: 503 });
  }
  try {
    const body = await request.json();
    if (typeof body.email !== "string" || typeof body.password !== "string") {
      return NextResponse.json({ error: "Informe e-mail e senha." }, { status: 400 });
    }
    if (body.email.length > 254 || body.password.length > 256) return NextResponse.json({ error: "Credenciais inválidas." }, { status: 400 });
    if (!credentialsAreValid(body.email, body.password)) {
      return NextResponse.json({ error: "E-mail ou senha incorretos." }, { status: 401 });
    }
    await ensureDatabase();
    const response = NextResponse.json({ ok: true });
    setAdminCookie(response, createSessionToken());
    return response;
  } catch (error) {
    console.error("Admin login error:", error);
    return NextResponse.json({ error: "Não foi possível conectar ao banco. Confira a configuração do servidor." }, { status: 503 });
  }
}

export async function DELETE(request: NextRequest) {
  if (!sameOrigin(request)) return NextResponse.json({ error: "Origem inválida." }, { status: 403 });
  const response = NextResponse.json({ ok: true });
  clearAdminCookie(response);
  return response;
}
