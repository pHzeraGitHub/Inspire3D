import { PageIntro } from "@/components/layout/PageIntro";
import { Container } from "@/components/ui/Container";
import { Button } from "@/components/ui/Button";
import { processStages } from "@/content/process";
import { pageMetadata } from "@/lib/seo";
import { site } from "@/config/site";

export const metadata = pageMetadata({
  title: "Sobre",
  description: site.description,
  path: "/sobre",
});

export default function SobrePage() {
  return (
    <>
      <PageIntro
        eyebrow="O estúdio"
        title="Um laboratório de fabricação criativa."
        description={site.description}
      />

      <section className="pb-(--spacing-section)">
        <Container>
          <div className="grid gap-px overflow-hidden rounded-panel border border-line bg-line md:grid-cols-2 lg:grid-cols-4">
            {processStages.map((stage) => (
              <div key={stage.key} className="bg-void p-7 md:p-8">
                <span className="index-num">{stage.step}</span>
                <h2 className="mt-5 font-display text-xl font-semibold text-chalk">{stage.title}</h2>
                <p className="mt-3 text-[0.9rem] leading-relaxed text-ash">{stage.description}</p>
              </div>
            ))}
          </div>

          <div className="mt-10 flex flex-wrap gap-3">
            <Button href="/orcamento">Pedir orçamento</Button>
            <Button href="/projetos" variant="outline">
              Ver projetos
            </Button>
          </div>
        </Container>
      </section>
    </>
  );
}
