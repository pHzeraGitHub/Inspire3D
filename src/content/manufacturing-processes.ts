export type ManufacturingProcess = {
  slug: string;
  title: string;
  summary: string;
  description: string;
  serviceSlug: string;
  tags: string[];
  applications: string[];
  steps: { title: string; description: string }[];
};

/** Terms and stages describe capabilities already presented on the services page. */
export const manufacturingProcesses: ManufacturingProcess[] = [
  {
    slug: "impressao-3d-fdm",
    title: "Impressão 3D FDM com filamento",
    summary: "Peças funcionais, protótipos e objetos personalizados produzidos camada por camada com filamento.",
    description: "Na impressão 3D FDM, o filamento é depositado em camadas. A escolha de material, orientação e suportes depende da geometria e do uso previsto para a peça.",
    serviceSlug: "impressao-3d",
    tags: ["Impressão 3D FDM", "Filamento PLA e PETG", "Protótipos funcionais", "Peças sob medida"],
    applications: ["Protótipos para avaliar forma e encaixe", "Organizadores e peças funcionais", "Estruturas e componentes personalizados"],
    steps: [
      { title: "Análise do arquivo", description: "Conferimos escala, espessuras, encaixes e pontos que precisam de ajuste antes da fabricação." },
      { title: "Material e preparação", description: "Definimos filamento, orientação e suportes conforme a resistência e o acabamento esperados." },
      { title: "Fabricação e conferência", description: "Imprimimos, removemos suportes e inspecionamos a peça antes de propor acabamento adicional." },
    ],
  },
  {
    slug: "impressao-3d-resina",
    title: "Impressão 3D em resina",
    summary: "Processo indicado para miniaturas, colecionáveis e peças que pedem detalhes finos.",
    description: "A impressão em resina usa fotopolimerização para reproduzir detalhes pequenos e superfícies mais uniformes. Orientação, suportes, lavagem e pós-cura fazem parte da preparação da peça.",
    serviceSlug: "impressao-3d",
    tags: ["Impressão 3D em resina", "Miniaturas", "Colecionáveis", "Detalhes finos"],
    applications: ["Miniaturas e personagens", "Colecionáveis autorais", "Peças pequenas com detalhes delicados"],
    steps: [
      { title: "Preparação do modelo", description: "Avaliamos espessuras, orientação e suportes para preservar os detalhes da geometria." },
      { title: "Impressão", description: "Fabricamos a peça na resina escolhida para o uso e o acabamento pretendidos." },
      { title: "Lavagem e pós-cura", description: "Removemos resíduos e suportes, fazemos a pós-cura e inspecionamos o resultado." },
    ],
  },
  {
    slug: "modelagem-3d",
    title: "Modelagem 3D e preparação de arquivos",
    summary: "Da referência ou ideia a um modelo digital preparado para fabricação.",
    description: "A modelagem digital parte de fotos, medidas, rascunhos ou de um arquivo existente. O trabalho pode criar uma peça nova, adaptar um modelo ou corrigir problemas antes da impressão.",
    serviceSlug: "modelagem",
    tags: ["Modelagem 3D", "Arquivo STL", "Escultura digital", "Prototipagem"],
    applications: ["Criação de modelos a partir de referências", "Correção de arquivos para impressão", "Ajustes de escala, tolerância e encaixe"],
    steps: [
      { title: "Entendimento do projeto", description: "Reunimos referências, dimensões e finalidade da peça." },
      { title: "Modelagem e revisão", description: "Construímos ou ajustamos o modelo e conferimos geometria, encaixes e possibilidade de fabricação." },
      { title: "Aprovação", description: "Apresentamos uma visualização para revisão antes de preparar o arquivo final." },
    ],
  },
  {
    slug: "pintura-acabamento",
    title: "Pintura e acabamento de peças 3D",
    summary: "Preparação de superfície, pintura e montagem para a apresentação final da peça.",
    description: "O acabamento é definido pelo objetivo do projeto. Pode incluir remoção de marcas, lixamento, primer, pintura manual, aerografia, montagem e embalagem.",
    serviceSlug: "acabamento",
    tags: ["Acabamento de impressão 3D", "Pintura de miniaturas", "Aerografia", "Montagem"],
    applications: ["Miniaturas e colecionáveis pintados", "Peças decorativas", "Protótipos de apresentação"],
    steps: [
      { title: "Preparação", description: "Avaliamos a superfície, removemos suportes e planejamos os ajustes necessários." },
      { title: "Pintura", description: "Aplicamos primer e pintura conforme a proposta visual aprovada para a peça." },
      { title: "Montagem e revisão", description: "Conferimos detalhes finais, montagem e apresentação antes da entrega." },
    ],
  },
  {
    slug: "cartonagem-caixas-premium",
    title: "Cartonagem e projeto de caixas premium",
    summary: "Desenvolvimento de embalagens para produtos, presentes, kits e experiências de marca.",
    description: "O projeto de cartonagem considera o conteúdo, a ocasião, a quantidade e a identidade visual. Formato, proteção e apresentação são definidos antes de fechar o escopo de produção.",
    serviceSlug: "cartonagem-caixas-premium",
    tags: ["Cartonagem", "Caixas premium", "Embalagens personalizadas", "Kits corporativos"],
    applications: ["Caixas para presentes personalizados", "Embalagens para produtos e kits", "Apresentação de ações de marca"],
    steps: [
      { title: "Briefing", description: "Entendemos o produto, a quantidade aproximada, a ocasião e a experiência desejada." },
      { title: "Formato e direção visual", description: "Estudamos dimensões, abertura, proteção e linguagem visual da embalagem." },
      { title: "Proposta", description: "Apresentamos o escopo do projeto para validação antes de definir a produção." },
    ],
  },
];
