import { PageIntro } from "@/components/layout/PageIntro";
import { Container } from "@/components/ui/Container";
import { Button } from "@/components/ui/Button";
import { site, whatsappLink } from "@/config/site";
import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata({
  title: "Contato",
  description: "Fale com o estúdio Inspire 3D por WhatsApp, e-mail ou redes sociais.",
  path: "/contato",
});

const channels = [
  {
    label: "WhatsApp",
    value: `${site.contact.whatsappLabel} — resposta mais rápida, ideal para tirar dúvidas e enviar referências.`,
    href: whatsappLink(),
    external: true,
  },
  {
    label: "E-mail",
    value: site.contact.email,
    href: `mailto:${site.contact.email}`,
    external: true,
  },
  {
    label: "Instagram",
    value: "Bastidores do estúdio e peças recém-saídas da bancada.",
    href: site.social.instagram,
    external: true,
  },
];

export default function ContatoPage() {
  return (
    <>
      <PageIntro
        eyebrow="Contato"
        title="Fale com o estúdio."
        description="Traga a ideia do jeito que ela existe hoje. A primeira conversa costuma resolver metade do projeto."
      />

      <section className="pb-(--spacing-section)">
        <Container>
          <div className="grid gap-4 md:grid-cols-3">
            {channels.map((channel) => (
              <a
                key={channel.label}
                href={channel.href}
                target={channel.external ? "_blank" : undefined}
                rel={channel.external ? "noopener noreferrer" : undefined}
                className="card card--hover flex flex-col p-7"
              >
                <span aria-hidden className="card__glow" />
                <h2 className="font-display text-lg font-semibold text-chalk">{channel.label}</h2>
                <p className="mt-3 text-[0.925rem] leading-relaxed text-ash">{channel.value}</p>
                <span className="mt-auto pt-8 font-mono text-[0.625rem] uppercase tracking-[0.18em] text-gold">
                  Abrir →
                </span>
              </a>
            ))}
          </div>

          <div className="panel mt-6 flex flex-col items-start gap-6 p-8 md:flex-row md:items-center md:justify-between md:p-10">
            <div className="relative">
              <h2 className="text-title text-chalk">Já sabe o que quer fabricar?</h2>
              <p className="mt-3 max-w-md text-[0.95rem] text-ash">
                Vá direto para o orçamento e ganhe uma etapa.
              </p>
            </div>
            <Button href="/orcamento" size="lg" className="relative">
              Pedir orçamento
            </Button>
          </div>
        </Container>
      </section>
    </>
  );
}
