export type IdeaCategory = "Caixas & papelaria" | "Impressão 3D" | "Arquivos digitais" | "Jogos & colecionáveis";

export type Idea = {
  slug: string;
  title: string;
  category: IdeaCategory;
  description: string;
  image: string;
  alt: string;
  tags: string[];
};

/** Artes enviadas pelo cliente como direção visual. Todos os itens desta lista são conceitos. */
export const ideas: Idea[] = [
  {
    slug: "caixas-premium",
    title: "Caixas premium",
    category: "Caixas & papelaria",
    description: "Embalagens para presentes, kits e marcas, com formatos e revestimentos pensados para a ocasião.",
    image: "/ideias/caixas-premium.png",
    alt: "Estudo visual de caixas premium pretas e douradas, com modelos de tampa, fecho e gaveta",
    tags: ["cartonagem", "embalagens personalizadas", "presentes"],
  },
  {
    slug: "trofeus-e-medalhas",
    title: "Troféus e medalhas Vértice",
    category: "Impressão 3D",
    description: "Uma linha visual para premiações esportivas com temas, cores e identificação do evento.",
    image: "/ideias/trofeus-medalhas.png",
    alt: "Estudo visual de troféus e medalhas personalizados para diferentes modalidades esportivas",
    tags: ["troféus 3D", "medalhas", "eventos esportivos"],
  },
  {
    slug: "soberano-arcano",
    title: "Soberano Arcano",
    category: "Jogos & colecionáveis",
    description: "Conceito de estátua colecionável que mostra como escultura, resina e pintura mudam a presença da peça.",
    image: "/ideias/soberano-arcano.png",
    alt: "Conceito de estátua de fantasia mostrado em resina bruta e com pintura detalhada",
    tags: ["colecionáveis", "resina", "pintura artesanal"],
  },
  {
    slug: "natal-decoracao",
    title: "Natal personalizado",
    category: "Impressão 3D",
    description: "Enfeites, nomes e peças decorativas criadas para contar a história de cada família.",
    image: "/ideias/natal-decoracao.png",
    alt: "Conceito de decoração natalina com enfeites personalizados e peças impressas em 3D",
    tags: ["Natal", "decoração", "personalização"],
  },
  {
    slug: "prototipo-funcional",
    title: "Protótipos funcionais",
    category: "Impressão 3D",
    description: "Da necessidade ao teste de forma e encaixe: soluções simples que podem ganhar versões sob medida.",
    image: "/ideias/prototipo-funcional.png",
    alt: "Conceito de suporte ajustável impresso em 3D com desenhos técnicos ao fundo",
    tags: ["prototipagem", "peças funcionais", "modelagem 3D"],
  },
  {
    slug: "caminho-dos-guardioes",
    title: "Caminho dos Guardiões",
    category: "Jogos & colecionáveis",
    description: "Um universo de jogo autoral em estudo, com tabuleiro, cartas, personagens e componentes físicos.",
    image: "/ideias/caminho-dos-guardioes.png",
    alt: "Estudo visual de jogo de tabuleiro de fantasia com cartas, tabuleiro e miniaturas",
    tags: ["jogo autoral", "miniaturas", "tabuleiro"],
  },
  {
    slug: "arquivo-natal-feliz",
    title: "Arte de corte Feliz Natal",
    category: "Arquivos digitais",
    description: "Estudo de arte digital para personalizar caixas e embalagens natalinas em máquina de corte.",
    image: "/ideias/arquivo-natal-feliz.png",
    alt: "Conceito de arte de corte Feliz Natal aplicada a uma caixa vermelha e dourada",
    tags: ["arquivo de corte", "Silhouette", "Natal"],
  },
  {
    slug: "arquivo-natal-premium",
    title: "Coleção de cortes de Natal",
    category: "Arquivos digitais",
    description: "Variações de estampas e elementos de Natal para uma futura coleção de arquivos de corte.",
    image: "/ideias/arquivo-natal-premium.png",
    alt: "Estudo de artes digitais de Natal aplicadas em caixas decoradas",
    tags: ["SVG", "DXF", "papelaria criativa"],
  },
  {
    slug: "trama-3d",
    title: "Trama 3D",
    category: "Impressão 3D",
    description: "Miniaturas com textura inspirada no crochê, pensadas para presentes afetivos e personalização.",
    image: "/ideias/trama-3d.png",
    alt: "Conceito de miniaturas de urso, coelho e cachorro com textura de crochê impressa em 3D",
    tags: ["miniaturas", "textura de crochê", "presentes"],
  },
  {
    slug: "mini-realistas",
    title: "Mini Realistas",
    category: "Jogos & colecionáveis",
    description: "Retratos em miniatura a partir de referências pessoais, com modelagem e acabamento em estudo.",
    image: "/ideias/mini-realistas.png",
    alt: "Conceito de miniatura personalizada inspirada em uma fotografia, antes e depois da pintura",
    tags: ["miniatura personalizada", "resina", "pintura"],
  },
  {
    slug: "festa-personalizada",
    title: "Festa personalizada",
    category: "Caixas & papelaria",
    description: "Papelaria, topos e lembranças que combinam corte, impressão e acabamento em uma mesma identidade visual.",
    image: "/ideias/festa-personalizada.png",
    alt: "Conceito de festa personalizada com caixas, topo, flores e peças decorativas",
    tags: ["papelaria personalizada", "festa", "topo de bolo"],
  },
];

export const ideaCategories = ["Todas", "Caixas & papelaria", "Impressão 3D", "Arquivos digitais", "Jogos & colecionáveis"] as const;
