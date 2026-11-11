import "server-only";

const escapeHtml = (value: string) => value.replace(/&/g, "&amp;").replace(/</g, "&lt;")
  .replace(/>/g, "&gt;").replace(/"/g, "&quot;");

export async function sendOrderLink(input: { email: string; name: string; code: string; url: string }) {
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.QUOTE_FROM_EMAIL;
  if (!apiKey || !from) return false;
  try {
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        from, to: [input.email], subject: `Acompanhe seu pedido ${input.code} | Inspire 3D`,
        html: `<p>Olá, ${escapeHtml(input.name)}.</p><p>Seu pedido ${escapeHtml(input.code)} foi iniciado. O pagamento é confirmado pelo Mercado Pago antes de entrar em produção.</p><p><a href="${escapeHtml(input.url)}">Acompanhar meu pedido</a></p><p>Guarde este link para consultar a produção e o envio.</p>`,
        text: `Olá, ${input.name}. Seu pedido ${input.code} foi iniciado. Acompanhe pagamento, produção e envio em: ${input.url}`,
      }),
      cache: "no-store", signal: AbortSignal.timeout(7000),
    });
    if (!response.ok) console.error("Order email failed:", response.status);
    return response.ok;
  } catch (error) { console.error("Order email failed:", error); return false; }
}
