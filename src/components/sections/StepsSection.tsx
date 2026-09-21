import { Section } from "@/components/ui/Section";
import { Container } from "@/components/ui/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Reveal } from "@/components/ui/Reveal";
import { steps } from "@/content/steps";

/**
 * Como funciona, do ponto de vista de quem contrata (briefing §13).
 *
 * Complementa — não repete — a seção de processo da Home: lá a cadeia é o
 * conceito da marca (IDEIA → DIGITAL → FABRICAÇÃO → REALIDADE); aqui é o
 * passo a passo prático, com o que cabe ao cliente em cada etapa.
 */
export function StepsSection() {
  return (
    <Section id="como-funciona" tone="graphite" className="scroll-mt-24 border-y border-line">
      <div aria-hidden className="halo -right-24 top-10 size-[460px] opacity-60" />

      <Container className="relative">
        <SectionHeading
          eyebrow="Como funciona"
          title={
            <>
              Do arquivo <span className="gold-text">à sua mão</span>.
            </>
          }
          description="Cinco passos. Você acompanha e aprova antes de cada avanço que custa dinheiro."
        />

        <ol className="mt-16 grid gap-px overflow-hidden rounded-2xl border border-line bg-line md:grid-cols-2 lg:grid-cols-5">
          {steps.map((step, i) => (
            <Reveal as="li" key={step.number} delay={i * 70} className="bg-carbon">
              <div className="flex h-full flex-col p-6">
                <span className="index-num">{step.number}</span>
                <h3 className="mt-3 font-display text-[1.05rem] font-semibold text-chalk">
                  {step.title}
                </h3>
                <p className="mt-3 text-[0.875rem] leading-relaxed text-ash">{step.description}</p>
                {step.yours ? (
                  <p className="mt-auto pt-5 text-[0.8125rem] leading-relaxed text-gold-lum/90">
                    {step.yours}
                  </p>
                ) : null}
              </div>
            </Reveal>
          ))}
        </ol>
      </Container>
    </Section>
  );
}
