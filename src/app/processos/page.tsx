import Link from "next/link";
import { PageIntro } from "@/components/layout/PageIntro";
import { Container } from "@/components/ui/Container";
import { Button } from "@/components/ui/Button";
import { manufacturingProcesses } from "@/content/manufacturing-processes";
import { breadcrumbJsonLd, pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata({
  title: "Processos de criação e fabricação",
  description: "Conheça os processos da Inspire 3D: impressão FDM, impressão em resina, modelagem 3D, pintura e acabamento, cartonagem e caixas premium.",
  path: "/processos",
});

export default function ProcessosPage() {
  return <>
    <PageIntro eyebrow="Como fazemos" title="Processos para dar forma a cada ideia." description="Do arquivo ao acabamento, cada projeto pede escolhas próprias de material, fabricação e apresentação. Conheça as possibilidades antes de pedir um orçamento.">
      <Button href="/orcamento">Conversar sobre um projeto</Button>
    </PageIntro>
    <section className="pb-(--spacing-section)">
      <Container>
        <ul className="grid gap-5 md:grid-cols-2">
          {manufacturingProcesses.map((process, index) => <li key={process.slug}>
            <article className="card h-full p-6 md:p-8">
              <p className="font-mono text-xs uppercase tracking-[0.18em] text-gold">Processo {String(index + 1).padStart(2, "0")}</p>
              <h2 className="mt-3 font-display text-2xl font-semibold text-chalk">{process.title}</h2>
              <p className="mt-4 text-sm leading-relaxed text-ash">{process.summary}</p>
              <ul className="mt-5 flex flex-wrap gap-2" aria-label={`Temas de ${process.title}`}>
                {process.tags.slice(0, 3).map((tag) => <li key={tag} className="chip">{tag}</li>)}
              </ul>
              <Link href={`/processos/${process.slug}`} className="link-underline mt-7 inline-flex text-sm text-gold-lum">Entender o processo ↗</Link>
            </article>
          </li>)}</ul>
      </Container>
    </section>
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd([{ name: "Processos", path: "/processos" }])) }} />
  </>;
}
