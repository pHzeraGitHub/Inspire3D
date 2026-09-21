import type { Technology } from "@/types";

export const technologies: Technology[] = [
  {
    slug: "fdm",
    name: "Impressão 3D FDM",
    role: "Volume, estrutura e resistência",
    description:
      "Filamento fundido para peças maiores, funcionais e resistentes — protótipos, componentes, organizadores e estruturas.",
    specs: [
      { label: "Altura de camada", value: "0,08 – 0,28 mm" },
      { label: "Materiais", value: "PLA · PETG · ABS · TPU" },
      { label: "Melhor para", value: "Peças funcionais e grandes" },
    ],
  },
  {
    slug: "resina",
    name: "Impressão 3D em Resina",
    role: "Detalhe fino e superfície limpa",
    description:
      "Fotopolimerização para miniaturas, colecionáveis e peças com detalhe fino, onde cada milímetro precisa aparecer.",
    specs: [
      { label: "Altura de camada", value: "0,01 – 0,05 mm" },
      { label: "Materiais", value: "Standard · ABS-like · Flex" },
      { label: "Melhor para", value: "Miniaturas e colecionáveis" },
    ],
  },
  {
    slug: "modelagem",
    name: "Modelagem Digital",
    role: "Da referência ao arquivo pronto",
    description:
      "Modelagem paramétrica e escultura digital. Criamos do zero, adaptamos um modelo existente ou preparamos o seu arquivo para imprimir.",
    specs: [
      { label: "Entrada", value: "Foto · sketch · descrição · STL" },
      { label: "Entrega", value: "STL · OBJ · 3MF · STEP" },
      { label: "Inclui", value: "Render de aprovação" },
    ],
  },
  {
    slug: "acabamento",
    name: "Pintura & Acabamento",
    role: "O que separa peça impressa de produto",
    description:
      "Lixamento, primer, aerografia e pintura manual. É a etapa que apaga a camada e entrega uma peça com aparência de produto.",
    specs: [
      { label: "Níveis", value: "Bruto · lixado · pintado · premium" },
      { label: "Técnicas", value: "Aerógrafo · pincel · verniz" },
      { label: "Extras", value: "Base, montagem e embalagem" },
    ],
  },
];
