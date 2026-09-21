import type { Project } from "@/types";

/**
 * Vitrine do portfólio.
 * FASE 1: metadados de estrutura, sem imagens (a arte é gerada por CSS/SVG).
 * FASE 2: `cover` passa a apontar para as fotos reais dos projetos.
 */
export const projects: Project[] = [
  {
    slug: "colecionavel-serie-aurum",
    title: "Série Aurum",
    category: "Colecionáveis",
    summary: "Busto autoral em resina, pintura manual e base em FDM texturizado.",
    tags: ["Resina", "Pintura manual", "Autoral"],
    year: 2025,
  },
  {
    slug: "board-game-kit-mesa",
    title: "Kit de Mesa Completo",
    category: "Board Games",
    summary: "Dados, peões e organizador sob medida para uma edição de colecionador.",
    tags: ["FDM", "Resina", "Insert"],
    year: 2025,
  },
  {
    slug: "luminaria-parametrica",
    title: "Luminária Paramétrica",
    category: "Decoração",
    summary: "Geometria gerada por parâmetros, difusão de luz calculada no modelo.",
    tags: ["FDM", "Modelagem", "Design"],
    year: 2025,
  },
  {
    slug: "prototipo-encaixe",
    title: "Protótipo de Encaixe",
    category: "Protótipos",
    summary: "Três iterações de tolerância em 72 horas até o encaixe final aprovado.",
    tags: ["FDM", "Engenharia", "Iteração"],
    year: 2024,
  },
  {
    slug: "totem-ativacao",
    title: "Totem de Ativação",
    category: "Projetos Especiais",
    summary: "Peça de grande formato modular para evento de marca.",
    tags: ["Grande formato", "Modular", "Acabamento"],
    year: 2024,
  },
];
