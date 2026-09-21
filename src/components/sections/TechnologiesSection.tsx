import { Section } from "@/components/ui/Section";
import { Container } from "@/components/ui/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Reveal } from "@/components/ui/Reveal";
import { technologies } from "@/content/technologies";
import { pad } from "@/lib/utils";

export function TechnologiesSection() {
  return (
    <Section id="tecnologias" className="scroll-mt-24">
      <div aria-hidden className="halo -left-40 top-1/3 size-[460px] opacity-50" />

      <Container className="relative">
        <SectionHeading
          eyebrow="O laboratório"
          title={
            <>
              A tecnologia certa <span className="gold-text">para cada peça</span>.
            </>
          }
          description="Nada de forçar uma geometria na máquina errada. A escolha entre filamento, resina e trabalho manual é parte do projeto — e a gente explica o porquê antes de imprimir."
        />

        <div className="mt-14 border-t border-line">
          {technologies.map((tech, i) => (
            <Reveal key={tech.slug} delay={i * 80}>
              <article className="group grid gap-6 border-b border-line py-9 transition-colors duration-500 hover:bg-white/[0.015] lg:grid-cols-12 lg:gap-8 lg:py-10">
                <div className="lg:col-span-4">
                  <div className="flex items-baseline gap-3">
                    <span className="index-num">{pad(i + 1)}</span>
                    <span
                      aria-hidden
                      className="h-px w-6 bg-line-strong transition-all duration-500 group-hover:w-12 group-hover:bg-gold"
                    />
                  </div>
                  <h3 className="mt-3 font-display text-2xl font-semibold text-chalk md:text-[1.75rem]">
                    {tech.name}
                  </h3>
                  <p className="mt-2 font-mono text-[0.6875rem] uppercase tracking-[0.16em] text-gold">
                    {tech.role}
                  </p>
                </div>

                <p className="text-[0.95rem] leading-relaxed text-ash lg:col-span-3">
                  {tech.description}
                </p>

                <dl className="grid grid-cols-1 gap-4 sm:grid-cols-3 lg:col-span-5">
                  {tech.specs.map((spec) => (
                    <div key={spec.label} className="border-l border-line pl-4">
                      <dt className="font-mono text-[0.5625rem] uppercase tracking-[0.14em] text-ash">
                        {spec.label}
                      </dt>
                      <dd className="mt-1.5 text-sm leading-snug text-silver">{spec.value}</dd>
                    </div>
                  ))}
                </dl>
              </article>
            </Reveal>
          ))}
        </div>
      </Container>
    </Section>
  );
}
