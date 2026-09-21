export type ClassValue = string | number | null | undefined | false | ClassValue[];

/** Concatenador de classes minimalista (sem dependências externas). */
export function cn(...inputs: ClassValue[]): string {
  const out: string[] = [];
  const walk = (value: ClassValue) => {
    if (!value && value !== 0) return;
    if (Array.isArray(value)) {
      value.forEach(walk);
      return;
    }
    out.push(String(value));
  };
  inputs.forEach(walk);
  return out.join(" ");
}

/** "01", "02"… para numeração técnica de seções e cards. */
export const pad = (n: number, size = 2) => String(n).padStart(size, "0");
