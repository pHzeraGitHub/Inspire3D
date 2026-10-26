"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Logo } from "@/components/visuals/Logo";
import { Button } from "@/components/ui/Button";
import { primaryNav } from "@/config/nav";
import { cn } from "@/lib/utils";

export function Header() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  // Esc fecha o menu mobile (a11y: toda gaveta precisa de saída pelo teclado).
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  return (
    <header
      className={cn(
        "fixed inset-x-0 top-0 z-50 transition-all duration-500",
        scrolled || open
          ? "border-b border-line bg-void/85 backdrop-blur-xl"
          : "border-b border-transparent",
      )}
    >
      <div className="shell flex h-[68px] items-center justify-between gap-6 md:h-[76px]">
        <Link href="/" aria-label="Inspire 3D — página inicial" onClick={() => setOpen(false)}>
          <Logo />
        </Link>

        <nav aria-label="Principal" className="hidden items-center gap-5 xl:flex 2xl:gap-7">
          {primaryNav.map((item) => (
            <Link
              key={item.label}
              href={item.href}
              className="link-underline text-[0.9rem] text-silver transition-colors duration-300 hover:text-chalk"
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="hidden items-center gap-3 xl:flex">
          <Button href="/orcamento" size="sm">
            Solicitar orçamento
          </Button>
        </div>

        <button
          type="button"
          aria-label={open ? "Fechar menu" : "Abrir menu"}
          aria-expanded={open}
          onClick={() => setOpen((v) => !v)}
          className="relative grid size-10 place-items-center rounded-full border border-line text-chalk xl:hidden"
        >
          <span
            className={cn(
              "absolute h-px w-4 bg-current transition-all duration-300",
              open ? "rotate-45" : "-translate-y-1",
            )}
          />
          <span
            className={cn(
              "absolute h-px w-4 bg-current transition-all duration-300",
              open ? "-rotate-45" : "translate-y-1",
            )}
          />
        </button>
      </div>

      {/* Menu mobile — `inert` impede que os links fiquem focáveis quando fechado */}
      <div
        inert={!open}
        className={cn(
          "grid overflow-hidden border-t border-line bg-void/95 backdrop-blur-xl transition-[grid-template-rows] duration-500 xl:hidden",
          open ? "grid-rows-[1fr]" : "grid-rows-[0fr] border-transparent",
        )}
      >
        <div className="min-h-0">
            <nav aria-label="Menu mobile" className="shell flex flex-col gap-1 py-6">
            {primaryNav.map((item, i) => (
              <Link
                key={item.label}
                href={item.href}
                onClick={() => setOpen(false)}
                className="flex items-baseline gap-4 border-b border-line py-4 font-display text-xl text-chalk"
              >
                <span className="index-num">{String(i + 1).padStart(2, "0")}</span>
                {item.label}
              </Link>
            ))}
            <div className="mt-6 flex flex-col gap-3">
              <Button href="/orcamento" onClick={() => setOpen(false)}>
                Solicitar orçamento
              </Button>
              <Button href="/contato" variant="outline" onClick={() => setOpen(false)}>
                Falar com o estúdio
              </Button>
            </div>
          </nav>
        </div>
      </div>
    </header>
  );
}
