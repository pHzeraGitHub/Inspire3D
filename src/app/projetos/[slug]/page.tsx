import { notFound } from "next/navigation";
import { PageIntro } from "@/components/layout/PageIntro";
import { Container } from "@/components/ui/Container";
import { Button } from "@/components/ui/Button";
import { Chip } from "@/components/ui/Chip";
import { ProjectArt } from "@/components/visuals/ProjectArt";
import { projects } from "@/content/projects";
import { pageMetadata } from "@/lib/seo";

export function generateStaticParams() {
  return projects.map((project) => ({ slug: project.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const project = projects.find((p) => p.slug === slug);
  if (!project) return pageMetadata({ title: "Projeto", description: "Projeto Inspire 3D." });
  return pageMetadata({
    title: project.title,
    description: project.summary,
    path: `/projetos/${project.slug}`,
  });
}

export default async function ProjetoPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const index = projects.findIndex((p) => p.slug === slug);
  const project = projects[index];
  if (!project) notFound();

  return (
    <>
      <PageIntro eyebrow={project.category} title={project.title} description={project.summary}>
        <div className="flex flex-wrap gap-2">
          {project.tags.map((tag) => (
            <Chip key={tag}>{tag}</Chip>
          ))}
        </div>
      </PageIntro>

      <section className="pb-(--spacing-section)">
        <Container>
          <div className="card overflow-hidden">
            <div className="aspect-16/9">
              <ProjectArt index={index} />
            </div>
          </div>

          <div className="mt-12 grid gap-10 lg:grid-cols-[1fr_1fr]">
            <p className="text-lead text-ash">
              Este é um estudo de aplicação para demonstrar a capacidade do estúdio. A ficha de um case real — com etapas, materiais, tempo de impressão e fotos da peça finalizada — entra aqui assim que o portfólio fotográfico estiver pronto.
            </p>
            <div className="lg:justify-self-end">
              <Button href="/orcamento">Quero algo parecido</Button>
            </div>
          </div>
        </Container>
      </section>
    </>
  );
}
