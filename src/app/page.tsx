import { Hero } from "@/components/sections/Hero";
import { CollectionsSection } from "@/components/sections/CollectionsSection";
import { IdeasPreviewSection } from "@/components/sections/IdeasPreviewSection";
import { CartonagemPreviewSection } from "@/components/sections/CartonagemPreviewSection";
import { FeaturedProductsSection } from "@/components/sections/FeaturedProductsSection";
import { ProcessSection } from "@/components/sections/ProcessSection";
import { ProjectsSection } from "@/components/sections/ProjectsSection";
import { BusinessSection } from "@/components/sections/BusinessSection";
import { QuoteSection } from "@/components/sections/QuoteSection";
import { InspireAiSection } from "@/components/sections/InspireAiSection";
import { StudioSection } from "@/components/sections/StudioSection";
import { FaqSection } from "@/components/sections/FaqSection";
import { CtaSection } from "@/components/sections/CtaSection";
import { faqJsonLd } from "@/lib/seo";
import { getCatalogProducts } from "@/lib/catalog";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const featuredProduct = (await getCatalogProducts()).find((product) => product.featured);

  return (
    <>
      <Hero />
      <IdeasPreviewSection />
      <CollectionsSection />
      <FeaturedProductsSection product={featuredProduct} />
      <InspireAiSection />
      <ProcessSection />
      <CartonagemPreviewSection />
      <BusinessSection />
      <StudioSection />
      <ProjectsSection />
      <QuoteSection />
      <FaqSection />
      <CtaSection />
      {/* FAQPage: habilita o rich result de perguntas na busca. */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd()) }}
      />
    </>
  );
}
