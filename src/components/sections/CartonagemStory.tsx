import { CartonagemIllustration } from "@/components/visuals/CartonagemIllustration";
import { Button } from "@/components/ui/Button";

const stages = [
  {
    key: "corte" as const,
    number: "01",
    title: "Corte estrutural",
    description: "A forma começa no papelão Holler de 2 mm. O corte pede guilhotina ou ferramenta adequada, com capacidade e precisão verificadas para a espessura. A Cameo 4 Pro fica reservada aos materiais compatíveis, não ao Holler de 2 mm.",
    detail: "Estrutura · medidas · precisão",
  },
  {
    key: "montagem" as const,
    number: "02",
    title: "Montagem",
    description: "As paredes recebem cola apropriada, são alinhadas e conferidas no esquadro antes da prensagem. Gabaritos de 90° impressos em 3D podem ajudar a repetir o alinhamento entre as unidades.",
    detail: "Esquadro · união · prensagem",
  },
  {
    key: "revestimento" as const,
    number: "03",
    title: "Revestimento",
    description: "O Color Plus cobre as faces externas, passa pelas viradas e encontra o acabamento interno. O excesso de cola é controlado e a peça seca sob peso ou prensagem leve.",
    detail: "Cor · viradas · acabamento",
  },
];

export function CartonagemStory() {
  return (
    <div>
      <div className="max-w-3xl">
        <p className="eyebrow">Dentro do ateliê</p>
        <h2 className="mt-5 text-display text-chalk">Uma caixa começa muito antes do laço.</h2>
        <p className="mt-5 text-lead text-ash">
          Primeiro vêm as medidas e a estrutura. Depois, o cuidado para manter cada parede no lugar. Por fim, o revestimento transforma a peça em uma experiência para quem a recebe.
        </p>
      </div>
      <ol className="mt-11 grid gap-5 lg:grid-cols-3">
        {stages.map((stage) => (
          <li key={stage.key} className="overflow-hidden rounded-[22px] border border-line bg-carbon">
            <figure className="aspect-[3/2] border-b border-line">
              <CartonagemIllustration stage={stage.key} />
              <figcaption className="sr-only">Ilustração da etapa de {stage.title.toLowerCase()} da cartonagem.</figcaption>
            </figure>
            <div className="p-6 md:p-7">
              <div className="flex items-center gap-3">
                <span className="font-mono text-sm text-gold">{stage.number}</span>
                <span aria-hidden className="h-px w-8 bg-gold-line" />
                <span className="font-mono text-[0.6rem] uppercase tracking-[0.15em] text-ash">{stage.detail}</span>
              </div>
              <h3 className="mt-4 font-display text-xl font-semibold text-chalk">{stage.title}</h3>
              <p className="mt-3 text-sm leading-relaxed text-silver">{stage.description}</p>
            </div>
          </li>
        ))}
      </ol>
      <div className="mt-9 flex flex-wrap items-center gap-4">
        <Button href="/orcamento?categoria=personalizado">Imaginar minha caixa</Button>
        <p className="max-w-xl text-xs leading-relaxed text-ash">
          Etapas ilustrativas para projetos em Holler e Color Plus. Ferramentas, materiais e acabamento são confirmados conforme cada projeto.
        </p>
      </div>
    </div>
  );
}
