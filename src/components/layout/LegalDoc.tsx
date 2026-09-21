import { Container } from "@/components/ui/Container";

export type LegalSection = { heading: string; body: string[] };

/**
 * Diagramação dos documentos jurídicos. Texto-base, não parecer jurídico:
 * revise com advogado antes de publicar e preencha razão social e CNPJ
 * em src/config/site.ts.
 */
export function LegalDoc({
  updatedAt,
  intro,
  sections,
}: {
  updatedAt: string;
  intro: string;
  sections: LegalSection[];
}) {
  return (
    <section className="pb-(--spacing-section)">
      <Container>
        <div className="max-w-3xl">
          <p className="font-mono text-[0.6875rem] uppercase tracking-[0.2em] text-gold">
            Atualizado em {updatedAt}
          </p>
          <p className="mt-6 text-lead text-silver">{intro}</p>

          <div className="mt-14 space-y-12">
            {sections.map((section, i) => (
              <section key={section.heading}>
                <h2 className="flex gap-4 font-display text-xl font-semibold text-chalk">
                  <span className="index-num flex-none pt-1.5">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  {section.heading}
                </h2>
                <div className="mt-4 space-y-4 pl-0 sm:pl-11">
                  {section.body.map((paragraph) => (
                    <p key={paragraph} className="text-[0.975rem] leading-relaxed text-ash">
                      {paragraph}
                    </p>
                  ))}
                </div>
              </section>
            ))}
          </div>
        </div>
      </Container>
    </section>
  );
}
