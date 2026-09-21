import Link from "next/link";
import { PageIntro } from "@/components/layout/PageIntro";
import { Container } from "@/components/ui/Container";
import { ProjectArt } from "@/components/visuals/ProjectArt";
import { projects } from "@/content/projects";
import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata({
  title: "Projetos",
  description:
    "Seleção de projetos fabricados pela Inspire 3D — colecionáveis, board games, decoração, protótipos e projetos especiais.",
  path: "/projetos",
});

export default function ProjetosPage() {
  return (
    <>
      <PageIntro
        eyebrow="Portfólio"
        title="Projetos que passaram pela bancada."
        description="Cada peça aqui percorreu o mesmo caminho: ideia, modelagem, fabricação e acabamento. As imagens definitivas entram na próxima fase do site."
      />

      <section className="pb-(--spacing-section)">
        <Container>
          <ul className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {projects.map((project, i) => (
              <li key={project.slug}>
                <Link href={`/projetos/${project.slug}`} className="card card--hover block h-full">
                  <span aria-hidden className="card__glow" />
                  <div className="relative aspect-4/3 border-b border-line">
                    <ProjectArt index={i} />
                    <span className="chip chip--gold absolute left-4 top-4">{project.category}</span>
                  </div>
                  <div className="p-6">
                    <h2 className="font-display text-lg font-semibold text-chalk">{project.title}</h2>
                    <p className="mt-2.5 text-sm leading-relaxed text-ash">{project.summary}</p>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        </Container>
      </section>
    </>
  );
}
