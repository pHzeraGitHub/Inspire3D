"use client";

import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import { Footer } from "@/components/layout/Footer";
import { Header } from "@/components/layout/Header";
import { WhatsAppButton } from "@/components/layout/WhatsAppButton";

export function SiteChrome({ children }: { children: ReactNode }) {
  const isAdmin = usePathname().startsWith("/admin");
  if (isAdmin) return <div id="conteudo">{children}</div>;
  return (
    <>
      <Header />
      <main id="conteudo">{children}</main>
      <Footer />
      <WhatsAppButton />
    </>
  );
}
