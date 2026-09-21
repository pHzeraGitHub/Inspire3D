import { briefingLines, complexityLabel } from "@/features/quote/summary";
import { leadEmailTemplate, sendLeadEmail, type Attachment, type SendResult } from "@/lib/mailer";
import type { QuoteEstimate, QuoteRequest } from "@/types";

export type QuoteLeadSource = "formulario" | "inspire-ai";

/**
 * Ponto único de notificação de lead.
 * Formulário e Inspire AI terminam aqui para evitar funis divergentes.
 *
 * IMPORTANTE: enquanto não houver banco de dados, "sent" significa que o
 * e-mail foi aceito pelo provedor. "skipped"/"failed" não devem ser exibidos
 * ao cliente como "pedido recebido".
 */
export async function notifyQuoteLead({
  data,
  estimate,
  source,
  attachments = [],
}: {
  data: QuoteRequest;
  estimate: QuoteEstimate;
  source: QuoteLeadSource;
  attachments?: Attachment[];
}): Promise<SendResult> {
  const sourceLabel = source === "inspire-ai" ? "Inspire AI" : "Formulário";

  const { html, text: plain } = leadEmailTemplate({
    contact: [
      { label: "Origem", value: sourceLabel },
      { label: "Nome", value: data.name },
      { label: "E-mail", value: data.email },
      ...(data.phone ? [{ label: "WhatsApp", value: data.phone }] : []),
      ...(data.company ? [{ label: "Empresa", value: data.company }] : []),
    ],
    lines: briefingLines(data, estimate),
    description: data.description,
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
    files: data.files?.map((f) => `${f.name} (${Math.max(1, Math.round(f.size / 1024))} KB)`) ?? [],
  });

  const mail = await sendLeadEmail({
    subject: `Orçamento via ${sourceLabel} — ${data.name}${data.company ? ` (${data.company})` : ""}`,
    html,
    text: plain,
    replyTo: data.email,
    attachments,
  });

  if (mail.status !== "sent") {
    console.error(`[quote:${source}] LEAD NÃO NOTIFICADO:`, plain);
  }

  return mail;
}
