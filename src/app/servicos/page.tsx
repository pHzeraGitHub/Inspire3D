import { PageIntro } from "@/components/layout/PageIntro";
import { ServicesSection } from "@/components/sections/ServicesSection";
import { StepsSection } from "@/components/sections/StepsSection";
import { BusinessSection } from "@/components/sections/BusinessSection";
import { TechnologiesSection } from "@/components/sections/TechnologiesSection";
import { CtaSection } from "@/components/sections/CtaSection";
import { Button } from "@/components/ui/Button";
import { services } from "@/content/services";
import { site } from "@/config/site";
import { breadcrumbJsonLd, pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata({
  title: "Serviços",
  description:
    "Impressão 3D FDM e resina, modelagem digital, acabamento, prototipagem, desenvolvimento de produto, cartonagem e caixas premium em Minas Gerais e para todo o Brasil.",
  path: "/servicos",
});

/** Serviços oferecidos, em Schema.org — alimenta a busca por termo de serviço. */
function servicesJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: `Serviços — ${site.name}`,
    itemListElement: services.map((service, i) => ({
      "@type": "ListItem",
      position: i + 1,
      item: {
        "@type": "Service",
        name: service.title,
        description: service.lead,
        url: `${site.url}/servicos#${service.slug}`,
        provider: { "@type": "Organization", name: site.name, url: site.url },
        areaServed: [
          { "@type": "AdministrativeArea", name: "Minas Gerais" },
          { "@type": "Country", name: "Brasil" },
        ],
      },
    })),
  };
}

export default function ServicosPage() {
  return (
    <>
      <PageIntro
        eyebrow="Serviços"
        title={
          <>
            Da imaginação <span className="gold-text">à fabricação</span>.
          </>
        }
        description="Modelagem, impressão 3D, acabamento, desenvolvimento de produto, cartonagem e caixas premium. Projetos sob medida para transformar ideias em produtos e experiências de marca."
      >
        <div className="flex flex-wrap gap-3">
          <Button href="/orcamento">Pedir orçamento</Button>
          <Button href="/projetos" variant="outline">
            Ver projetos
          </Button>
        </div>
      </PageIntro>

      <ServicesSection />
      <StepsSection />
      <TechnologiesSection />
      <BusinessSection />
      <CtaSection />

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(servicesJsonLd()) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(breadcrumbJsonLd([{ name: "Serviços", path: "/servicos" }])),
        }}
      />
    </>
  );
}
