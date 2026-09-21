import type {
  QuoteDeadline,
  QuoteFinish,
  QuoteModeling,
  QuotePath,
  QuoteSize,
  QuoteTechnology,
} from "@/types";

/**
 * Listas de valores aceitos, compartilhadas entre o formulário e a Inspire AI.
 *
 * TypeScript não valida nada em runtime. Tudo que vem de fora — cliente OU
 * modelo de linguagem — passa por aqui antes de virar cálculo ou e-mail.
 * O modelo é tão "de fora" quanto o navegador: ele pode inventar
 * `size: "enorme"` com toda a confiança do mundo.
 */

export const PATHS: QuotePath[] = [
  "arquivo",
  "ideia",
  "personalizar",
  "miniatura",
  "serie",
  "prototipo",
  "outro",
];
export const TECHNOLOGIES: QuoteTechnology[] = ["fdm", "resina", "indefinido"];
export const FINISHES: QuoteFinish[] = ["bruto", "lixado", "pintado", "premium"];
export const SIZES: QuoteSize[] = ["pequeno", "medio", "grande", "extra"];
export const MODELINGS: QuoteModeling[] = ["nenhuma", "ajuste", "completa"];
export const DEADLINES: QuoteDeadline[] = ["sem_pressa", "ate_30", "ate_15", "urgente"];
export const CATEGORIES = [
  "colecionavel",
  "miniatura",
  "personagem",
  "jogos",
  "decoracao",
  "prototipo",
  "funcional",
  "personalizado",
  "corporativo",
  "outro",
];

export const MAX_TEXT = 4000;
export const MAX_QUANTITY = 10_000;

export const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

/** Devolve o valor só se ele estiver na lista; caso contrário, `null`. */
export const inList = <T extends string>(list: T[], value: unknown): T | null =>
  typeof value === "string" && (list as string[]).includes(value) ? (value as T) : null;

/** Texto saneado e limitado. Nunca devolve `undefined`. */
export const text = (value: unknown, max = 200) =>
  typeof value === "string" ? value.trim().slice(0, max) : "";

/** Quantidade válida, ou `null` se não for um inteiro dentro da faixa. */
export const quantityOf = (value: unknown): number | null => {
  const n = Number(value);
  return Number.isInteger(n) && n >= 1 && n <= MAX_QUANTITY ? n : null;
};
