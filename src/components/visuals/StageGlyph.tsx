import type { ProcessStage } from "@/types";

/**
 * Um glifo por etapa do processo. A leitura da esquerda para a direita
 * conta a história da marca: rascunho → malha → extrusão → objeto.
 */
export function StageGlyph({ stage }: { stage: ProcessStage["key"] }) {
  const common = {
    viewBox: "0 0 72 72",
    className: "size-14 md:size-16",
    fill: "none" as const,
  };

  if (stage === "ideia") {
    return (
      <svg {...common} aria-hidden>
        <path
          d="M14 52c6-22 14-33 22-33s10 7 4 14-14 6-16 14 6 12 16 8"
          stroke="#B7BBC2"
          strokeOpacity="0.45"
          strokeWidth="1.4"
          strokeLinecap="round"
          strokeDasharray="3 5"
        />
        <path
          d="M42 16v-7M52 21l5-5M55 33h7"
          stroke="#D4A437"
          strokeWidth="1.6"
          strokeLinecap="round"
        />
        <circle cx="42" cy="30" r="9" stroke="#D4A437" strokeWidth="1.6" />
        <path d="M38 39h8v5h-8z" fill="#D4A437" fillOpacity="0.25" stroke="#D4A437" strokeWidth="1.2" />
      </svg>
    );
  }

  if (stage === "digital") {
    return (
      <svg {...common} aria-hidden>
        <g stroke="#B7BBC2" strokeOpacity="0.4" strokeWidth="1.1">
          <path d="M10 44 36 30l26 14-26 14-26-14Z" />
          <path d="M10 44v-8l26-14 26 14v8" />
          <path d="M36 22v36M23 29l26 14M49 29 23 43" strokeOpacity="0.22" />
        </g>
        <circle cx="36" cy="30" r="3.2" fill="#D4A437" />
        <circle cx="10" cy="40" r="2.4" fill="#F0C75E" />
        <circle cx="62" cy="40" r="2.4" fill="#F0C75E" />
        <circle cx="36" cy="58" r="2.4" fill="#F0C75E" />
      </svg>
    );
  }

  if (stage === "fabricacao") {
    return (
      <svg {...common} aria-hidden>
        <path d="M18 16h36" stroke="#B7BBC2" strokeOpacity="0.4" strokeWidth="1.4" />
        <path
          d="M29 16h14l-4 9h-6l-4-9Z"
          fill="#1D2127"
          stroke="#B7BBC2"
          strokeOpacity="0.6"
          strokeWidth="1.2"
        />
        <path d="M36 25v7" stroke="#F0C75E" strokeWidth="2" strokeLinecap="round" />
        <g stroke="#D4A437" strokeWidth="2.2" strokeLinecap="round">
          <path d="M22 38h28" strokeOpacity="0.95" />
          <path d="M20 44h32" strokeOpacity="0.8" />
          <path d="M18 50h36" strokeOpacity="0.62" />
          <path d="M16 56h40" strokeOpacity="0.45" />
        </g>
      </svg>
    );
  }

  return (
    <svg {...common} aria-hidden>
      <defs>
        <linearGradient id="glyph-solid" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#F6DFA4" />
          <stop offset="100%" stopColor="#B98D2C" />
        </linearGradient>
      </defs>
      <path d="M36 16 58 28 36 40 14 28 36 16Z" fill="url(#glyph-solid)" />
      <path d="M58 28v18L36 58V40l22-12Z" fill="#8E6E22" />
      <path d="M14 28v18l22 12V40L14 28Z" fill="#5B4515" />
      <path
        d="M20 24 36 15"
        stroke="#FFF6DE"
        strokeOpacity="0.7"
        strokeWidth="1.6"
        strokeLinecap="round"
      />
      <path d="M62 52h5M64 46h5M60 58h5" stroke="#B7BBC2" strokeOpacity="0.4" strokeWidth="1.3" strokeLinecap="round" />
    </svg>
  );
}
