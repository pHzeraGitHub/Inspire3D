import type { ProcessStage } from "@/types";

/** A espinha dorsal da marca: IDEIA → DIGITAL → FABRICAÇÃO → REALIDADE. */
export const processStages: ProcessStage[] = [
  {
    step: "01",
    key: "ideia",
    title: "Ideia",
    description:
      "Começa com uma referência, um rascunho ou uma frase. A gente entende a função, a escala e o encanto que a peça precisa ter.",
    outputs: ["Briefing técnico", "Referências", "Definição de escala"],
  },
  {
    step: "02",
    key: "digital",
    title: "Digital",
    description:
      "Modelagem 3D e preparação de arquivo. Aqui a peça ganha geometria, tolerâncias, encaixes e suportes.",
    outputs: ["Modelagem 3D", "Ajuste de tolerâncias", "Aprovação do render"],
  },
  {
    step: "03",
    key: "fabricacao",
    title: "Fabricação",
    description:
      "Camada por camada, em FDM ou resina, com o parâmetro certo para cada geometria. É onde o digital vira matéria.",
    outputs: ["FDM ou resina", "Controle de camada", "Pós-cura & limpeza"],
  },
  {
    step: "04",
    key: "realidade",
    title: "Realidade",
    description:
      "Lixamento, primer, pintura e montagem. A peça sai da bancada pronta para a prateleira, a mesa ou o cliente final.",
    outputs: ["Acabamento manual", "Pintura", "Inspeção & entrega"],
  },
];
