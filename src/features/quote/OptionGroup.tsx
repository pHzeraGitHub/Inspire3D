"use client";

import type { Option } from "./options";

/**
 * Grupo de opções acessível: é um radiogroup de verdade (inputs nativos
 * escondidos), então funciona com teclado e leitor de tela — o visual de
 * card é só a casca.
 */
export function OptionGroup<T extends string>({
  name,
  legend,
  hint,
  options,
  value,
  onChange,
  columns = 2,
  error,
  visuals,
  meta,
  footnote,
}: {
  name: string;
  legend: string;
  hint?: string;
  options: Option<T>[];
  value: T | null;
  onChange: (value: T) => void;
  columns?: 1 | 2 | 3 | 4;
  error?: string;
  /** Prova visual por opção — mostrada acima do título. */
  visuals?: Partial<Record<T, React.ReactNode>>;
  /** Informação de canto: hoje, quanto a opção soma ao orçamento. */
  meta?: Partial<Record<T, React.ReactNode>>;
  /** Nota abaixo do grupo, para identificar ilustração ou origem do dado. */
  footnote?: string;
}) {
  const cols =
    columns === 1
      ? "grid-cols-1"
      : columns === 4
        ? "grid-cols-2 lg:grid-cols-4"
        : columns === 3
          ? "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3"
          : "grid-cols-1 sm:grid-cols-2";

  return (
    <fieldset>
      <legend className="field-label">{legend}</legend>
      {hint ? <p className="field-hint">{hint}</p> : null}

      <div className={`mt-4 grid gap-3 ${cols}`}>
        {options.map((option) => {
          const selected = value === option.value;
          const visual = visuals?.[option.value];
          const extra = meta?.[option.value];
          return (
            <label key={option.value} className="option" data-selected={selected}>
              <input
                type="radio"
                name={name}
                value={option.value}
                checked={selected}
                onChange={() => onChange(option.value)}
                className="sr-only"
              />
              <svg
                viewBox="0 0 16 16"
                aria-hidden
                className="option__check size-4 text-gold"
                fill="none"
              >
                <circle cx="8" cy="8" r="7" stroke="currentColor" strokeOpacity=".55" />
                <path
                  d="m5 8.2 2.1 2.1L11 6.4"
                  stroke="currentColor"
                  strokeWidth="1.6"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>

              {visual ? <span className="option__art">{visual}</span> : null}

              <span className="option__title pr-7">{option.title}</span>
              {option.desc ? <span className="option__desc">{option.desc}</span> : null}
              {extra ? <span className="option__meta">{extra}</span> : null}
            </label>
          );
        })}
      </div>

      {footnote ? (
        <p className="mt-3 font-mono text-[0.625rem] uppercase tracking-[0.14em] text-ash/80">
          {footnote}
        </p>
      ) : null}

      {error ? (
        <p className="field-error" role="alert">
          <svg viewBox="0 0 16 16" aria-hidden className="size-3.5" fill="currentColor">
            <path d="M8 1.5 15 14H1L8 1.5Zm0 4.2a.8.8 0 0 0-.8.86l.25 3a.55.55 0 0 0 1.1 0l.25-3A.8.8 0 0 0 8 5.7Zm0 5.6a.8.8 0 1 0 0 1.6.8.8 0 0 0 0-1.6Z" />
          </svg>
          {error}
        </p>
      ) : null}
    </fieldset>
  );
}
