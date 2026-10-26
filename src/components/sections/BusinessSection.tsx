import { Section } from "@/components/ui/Section";
import { Container } from "@/components/ui/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Button } from "@/components/ui/Button";
import { Reveal } from "@/components/ui/Reveal";
import { businessOffers } from "@/content/business";
import { whatsappLink } from "@/config/site";

/**
 * Soluções para empresas (briefing §16).
 *
 * Linha comercial B2B para presentes, produtos de marca e projetos sob demanda.
 */
export function BusinessSection() {
  return (
    <Section id="empresas" className="scroll-mt-24">
      <Container>
        <div className="grid gap-12 lg:grid-cols-[minmax(0,26rem)_1fr] lg:gap-16">
          <div className="lg:sticky lg:top-28 lg:self-start">
            <SectionHeading
              eyebrow="Inspire para empresas"
              title={
                <>
                  Sua marca merece algo <span className="gold-text">extraordinário.</span>
                </>
              }
              description="Presentes, kits e produtos personalizados que levam a identidade da sua empresa para além da tela."
            />

            <div className="mt-9 flex flex-wrap gap-3">
              <Button href="/orcamento?categoria=corporativo">Solicitar proposta empresarial</Button>
              <Button
                href={whatsappLink(
                  "Olá! Sou de uma empresa e gostaria de conversar sobre um projeto com a Inspire 3D.",
                )}
                variant="outline"
              >
                Chamar no WhatsApp
              </Button>
            </div>

            <p className="mt-7 max-w-md text-[0.875rem] leading-relaxed text-ash">
              Conte o objetivo, a quantidade aproximada e a ocasião. O fluxo de orçamento ajuda a
              organizar os próximos passos do projeto.
            </p>
          </div>

          <ul className="grid gap-4 sm:grid-cols-2">
            {businessOffers.map((offer, i) => (
              <Reveal as="li" key={offer.title} delay={i * 50}>
                <div className="card h-full p-6">
                  <span aria-hidden className="card__glow" />
                  <h3 className="relative font-display text-[1rem] font-semibold text-chalk">
                    {offer.title}
                  </h3>
                  <p className="relative mt-2.5 text-[0.875rem] leading-relaxed text-ash">
                    {offer.description}
                  </p>
                </div>
              </Reveal>
            ))}
          </ul>
        </div>
      </Container>
    </Section>
  );
}
