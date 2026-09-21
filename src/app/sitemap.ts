import type { MetadataRoute } from "next";
import { site } from "@/config/site";
import { projects } from "@/content/projects";

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  const routes = [
    "",
    "/servicos",
    "/projetos",
    "/produtos",
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
  ];
}
