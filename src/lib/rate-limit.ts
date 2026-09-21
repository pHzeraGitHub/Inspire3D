/**
 * Rate limiting em memória — janela deslizante simples.
 *
 * Suficiente para uma instância. Quando o site escalar para várias instâncias
 * (ou for para serverless com cold start frequente), troque o Map por Redis /
 * Upstash mantendo esta mesma assinatura.
 */

type Hit = { count: number; resetAt: number };

const buckets = new Map<string, Hit>();

/** Limpeza preguiçosa: a cada chamada, varre o que já expirou. */
function sweep(now: number) {
  if (buckets.size < 500) return;
  for (const [key, hit] of buckets) {
    if (hit.resetAt <= now) buckets.delete(key);
  }
}

export function rateLimit(
  key: string,
  { limit, windowMs }: { limit: number; windowMs: number },
): { ok: boolean; remaining: number; retryAfterSeconds: number } {
  const now = Date.now();
  sweep(now);

  const hit = buckets.get(key);

  if (!hit || hit.resetAt <= now) {
    buckets.set(key, { count: 1, resetAt: now + windowMs });
    return { ok: true, remaining: limit - 1, retryAfterSeconds: 0 };
  }

  hit.count += 1;

  if (hit.count > limit) {
    return {
      ok: false,
      remaining: 0,
      retryAfterSeconds: Math.max(1, Math.ceil((hit.resetAt - now) / 1000)),
    };
  }

  return { ok: true, remaining: limit - hit.count, retryAfterSeconds: 0 };
}

/** IP do cliente atrás de proxy (Vercel, Cloudflare, nginx). */
export function clientIp(request: Request): string {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0]!.trim();
  return (
    request.headers.get("cf-connecting-ip") ??
    request.headers.get("x-real-ip") ??
    "desconhecido"
  );
}
