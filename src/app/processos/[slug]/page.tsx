import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { PageIntro } from "@/components/layout/PageIntro";
import { Container } from "@/components/ui/Container";
import { Button } from "@/components/ui/Button";
import { CartonagemStory } from "@/components/sections/CartonagemStory";
import { manufacturingProcesses } from "@/content/manufacturing-processes";
import { site } from "@/config/site";
import { breadcrumbJsonLd, pageMetadata } from "@/lib/seo";

type PageProps = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  return manufacturingProcesses.map((process) => ({ slug: process.slug }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const process = manufacturingProcesses.find((item) => item.slug === slug);
  if (!process) return { title: "Processo não encontrado", robots: { index: false, follow: false } };
  return pageMetadata({ title: process.title, description: process.summary, path: `/processos/${slug}` });
}

export default async function ProcessoPage({ params }: PageProps) {
  const { slug } = await params;
  const process = manufacturingProcesses.find((item) => item.slug === slug);
  if (!process) notFound();

  const serviceJsonLd = {
    "@context": "https://schema.org",
    "@type": "Service",
    name: process.title,
    description: process.description,
    serviceType: process.tags[0],
    keywords: process.tags.join(", "),
    url: `${site.url}/processos/${process.slug}`,
    provider: { "@type": "Organization", name: site.name, url: site.url },
    areaServed: [{ "@type": "AdministrativeArea", name: "Minas Gerais" }, { "@type": "Country", name: "Brasil" }],
  };

  return <>
    <PageIntro eyebrow="Processos · Inspire 3D" title={process.title} description={process.summary}>
      <Button href="/orcamento">Solicitar orçamento</Button>
      <Button href="/processos" variant="outline">Ver todos os processos</Button>
    </PageIntro>
    <section className="pb-(--spacing-section)"><Container>
      {process.slug === "cartonagem-caixas-premium" ? <CartonagemStory /> : <div className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr]">
        <div className="panel p-6 md:p-8">
          <h2 className="font-display text-2xl font-semibold text-chalk">Como funciona</h2>
          <p className="mt-4 text-base leading-relaxed text-silver">{process.description}</p>
          <ol className="mt-8 space-y-6 border-t border-line pt-7">
            {process.steps.map((step, index) => <li key={step.title} className="flex gap-4">
              <span className="font-mono text-sm text-gold">{String(index + 1).padStart(2, "0")}</span>
              <div><h3 className="font-display text-lg text-chalk">{step.title}</h3><p className="mt-2 text-sm leading-relaxed text-ash">{step.description}</p></div>
            </li>)}
          </ol>
        </div>
        <div className="space-y-5">
          <div className="card p-6 md:p-8"><h2 className="font-display text-xl text-chalk">Aplicações</h2>
            <ul className="mt-5 space-y-3 text-sm leading-relaxed text-silver">
              {process.applications.map((application) => <li key={application} className="flex gap-3"><span aria-hidden className="text-gold">◆</span>{application}</li>)}
            </ul>
          </div>
          <div className="card p-6 md:p-8"><h2 className="font-display text-xl text-chalk">Temas relacionados</h2>
            <ul className="mt-5 flex flex-wrap gap-2" aria-label="Temas deste processo">
              {process.tags.map((tag) => <li key={tag} className="chip">{tag}</li>)}
            </ul>
          </div>
          <Link href={`/servicos#${process.serviceSlug}`} className="link-underline inline-flex text-sm text-gold-lum">Ver o serviço relacionado ↗</Link>
        </div>
      </div>}
      <div className="mt-10 border-t border-line pt-6"><Link href="/processos" className="link-underline text-sm text-silver">← Todos os processos</Link></div>
    </Container></section>
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(serviceJsonLd) }} />
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd([
      { name: "Processos", path: "/processos" }, { name: process.title, path: `/processos/${process.slug}` },
    ])) }} />
  </>;
}
