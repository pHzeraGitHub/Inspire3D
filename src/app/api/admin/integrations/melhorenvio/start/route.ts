import { randomBytes } from "node:crypto";
import { NextResponse } from "next/server";
import { getAdminSession } from "@/lib/admin-auth";
import { melhorEnvioBaseUrl, melhorEnvioCallbackUrl, melhorEnvioOAuthConfigured } from "@/lib/melhor-envio-oauth";

export const runtime = "nodejs";

export async function GET() {
  if (!(await getAdminSession())) return NextResponse.redirect(new URL("/admin/login", process.env.NEXT_PUBLIC_SITE_URL));
  if (!melhorEnvioOAuthConfigured()) return NextResponse.redirect(new URL("/admin/integracoes?status=configuracao", process.env.NEXT_PUBLIC_SITE_URL));

  const state = randomBytes(32).toString("base64url");
  const authorize = new URL(`${melhorEnvioBaseUrl()}/oauth/authorize`);
  authorize.searchParams.set("client_id", process.env.MELHOR_ENVIO_CLIENT_ID!.trim());
  authorize.searchParams.set("redirect_uri", melhorEnvioCallbackUrl());
  authorize.searchParams.set("response_type", "code");
  authorize.searchParams.set("scope", "shipping-calculate");
  authorize.searchParams.set("state", state);

  const response = NextResponse.redirect(authorize);
  response.cookies.set("inspire3d_me_state", state, {
    httpOnly: true, secure: process.env.NODE_ENV === "production", sameSite: "lax",
    path: "/api/admin/integrations/melhorenvio/callback", maxAge: 600,
  });
  response.headers.set("Cache-Control", "no-store");
  return response;
}
