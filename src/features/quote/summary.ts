import type { QuoteEstimate, QuoteRequest } from "@/types";
import {
  categoryOptions,
  deadlineOptions,
  finishOptions,
  labelOf,
  modelingOptions,
  pathOptions,
  sizeOptions,
} from "./options";

/** Linhas do briefing — mesma fonte para a tela, o e-mail e o WhatsApp. */
export function briefingLines(data: QuoteRequest, estimate?: QuoteEstimate) {
  const lines: { label: string; value: string }[] = [
    { label: "Ponto de partida", value: labelOf(pathOptions, data.path) },
    { label: "Categoria", value: labelOf(categoryOptions, data.category) },
    { label: "Tamanho", value: labelOf(sizeOptions, data.size) },
    { label: "Acabamento", value: labelOf(finishOptions, data.finish) },
    { label: "Modelagem", value: labelOf(modelingOptions, data.modeling) },
    { label: "Quantidade", value: `${data.quantity} ${data.quantity > 1 ? "unidades" : "unidade"}` },
    { label: "Prazo desejado", value: labelOf(deadlineOptions, data.deadline) },
  ];

  if (data.dimensions?.trim()) {
    lines.splice(3, 0, { label: "Dimensões", value: data.dimensions.trim() });
  }
  if (estimate) {
    lines.push({
      label: "Tecnologia",
      value: estimate.recommendedTechnology === "resina" ? "Resina" : "FDM",
    });
  }
  return lines;
}

const complexityLabel = { simples: "Simples", media: "Média", alta: "Alta" } as const;

/** Mensagem que abre o WhatsApp já com o projeto descrito. */
export function whatsappMessage(data: QuoteRequest, estimate: QuoteEstimate) {
  const parts = [
    "Olá! Montei meu orçamento pelo site da Inspire 3D.",
    "",
    `*Projeto:* ${labelOf(categoryOptions, data.category)}`,
    ...briefingLines(data, estimate)
      .filter((l) => l.label !== "Categoria")
      .map((l) => `*${l.label}:* ${l.value}`),
    `*Complexidade:* ${complexityLabel[estimate.complexity]}`,
    `*Prazo estimado:* ${estimate.leadTimeDays[0]} a ${estimate.leadTimeDays[1]} dias úteis`,
  ];

  if (estimate.price) {
    parts.push(
      `*Faixa estimada:* R$ ${estimate.price.min.toLocaleString("pt-BR")} – ${estimate.price.max.toLocaleString("pt-BR")}`,
    );
  }

  parts.push("", `*Descrição:* ${data.description.trim()}`, "", `Meu nome é ${data.name.trim()}.`);

  if (data.files?.length) {
    parts.push(`Enviei ${data.files.length} arquivo(s) pelo site.`);
  }

  return parts.join("\n");
}

export { complexityLabel };
