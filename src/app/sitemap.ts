import type { MetadataRoute } from "next";
import { site } from "@/config/site";
import { projects } from "@/content/projects";
import { getCatalogProducts } from "@/lib/catalog";
import { manufacturingProcesses } from "@/content/manufacturing-processes";

export const dynamic = "force-dynamic";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const products = await getCatalogProducts();
  const now = new Date();
  const routes = [
    "",
    "/servicos",
    "/processos",
    "/ideias",
    "/produtos",
    "/projetos",
    "/orcamento",
    "/contato",
    "/sobre",
    "/politica-de-privacidade",
    "/termos",
  ];

  return [
    ...routes.map((route) => ({
      url: `${site.url}${route}`,
      lastModified: now,
      changeFrequency: "monthly" as const,
      priority: route === "" ? 1 : route.startsWith("/termos") || route.startsWith("/politica") ? 0.2 : 0.7,
    })),
    ...projects.map((project) => ({
      url: `${site.url}/projetos/${project.slug}`,
      lastModified: now,
      changeFrequency: "monthly" as const,
      priority: 0.5,
    })),
    ...manufacturingProcesses.map((process) => ({
      url: `${site.url}/processos/${process.slug}`,
      lastModified: now,
      changeFrequency: "monthly" as const,
      priority: 0.7,
    })),
    ...products.map((product) => ({
      url: `${site.url}/produtos/${product.slug}`,
      lastModified: now,
      changeFrequency: "monthly" as const,
      priority: product.featured ? 0.8 : 0.6,
    })),
  ];
}
