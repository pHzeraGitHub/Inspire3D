import type { FaqItem } from "@/types";

/**
 * Acordeão nativo (<details>) — acessível por padrão, sem JavaScript.
 */
export function Accordion({ items }: { items: FaqItem[] }) {
  return (
    <div className="divide-y divide-line border-y border-line">
      {items.map((item) => (
        <details key={item.question} className="group">
          <summary className="flex cursor-pointer list-none items-start justify-between gap-6 py-6 text-left [&::-webkit-details-marker]:hidden">
            <span className="font-display text-lg font-medium text-chalk transition-colors duration-300 group-hover:text-gold-lum md:text-xl">
              {item.question}
            </span>
            <span
              aria-hidden
              className="relative mt-1 grid size-7 flex-none place-items-center rounded-full border border-line text-gold transition-colors duration-300 group-hover:border-gold-line"
            >
              <span className="absolute h-px w-3 bg-current" />
              <span className="absolute h-3 w-px bg-current transition-transform duration-300 group-open:rotate-90 group-open:opacity-0" />
            </span>
          </summary>
          <p className="max-w-3xl pb-7 text-[0.975rem] leading-relaxed text-ash">{item.answer}</p>
        </details>
      ))}
    </div>
  );
}
