import Link from "next/link";
import { Section } from "@/components/ui/Section";
import { Container } from "@/components/ui/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Button } from "@/components/ui/Button";
import { ProjectArt } from "@/components/visuals/ProjectArt";
import { projects } from "@/content/projects";

export function ProjectsSection() {
  return (
    <Section id="projetos" tone="graphite" className="scroll-mt-24 overflow-hidden border-y border-line">
      <Container>
        <SectionHeading
          eyebrow="Projetos"
          title={
            <>
              Ideias que podem <span className="gold-text">ganhar forma</span>.
            </>
          }
          description="Estudos de aplicação que mostram as frentes que o estúdio está preparado para desenvolver. O portfólio real entra conforme as primeiras peças forem finalizadas."
          action={
            <Button href="/projetos" variant="outline">
              Ver todos os projetos
            </Button>
          }
        />
      </Container>

      {/* trilho horizontal — sangra até a borda da tela */}
      <div className="mt-14 overflow-x-auto pb-4 [scrollbar-width:thin]">
        <ul className="rail-pad flex w-max gap-5">
          {projects.map((project, i) => (
            <li key={project.slug} className="w-[300px] flex-none sm:w-[360px]">
              <Link
                href={`/projetos/${project.slug}`}
                className="card card--hover group block h-full"
              >
                <span aria-hidden className="card__glow" />
                <div className="relative aspect-4/3 overflow-hidden border-b border-line">
                  <ProjectArt index={i} />
                  <span className="absolute left-4 top-4 chip chip--gold">{project.category}</span>
                </div>
                <div className="p-6">
                  <div className="flex items-baseline justify-between gap-4">
                    <h3 className="font-display text-lg font-semibold text-chalk transition-colors duration-300 group-hover:text-gold-lum">
                      {project.title}
                    </h3>
                    <span className="index-num">conceito</span>
                  </div>
                  <p className="mt-2.5 text-sm leading-relaxed text-ash">{project.summary}</p>
                  <ul className="mt-5 flex flex-wrap gap-x-3 gap-y-1.5">
                    {project.tags.map((tag) => (
                      <li
                        key={tag}
                        className="font-mono text-[0.5625rem] uppercase tracking-[0.14em] text-silver/60"
                      >
                        {tag}
                      </li>
                    ))}
                  </ul>
                </div>
              </Link>
            </li>
          ))}

          {/* cartão-convite ao final do trilho */}
          <li className="w-[300px] flex-none sm:w-[360px]">
            <div className="panel flex h-full flex-col items-start justify-end p-7">
              <div aria-hidden className="grid-backdrop grid-backdrop--fine" />
              <p className="relative font-display text-xl font-semibold leading-snug text-chalk">
                O próximo projeto
                <br />
                pode ser o seu.
              </p>
              <p className="relative mt-3 text-sm text-ash">
                Conte a ideia e receba uma estimativa com material, acabamento e prazo.
              </p>
              <Button href="/orcamento" size="sm" className="relative mt-6">
                Começar
              </Button>
            </div>
          </li>
        </ul>
      </div>
    </Section>
  );
}
