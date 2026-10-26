import { PageIntro } from "@/components/layout/PageIntro";
import { Button } from "@/components/ui/Button";
import { StudioSection } from "@/components/sections/StudioSection";
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
        eyebrow="Nossa história"
        title="Criatividade que vira produto."
        description="Design, inteligência artificial e tecnologias de fabricação para criar produtos com identidade, inovação e personalidade."
      />

      <StudioSection showCta={false} />

      <section className="pb-(--spacing-section)">
        <div className="shell flex flex-wrap gap-3">
          <Button href="/produtos">Explorar produtos</Button>
          <Button href="/projetos" variant="outline">Ver projetos</Button>
          <Button href="/orcamento" variant="outline">Conversar sobre uma ideia</Button>
        </div>
      </section>
    </>
  );
}
