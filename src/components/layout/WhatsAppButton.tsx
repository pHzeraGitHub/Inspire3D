"use client";

import { useEffect, useState } from "react";
import { whatsappLink } from "@/config/site";
import { cn } from "@/lib/utils";

/**
 * Canal de conversão flutuante (briefing §15).
 * Discreto e integrado à identidade: grafite + hairline, dourado só no hover.
 * Nada de bolha verde. Só aparece depois do primeiro scroll, para não
 * competir com o CTA do Hero.
 */
export function WhatsAppButton({ message }: { message?: string }) {
  const [shown, setShown] = useState(false);

  useEffect(() => {
    const onScroll = () => setShown(window.scrollY > 520);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <a
      href={whatsappLink(message)}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Conversar pelo WhatsApp"
      className={cn(
        "group fixed bottom-5 right-5 z-40 inline-flex items-center gap-2.5 rounded-full",
        "border border-line-strong bg-carbon/90 py-3 pl-3.5 pr-4 backdrop-blur-xl",
        "shadow-[0_10px_30px_-12px_rgba(0,0,0,0.8)] transition-all duration-500",
        "hover:border-gold/60 hover:shadow-[0_12px_34px_-12px_rgba(212,164,55,0.45)]",
        "md:bottom-7 md:right-7",
        shown ? "translate-y-0 opacity-100" : "pointer-events-none translate-y-3 opacity-0",
      )}
    >
      <svg viewBox="0 0 24 24" aria-hidden className="size-[18px] fill-gold">
        <path d="M12.04 2c-5.46 0-9.9 4.44-9.9 9.9 0 1.75.46 3.45 1.33 4.95L2 22l5.3-1.38a9.86 9.86 0 0 0 4.74 1.2h.01c5.46 0 9.9-4.44 9.9-9.9 0-2.64-1.03-5.13-2.9-7A9.82 9.82 0 0 0 12.04 2Zm0 18.02h-.01a8.2 8.2 0 0 1-4.18-1.15l-.3-.18-3.1.81.83-3.03-.2-.31a8.19 8.19 0 0 1-1.26-4.37c0-4.54 3.7-8.23 8.23-8.23a8.17 8.17 0 0 1 5.81 2.41 8.15 8.15 0 0 1 2.41 5.83c0 4.54-3.7 8.22-8.23 8.22Zm4.52-6.16c-.25-.13-1.47-.72-1.69-.8-.23-.09-.39-.13-.56.12-.16.25-.64.8-.78.97-.15.16-.29.18-.54.06-.25-.13-1.05-.39-1.99-1.23-.74-.66-1.23-1.47-1.38-1.72-.14-.25-.01-.38.11-.51.11-.11.25-.29.37-.44.13-.15.17-.25.25-.41.09-.17.04-.31-.02-.44-.06-.12-.56-1.35-.77-1.85-.2-.48-.4-.42-.56-.43h-.47c-.17 0-.44.06-.66.31-.23.25-.87.85-.87 2.07s.89 2.4 1.02 2.56c.12.17 1.75 2.67 4.23 3.74.59.26 1.05.41 1.41.52.59.19 1.13.16 1.56.1.47-.07 1.47-.6 1.68-1.18.2-.58.2-1.08.14-1.18-.06-.11-.23-.17-.48-.29Z" />
      </svg>
      <span className="font-display text-[0.8125rem] font-semibold text-chalk transition-colors group-hover:text-gold-lum">
        WhatsApp
      </span>
    </a>
  );
}
