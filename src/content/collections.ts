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
    subtitle: "Produtos funcionais",
    description:
      "Objetos de uso cotidiano que combinam praticidade, desenho inteligente e identidade própria.",
    possibilities: ["Organizadores", "Suportes", "Acessórios funcionais"],
  },
];
