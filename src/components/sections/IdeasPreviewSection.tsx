import { Section } from "@/components/ui/Section";
import { Container } from "@/components/ui/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Button } from "@/components/ui/Button";
import { IdeaCard } from "@/components/ideas/IdeaCard";
import { ideas } from "@/content/ideas";

const previewSlugs = ["caixas-premium", "trofeus-e-medalhas", "arquivo-natal-feliz", "trama-3d"];
const preview = previewSlugs.map((slug) => ideas.find((idea) => idea.slug === slug)!);

export function IdeasPreviewSection() {
  return (
    <Section id="ideias" tone="graphite" className="scroll-mt-24 border-y border-line">
      <Container>
        <SectionHeading
          eyebrow="Ideias em criação"
          title={<>Um primeiro olhar para o que <span className="gold-text">podemos criar juntos.</span></>}
          description="Caixas, peças impressas em 3D e arquivos de corte: esta vitrine reúne direções visuais para novas criações da Inspire 3D."
          action={<Button href="/ideias" variant="outline">Explorar todas as ideias</Button>}
        />
        <div className="mt-10 grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
          {preview.map((idea, index) => <IdeaCard key={idea.slug} idea={idea} priority={index === 0} />)}
        </div>
        <p className="mt-5 text-xs leading-relaxed text-ash">
          Artes conceituais enviadas como referência. Produtos, formatos, materiais, preços e disponibilidade dependem de desenvolvimento e confirmação.
        </p>
      </Container>
    </Section>
  );
}
