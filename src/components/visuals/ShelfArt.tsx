/**
 * Composição decorativa do card em destaque: três peças isométricas
 * sobre a bancada. Sugere "coleção" sem prometer um produto específico.
 */
export function ShelfArt() {
  return (
    <svg
      viewBox="0 0 520 210"
      preserveAspectRatio="xMidYMax meet"
      className="absolute inset-0 h-full w-full"
      fill="none"
      aria-hidden
    >
      <defs>
        <linearGradient id="shelf-gold" x1="0" y1="0" x2="0.4" y2="1">
          <stop offset="0%" stopColor="#F0C75E" />
          <stop offset="100%" stopColor="#9C7522" />
        </linearGradient>
        <radialGradient id="shelf-glow" cx="0.5" cy="0.75" r="0.55">
          <stop offset="0%" stopColor="#D4A437" stopOpacity="0.22" />
          <stop offset="100%" stopColor="#D4A437" stopOpacity="0" />
        </radialGradient>
      </defs>

      <ellipse cx="260" cy="168" rx="230" ry="72" fill="url(#shelf-glow)" />

      {/* bancada */}
      <g stroke="#B7BBC2" strokeOpacity="0.16" strokeWidth="1">
        <polygon points="260,120 470,178 260,236 50,178" />
        <polygon points="260,144 400,182 260,220 120,182" strokeOpacity="0.1" />
      </g>

      {/* peça alta (busto abstrato) */}
      <g>
        <path d="M150 92 190 110 190 158 150 176 110 158 110 110 150 92Z" fill="url(#shelf-gold)" fillOpacity="0.9" />
        <path d="M190 110v48l-40 18v-48l40-18Z" fill="#6E5318" />
        <path d="M110 110v48l40 18v-48l-40-18Z" fill="#4A370F" />
        <path d="M150 74c9 0 15 7 15 14s-6 12-15 12-15-5-15-12 6-14 15-14Z" fill="url(#shelf-gold)" />
      </g>

      {/* cubo médio */}
      <g>
        <path d="M266 118 306 136 266 154 226 136 266 118Z" fill="url(#shelf-gold)" />
        <path d="M306 136v34l-40 18v-34l40-18Z" fill="#6E5318" />
        <path d="M226 136v34l40 18v-34l-40-18Z" fill="#4A370F" />
      </g>

      {/* peça pequena / wireframe (ainda digital) */}
      <g stroke="#B7BBC2" strokeOpacity="0.4" strokeWidth="1.2">
        <path d="M376 132 404 145 376 158 348 145 376 132Z" />
        <path d="M404 145v24l-28 13v-24M348 145v24l28 13" />
        <path d="M376 108v16" strokeDasharray="3 4" stroke="#D4A437" strokeOpacity="0.7" />
      </g>
    </svg>
  );
}
