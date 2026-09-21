import { NextResponse } from "next/server";
import { askInspireAi, MAX_MESSAGE_CHARS, MAX_TURNS, type ChatMessage } from "@/lib/inspire-ai";
import { estimateQuote } from "@/lib/quote";
import { clientIp, rateLimit } from "@/lib/rate-limit";
import {
  CATEGORIES,
  DEADLINES,
  FINISHES,
  MAX_TEXT,
  MODELINGS,
  PATHS,
  SIZES,
  TECHNOLOGIES,
  emailRe,
  inList,
  quantityOf,
  text,
} from "@/lib/quote-validation";
import type { QuoteRequest } from "@/types";

export const runtime = "nodejs";

/**
 * Inspire AI — a IA conversa, o motor calcula.
 *
 * O modelo devolve um briefing estruturado. Esse briefing é tratado como
 * entrada NÃO CONFIÁVEL, exatamente como o formulário: o modelo pode inventar
 * `size: "enorme"` com toda a confiança do mundo. Só depois de passar pela
 * mesma validação é que vira estimativa.
 */

function normalizeBriefing(raw: Record<string, unknown>): QuoteRequest | null {
  const name = text(raw.name, 120);
  const email = text(raw.email, 180);
  const description = text(raw.description, MAX_TEXT);

  const path = inList(PATHS, raw.path);
  const category = inList(CATEGORIES, raw.category);
  const size = inList(SIZES, raw.size);
  const finish = inList(FINISHES, raw.finish);
  const modeling = inList(MODELINGS, raw.modeling);
  const deadline = inList(DEADLINES, raw.deadline);
  const quantity = quantityOf(raw.quantity);

  if (
    name.length < 2 ||
    !emailRe.test(email) ||
    description.length < 10 ||
    !path ||
    !category ||
    !size ||
    !finish ||
    !modeling ||
    !deadline ||
    quantity === null
  ) {
    return null;
  }

  return {
    path,
    category,
    description,
    technology: inList(TECHNOLOGIES, raw.technology) ?? "indefinido",
    size,
    finish,
    modeling,
    quantity,
    dimensions: text(raw.dimensions, 120) || undefined,
    deadline,
    name,
    email,
    phone: text(raw.phone, 40) || undefined,
    company: text(raw.company, 140) || undefined,
    /* Consentimento vem do aviso exibido antes de abrir a conversa, não de um
       campo que o modelo pudesse preencher sozinho. */
    consent: true,
  };
}

export async function POST(request: Request) {
  const ip = clientIp(request);

  /* Conversa custa dinheiro por chamada — o limite é mais apertado que o do
     formulário e conta cada turno, não cada conversa. */
  const limited = rateLimit(`ai:${ip}`, { limit: 40, windowMs: 15 * 60 * 1000 });
  if (!limited.ok) {
    return NextResponse.json(
      {
        error:
          "Você atingiu o limite de mensagens por enquanto. O formulário de orçamento continua aberto.",
      },
      { status: 429, headers: { "Retry-After": String(limited.retryAfterSeconds) } },
    );
  }

  let body: { messages?: unknown };
  try {
    body = (await request.json()) as { messages?: unknown };
  } catch {
    return NextResponse.json({ error: "JSON inválido." }, { status: 400 });
  }

  if (!Array.isArray(body.messages) || body.messages.length === 0) {
    return NextResponse.json({ error: "Envie ao menos uma mensagem." }, { status: 422 });
  }

  if (body.messages.length > MAX_TURNS) {
    return NextResponse.json(
      {
        error:
          "Essa conversa ficou longa. Vamos fechar pelo formulário de orçamento ou pelo WhatsApp?",
      },
      { status: 422 },
    );
  }

  /* Sanitiza o histórico: só os dois papéis, só texto, tamanho limitado. */
  const messages: ChatMessage[] = [];
  for (const item of body.messages) {
    if (typeof item !== "object" || item === null) continue;
    const { role, content } = item as { role?: unknown; content?: unknown };
    const clean = text(content, MAX_MESSAGE_CHARS);
    if ((role === "user" || role === "assistant") && clean) {
      messages.push({ role, content: clean });
    }
  }

  if (!messages.length || messages[messages.length - 1]!.role !== "user") {
    return NextResponse.json({ error: "Histórico inválido." }, { status: 422 });
  }

  const turn = await askInspireAi(messages);

  if (turn.kind === "error") {
    return NextResponse.json({ error: turn.message }, { status: 503 });
  }

  if (turn.kind === "reply") {
    return NextResponse.json({ ok: true, done: false, reply: turn.text }, { status: 200 });
  }

  /* Briefing registrado — validar antes de calcular. */
  const data = normalizeBriefing(turn.input);
  if (!data) {
    console.warn("[inspire-ai] briefing recusado na validação:", turn.input);
    return NextResponse.json(
      {
        ok: true,
        done: false,
        reply:
          "Faltou confirmar alguns detalhes do projeto. Pode me dizer seu nome e um e-mail para eu fechar o briefing?",
      },
      { status: 200 },
    );
  }

  const estimate = estimateQuote(data);

  return NextResponse.json(
    { ok: true, done: true, reply: turn.text, data, estimate },
    { status: 200 },
  );
}
