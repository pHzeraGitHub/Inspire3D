import { Hero } from "@/components/sections/Hero";
import { CapabilitiesMarquee } from "@/components/sections/CapabilitiesMarquee";
import { ProcessSection } from "@/components/sections/ProcessSection";
import { VerticalsSection } from "@/components/sections/VerticalsSection";
import { TechnologiesSection } from "@/components/sections/TechnologiesSection";
import { ProjectsSection } from "@/components/sections/ProjectsSection";
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
      <CapabilitiesMarquee />
      <ProcessSection />
      <VerticalsSection />
      <TechnologiesSection />
      <ProjectsSection />
      <QuoteSection />
      <InspireAiSection />
      <StudioSection />
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
