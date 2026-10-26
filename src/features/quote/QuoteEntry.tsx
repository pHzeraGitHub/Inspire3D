"use client";

import { useState } from "react";
import { InspireAiChat } from "./InspireAiChat";
import { QuoteWizard } from "./QuoteWizard";

/**
 * As duas portas para o mesmo funil.
 *
 * Conversa e formulário preenchem o MESMO `QuoteRequest` e caem no MESMO
 * motor de estimativa. Nenhuma lógica duplicada: a Inspire AI é uma forma
 * diferente de responder as mesmas perguntas, para quem tem preguiça de
 * formulário ou não sabe o que é FDM.
 */
export function QuoteEntry({
  aiEnabled,
  initialCategory,
  aiRequested = false,
}: {
  aiEnabled: boolean;
  initialCategory?: string;
  aiRequested?: boolean;
}) {
  const [mode, setMode] = useState<"conversa" | "formulario">(() =>
    aiEnabled && (aiRequested || !initialCategory) ? "conversa" : "formulario",
  );

  if (!aiEnabled) return <QuoteWizard initialCategory={initialCategory} />;

  return (
    <div>
      <div
        role="tablist"
        aria-label="Como você prefere pedir o orçamento"
        className="mb-7 inline-flex rounded-full border border-line bg-carbon/70 p-1"
      >
        {(
          [
            ["conversa", "Conversar", "Responda em uma frase"],
            ["formulario", "Formulário", "Preencha você mesmo"],
          ] as const
        ).map(([value, label, hint]) => (
          <button
            key={value}
            type="button"
            role="tab"
            aria-selected={mode === value}
            title={hint}
            onClick={() => setMode(value)}
            className={
              mode === value
                ? "rounded-full bg-gold/15 px-5 py-2 font-display text-sm font-semibold text-gold-lum transition-colors"
                : "rounded-full px-5 py-2 font-display text-sm font-semibold text-ash transition-colors hover:text-chalk"
            }
          >
            {label}
          </button>
        ))}
      </div>

      {mode === "conversa" ? (
        <InspireAiChat onPreferForm={() => setMode("formulario")} />
      ) : (
        <QuoteWizard initialCategory={initialCategory} />
      )}
    </div>
  );
}
