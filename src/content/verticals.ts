import type { Vertical } from "@/types";

/** O que a Inspire 3D fabrica. Ordem = ordem no grid bento da Home. */
export const verticals: Vertical[] = [
  {
    slug: "colecionaveis",
    title: "Colecionáveis & Action Figures",
    tagline:
      "Personagens, bustos e miniaturas com nível de detalhe de resina e acabamento pintado à mão.",
    items: ["Action figures", "Bustos", "Miniaturas", "Dioramas", "Estatuetas", "Personagens autorais"],
    featured: true,
  },
  {
    slug: "board-games",
    title: "Board Games",
    tagline: "Componentes que mudam a mesa de lugar: do protótipo do seu jogo à edição de colecionador.",
    items: ["Dados personalizados", "Peões & meeples", "Tokens", "Organizadores de caixa", "Insertos", "Terrenos"],
    featured: true,
  },
  {
    slug: "decoracao",
    title: "Decoração & Design",
    tagline: "Objetos com presença: geometria, luz e textura pensadas para o ambiente.",
    items: ["Luminárias", "Vasos", "Esculturas", "Painéis", "Objetos de mesa"],
  },
  {
    slug: "prototipos",
    title: "Protótipos & Peças Funcionais",
    tagline: "Da ideia ao teste físico em dias — e da peça quebrada à substituta sob medida.",
    items: ["Protótipos de produto", "Peças de reposição", "Gabaritos", "Suportes técnicos", "Encaixes"],
  },
  {
    slug: "personalizados",
    title: "Personalizados & Presentes",
    tagline: "Peças únicas, com nome, data, logo ou rosto de quem vai receber.",
    items: ["Presentes autorais", "Lembranças", "Troféus", "Brindes corporativos", "Chaveiros"],
  },
  {
    slug: "projetos-especiais",
    title: "Totens & Projetos Especiais",
    tagline: "Grande formato, cenografia e desenvolvimento de produto do zero.",
    items: ["Totens", "Cenografia", "Ativações de marca", "Desenvolvimento de produto", "Séries autorais"],
  },
];
