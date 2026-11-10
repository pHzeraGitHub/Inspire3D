import { NextResponse, type NextRequest } from "next/server";
import { getAdminSession } from "@/lib/admin-auth";

export async function requireAdminApi() {
  if (!(await getAdminSession())) {
    return { response: NextResponse.json({ error: "Sessão expirada. Entre novamente." }, { status: 401 }) };
  }
  return { response: null };
}

export function badRequest(message: string) {
  return NextResponse.json({ error: message }, { status: 400 });
}

export function sameOrigin(request: NextRequest) {
  const origin = request.headers.get("origin");
  const host = (request.headers.get("x-forwarded-host") ?? request.headers.get("host"))?.split(",")[0]?.trim();
  const site = (request.headers.get("x-forwarded-proto") ?? (process.env.NODE_ENV === "production" ? "https" : "http")).split(",")[0]?.trim();
  if (!origin || !host) return false;
  try {
    const parsed = new URL(origin);
    return parsed.host === host && parsed.protocol === `${site}:`;
  } catch {
    return false;
  }
}

export function apiError(error: unknown) {
  const message = error instanceof Error ? error.message : "Não foi possível concluir a operação.";
  if (message.includes("duplicate key") || message.includes("unique constraint")) {
    return NextResponse.json({ error: "Já existe um item com esse nome ou endereço no catálogo." }, { status: 409 });
  }
  console.error("Admin API error:", error);
  return NextResponse.json({ error: "Falha ao acessar o banco de dados. Confira as configurações e tente novamente." }, { status: 503 });
}
