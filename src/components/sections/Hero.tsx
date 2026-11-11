import Image from "next/image";
import { Button } from "@/components/ui/Button";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { collections } from "@/content/collections";
import { ideas } from "@/content/ideas";

const heroSlugs = ["caixas-premium", "trofeus-e-medalhas", "trama-3d", "festa-personalizada"];
const heroIdeas = heroSlugs.map((slug) => ideas.find((idea) => idea.slug === slug)!);

export function Hero() {
  const aiEnabled = Boolean(process.env.ANTHROPIC_API_KEY);

  return (
    <section id="inicio" className="relative isolate scroll-mt-20 overflow-hidden pt-[68px] md:pt-[76px]">
      {/* fundo */}
      <div aria-hidden className="absolute inset-0 -z-10">
        <div className="absolute inset-0 bg-[radial-gradient(120%_85%_at_78%_18%,#15181E_0%,#08090B_58%)]" />
        <div className="grid-backdrop" />
        <div className="halo -right-24 top-4 size-[560px] md:right-4" />
        <div className="halo -left-40 bottom-0 size-[420px] opacity-60" />
        <div className="noise" />
        <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-b from-transparent to-void" />
      </div>

      <div className="shell grid items-center gap-10 pb-16 pt-12 md:pb-24 md:pt-16 lg:min-h-[calc(100svh-76px)] lg:grid-cols-[1.08fr_0.92fr] lg:gap-8 lg:pb-16 lg:pt-6">
        {/* ── Coluna de conteúdo ── */}
        <div className="relative z-10 max-w-2xl">
          <Eyebrow>Design · criatividade · tecnologia</Eyebrow>

          <h1 className="mt-6 text-hero font-semibold text-chalk">
            Criatividade
            <br />
            que ganha <span className="gold-text">forma.</span>
          </h1>

          <p className="mt-7 max-w-xl text-lead text-ash">
            Produtos criativos, presentes personalizados e caixas premium. Conheça as ideias que estão
            ganhando forma e descubra como cada detalhe pode contar uma história.
          </p>

          <div className="mt-10 flex flex-col gap-3 sm:flex-row sm:items-center">
            <Button href="/ideias" size="lg">
              Explorar ideias
              <svg viewBox="0 0 16 16" className="size-4" fill="none" aria-hidden>
                <path
                  d="M2 8h11M9 4l4 4-4 4"
                  stroke="currentColor"
                  strokeWidth="1.6"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </Button>
            <Button
              href={aiEnabled ? "/orcamento?assistente=ia#quote" : "/#inspire-ai"}
              variant="outline"
              size="lg"
            >
              {aiEnabled ? "Crie com a Inspire AI" : "Conheça a Inspire AI"}
            </Button>
          </div>

          {/* Quatro linhas de produtos — sem métricas ou promessas de estoque. */}
          <dl className="mt-12 grid grid-cols-2 gap-x-5 gap-y-6 border-t border-line pt-8 sm:grid-cols-4">
            {collections.map((collection) => (
              <div key={collection.slug}>
                <dt className="font-display text-sm font-semibold text-chalk md:text-base">
                  {collection.name.replace("Inspire ", "")}
                </dt>
                <dd className="mt-1 font-mono text-[0.625rem] uppercase tracking-[0.14em] text-ash">
                  {collection.subtitle}
                </dd>
              </div>
            ))}
          </dl>
        </div>

        {/* ── Artes conceituais enviadas pela marca ── */}
        <div className="relative mx-auto w-full max-w-[560px] lg:mx-0 lg:max-w-none">
          <div aria-hidden className="halo left-1/2 top-1/2 size-[480px] -translate-x-1/2 -translate-y-1/2 opacity-80" />
          <div className="relative grid grid-cols-2 gap-3 sm:gap-4">
            {heroIdeas.map((idea, index) => (
              <article
                key={idea.slug}
                className="group relative aspect-[1.08] overflow-hidden rounded-2xl border border-line bg-[radial-gradient(ellipse_at_50%_55%,#29251C_0%,#17191D_62%,#111317_100%)] p-2 shadow-[0_22px_60px_rgba(0,0,0,0.22)] sm:rounded-3xl sm:p-3"
              >
                <div className="relative size-full overflow-hidden rounded-xl sm:rounded-2xl">
                  <Image src={idea.image} alt={idea.alt} fill priority={index === 0} sizes="(max-width: 1024px) 45vw, 22vw" className="object-cover transition-transform duration-700 group-hover:scale-[1.04]" />
                </div>
                <span className="absolute bottom-3 left-3 rounded-full border border-line bg-void/75 px-2.5 py-1 font-mono text-[0.5625rem] uppercase tracking-[0.12em] text-silver backdrop-blur sm:bottom-4 sm:left-4 sm:px-3 sm:text-[0.625rem]">
                  {idea.title}
                </span>
                <span className="absolute right-4 top-4 font-mono text-[0.5625rem] text-silver/45">
                  0{index + 1}
                </span>
              </article>
            ))}
          </div>
          <p className="relative mt-4 text-center font-mono text-[0.5625rem] uppercase tracking-[0.15em] text-ash/70">
            Conceitos visuais · não são fotos de produtos finais
          </p>
        </div>
      </div>
    </section>
  );
}
