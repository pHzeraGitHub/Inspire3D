import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  // Evita que `next build` sobrescreva os arquivos usados por `next dev`.
  distDir: process.env.NODE_ENV === "development" ? ".next-dev" : ".next",
  serverExternalPackages: ["@electric-sql/pglite", "exceljs", "jszip"],
  images: {
    // Preparado para CDN de imagens de produto/portfólio (fase 2+).
    formats: ["image/avif", "image/webp"],
    remotePatterns: [],
  },
};

export default nextConfig;
