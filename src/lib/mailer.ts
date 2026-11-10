import { site } from "@/config/site";

/**
 * Envio de e-mail via Resend, por HTTP puro — sem SDK, sem dependência nova.
 *
 * Se `RESEND_API_KEY` não estiver definida, a função não falha: registra no
 * log do servidor e devolve `skipped`. Assim o formulário funciona em
 * desenvolvimento e o lead nunca se perde por configuração faltando.
 */

export type Attachment = { filename: string; content: string };

export type SendResult = { status: "sent" | "skipped" | "failed"; detail?: string };

export async function sendLeadEmail({
  subject,
  html,
  text,
  replyTo,
  attachments = [],
}: {
  subject: string;
  html: string;
  text: string;
  replyTo?: string;
  attachments?: Attachment[];
}): Promise<SendResult> {
  const apiKey = process.env.RESEND_API_KEY;
  const to = process.env.QUOTE_NOTIFICATION_EMAIL || site.contact.email;
  const from = process.env.QUOTE_FROM_EMAIL || "Inspire 3D <onboarding@resend.dev>";

  if (!to) {
    console.warn("[quote] Destinatário de orçamento não configurado.");
    return { status: "skipped", detail: "Destinatário ausente" };
  }

  if (!apiKey) {
    console.warn(
      "[quote] RESEND_API_KEY ausente — lead NÃO foi enviado por e-mail.",
      { subject, to },
    );
    return { status: "skipped", detail: "RESEND_API_KEY ausente" };
  }

  try {
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from,
        to: [to],
        subject,
        html,
        text,
        ...(replyTo ? { reply_to: replyTo } : {}),
        ...(attachments.length ? { attachments } : {}),
      }),
    });

    if (!response.ok) {
      const detail = await response.text();
      console.error("[quote] Resend recusou o envio:", response.status, detail);
      return { status: "failed", detail };
    }

    return { status: "sent" };
  } catch (error) {
    console.error("[quote] Falha ao chamar a Resend:", error);
    return { status: "failed", detail: String(error) };
  }
}

const escapeHtml = (value: string) =>
  value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");

/** Monta o e-mail do lead: legível no celular, sem depender de imagens. */
export function leadEmailTemplate({
  lines,
  description,
  contact,
  estimate,
  files,
}: {
  lines: { label: string; value: string }[];
  description: string;
  contact: { label: string; value: string }[];
  estimate: { label: string; value: string }[];
  files: string[];
}) {
  const rows = (items: { label: string; value: string }[]) =>
    items
      .map(
        (i) =>
          `<tr><td style="padding:6px 14px 6px 0;color:#8A8F98;font:11px/1.5 ui-monospace,monospace;text-transform:uppercase;letter-spacing:.1em;white-space:nowrap;vertical-align:top">${escapeHtml(i.label)}</td><td style="padding:6px 0;color:#F5F5F5;font:14px/1.6 system-ui,sans-serif">${escapeHtml(i.value)}</td></tr>`,
      )
      .join("");

  const block = (title: string, items: { label: string; value: string }[]) =>
    items.length
      ? `<p style="margin:28px 0 6px;color:#D4A437;font:11px/1.4 ui-monospace,monospace;text-transform:uppercase;letter-spacing:.18em">${title}</p><table style="width:100%;border-collapse:collapse">${rows(items)}</table>`
      : "";

  const html = `<div style="background:#08090B;padding:28px;font-family:system-ui,sans-serif">
<div style="max-width:600px;margin:0 auto;background:#111317;border:1px solid rgba(183,187,194,.14);border-radius:16px;padding:28px">
<p style="margin:0;color:#D4A437;font:11px/1.4 ui-monospace,monospace;text-transform:uppercase;letter-spacing:.18em">Novo orçamento pelo site</p>
<h1 style="margin:10px 0 0;color:#F5F5F5;font-size:22px;font-weight:600">${escapeHtml(contact[0]?.value ?? "Novo lead")}</h1>
${block("Contato", contact)}
${block("Projeto", lines)}
<p style="margin:28px 0 6px;color:#D4A437;font:11px/1.4 ui-monospace,monospace;text-transform:uppercase;letter-spacing:.18em">Descrição</p>
<p style="margin:0;color:#F5F5F5;font:14px/1.7 system-ui,sans-serif;white-space:pre-wrap">${escapeHtml(description)}</p>
${block("Leitura automática", estimate)}
${
  files.length
    ? `<p style="margin:28px 0 6px;color:#D4A437;font:11px/1.4 ui-monospace,monospace;text-transform:uppercase;letter-spacing:.18em">Anexos</p><p style="margin:0;color:#B7BBC2;font:13px/1.7 system-ui,sans-serif">${files.map(escapeHtml).join("<br>")}</p>`
    : `<p style="margin:28px 0 0;color:#8A8F98;font:13px/1.6 system-ui,sans-serif">Sem arquivos anexados.</p>`
}
<p style="margin:30px 0 0;padding-top:18px;border-top:1px solid rgba(183,187,194,.14);color:#8A8F98;font:12px/1.6 system-ui,sans-serif">Responda este e-mail para falar direto com o cliente.</p>
</div></div>`;

  const plain = [
    "NOVO ORÇAMENTO PELO SITE",
    "",
    ...contact.map((i) => `${i.label}: ${i.value}`),
    "",
    ...lines.map((i) => `${i.label}: ${i.value}`),
    "",
    "DESCRIÇÃO:",
    description,
    "",
    ...estimate.map((i) => `${i.label}: ${i.value}`),
    "",
    files.length ? `Anexos: ${files.join(", ")}` : "Sem arquivos anexados.",
  ].join("\n");

  return { html, text: plain };
}
