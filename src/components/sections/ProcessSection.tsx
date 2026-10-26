import { Section } from "@/components/ui/Section";
import { Container } from "@/components/ui/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Reveal } from "@/components/ui/Reveal";
import { StageGlyph } from "@/components/visuals/StageGlyph";
import { processStages } from "@/content/process";

export function ProcessSection() {
  return (
    <Section id="processo" className="scroll-mt-24">
      <div aria-hidden className="grid-backdrop grid-backdrop--fine opacity-70" />

      <Container className="relative">
        <SectionHeading
          eyebrow="Como criamos"
          title={
            <>
              Da ideia à <span className="gold-text">experiência</span>, em quatro etapas.
            </>
          }
          description="A tecnologia ajuda a dar forma ao conceito. O que guia cada etapa é a intenção por trás do produto."
        />

        <div className="relative mt-16">
          {/* trilho horizontal (desktop) */}
          <div
            aria-hidden
            className="absolute left-0 right-0 top-8 hidden h-px bg-gradient-to-r from-transparent via-gold-line to-transparent lg:block"
          />

          <ol className="grid gap-12 lg:grid-cols-4 lg:gap-8">
            {processStages.map((stage, i) => (
              <Reveal as="li" key={stage.key} delay={i * 110}>
                <div className="relative flex gap-6 lg:block">
                  {/* trilho vertical (mobile/tablet) */}
                  {i < processStages.length - 1 ? (
                    <span
                      aria-hidden
                      className="absolute -bottom-12 left-8 top-[4.75rem] w-px bg-gradient-to-b from-gold-line to-transparent lg:hidden"
                    />
                  ) : null}

                  <div className="relative flex-none">
                    <div className="relative grid size-16 place-items-center rounded-full border border-line bg-void">
                      <StageGlyph stage={stage.key} />
                    </div>
                  </div>

                  <div className="lg:mt-7">
                    <div className="flex items-baseline gap-3">
                      <span className="index-num">{stage.step}</span>
                      <span aria-hidden className="h-px w-6 bg-line-strong" />
                    </div>
                    <h3 className="mt-3 font-display text-2xl font-semibold text-chalk">
                      {stage.title}
                    </h3>
                    <p className="mt-3 text-[0.95rem] leading-relaxed text-ash">
                      {stage.description}
                    </p>
                    <ul className="mt-5 space-y-2">
                      {stage.outputs.map((output) => (
                        <li
                          key={output}
                          className="flex items-center gap-2.5 font-mono text-[0.6875rem] uppercase tracking-[0.12em] text-silver/80"
                        >
                          <span aria-hidden className="size-1 rotate-45 bg-gold" />
                          {output}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </Reveal>
            ))}
          </ol>
        </div>
      </Container>
    </Section>
  );
}
