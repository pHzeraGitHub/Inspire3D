"use client";

import { useRef, useState } from "react";
import {
  ACCEPTED_EXTENSIONS,
  MAX_FILES,
  MAX_FILE_BYTES,
  MAX_TOTAL_BYTES,
  formatBytes,
} from "./options";

const extensionOf = (name: string) => name.slice(name.lastIndexOf(".")).toLowerCase();

/** Validação no cliente. O servidor revalida tudo — isto é só conveniência. */
function validate(incoming: File[], current: File[]): { accepted: File[]; errors: string[] } {
  const errors: string[] = [];
  const accepted: File[] = [];
  let total = current.reduce((sum, f) => sum + f.size, 0);

  for (const file of incoming) {
    if (current.length + accepted.length >= MAX_FILES) {
      errors.push(`Máximo de ${MAX_FILES} arquivos.`);
      break;
    }
    if (!ACCEPTED_EXTENSIONS.includes(extensionOf(file.name) as (typeof ACCEPTED_EXTENSIONS)[number])) {
      errors.push(`${file.name}: formato não aceito.`);
      continue;
    }
    if (file.size > MAX_FILE_BYTES) {
      errors.push(`${file.name}: acima de ${formatBytes(MAX_FILE_BYTES)}.`);
      continue;
    }
    if (total + file.size > MAX_TOTAL_BYTES) {
      errors.push(`Total acima de ${formatBytes(MAX_TOTAL_BYTES)}. Mande o resto pelo WhatsApp.`);
      break;
    }
    if (current.some((f) => f.name === file.name && f.size === file.size)) continue;
    total += file.size;
    accepted.push(file);
  }

  return { accepted, errors };
}

export function FileUpload({
  files,
  onChange,
}: {
  files: File[];
  onChange: (files: File[]) => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);
  const [errors, setErrors] = useState<string[]>([]);

  const add = (list: FileList | null) => {
    if (!list?.length) return;
    const { accepted, errors: next } = validate(Array.from(list), files);
    setErrors(next);
    if (accepted.length) onChange([...files, ...accepted]);
    if (inputRef.current) inputRef.current.value = "";
  };

  const remove = (index: number) => {
    setErrors([]);
    onChange(files.filter((_, i) => i !== index));
  };

  const used = files.reduce((sum, f) => sum + f.size, 0);

  return (
    <div>
      <span className="field-label">Arquivos (opcional)</span>
      <p className="field-hint">
        Não tem arquivo 3D? Sem problema — a descrição acima já basta para começar.
      </p>

      <label
        className="dropzone mt-4"
        data-drag={dragging}
        onDragOver={(e) => {
          e.preventDefault();
          setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragging(false);
          add(e.dataTransfer.files);
        }}
      >
        <input
          ref={inputRef}
          type="file"
          multiple
          accept={ACCEPTED_EXTENSIONS.join(",")}
          onChange={(e) => add(e.target.files)}
          className="sr-only"
        />
        <svg viewBox="0 0 24 24" aria-hidden className="mx-auto size-6 text-gold" fill="none">
          <path
            d="M12 16V4m0 0L7.5 8.5M12 4l4.5 4.5M4 16v2.5A1.5 1.5 0 0 0 5.5 20h13a1.5 1.5 0 0 0 1.5-1.5V16"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
        <span className="mt-3 block font-display text-[0.95rem] font-semibold text-chalk">
          Arraste os arquivos ou clique para escolher
        </span>
        <span className="mt-1.5 block font-mono text-[0.6875rem] uppercase tracking-[0.14em] text-ash">
          STL · OBJ · 3MF · STEP · ZIP · PDF · PNG · JPG
        </span>
        <span className="mt-1 block text-xs text-ash/80">
          Até {MAX_FILES} arquivos · {formatBytes(MAX_FILE_BYTES)} cada ·{" "}
          {formatBytes(MAX_TOTAL_BYTES)} no total
        </span>
      </label>

      {files.length > 0 ? (
        <ul className="mt-4 space-y-2">
          {files.map((file, i) => (
            <li
              key={`${file.name}-${file.size}`}
              className="flex items-center gap-3 rounded-xl border border-line bg-void/50 px-4 py-3"
            >
              <svg viewBox="0 0 16 16" aria-hidden className="size-4 flex-none text-gold" fill="none">
                <path
                  d="M9 1.5H4.5A1.5 1.5 0 0 0 3 3v10a1.5 1.5 0 0 0 1.5 1.5h7A1.5 1.5 0 0 0 13 13V5.5L9 1.5Zm0 0V5a.5.5 0 0 0 .5.5H13"
                  stroke="currentColor"
                  strokeWidth="1.3"
                  strokeLinejoin="round"
                />
              </svg>
              <span className="min-w-0 flex-1 truncate text-sm text-chalk">{file.name}</span>
              <span className="flex-none font-mono text-[0.6875rem] text-ash">
                {formatBytes(file.size)}
              </span>
              <button
                type="button"
                onClick={() => remove(i)}
                aria-label={`Remover ${file.name}`}
                className="flex-none rounded-full p-1 text-ash transition-colors hover:text-chalk"
              >
                <svg viewBox="0 0 16 16" aria-hidden className="size-3.5" fill="none">
                  <path
                    d="m4 4 8 8M12 4l-8 8"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                  />
                </svg>
              </button>
            </li>
          ))}
          <li className="pt-1 text-right font-mono text-[0.6875rem] uppercase tracking-[0.14em] text-ash">
            {formatBytes(used)} de {formatBytes(MAX_TOTAL_BYTES)}
          </li>
        </ul>
      ) : null}

      {errors.length > 0 ? (
        <ul className="mt-3 space-y-1" role="alert">
          {errors.map((error) => (
            <li key={error} className="field-error">
              {error}
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}
