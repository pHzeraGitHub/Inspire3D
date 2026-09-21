import { Section } from "@/components/ui/Section";
import { Container } from "@/components/ui/Container";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { Accordion } from "@/components/ui/Accordion";
import { Button } from "@/components/ui/Button";
import { faq } from "@/content/faq";

export function FaqSection() {
  return (
    <Section tone="graphite" className="border-t border-line">
      <Container className="relative grid gap-12 lg:grid-cols-[0.8fr_1.4fr] lg:gap-16">
        <div className="lg:sticky lg:top-28 lg:self-start">
          <Eyebrow>Dúvidas frequentes</Eyebrow>
          <h2 className="mt-6 text-title text-chalk">
            O que quase todo mundo <span className="gold-text">pergunta antes</span>.
          </h2>
          <p className="mt-5 max-w-sm text-[0.95rem] leading-relaxed text-ash">
            Se a sua pergunta não estiver aqui, ela provavelmente é específica do seu projeto — e
            essa é a melhor conversa para se ter.
          </p>
          <Button href="/contato" variant="outline" size="sm" className="mt-8">
            Perguntar direto
          </Button>
        </div>

        <Accordion items={faq} />
      </Container>
    </Section>
  );
}
