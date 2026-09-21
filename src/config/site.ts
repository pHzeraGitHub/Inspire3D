/**
 * Fonte única de verdade sobre a marca.
 * Tudo que é institucional (nome, slogan, contato, SEO base) vive aqui.
 */
export const site = {
  name: "Inspire 3D",
  legalName: "Inspire 3D",
  slogan: "Transformando ideias em realidade.",
  shortDescription:
    "Estúdio de fabricação criativa: impressão 3D, modelagem e personalização para transformar ideias em produtos físicos.",
  description:
    "A Inspire 3D é um estúdio de fabricação criativa. Unimos modelagem digital, impressão 3D FDM e resina, pintura e acabamento manual para transformar ideias em objetos reais — colecionáveis, board games, protótipos, peças funcionais e projetos autorais.",
  url: process.env.NEXT_PUBLIC_SITE_URL ?? "https://www.inspire3d.com.br",
  locale: "pt-BR",
  contact: {
    email: "contato@inspire3d.com.br",
    whatsapp: process.env.NEXT_PUBLIC_WHATSAPP ?? "5531999700539",
    whatsappLabel: "(31) 99970-0539",
    city: "Minas Gerais · Brasil",
  },
  social: {
    instagram: "https://instagram.com/inspire3d",
    tiktok: "https://tiktok.com/@inspire3d",
    youtube: "https://youtube.com/@inspire3d",
  },
} as const;

export const whatsappLink = (message = "Olá! Vim pelo site e gostaria de um orçamento.") =>
  `https://wa.me/${site.contact.whatsapp}?text=${encodeURIComponent(message)}`;
