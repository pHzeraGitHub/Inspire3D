import { Hero } from "@/components/sections/Hero";
import { CollectionsSection } from "@/components/sections/CollectionsSection";
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
      <CollectionsSection />
      <FeaturedProductsSection product={featuredProduct} />
      <InspireAiSection />
      <ProcessSection />
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
