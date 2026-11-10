import "server-only";
import { createHmac, randomBytes, scryptSync, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";

const COOKIE_NAME = "inspire3d_admin";
const SESSION_SECONDS = 60 * 60 * 12;

export function adminIsConfigured() {
  return Boolean(
    process.env.ADMIN_EMAIL &&
    process.env.ADMIN_PASSWORD &&
    process.env.ADMIN_PASSWORD.length >= 12 &&
    process.env.ADMIN_SESSION_SECRET &&
    process.env.ADMIN_SESSION_SECRET.length >= 32,
  );
}

function sign(value: string) {
  return createHmac("sha256", process.env.ADMIN_SESSION_SECRET ?? "")
    .update(value)
    .digest("base64url");
}

export function credentialsAreValid(email: string, password: string) {
  const expectedEmail = process.env.ADMIN_EMAIL ?? "";
  const expectedPassword = process.env.ADMIN_PASSWORD ?? "";
  if (!adminIsConfigured() || !expectedEmail || !expectedPassword) return false;

  const emailMatch = email.trim().toLowerCase() === expectedEmail.trim().toLowerCase();
  const salt = process.env.ADMIN_SESSION_SECRET!;
  const candidate = scryptSync(password, salt, 64);
  const expected = scryptSync(expectedPassword, salt, 64);
  return emailMatch && timingSafeEqual(candidate, expected);
}

export function createSessionToken() {
  const payload = `${Date.now()}:${randomBytes(16).toString("base64url")}`;
  return `${payload}.${sign(payload)}`;
}

export function sessionTokenIsValid(token?: string) {
  if (!adminIsConfigured() || !token) return false;
  const split = token.lastIndexOf(".");
  if (split < 0) return false;
  const payload = token.slice(0, split);
  const signature = token.slice(split + 1);
  const expected = sign(payload);
  const providedBytes = Buffer.from(signature);
  const expectedBytes = Buffer.from(expected);
  if (providedBytes.length !== expectedBytes.length || !timingSafeEqual(providedBytes, expectedBytes)) return false;

  const issuedAt = Number(payload.split(":", 1)[0]);
  return Number.isFinite(issuedAt) && Date.now() - issuedAt >= 0 && Date.now() - issuedAt < SESSION_SECONDS * 1000;
}

export async function getAdminSession() {
  const jar = await cookies();
  return sessionTokenIsValid(jar.get(COOKIE_NAME)?.value);
}

export function setAdminCookie(response: Response, token: string) {
  const secure = process.env.NODE_ENV === "production" ? "; Secure" : "";
  response.headers.append(
    "Set-Cookie",
    `${COOKIE_NAME}=${token}; Path=/; HttpOnly; SameSite=Strict; Max-Age=${SESSION_SECONDS}${secure}`,
  );
}

export function clearAdminCookie(response: Response) {
  response.headers.append(
    "Set-Cookie",
    `${COOKIE_NAME}=; Path=/; HttpOnly; SameSite=Strict; Max-Age=0${process.env.NODE_ENV === "production" ? "; Secure" : ""}`,
  );
}
