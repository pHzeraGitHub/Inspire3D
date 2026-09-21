import { Section } from "@/components/ui/Section";
import { Container } from "@/components/ui/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Card } from "@/components/ui/Card";
import { Reveal } from "@/components/ui/Reveal";
import { Button } from "@/components/ui/Button";
import { ShelfArt } from "@/components/visuals/ShelfArt";
import { verticals } from "@/content/verticals";
import { pad } from "@/lib/utils";

/** Posições do grid bento (lg). A ordem segue src/content/verticals.ts */
const span = [
  "lg:col-span-7 lg:row-span-2",
  "lg:col-span-5",
  "lg:col-span-5",
  "lg:col-span-4",
  "lg:col-span-4",
  "lg:col-span-4",
];

export function VerticalsSection() {
  return (
    <Section id="fabricamos" tone="graphite" className="scroll-mt-24 border-y border-line">
      <Container className="relative">
        <SectionHeading
          eyebrow="O que fabricamos"
          title={
            <>
              Seis frentes. <span className="silver-text">Um mesmo padrão de acabamento.</span>
            </>
          }
          description="A Inspire 3D não é uma prateleira fechada de produtos — é uma capacidade de fabricação aplicada a categorias diferentes."
          action={
            <Button href="/orcamento" variant="outline">
              Tenho um projeto
            </Button>
          }
        />

        <div className="mt-14 grid gap-4 sm:grid-cols-2 lg:grid-cols-12">
          {verticals.map((vertical, i) => (
            <Reveal
              key={vertical.slug}
              delay={i * 70}
              className={`${span[i] ?? "lg:col-span-4"} flex`}
            >
              <Card className="flex w-full flex-col p-7 md:p-8">
                <div className="flex items-center justify-between gap-4">
                  <span className="index-num">{pad(i + 1)}</span>
                  {vertical.featured ? (
                    <span className="font-mono text-[0.5625rem] uppercase tracking-[0.2em] text-gold">
                      Destaque
                    </span>
                  ) : null}
                </div>

                <h3 className="mt-6 font-display text-xl font-semibold leading-tight text-chalk md:text-2xl">
                  {vertical.title}
                </h3>
                <p className="mt-3 max-w-md text-[0.95rem] leading-relaxed text-ash">
                  {vertical.tagline}
                </p>

                <ul className="mt-7 flex flex-wrap gap-2">
                  {vertical.items.map((item) => (
                    <li
                      key={item}
                      className="rounded-full border border-line bg-white/[0.02] px-3 py-1.5 font-mono text-[0.625rem] uppercase tracking-[0.08em] text-silver/80"
                    >
                      {item}
                    </li>
                  ))}
                </ul>

                {i === 0 ? (
                  <div aria-hidden className="relative mt-8 flex flex-1 flex-col justify-end">
                    <div className="relative min-h-[150px] flex-1 lg:min-h-[190px]">
                      <ShelfArt />
                    </div>
                    <div className="rule--gold rule mt-6" />
                    <div className="mt-6 grid grid-cols-3 gap-3 opacity-70">
                      {["Resina 0,01 mm", "Pintura à mão", "Base inclusa"].map((label) => (
                        <div
                          key={label}
                          className="rounded-lg border border-line bg-void/60 px-3 py-3 text-center font-mono text-[0.5625rem] uppercase leading-tight tracking-[0.1em] text-ash"
                        >
                          {label}
                        </div>
                      ))}
                    </div>
                  </div>
                ) : null}
              </Card>
            </Reveal>
          ))}
        </div>
      </Container>
    </Section>
  );
}
