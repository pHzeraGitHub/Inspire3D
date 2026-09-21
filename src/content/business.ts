import type { BusinessOffer } from "@/types";

/** Soluções para empresas (briefing §16) — o site não pode viver só de B2C. */
export const businessOffers: BusinessOffer[] = [
  {
    title: "Prototipagem",
    description: "Valide forma e encaixe antes de comprometer molde ou ferramental.",
  },
  {
    title: "Pequenas séries",
    description: "Dezenas ou centenas de unidades, sem custo de ferramenta.",
  },
  {
    title: "Peças personalizadas",
    description: "Componente sob medida que nenhum catálogo tem.",
  },
  {
    title: "Brindes e presentes especiais",
    description: "Peça com a sua marca que a pessoa guarda em vez de descartar.",
  },
  {
    title: "Modelos demonstrativos",
    description: "O produto em escala, na mão do cliente, antes de existir.",
  },
  {
    title: "Displays e material de apresentação",
    description: "Suporte, expositor e peça de vitrine feitos para o seu produto.",
  },
  {
    title: "Cenografia e ativação de marca",
    description: "Grande formato para evento, feira e ponto de venda.",
  },
  {
    title: "Projetos corporativos",
    description: "Quando a demanda é recorrente e vale desenhar um processo junto.",
  },
];
