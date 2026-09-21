import { PageIntro } from "@/components/layout/PageIntro";
import { Container } from "@/components/ui/Container";
import { QuoteEntry } from "@/features/quote/QuoteEntry";
import { pageMetadata, breadcrumbJsonLd } from "@/lib/seo";
import { whatsappLink } from "@/config/site";

export const metadata = pageMetadata({
  title: "Orçamento inteligente",
  description:
    "Descreva sua peça em três passos e receba na hora a tecnologia recomendada, a complexidade e o prazo estimado. Com arquivo 3D ou só com a ideia.",
  path: "/orcamento",
});

const guarantees = [
  {
    title: "Não precisa ter arquivo 3D",
    desc: "Uma foto, um rascunho ou a ideia escrita já bastam para começar.",
  },
  {
    title: "Seus arquivos são seus",
    desc: "Usados apenas para orçar e produzir. Nada vai para portfólio sem o seu ok.",
  },
  {
    title: "Sem cadastro",
    desc: "Três passos, só os dados necessários para responder. Leva uns 2 minutos.",
  },
];

export default function OrcamentoPage() {
  return (
    <>
      <PageIntro
        eyebrow="Orçamento inteligente"
        title="Conte o que você quer criar."
        description="Em vez de um formulário no escuro, você entende o que muda o preço enquanto responde — e sai com tecnologia recomendada, complexidade e prazo na tela."
      />

      <section className="pb-(--spacing-section)">
        <Container>
          <div className="grid gap-12 lg:grid-cols-[1fr_320px] lg:gap-16">
            <div className="min-w-0">
              {/* A chave só existe no servidor: a página decide se a conversa
                  aparece, e o componente de chat nunca vê variável de ambiente. */}
              <QuoteEntry aiEnabled={Boolean(process.env.ANTHROPIC_API_KEY)} />
            </div>

            <aside className="lg:pt-14">
              <ul className="space-y-7">
                {guarantees.map((item) => (
                  <li key={item.title} className="border-l border-line pl-5">
                    <p className="font-display text-[0.975rem] font-semibold text-chalk">
                      {item.title}
                    </p>
                    <p className="mt-1.5 text-[0.875rem] leading-relaxed text-ash">{item.desc}</p>
                  </li>
                ))}
              </ul>

              <div className="mt-10 rounded-2xl border border-line bg-carbon/70 p-6">
                <p className="font-mono text-[0.625rem] uppercase tracking-[0.18em] text-gold">
                  Prefere conversar?
                </p>
                <p className="mt-3 text-[0.9rem] leading-relaxed text-silver">
                  Projeto complicado de explicar por formulário resolve melhor no papo.
                </p>
                <a
                  href={whatsappLink(
                    "Olá! Conheci a Inspire 3D pelo site e gostaria de conversar sobre um projeto.",
                  )}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="link-underline mt-4 inline-flex text-sm text-chalk"
                >
                  Chamar no WhatsApp
                </a>
              </div>
            </aside>
          </div>
        </Container>
      </section>

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(
            breadcrumbJsonLd([{ name: "Orçamento", path: "/orcamento" }]),
          ),
        }}
      />
    </>
  );
}
