import Link from "next/link";
import { Section } from "@/components/ui/Section";
import { Container } from "@/components/ui/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Reveal } from "@/components/ui/Reveal";
import { services } from "@/content/services";
import { manufacturingProcesses } from "@/content/manufacturing-processes";

/**
 * As seis frentes em profundidade. Lista, não grade: cada serviço ocupa uma
 * linha inteira, com o que está incluso à direita. A leitura é de ficha
 * técnica — o mesmo registro da seção de tecnologias da Home.
 */
export function ServicesSection() {
  return (
    <Section id="servicos" className="scroll-mt-24">
      <Container>
        <SectionHeading
          eyebrow="Capacidades"
          title={
            <>
              O que entra em <span className="gold-text">cada projeto</span>.
            </>
          }
          description="Na prática, quase todo projeto passa por mais de uma frente — e é isso que evita o vaivém entre fornecedores."
        />

        <div className="mt-16 divide-y divide-line border-y border-line">
          {services.map((service, i) => (
            <Reveal key={service.slug} delay={i * 60}>
              <article
                id={service.slug}
                className="grid scroll-mt-28 gap-8 py-10 lg:grid-cols-[minmax(0,22rem)_1fr] lg:gap-14 lg:py-12"
              >
                <div>
                  <span className="index-num">{service.number}</span>
                  <h3 className="mt-3 font-display text-xl font-semibold text-chalk md:text-2xl">
                    {service.title}
                  </h3>
                  <p className="mt-4 text-[0.95rem] leading-relaxed text-ash">{service.lead}</p>
                </div>

                <div>
                  <p className="font-mono text-[0.625rem] uppercase tracking-[0.18em] text-gold">
                    O que está incluso
                  </p>
                  <ul className="mt-4 grid gap-2.5 sm:grid-cols-2">
                    {service.includes.map((item) => (
                      <li
                        key={item}
                        className="flex gap-2.5 text-[0.9rem] leading-relaxed text-silver"
                      >
                        <span aria-hidden className="mt-2 size-1 flex-none rotate-45 bg-gold/70" />
                        {item}
                      </li>
                    ))}
                  </ul>

                  <p className="mt-6 border-t border-line pt-4 text-[0.9rem] leading-relaxed text-chalk">
                    <span className="font-mono text-[0.625rem] uppercase tracking-[0.18em] text-ash">
                      Você recebe
                    </span>
                    <br />
                    {service.delivers}
                  </p>
                  {manufacturingProcesses.some((process) => process.serviceSlug === service.slug) ? (
                    <div className="mt-5 flex flex-wrap gap-x-5 gap-y-2">
                      {manufacturingProcesses.filter((process) => process.serviceSlug === service.slug).map((process) => (
                        <Link key={process.slug} href={`/processos/${process.slug}`} className="link-underline text-sm text-gold-lum">
                          {process.title} ↗
                        </Link>
                      ))}
                    </div>
                  ) : null}
                </div>
              </article>
            </Reveal>
          ))}
        </div>
      </Container>
    </Section>
  );
}
