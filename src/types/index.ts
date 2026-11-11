/* ══════════════════════════════════════════════════════════════════════
   Contratos de domínio da Inspire 3D.
   Hoje alimentados por arquivos em src/content (conteúdo estático).
   Amanhã, pelo mesmo shape vindo de banco de dados / CMS — sem alterar UI.
   ══════════════════════════════════════════════════════════════════════ */

export type Vertical = {
  slug: string;
  title: string;
  tagline: string;
  items: string[];
  /** Destaque no grid bento da Home. */
  featured?: boolean;
};

export type Technology = {
  slug: string;
  name: string;
  role: string;
  description: string;
  specs: { label: string; value: string }[];
};

export type ProcessStage = {
  step: string;
  key: "ideia" | "digital" | "fabricacao" | "realidade";
  title: string;
  description: string;
  outputs: string[];
};

export type Project = {
  slug: string;
  title: string;
  category: string;
  summary: string;
  /** Fase 2: imagens reais do portfólio. */
  cover?: string;
  tags: string[];
  year: number;
};

export type CollectionSlug =
  | "inspire-gifts"
  | "inspire-collectibles"
  | "inspire-games"
  | "inspire-solutions";

export type ProductCollection = {
  slug: CollectionSlug;
  name: string;
  subtitle: string;
  description: string;
  possibilities: string[];
};

export type ProductLaunchStatus = "in-development" | "coming-soon" | "released";
export type ProductAvailability = "not-announced" | "available" | "unavailable";

export type ProductVariant = {
  label: string;
  options: string[];
};

export type Product = {
  id: string;
  slug: string;
  name: string;
  shortDescription: string;
  description: string;
  collection: CollectionSlug;
  category: string;
  /** Only verified product photography belongs here. */
  images: string[];
  technicalCharacteristics?: string[];
  dimensions?: string;
  variants?: ProductVariant[];
  personalizationOptions?: string[];
  priceFrom?: number;
  availability: ProductAvailability;
  launchStatus: ProductLaunchStatus;
  leadTime?: string;
  productionDays?: number;
  productionReady?: boolean;
  featured: boolean;
  seo: { title: string; description: string };
  /** True only when a real purchase or quote path is available. */
  available: boolean;
};

export type Service = {
  number: string;
  slug: string;
  title: string;
  lead: string;
  /** O que o estúdio faz nessa frente. */
  includes: string[];
  /** O que o cliente recebe no fim. */
  delivers: string;
};

export type Step = {
  number: string;
  title: string;
  description: string;
  /** Linha de fecho da etapa: o que cabe ao cliente, ou o compromisso do
   *  estúdio. Presente nas cinco — é o que alinha os cards na grade. */
  yours?: string;
};

export type BusinessOffer = {
  title: string;
  description: string;
};

export type FaqItem = {
  question: string;
  answer: string;
};

/* ── Orçamento inteligente (Fase 2) ───────────────────────────────────── */

/** Ponto de partida do cliente — primeira pergunta do wizard. */
export type QuotePath =
  | "arquivo"
  | "ideia"
  | "personalizar"
  | "miniatura"
  | "serie"
  | "prototipo"
  | "outro";

export type QuoteTechnology = "fdm" | "resina" | "indefinido";
export type QuoteFinish = "bruto" | "lixado" | "pintado" | "premium";
export type QuoteSize = "pequeno" | "medio" | "grande" | "extra";
export type QuoteModeling = "nenhuma" | "ajuste" | "completa";
export type QuoteDeadline = "sem_pressa" | "ate_30" | "ate_15" | "urgente";

export type QuoteFileInfo = {
  name: string;
  size: number;
  type: string;
};

export type QuoteRequest = {
  /* Passo 1 — caminho */
  path: QuotePath;

  /* Passo 2 — projeto */
  category: string;
  description: string;
  technology: QuoteTechnology;
  size: QuoteSize;
  finish: QuoteFinish;
  modeling: QuoteModeling;
  quantity: number;
  /** Dimensões aproximadas em texto livre, ex.: "18 × 9 × 9 cm". */
  dimensions?: string;
  deadline: QuoteDeadline;

  /* Passo 3 — contato */
  name: string;
  email: string;
  phone?: string;
  company?: string;

  /* LGPD — consentimento explícito, nunca pré-marcado. */
  consent: boolean;

  /** Preenchido no servidor a partir do multipart. */
  files?: QuoteFileInfo[];
};

export type QuoteComplexity = "simples" | "media" | "alta";

export type LeadDeliveryStatus = "sent" | "skipped" | "failed";

export type QuoteEstimate = {
  currency: "BRL";
  /** Só vem preenchido quando a tabela de preço está calibrada. */
  price: { min: number; max: number } | null;
  /** Motivo de `price` estar nulo — exibido só no log, nunca ao cliente. */
  priceStatus: "ok" | "nao_calibrado";
  leadTimeDays: [number, number];
  complexity: QuoteComplexity;
  /** Tecnologia que o estúdio recomenda, dado o que foi descrito. */
  recommendedTechnology: Exclude<QuoteTechnology, "indefinido">;
  recommendationReason: string;
  assumptions: string[];
};
