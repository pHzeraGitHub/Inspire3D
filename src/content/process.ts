import type { ProcessStage } from "@/types";

/** A espinha dorsal da marca: IMAGINE → CRIAMOS → PRODUZIMOS → SURPREENDEMOS. */
export const processStages: ProcessStage[] = [
  {
    step: "01",
    key: "ideia",
    title: "Imagine",
    description:
      "Tudo começa com uma vontade, uma lembrança ou algo que ainda não existe. Você conta o que imaginou do jeito que for mais fácil.",
    outputs: ["Ideia", "Preferências", "Possibilidades"],
  },
  {
    step: "02",
    key: "digital",
    title: "Criamos",
    description:
      "Design e criatividade dão direção ao conceito. A Inspire AI pode ajudar a explorar opções e organizar as preferências.",
    outputs: ["Conceito", "Design", "Personalização"],
  },
  {
    step: "03",
    key: "fabricacao",
    title: "Produzimos",
    description:
      "Com o conceito definido, tecnologias de fabricação digital ajudam a transformar o projeto em um produto físico.",
    outputs: ["Preparação", "Fabricação digital", "Acabamento"],
  },
  {
    step: "04",
    key: "realidade",
    title: "Surpreendemos",
    description:
      "O resultado é um produto desenvolvido para criar uma experiência única — para você ou para quem vai recebê-lo.",
    outputs: ["Identidade", "Detalhes", "Experiência"],
  },
];
