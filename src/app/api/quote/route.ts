import { NextResponse } from "next/server";
import { estimateQuote } from "@/lib/quote";
import { clientIp, rateLimit } from "@/lib/rate-limit";
import { leadEmailTemplate, sendLeadEmail, type Attachment } from "@/lib/mailer";
import { briefingLines, complexityLabel } from "@/features/quote/summary";
import {
  ACCEPTED_EXTENSIONS,
  MAX_FILES,
  MAX_FILE_BYTES,
  MAX_TOTAL_BYTES,
  formatBytes,
} from "@/features/quote/options";
import {
  CATEGORIES,
  DEADLINES,
  FINISHES,
  MAX_QUANTITY,
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

const extensionOf = (name: string) => name.slice(name.lastIndexOf(".")).toLowerCase();

export async function POST(request: Request) {
  /* ── 1. Rate limiting ────────────────────────────────────────────── */
  const ip = clientIp(request);
  const limited = rateLimit(`quote:${ip}`, { limit: 5, windowMs: 10 * 60 * 1000 });
  if (!limited.ok) {
    return NextResponse.json(
      { error: "Muitos envios seguidos. Aguarde alguns minutos ou chame no WhatsApp." },
      { status: 429, headers: { "Retry-After": String(limited.retryAfterSeconds) } },
    );
  }

  /* ── 2. Leitura do multipart ─────────────────────────────────────── */
  let form: FormData;
  try {
    form = await request.formData();
  } catch {
    return NextResponse.json({ error: "Formato de envio inválido." }, { status: 400 });
  }

  let raw: Record<string, unknown>;
  try {
    const parsed: unknown = JSON.parse(String(form.get("payload") ?? ""));
    if (typeof parsed !== "object" || parsed === null || Array.isArray(parsed)) {
      throw new Error("payload não é objeto");
    }
    raw = parsed as Record<string, unknown>;
  } catch {
    return NextResponse.json({ error: "Dados do formulário inválidos." }, { status: 400 });
  }

  /* ── 3. Honeypot ─────────────────────────────────────────────────── */
  // Nome propositalmente neutro: "website"/"url" são campos que gerenciadores
  // de senha preenchem sozinhos, o que geraria falso positivo com gente real.
  if (text(raw._gotcha)) {
    // Bot preencheu o campo invisível. Responde 200 para não ensinar nada.
    return NextResponse.json({ ok: true, estimate: null, data: null }, { status: 200 });
  }

  /* ── 4. Validação ────────────────────────────────────────────────── */
  const fields: Record<string, string> = {};

  const name = text(raw.name, 120);
  const email = text(raw.email, 180);
  const description = text(raw.description, MAX_TEXT);
  const phone = text(raw.phone, 40);
  const company = text(raw.company, 140);
  const dimensions = text(raw.dimensions, 120);

  if (name.length < 2) fields.name = "Informe seu nome.";
  if (!emailRe.test(email)) fields.email = "E-mail inválido.";
  if (description.length < 15) fields.description = "Descreva o projeto em pelo menos uma frase.";
  if (raw.consent !== true) fields.consent = "É necessário aceitar o uso dos dados.";

  const path = inList(PATHS, raw.path);
  const category = inList(CATEGORIES, raw.category);
  const size = inList(SIZES, raw.size);
  const finish = inList(FINISHES, raw.finish);
  const modeling = inList(MODELINGS, raw.modeling);
  const deadline = inList(DEADLINES, raw.deadline);
  const technology = inList(TECHNOLOGIES, raw.technology) ?? "indefinido";

  if (!path) fields.path = "Escolha por onde começar.";
  if (!category) fields.category = "Categoria inválida.";
  if (!size) fields.size = "Tamanho inválido.";
  if (!finish) fields.finish = "Acabamento inválido.";
  if (!modeling) fields.modeling = "Opção de modelagem inválida.";
  if (!deadline) fields.deadline = "Prazo inválido.";

  const quantity = quantityOf(raw.quantity);
  if (quantity === null) {
    fields.quantity = `Quantidade deve ser um inteiro entre 1 e ${MAX_QUANTITY}.`;
  }

  /* ── 5. Arquivos ─────────────────────────────────────────────────── */
  const uploads = form.getAll("files").filter((f): f is File => f instanceof File && f.size > 0);

  if (uploads.length > MAX_FILES) {
    fields.files = `Máximo de ${MAX_FILES} arquivos.`;
  }
  let totalBytes = 0;
  for (const file of uploads) {
    totalBytes += file.size;
    if (!ACCEPTED_EXTENSIONS.includes(extensionOf(file.name) as (typeof ACCEPTED_EXTENSIONS)[number])) {
      fields.files = `Formato não aceito: ${file.name}`;
      break;
    }
    if (file.size > MAX_FILE_BYTES) {
      fields.files = `${file.name} passa de ${formatBytes(MAX_FILE_BYTES)}.`;
      break;
    }
  }
  if (!fields.files && totalBytes > MAX_TOTAL_BYTES) {
    fields.files = `Total acima de ${formatBytes(MAX_TOTAL_BYTES)}.`;
  }

  if (Object.keys(fields).length) {
    return NextResponse.json({ error: "Confira os campos destacados.", fields }, { status: 422 });
  }

  /* ── 6. Pedido válido ────────────────────────────────────────────── */
  const data: QuoteRequest = {
    path: path!,
    category: category!,
    description,
    technology,
    size: size!,
    finish: finish!,
    modeling: modeling!,
    quantity: quantity!,
    dimensions: dimensions || undefined,
    deadline: deadline!,
    name,
    email,
    phone: phone || undefined,
    company: company || undefined,
    consent: true,
    files: uploads.map((f) => ({ name: f.name, size: f.size, type: f.type })),
  };

  const estimate = estimateQuote(data);

  /* ── 7. Notificação ──────────────────────────────────────────────── */
  const attachments: Attachment[] = [];
  for (const file of uploads) {
    const buffer = Buffer.from(await file.arrayBuffer());
    attachments.push({ filename: file.name, content: buffer.toString("base64") });
  }

  const { html, text: plain } = leadEmailTemplate({
    contact: [
      { label: "Nome", value: name },
      { label: "E-mail", value: email },
      ...(phone ? [{ label: "WhatsApp", value: phone }] : []),
      ...(company ? [{ label: "Empresa", value: company }] : []),
    ],
    lines: briefingLines(data, estimate),
    description,
    estimate: [
      {
        label: "Tecnologia indicada",
        value: estimate.recommendedTechnology === "resina" ? "Resina" : "FDM",
      },
      { label: "Complexidade", value: complexityLabel[estimate.complexity] },
      {
        label: "Prazo estimado",
        value: `${estimate.leadTimeDays[0]} a ${estimate.leadTimeDays[1]} dias úteis`,
      },
      ...(estimate.price
        ? [
            {
              label: "Faixa estimada",
              value: `R$ ${estimate.price.min.toLocaleString("pt-BR")} – ${estimate.price.max.toLocaleString("pt-BR")}`,
            },
          ]
        : [{ label: "Faixa estimada", value: "tabela de preço ainda não calibrada" }]),
    ],
    files: data.files?.map((f) => `${f.name} (${formatBytes(f.size)})`) ?? [],
  });

  const mail = await sendLeadEmail({
    subject: `Orçamento — ${name}${company ? ` (${company})` : ""}`,
    html,
    text: plain,
    replyTo: email,
    attachments,
  });

  if (mail.status === "failed") {
    // O cliente não pode pagar por uma falha nossa: o lead ainda vai para o log
    // e a tela oferece o WhatsApp como saída.
    console.error("[quote] LEAD NÃO NOTIFICADO:", plain);
  }

  // TODO (Fase 3): persistir o lead no banco assim que o Prisma entrar.
  return NextResponse.json({ ok: true, estimate, data }, { status: 200 });
}
