import { Section } from "@/components/ui/Section";
import { Container } from "@/components/ui/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Reveal } from "@/components/ui/Reveal";
import { pad } from "@/lib/utils";

const commitments = [
  {
    title: "Aprovação antes da máquina",
    text: "Nenhuma peça entra em produção sem que você tenha visto o render e concordado com escala, encaixe e acabamento.",
  },
  {
    title: "Um responsável, do início ao fim",
    text: "O mesmo estúdio modela, imprime, lixa e pinta. Não há terceirização escondida no meio do caminho.",
  },
  {
    title: "Seus arquivos são seus",
    text: "Projetos e modelos enviados são tratados como confidenciais e usados apenas para produzir a sua peça.",
  },
  {
    title: "Prazo combinado é prazo",
    text: "O prazo sai junto com o orçamento, considerando modelagem, tempo real de impressão e bancada de acabamento.",
  },
];

export function StudioSection() {
  return (
    <Section>
      <Container className="relative">
        <SectionHeading
          eyebrow="Como trabalhamos"
          title={
            <>
              Fabricação é confiança <span className="silver-text">antes de ser tecnologia</span>.
            </>
          }
        />

        <div className="mt-14 grid gap-px overflow-hidden rounded-panel border border-line bg-line sm:grid-cols-2 lg:grid-cols-4">
          {commitments.map((item, i) => (
            <Reveal key={item.title} delay={i * 80} className="bg-void">
              <div className="h-full bg-void p-7 transition-colors duration-500 hover:bg-carbon md:p-8">
                <span className="index-num">{pad(i + 1)}</span>
                <h3 className="mt-6 font-display text-lg font-semibold leading-snug text-chalk">
                  {item.title}
                </h3>
                <p className="mt-3 text-[0.9rem] leading-relaxed text-ash">{item.text}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </Container>
    </Section>
  );
}
