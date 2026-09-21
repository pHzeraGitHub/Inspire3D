import { cn } from "@/lib/utils";

/**
 * Marca da Inspire 3D: pórtico de impressora com cabeçote,
 * produzindo um cubo dourado isométrico.
 *
 * Quando o arquivo oficial da marca estiver pronto, basta trocar o conteúdo
 * deste componente — todo o site consome apenas <LogoMark /> e <Logo />.
 */
export function LogoMark({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 40 40"
      role="img"
      aria-label="Inspire 3D"
      className={cn("size-9", className)}
      fill="none"
    >
      <defs>
        <linearGradient id="i3d-gold-top" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#FBE39C" />
          <stop offset="100%" stopColor="#D4A437" />
        </linearGradient>
        <linearGradient id="i3d-gold-right" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#C89A31" />
          <stop offset="100%" stopColor="#8A6A1E" />
        </linearGradient>
        <linearGradient id="i3d-gold-left" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#A98226" />
          <stop offset="100%" stopColor="#6B5117" />
        </linearGradient>
      </defs>

      {/* pórtico */}
      <path
        d="M5 11V6h6M35 11V6h-6M5 29v5h6M35 29v5h-6"
        stroke="#B7BBC2"
        strokeOpacity="0.55"
        strokeWidth="1.6"
        strokeLinecap="square"
      />
      {/* trilho + cabeçote */}
      <path d="M4 12h32" stroke="#B7BBC2" strokeOpacity="0.35" strokeWidth="1.2" />
      <path d="M17.4 12h5.2l-1.7 3.4h-1.8L17.4 12Z" fill="#B7BBC2" fillOpacity="0.8" />
      {/* filete de extrusão */}
      <path d="M20 15.6v2.2" stroke="#F0C75E" strokeWidth="1.2" strokeLinecap="round" />

      {/* cubo dourado isométrico */}
      <path d="M20 18.4 27.8 23 20 27.6 12.2 23 20 18.4Z" fill="url(#i3d-gold-top)" />
      <path d="M27.8 23v8L20 35.6v-8L27.8 23Z" fill="url(#i3d-gold-right)" />
      <path d="M12.2 23v8L20 35.6v-8L12.2 23Z" fill="url(#i3d-gold-left)" />
    </svg>
  );
}

export function Logo({ className }: { className?: string }) {
  return (
    <span className={cn("inline-flex items-center gap-2.5", className)}>
      <LogoMark />
      <span className="font-display text-[1.0625rem] font-semibold tracking-tight text-chalk">
        INSPIRE <span className="gold-text">3D</span>
      </span>
    </span>
  );
}
