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

export default function HomePage() {
  return (
    <>
      <Hero />
      <CollectionsSection />
      <FeaturedProductsSection />
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
