/**
 * Fonte única de verdade sobre a marca.
 * Tudo que é institucional (nome, slogan, contato, SEO base) vive aqui.
 */
export const site = {
  name: "Inspire 3D",
  legalName: "Inspire 3D",
  slogan: "Transformamos ideias em produtos que inspiram.",
  shortDescription:
    "Marca de produtos criativos e personalizados que combina design, tecnologia e fabricação digital.",
  description:
    "A Inspire 3D é uma marca de produtos criativos próprios e personalizados. Unimos design, inteligência artificial e fabricação digital — incluindo modelagem e impressão 3D FDM e resina — para desenvolver produtos autorais, presentes, colecionáveis, jogos e soluções funcionais.",
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
