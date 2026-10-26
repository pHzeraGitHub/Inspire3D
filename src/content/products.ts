import type { Product } from "@/types";

/** Only confirmed product concepts belong in the catalog. */
export const products: Product[] = [
  {
    id: "inspire-games-caminho-dos-guardioes",
    slug: "caminho-dos-guardioes",
    name: "Caminho dos Guardiões",
    shortDescription: "Um jogo de tabuleiro autoral em desenvolvimento no ecossistema Inspire 3D.",
    description:
      "Caminho dos Guardiões é um projeto original da Inspire Games. O jogo está em desenvolvimento; personagens, componentes, regras, preço e data de lançamento ainda não foram anunciados.",
    collection: "inspire-games",
    category: "Jogo de tabuleiro",
    images: [],
    availability: "not-announced",
    launchStatus: "in-development",
    featured: true,
    available: false,
    seo: {
      title: "Caminho dos Guardiões",
      description:
        "Conheça o projeto autoral Caminho dos Guardiões, um jogo de tabuleiro da Inspire Games em desenvolvimento.",
    },
  },
];

export const launchStatusLabels = {
  "in-development": "Em desenvolvimento",
  "coming-soon": "Em breve",
  released: "Disponível",
} as const;

export function productStatusLabel(product: Product) {
  if (product.launchStatus === "released" && product.availability !== "available") {
    return "Indisponível";
  }
  return launchStatusLabels[product.launchStatus];
}
