import { Container } from "@/components/ui/Container";
import { Button } from "@/components/ui/Button";

/**
 * Bloco de "próxima fase" usado nas rotas já reservadas na arquitetura,
 * mas ainda não construídas (produtos, e-commerce, agente de IA).
 */
type Cta = { label: string; href: string };

export function ComingSoon({
  title,
  description,
  roadmap,
  primaryCta = { label: "Pedir orçamento", href: "/orcamento" },
  secondaryCta = { label: "Voltar para a Home", href: "/" },
}: {
  title: string;
  description: string;
  roadmap: string[];
  /** Sobrescreva nas rotas em que o padrão apontaria para a própria página. */
  primaryCta?: Cta;
  secondaryCta?: Cta;
}) {
  return (
    <section className="pb-(--spacing-section)">
      <Container>
        <div className="panel p-8 md:p-12">
          <div aria-hidden className="grid-backdrop grid-backdrop--fine" />
          <div className="relative grid gap-10 lg:grid-cols-[1fr_1fr] lg:items-center">
            <div>
              <h2 className="text-title text-chalk">{title}</h2>
              <p className="mt-5 max-w-md text-[0.975rem] leading-relaxed text-ash">
                {description}
              </p>
              <div className="mt-8 flex flex-wrap gap-3">
                <Button href={primaryCta.href}>{primaryCta.label}</Button>
                <Button href={secondaryCta.href} variant="outline">
                  {secondaryCta.label}
                </Button>
              </div>
            </div>

            <ol className="space-y-4">
              {roadmap.map((item, i) => (
                <li key={item} className="flex gap-4 border-l border-line pl-5">
                  <span className="index-num flex-none">{String(i + 1).padStart(2, "0")}</span>
                  <span className="text-[0.925rem] leading-relaxed text-silver">{item}</span>
                </li>
              ))}
            </ol>
          </div>
        </div>
      </Container>
    </section>
  );
}
