import { Container } from "@/components/ui/Container";
import { Button } from "@/components/ui/Button";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { site, whatsappLink } from "@/config/site";

export function CtaSection() {
  return (
    <section className="relative overflow-hidden py-(--spacing-section)">
      <div aria-hidden className="absolute inset-0 -z-10">
        <div className="absolute inset-0 bg-[radial-gradient(90%_120%_at_50%_120%,#1A1D23_0%,#08090B_60%)]" />
        <div className="grid-backdrop" />
        <div className="halo left-1/2 top-full size-[620px] -translate-x-1/2 -translate-y-1/2" />
        <div className="noise" />
      </div>

      <Container className="relative text-center">
        <div className="mx-auto flex flex-col items-center">
          <Eyebrow>Próximo passo</Eyebrow>

          <h2 className="mt-7 max-w-4xl text-hero font-semibold text-chalk">
            Sua ideia pode virar
            <br />
            um produto que <span className="gold-text">inspira.</span>
          </h2>

          <p className="mt-7 max-w-xl text-lead text-ash">
            Conte o que imagina. Descubra coleções, produtos e personalizações possíveis com a
            Inspire 3D.
          </p>

          <div className="mt-11 flex flex-col gap-3 sm:flex-row">
            <Button href="/orcamento" size="lg">
              Explorar personalizações
            </Button>
            <Button href={whatsappLink()} variant="outline" size="lg" external>
              Chamar no WhatsApp
            </Button>
          </div>

          <a
            href={`mailto:${site.contact.email}`}
            className="link-underline mt-10 font-mono text-[0.6875rem] uppercase tracking-[0.2em] text-ash transition-colors hover:text-gold-lum"
          >
            {site.contact.email}
          </a>
        </div>
      </Container>
    </section>
  );
}
