/**
 * Arte-espaço-reservado do portfólio.
 * Fase 1: composições isométricas geradas por SVG, uma por índice.
 * Fase 2: substituídas pelas fotos reais (campo `cover` de Project) —
 * o card não muda, apenas a fonte da imagem.
 */
export function ProjectArt({ index }: { index: number }) {
  const variant = index % 5;

  return (
    <svg viewBox="0 0 400 300" className="h-full w-full" fill="none" aria-hidden>
      <defs>
        <linearGradient id={`pa-bg-${index}`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#191D23" />
          <stop offset="100%" stopColor="#0C0E12" />
        </linearGradient>
        <linearGradient id={`pa-gold-${index}`} x1="0" y1="0" x2="0.6" y2="1">
          <stop offset="0%" stopColor="#F0C75E" />
          <stop offset="100%" stopColor="#8A6A1E" />
        </linearGradient>
        <radialGradient id={`pa-glow-${index}`} cx="0.5" cy="0.55" r="0.5">
          <stop offset="0%" stopColor="#D4A437" stopOpacity="0.3" />
          <stop offset="100%" stopColor="#D4A437" stopOpacity="0" />
        </radialGradient>
      </defs>

      <rect width="400" height="300" fill={`url(#pa-bg-${index})`} />
      <g stroke="#B7BBC2" strokeOpacity="0.07" strokeWidth="1">
        {Array.from({ length: 9 }, (_, i) => (
          <line key={`h${i}`} x1="0" y1={i * 34 + 12} x2="400" y2={i * 34 + 12} />
        ))}
        {Array.from({ length: 12 }, (_, i) => (
          <line key={`v${i}`} x1={i * 34 + 12} y1="0" x2={i * 34 + 12} y2="300" />
        ))}
      </g>
      <ellipse cx="200" cy="170" rx="150" ry="110" fill={`url(#pa-glow-${index})`} />

      {variant === 0 && (
        <g>
          <path d="M200 96 262 132 200 168 138 132 200 96Z" fill={`url(#pa-gold-${index})`} />
          <path d="M262 132v56l-62 36v-56l62-36Z" fill="#7A5C1A" />
          <path d="M138 132v56l62 36v-56l-62-36Z" fill="#4E3A11" />
        </g>
      )}
      {variant === 1 && (
        <g>
          {[0, 1, 2].map((i) => (
            <g key={i} transform={`translate(${i * 62 - 62}, ${i % 2 ? 14 : 0})`}>
              <path d="M200 128 232 146 200 164 168 146 200 128Z" fill={`url(#pa-gold-${index})`} />
              <path d="M232 146v30l-32 18v-30l32-18Z" fill="#7A5C1A" />
              <path d="M168 146v30l32 18v-30l-32-18Z" fill="#4E3A11" />
            </g>
          ))}
        </g>
      )}
      {variant === 2 && (
        <g>
          {Array.from({ length: 14 }, (_, i) => {
            const w = 90 - Math.abs(i - 6) * 7;
            return (
              <ellipse
                key={i}
                cx="200"
                cy={90 + i * 11}
                rx={w}
                ry={w / 3.4}
                stroke={`url(#pa-gold-${index})`}
                strokeOpacity={0.35 + i * 0.04}
                strokeWidth="1.6"
              />
            );
          })}
        </g>
      )}
      {variant === 3 && (
        <g>
          <rect x="150" y="110" width="100" height="80" rx="8" fill="#20242B" stroke="#B7BBC2" strokeOpacity="0.3" />
          <rect x="172" y="132" width="56" height="36" rx="4" fill={`url(#pa-gold-${index})`} />
          <g stroke="#B7BBC2" strokeOpacity="0.35" strokeWidth="1.2" strokeDasharray="4 5">
            <path d="M150 100h100M120 110v80" />
          </g>
        </g>
      )}
      {variant === 4 && (
        <g>
          <path d="M200 74v152" stroke="#B7BBC2" strokeOpacity="0.2" strokeWidth="1.2" />
          {[0, 1, 2, 3].map((i) => (
            <path
              key={i}
              d={`M200 ${96 + i * 34} 246 ${118 + i * 34} 200 ${140 + i * 34} 154 ${118 + i * 34}Z`}
              fill={`url(#pa-gold-${index})`}
              fillOpacity={0.9 - i * 0.2}
            />
          ))}
        </g>
      )}

      <rect
        x="0.5"
        y="0.5"
        width="399"
        height="299"
        stroke="#B7BBC2"
        strokeOpacity="0.1"
        fill="none"
      />
    </svg>
  );
}
