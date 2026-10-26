import { Section } from "@/components/ui/Section";
import { Container } from "@/components/ui/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Reveal } from "@/components/ui/Reveal";
import { Button } from "@/components/ui/Button";
import { brandPillars, brandStory } from "@/content/brand";

export function StudioSection({ showCta = true }: { showCta?: boolean }) {
  return (
    <Section id="historia" className="scroll-mt-24">
      <Container className="relative">
        <SectionHeading
          eyebrow="Nossa história"
          title={
            <>
              Mais do que fabricar objetos, queremos <span className="gold-text">criar experiências.</span>
            </>
          }
          description={brandStory[0]}
        />

        <p className="mt-7 max-w-3xl text-[0.975rem] leading-relaxed text-silver md:text-lg">
          {brandStory[1]}
        </p>

        <div className="mt-12 grid gap-4 md:grid-cols-3">
          {brandPillars.map((item, i) => (
            <Reveal key={item.title} delay={i * 80}>
              <article className="card h-full p-6 md:p-7">
                <span className="index-num">0{i + 1}</span>
                <h3 className="mt-5 font-display text-lg font-semibold text-chalk">{item.title}</h3>
                <p className="mt-3 text-[0.9rem] leading-relaxed text-ash">{item.description}</p>
              </article>
            </Reveal>
          ))}
        </div>

        {showCta ? (
          <div className="mt-9">
            <Button href="/sobre" variant="outline">Conheça a Inspire 3D</Button>
          </div>
        ) : null}
      </Container>
    </Section>
  );
}
