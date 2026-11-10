import type { ProductCollection } from "@/types";

/** Product lines, kept separate from inventory so the catalog can grow safely. */
export const collections: ProductCollection[] = [
  {
    slug: "inspire-gifts",
    name: "Inspire Gifts",
    subtitle: "Presentes & personalizados",
    description:
      "Presentes criativos que ganham significado com nomes, mensagens e detalhes pensados para cada ocasião.",
    possibilities: ["Presentes personalizados", "Peças comemorativas", "Objetos decorativos"],
  },
  {
    slug: "inspire-collectibles",
    name: "Inspire Collectibles",
    subtitle: "Colecionáveis",
    description:
      "Personagens, miniaturas e peças autorais criadas para ocupar um lugar especial em cada coleção.",
    possibilities: ["Action figures autorais", "Miniaturas", "Estatuetas"],
  },
  {
    slug: "inspire-games",
    name: "Inspire Games",
    subtitle: "Jogos & entretenimento",
    description:
      "Jogos próprios, acessórios e universos que começam na imaginação. Caminho dos Guardiões está em desenvolvimento.",
    possibilities: ["Jogos originais", "Dados e tokens", "Organizadores para jogos"],
  },
  {
    slug: "inspire-solutions",
    name: "Inspire Solutions",
    subtitle: "Produtos & embalagens",
    description:
      "Soluções funcionais e projetos de cartonagem e caixas premium para apresentar produtos, presentes e kits.",
    possibilities: ["Cartonagem", "Caixas premium", "Soluções sob medida"],
  },
];
