import type {
  QuoteDeadline,
  QuoteFinish,
  QuoteModeling,
  QuotePath,
  QuoteSize,
  QuoteTechnology,
} from "@/types";

export type Option<T> = { value: T; title: string; desc?: string };

/** Passo 1 — a pergunta que abre o orçamento (briefing §14). */
export const pathOptions: Option<QuotePath>[] = [
  {
    value: "arquivo",
    title: "Tenho um arquivo 3D",
    desc: "STL, OBJ, 3MF ou STEP pronto para orçar.",
  },
  {
    value: "ideia",
    title: "Tenho apenas uma ideia",
    desc: "Sem modelo ainda. A modelagem entra como etapa.",
  },
  {
    value: "personalizar",
    title: "Quero personalizar um produto",
    desc: "Nome, data, logo ou rosto em uma peça.",
  },
  {
    value: "miniatura",
    title: "Quero uma miniatura ou personagem",
    desc: "Busto, action figure, mascote, pet.",
  },
  {
    value: "serie",
    title: "Quero produzir várias unidades",
    desc: "Série pequena ou média da mesma peça.",
  },
  {
    value: "prototipo",
    title: "Quero desenvolver um protótipo",
    desc: "Peça funcional, encaixe, teste de forma.",
  },
  {
    value: "outro",
    title: "Quero falar sobre outro projeto",
    desc: "Se não encaixa acima, começa por aqui.",
  },
];

export const categoryOptions: Option<string>[] = [
  { value: "colecionavel", title: "Colecionável" },
  { value: "miniatura", title: "Miniatura" },
  { value: "personagem", title: "Personagem / busto" },
  { value: "jogos", title: "Board game" },
  { value: "decoracao", title: "Decoração" },
  { value: "prototipo", title: "Protótipo" },
  { value: "funcional", title: "Peça funcional" },
  { value: "personalizado", title: "Personalizado / presente" },
  { value: "corporativo", title: "Projeto corporativo" },
  { value: "outro", title: "Outro" },
];

export const technologyOptions: Option<QuoteTechnology>[] = [
  {
    value: "indefinido",
    title: "Não sei — me recomendem",
    desc: "A gente escolhe pelo que a peça precisa.",
  },
  { value: "fdm", title: "FDM", desc: "Peças maiores, funcionais, resistentes." },
  { value: "resina", title: "Resina", desc: "Detalhe fino, miniaturas, colecionáveis." },
];

export const sizeOptions: Option<QuoteSize>[] = [
  { value: "pequeno", title: "Até 8 cm", desc: "Cabe na palma da mão." },
  { value: "medio", title: "8 a 15 cm", desc: "Miniatura de estante." },
  { value: "grande", title: "15 a 25 cm", desc: "Peça de presença." },
  { value: "extra", title: "Acima de 25 cm", desc: "Pode ser produzida em partes." },
];

export const finishOptions: Option<QuoteFinish>[] = [
  { value: "bruto", title: "Bruto", desc: "Como sai da máquina, sem suportes." },
  { value: "lixado", title: "Lixado", desc: "Superfície tratada, pronta para pintar." },
  { value: "pintado", title: "Pintado à mão", desc: "Primer, cor e verniz." },
  { value: "premium", title: "Premium", desc: "Pintura detalhada, base e montagem." },
];

export const modelingOptions: Option<QuoteModeling>[] = [
  { value: "nenhuma", title: "Tenho o arquivo pronto", desc: "Só produzir." },
  { value: "ajuste", title: "Tenho arquivo, mas precisa de ajuste", desc: "Reparo, escala, encaixes." },
  { value: "completa", title: "Preciso da modelagem", desc: "Criamos do zero, com render para aprovar." },
];

export const deadlineOptions: Option<QuoteDeadline>[] = [
  { value: "sem_pressa", title: "Sem pressa", desc: "Qualidade acima de velocidade." },
  { value: "ate_30", title: "Até 30 dias" },
  { value: "ate_15", title: "Até 15 dias" },
  { value: "urgente", title: "É urgente", desc: "Confirmamos viabilidade antes de fechar." },
];

/** Rótulos legíveis, usados no resumo e no e-mail do lead. */
export const labelOf = <T extends string>(options: Option<T>[], value: T) =>
  options.find((o) => o.value === value)?.title ?? value;

/* ── Upload ──────────────────────────────────────────────────────────── */

export const ACCEPTED_EXTENSIONS = [
  ".stl",
  ".obj",
  ".3mf",
  ".step",
  ".stp",
  ".zip",
  ".pdf",
  ".png",
  ".jpg",
  ".jpeg",
] as const;

/** Limites alinhados ao envio por e-mail com anexo. */
export const MAX_FILES = 5;
export const MAX_FILE_BYTES = 10 * 1024 * 1024; // 10 MB por arquivo
export const MAX_TOTAL_BYTES = 15 * 1024 * 1024; // 15 MB no total

export const formatBytes = (bytes: number) =>
  bytes >= 1024 * 1024
    ? `${(bytes / (1024 * 1024)).toFixed(1)} MB`
    : `${Math.max(1, Math.round(bytes / 1024))} KB`;
