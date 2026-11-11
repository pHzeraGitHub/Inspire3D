import "server-only";
import { createCipheriv, createDecipheriv, createHash, randomBytes } from "node:crypto";
import { query, transaction } from "@/lib/db";

const provider = () => process.env.MELHOR_ENVIO_ENV === "sandbox" ? "melhor_envio_sandbox" : "melhor_envio";
export const melhorEnvioBaseUrl = () => process.env.MELHOR_ENVIO_ENV === "sandbox"
  ? "https://sandbox.melhorenvio.com.br" : "https://melhorenvio.com.br";
const REFRESH_EARLY_MS = 24 * 60 * 60 * 1000;

type StoredToken = {
  access_token_encrypted: string;
  refresh_token_encrypted: string;
  expires_at: Date | string;
};

type TokenReply = {
  access_token?: unknown;
  refresh_token?: unknown;
  expires_in?: unknown;
};

function siteUrl() {
  return process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") ?? "";
}

export function melhorEnvioOAuthConfigured() {
  const contact = process.env.MELHOR_ENVIO_CONTACT_EMAIL?.trim() || process.env.ADMIN_EMAIL?.trim() || "";
  return /^\d+$/.test(process.env.MELHOR_ENVIO_CLIENT_ID?.trim() ?? "") &&
    Boolean(process.env.MELHOR_ENVIO_CLIENT_SECRET?.trim()) &&
    Boolean(process.env.ADMIN_SESSION_SECRET && process.env.ADMIN_SESSION_SECRET.length >= 32) &&
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(contact) &&
    siteUrl().startsWith("https://");
}

export function melhorEnvioCallbackUrl() {
  return `${siteUrl()}/api/admin/integrations/melhorenvio/callback`;
}

function key() {
  const secret = process.env.ADMIN_SESSION_SECRET;
  if (!secret || secret.length < 32) throw new Error("Chave de integração indisponível.");
  return createHash("sha256").update("inspire3d:melhor-envio:tokens:v1:").update(secret).digest();
}

function encrypt(value: string) {
  const iv = randomBytes(12);
  const cipher = createCipheriv("aes-256-gcm", key(), iv);
  const encrypted = Buffer.concat([cipher.update(value, "utf8"), cipher.final()]);
  return [iv, cipher.getAuthTag(), encrypted].map((item) => item.toString("base64url")).join(".");
}

function decrypt(value: string) {
  const parts = value.split(".").map((part) => Buffer.from(part, "base64url"));
  if (parts.length !== 3 || parts[0].length !== 12 || parts[1].length !== 16) throw new Error("Credencial armazenada inválida.");
  const decipher = createDecipheriv("aes-256-gcm", key(), parts[0]);
  decipher.setAuthTag(parts[1]);
  return Buffer.concat([decipher.update(parts[2]), decipher.final()]).toString("utf8");
}

function validReply(value: TokenReply) {
  const access = value.access_token;
  const refresh = value.refresh_token;
  const lifetime = Number(value.expires_in);
  if (typeof access !== "string" || access.length < 40 || typeof refresh !== "string" || refresh.length < 40 ||
    !Number.isFinite(lifetime) || lifetime < 60 || lifetime > 60 * 60 * 24 * 60) {
    throw new Error("Resposta de autenticação do Melhor Envio inválida.");
  }
  return { access, refresh, expiresAt: new Date(Date.now() + lifetime * 1000) };
}

async function requestToken(fields: Record<string, string>) {
  if (!melhorEnvioOAuthConfigured()) throw new Error("Aplicativo do Melhor Envio não configurado.");
  const contact = process.env.MELHOR_ENVIO_CONTACT_EMAIL?.trim() || process.env.ADMIN_EMAIL?.trim();
  if (!contact || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(contact)) throw new Error("E-mail técnico do Melhor Envio indisponível.");
  const response = await fetch(`${melhorEnvioBaseUrl()}/oauth/token`, {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/x-www-form-urlencoded",
      "User-Agent": `Inspire3D (${contact})`,
    },
    body: new URLSearchParams({
      client_id: process.env.MELHOR_ENVIO_CLIENT_ID!.trim(),
      client_secret: process.env.MELHOR_ENVIO_CLIENT_SECRET!.trim(),
      redirect_uri: melhorEnvioCallbackUrl(),
      ...fields,
    }),
    cache: "no-store",
    signal: AbortSignal.timeout(12000),
  });
  if (!response.ok) {
    console.error("Melhor Envio OAuth failed:", response.status);
    throw new Error("Não foi possível autorizar o Melhor Envio.");
  }
  return validReply(await response.json() as TokenReply);
}

export async function saveMelhorEnvioAuthorization(code: string) {
  const token = await requestToken({ grant_type: "authorization_code", code });
  await query(
    `INSERT INTO integration_tokens (provider, access_token_encrypted, refresh_token_encrypted, expires_at)
     VALUES ($1,$2,$3,$4)
     ON CONFLICT (provider) DO UPDATE SET access_token_encrypted=EXCLUDED.access_token_encrypted,
       refresh_token_encrypted=EXCLUDED.refresh_token_encrypted, expires_at=EXCLUDED.expires_at, updated_at=NOW()`,
    [provider(), encrypt(token.access), encrypt(token.refresh), token.expiresAt],
  );
}

export async function melhorEnvioAuthorizationStatus() {
  if (process.env.MELHOR_ENVIO_TOKEN?.trim()) return { connected: true, expiresAt: null, mode: "personal" as const };
  if (!melhorEnvioOAuthConfigured()) return { connected: false, expiresAt: null, mode: "oauth" as const };
  const result = await query<{ expires_at: Date | string }>(
    "SELECT expires_at FROM integration_tokens WHERE provider=$1", [provider()],
  );
  const expiresAt = result.rows[0]?.expires_at ?? null;
  if (expiresAt && new Date(expiresAt).getTime() < Date.now() + REFRESH_EARLY_MS) {
    try { await getMelhorEnvioAccessToken(); }
    catch { return { connected: false, expiresAt, mode: "oauth" as const }; }
    return { connected: true, expiresAt: null, mode: "oauth" as const };
  }
  return { connected: result.rows.length > 0, expiresAt, mode: "oauth" as const };
}

export async function getMelhorEnvioAccessToken(forceRefresh = false) {
  const personal = process.env.MELHOR_ENVIO_TOKEN?.trim();
  if (personal) return personal;
  if (!melhorEnvioOAuthConfigured()) throw new Error("Integração do Melhor Envio não configurada.");
  return transaction(async (client) => {
    const result = await client.query<StoredToken>(
      "SELECT access_token_encrypted, refresh_token_encrypted, expires_at FROM integration_tokens WHERE provider=$1 FOR UPDATE",
      [provider()],
    );
    const stored = result.rows[0];
    if (!stored) throw new Error("Melhor Envio ainda não autorizado.");
    if (!forceRefresh && new Date(stored.expires_at).getTime() > Date.now() + REFRESH_EARLY_MS) {
      return decrypt(stored.access_token_encrypted);
    }
    const renewed = await requestToken({ grant_type: "refresh_token", refresh_token: decrypt(stored.refresh_token_encrypted) });
    await client.query(
      `UPDATE integration_tokens SET access_token_encrypted=$2, refresh_token_encrypted=$3,
       expires_at=$4, updated_at=NOW() WHERE provider=$1`,
      [provider(), encrypt(renewed.access), encrypt(renewed.refresh), renewed.expiresAt],
    );
    return renewed.access;
  });
}
