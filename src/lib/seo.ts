import type { Metadata } from "next";
import { site } from "@/config/site";
import { faq } from "@/content/faq";

/** Metadata padrão de qualquer página interna. */
export function pageMetadata({
  title,
  description,
  path = "/",
}: {
  title: string;
  description: string;
  path?: string;
}): Metadata {
  const url = `${site.url}${path}`;
  return {
    title,
    description,
    alternates: { canonical: url },
    openGraph: {
      title: `${title} — ${site.name}`,
      description,
      url,
      siteName: site.name,
      locale: "pt_BR",
      type: "website",
      images: [{ url: "/og-image.png", width: 1200, height: 630, alt: `${title} — ${site.name}` }],
    },
    twitter: {
      card: "summary_large_image",
      title: `${title} — ${site.name}`,
      description,
      images: ["/og-image.png"],
    },
  };
}

/** Dados estruturados da organização (Schema.org). */
export function organizationJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: site.name,
    url: site.url,
    slogan: site.slogan,
    description: site.description,
    ...(site.contact.email ? { email: site.contact.email } : {}),
    sameAs: Object.values(site.social),
    knowsAbout: [
      "Design de produtos",
      "Produtos personalizados",
      "Presentes criativos",
      "Colecionáveis autorais",
      "Jogos de tabuleiro",
      "Produtos funcionais",
      "Cartonagem e caixas premium",
      "Embalagens para produtos, presentes e kits",
      "Inteligência artificial aplicada à ideação",
      "Fabricação digital",
      "Impressão 3D FDM e resina",
    ],
  };
}

/**
 * LocalBusiness — o que sustenta a busca local ("impressão 3D BH",
 * "impressão 3D Contagem"). Endereço e horário devem ser preenchidos
 * quando o estúdio tiver endereço público de atendimento.
 */
export function localBusinessJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    "@id": `${site.url}/#estudio`,
    name: site.name,
    url: site.url,
    description: site.shortDescription,
    ...(site.contact.email ? { email: site.contact.email } : {}),
    telephone: `+${site.contact.whatsapp}`,
    image: `${site.url}/og-image.png`,
    sameAs: Object.values(site.social),
    areaServed: [
      { "@type": "AdministrativeArea", name: "Minas Gerais" },
      { "@type": "Country", name: "Brasil" },
    ],
    address: {
      "@type": "PostalAddress",
      addressRegion: "MG",
      addressCountry: "BR",
    },
    makesOffer: [
      "Impressão 3D FDM",
      "Impressão 3D em resina",
      "Modelagem 3D sob medida",
      "Miniaturas e colecionáveis personalizados",
      "Componentes para board games",
      "Prototipagem rápida",
      "Pintura e acabamento manual",
      "Cartonagem e caixas premium",
    ].map((name) => ({
      "@type": "Offer",
      itemOffered: { "@type": "Service", name },
    })),
  };
}

/** FAQPage — habilita o rich result de perguntas na busca. */
export function faqJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faq.map((item) => ({
      "@type": "Question",
      name: item.question,
      acceptedAnswer: { "@type": "Answer", text: item.answer },
    })),
  };
}

/** BreadcrumbList para páginas internas. */
export function breadcrumbJsonLd(trail: { name: string; path: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [{ name: "Início", path: "/" }, ...trail].map((item, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: item.name,
      item: `${site.url}${item.path}`,
    })),
  };
}
