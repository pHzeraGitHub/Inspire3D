import { cn } from "@/lib/utils";

export type FinishLevel = "bruto" | "lixado" | "pintado" | "premium";

/**
 * Prova visual dos quatro acabamentos — a MESMA peça, quatro tratamentos.
 *
 * Existe para responder, sem texto, a pergunta que trava a escolha:
 * "o que exatamente eu ganho pagando mais?". Bruta mostra estrias de camada
 * e rebarbas de suporte; lixada, superfície limpa; pintada, cor e sombra;
 * premium, pintura em duas cores, brilho especular e base de exposição.
 *
 * SVG autoral, alguns KB, escala sem perda. Quando existirem fotos reais das
 * peças da Inspire 3D, trocar por <Image> — o contrato do componente não muda.
 */

const Bruto = () => (
  <><defs>
  <linearGradient id="fs-raw-bruto" x1=".1" y1="0" x2=".95" y2="1">
    <stop offset="0%" stopColor="#80858E"/><stop offset="58%" stopColor="#5C616A"/><stop offset="100%" stopColor="#41454C"/></linearGradient>
  <linearGradient id="fs-smooth-bruto" x1=".12" y1="0" x2=".92" y2="1">
    <stop offset="0%" stopColor="#C6CAD1"/><stop offset="46%" stopColor="#8B909A"/><stop offset="100%" stopColor="#4C5058"/></linearGradient>
  <linearGradient id="fs-paint-bruto" x1=".15" y1="0" x2=".9" y2="1">
    <stop offset="0%" stopColor="#EFC55C"/><stop offset="52%" stopColor="#D4A437"/><stop offset="100%" stopColor="#96751F"/></linearGradient>
  <linearGradient id="fs-prem-bruto" x1=".08" y1="0" x2=".95" y2="1">
    <stop offset="0%" stopColor="#FFF1C4"/><stop offset="30%" stopColor="#F0C75E"/><stop offset="66%" stopColor="#CC9E34"/><stop offset="100%" stopColor="#7A5C1A"/></linearGradient>
  <linearGradient id="fs-cloak-bruto" x1="0" y1="0" x2="1" y2="1">
    <stop offset="0%" stopColor="#2E333B"/><stop offset="100%" stopColor="#171A20"/></linearGradient>
  <pattern id="fs-lay-bruto" width="7" height="3" patternUnits="userSpaceOnUse">
    <line x1="0" y1="2.7" x2="7" y2="2.7" stroke="#000" strokeOpacity=".26" strokeWidth="1.05"/>
    <line x1="0" y1="0.5" x2="7" y2="0.5" stroke="#fff" strokeOpacity=".06" strokeWidth=".65"/>
  </pattern>
  <radialGradient id="fs-halo-bruto" cx=".5" cy=".52" r=".5">
    <stop offset="0%" stopColor="#D4A437" stopOpacity=".42"/><stop offset="100%" stopColor="#D4A437" stopOpacity="0"/></radialGradient>
</defs><path d="M60 33c7.6 0 13 5.6 13 12.8 0 4.3-1.8 7.8-4.5 10l4 3.2c6.8 5.5 10.7 13.4 11.6 22.9l2.7 28.1H33.2l2.9-28.1c.9-9.5 4.6-17.4 11.4-22.9l4-3.2c-2.7-2.2-4.5-5.7-4.5-10C47 38.6 52.4 33 60 33Z" fill="url(#fs-raw-bruto)"/><path d="M60 33c7.6 0 13 5.6 13 12.8 0 4.3-1.8 7.8-4.5 10l4 3.2c6.8 5.5 10.7 13.4 11.6 22.9l2.7 28.1H33.2l2.9-28.1c.9-9.5 4.6-17.4 11.4-22.9l4-3.2c-2.7-2.2-4.5-5.7-4.5-10C47 38.6 52.4 33 60 33Z" fill="url(#fs-lay-bruto)"/><g stroke="#9AA0A9" strokeWidth="1.9" strokeLinecap="round"><path d="M36.5 104l-8 9M43 107l-5.5 10M50 108l-2 9M70 108l2 9M77 107l5.5 10M83.5 104l8 9"/></g><g fill="#9AA0A9"><circle cx="28.5" cy="113" r="1.5"/><circle cx="37.5" cy="117" r="1.4"/><circle cx="48" cy="117" r="1.3"/><circle cx="72" cy="117" r="1.3"/><circle cx="82.5" cy="117" r="1.4"/><circle cx="91.5" cy="113" r="1.5"/></g><path d="M29 110h62l4.5 9.5H24.5L29 110Z" fill="#5A5E66"/><path d="M29 110h62l4.5 9.5H24.5L29 110Z" fill="url(#fs-lay-bruto)"/><path d="M24.5 119.5h71v6.5h-71z" fill="#474B52"/><g fill="#3E4249"><path d="M24.5 119.5h5l-2 6.5h-3z"/><path d="M91 119.5h4.5v6.5H90z"/></g></>
);

const Lixado = () => (
  <><defs>
  <linearGradient id="fs-raw-lixado" x1=".1" y1="0" x2=".95" y2="1">
    <stop offset="0%" stopColor="#80858E"/><stop offset="58%" stopColor="#5C616A"/><stop offset="100%" stopColor="#41454C"/></linearGradient>
  <linearGradient id="fs-smooth-lixado" x1=".12" y1="0" x2=".92" y2="1">
    <stop offset="0%" stopColor="#C6CAD1"/><stop offset="46%" stopColor="#8B909A"/><stop offset="100%" stopColor="#4C5058"/></linearGradient>
  <linearGradient id="fs-paint-lixado" x1=".15" y1="0" x2=".9" y2="1">
    <stop offset="0%" stopColor="#EFC55C"/><stop offset="52%" stopColor="#D4A437"/><stop offset="100%" stopColor="#96751F"/></linearGradient>
  <linearGradient id="fs-prem-lixado" x1=".08" y1="0" x2=".95" y2="1">
    <stop offset="0%" stopColor="#FFF1C4"/><stop offset="30%" stopColor="#F0C75E"/><stop offset="66%" stopColor="#CC9E34"/><stop offset="100%" stopColor="#7A5C1A"/></linearGradient>
  <linearGradient id="fs-cloak-lixado" x1="0" y1="0" x2="1" y2="1">
    <stop offset="0%" stopColor="#2E333B"/><stop offset="100%" stopColor="#171A20"/></linearGradient>
  <pattern id="fs-lay-lixado" width="7" height="3" patternUnits="userSpaceOnUse">
    <line x1="0" y1="2.7" x2="7" y2="2.7" stroke="#000" strokeOpacity=".26" strokeWidth="1.05"/>
    <line x1="0" y1="0.5" x2="7" y2="0.5" stroke="#fff" strokeOpacity=".06" strokeWidth=".65"/>
  </pattern>
  <radialGradient id="fs-halo-lixado" cx=".5" cy=".52" r=".5">
    <stop offset="0%" stopColor="#D4A437" stopOpacity=".42"/><stop offset="100%" stopColor="#D4A437" stopOpacity="0"/></radialGradient>
</defs><path d="M60 33c7.6 0 13 5.6 13 12.8 0 4.3-1.8 7.8-4.5 10l4 3.2c6.8 5.5 10.7 13.4 11.6 22.9l2.7 28.1H33.2l2.7-28.1c.9-9.5 4.8-17.4 11.6-22.9l4-3.2c-2.7-2.2-4.5-5.7-4.5-10C47 38.6 52.4 33 60 33Z" fill="url(#fs-smooth-lixado)"/><path d="M60 55.3l4 3.2c6.8 5.5 10.7 13.4 11.6 22.9l2.7 28.1H60V55.3Z" fill="#000" fillOpacity=".10"/><path d="M53 55.1a13 13 0 0 0 14 0" fill="none" stroke="#585C64" strokeOpacity=".5" strokeWidth="1.5"/><path d="M60 33c-7.6 0-13 5.6-13 12.8" fill="none" stroke="#EEF1F5" strokeOpacity=".55" strokeWidth="1.8" strokeLinecap="round"/><path d="M50.5 65c-2.6 4-4.1 9-4.7 15" fill="none" stroke="#E4E7EB" strokeOpacity=".3" strokeWidth="1.5"/><path d="M29 110h62l4.5 9.5H24.5L29 110Z" fill="#767A82"/><path d="M24.5 119.5h71v6.5h-71z" fill="#5E626A"/></>
);

const Pintado = () => (
  <><defs>
  <linearGradient id="fs-raw-pintado" x1=".1" y1="0" x2=".95" y2="1">
    <stop offset="0%" stopColor="#80858E"/><stop offset="58%" stopColor="#5C616A"/><stop offset="100%" stopColor="#41454C"/></linearGradient>
  <linearGradient id="fs-smooth-pintado" x1=".12" y1="0" x2=".92" y2="1">
    <stop offset="0%" stopColor="#C6CAD1"/><stop offset="46%" stopColor="#8B909A"/><stop offset="100%" stopColor="#4C5058"/></linearGradient>
  <linearGradient id="fs-paint-pintado" x1=".15" y1="0" x2=".9" y2="1">
    <stop offset="0%" stopColor="#EFC55C"/><stop offset="52%" stopColor="#D4A437"/><stop offset="100%" stopColor="#96751F"/></linearGradient>
  <linearGradient id="fs-prem-pintado" x1=".08" y1="0" x2=".95" y2="1">
    <stop offset="0%" stopColor="#FFF1C4"/><stop offset="30%" stopColor="#F0C75E"/><stop offset="66%" stopColor="#CC9E34"/><stop offset="100%" stopColor="#7A5C1A"/></linearGradient>
  <linearGradient id="fs-cloak-pintado" x1="0" y1="0" x2="1" y2="1">
    <stop offset="0%" stopColor="#2E333B"/><stop offset="100%" stopColor="#171A20"/></linearGradient>
  <pattern id="fs-lay-pintado" width="7" height="3" patternUnits="userSpaceOnUse">
    <line x1="0" y1="2.7" x2="7" y2="2.7" stroke="#000" strokeOpacity=".26" strokeWidth="1.05"/>
    <line x1="0" y1="0.5" x2="7" y2="0.5" stroke="#fff" strokeOpacity=".06" strokeWidth=".65"/>
  </pattern>
  <radialGradient id="fs-halo-pintado" cx=".5" cy=".52" r=".5">
    <stop offset="0%" stopColor="#D4A437" stopOpacity=".42"/><stop offset="100%" stopColor="#D4A437" stopOpacity="0"/></radialGradient>
</defs><path d="M60 33c7.6 0 13 5.6 13 12.8 0 4.3-1.8 7.8-4.5 10l4 3.2c6.8 5.5 10.7 13.4 11.6 22.9l2.7 28.1H33.2l2.7-28.1c.9-9.5 4.8-17.4 11.6-22.9l4-3.2c-2.7-2.2-4.5-5.7-4.5-10C47 38.6 52.4 33 60 33Z" fill="url(#fs-paint-pintado)"/><path d="M60 55.3l4 3.2c6.8 5.5 10.7 13.4 11.6 22.9l2.7 28.1H60V55.3Z" fill="#000" fillOpacity=".17"/><path d="M53 55.1a13 13 0 0 0 14 0" fill="none" stroke="#7A5C1A" strokeOpacity=".6" strokeWidth="1.6"/><path d="M60 33c-7.6 0-13 5.6-13 12.8" fill="none" stroke="#FBE39C" strokeOpacity=".6" strokeWidth="1.7" strokeLinecap="round"/><path d="M29 110h62l4.5 9.5H24.5L29 110Z" fill="#333840"/><path d="M24.5 119.5h71v6.5h-71z" fill="#262A31"/></>
);

const Premium = () => (
  <><defs>
  <linearGradient id="fs-raw-premium" x1=".1" y1="0" x2=".95" y2="1">
    <stop offset="0%" stopColor="#80858E"/><stop offset="58%" stopColor="#5C616A"/><stop offset="100%" stopColor="#41454C"/></linearGradient>
  <linearGradient id="fs-smooth-premium" x1=".12" y1="0" x2=".92" y2="1">
    <stop offset="0%" stopColor="#C6CAD1"/><stop offset="46%" stopColor="#8B909A"/><stop offset="100%" stopColor="#4C5058"/></linearGradient>
  <linearGradient id="fs-paint-premium" x1=".15" y1="0" x2=".9" y2="1">
    <stop offset="0%" stopColor="#EFC55C"/><stop offset="52%" stopColor="#D4A437"/><stop offset="100%" stopColor="#96751F"/></linearGradient>
  <linearGradient id="fs-prem-premium" x1=".08" y1="0" x2=".95" y2="1">
    <stop offset="0%" stopColor="#FFF1C4"/><stop offset="30%" stopColor="#F0C75E"/><stop offset="66%" stopColor="#CC9E34"/><stop offset="100%" stopColor="#7A5C1A"/></linearGradient>
  <linearGradient id="fs-cloak-premium" x1="0" y1="0" x2="1" y2="1">
    <stop offset="0%" stopColor="#2E333B"/><stop offset="100%" stopColor="#171A20"/></linearGradient>
  <pattern id="fs-lay-premium" width="7" height="3" patternUnits="userSpaceOnUse">
    <line x1="0" y1="2.7" x2="7" y2="2.7" stroke="#000" strokeOpacity=".26" strokeWidth="1.05"/>
    <line x1="0" y1="0.5" x2="7" y2="0.5" stroke="#fff" strokeOpacity=".06" strokeWidth=".65"/>
  </pattern>
  <radialGradient id="fs-halo-premium" cx=".5" cy=".52" r=".5">
    <stop offset="0%" stopColor="#D4A437" stopOpacity=".42"/><stop offset="100%" stopColor="#D4A437" stopOpacity="0"/></radialGradient>
</defs><circle cx="60" cy="78" r="54" fill="url(#fs-halo-premium)"/><path d="M60 33c7.6 0 13 5.6 13 12.8 0 4.3-1.8 7.8-4.5 10l4 3.2c6.8 5.5 10.7 13.4 11.6 22.9l2.7 28.1H33.2l2.7-28.1c.9-9.5 4.8-17.4 11.6-22.9l4-3.2c-2.7-2.2-4.5-5.7-4.5-10C47 38.6 52.4 33 60 33Z" fill="url(#fs-prem-premium)"/><path d="M47.6 59l-.4.3c-6.8 5.5-10.7 13.4-11.6 22.9L32.9 110h17.6c-2.6-13.6-2-27.3 1.9-41.1-1.9-3.1-3.5-6.4-4.8-9.9Z" fill="url(#fs-cloak-premium)"/><path d="M60 55.3l4 3.2c6.8 5.5 10.7 13.4 11.6 22.9l2.7 28.1H60V55.3Z" fill="#000" fillOpacity=".2"/><path d="M53 55.1a13 13 0 0 0 14 0" fill="none" stroke="#7A5C1A" strokeOpacity=".7" strokeWidth="1.7"/><path d="M55 37.6a8.8 8.8 0 0 1 6.8-2.5" fill="none" stroke="#FFF8E4" strokeWidth="2.4" strokeLinecap="round"/><path d="M70.8 66c2.9 4.2 4.6 9.6 5.2 16.1" fill="none" stroke="#FFF3CE" strokeOpacity=".5" strokeWidth="1.5"/><path d="M63 92h13M63 99h11" stroke="#7A5C1A" strokeOpacity=".55" strokeWidth="1.4" strokeLinecap="round"/><path d="M50.5 110c-2.2-13.1-1.6-26.3 1.8-39.6" fill="none" stroke="#D4A437" strokeOpacity=".45" strokeWidth="1.3"/><path d="M27 109h66l5.5 10.5H21.5L27 109Z" fill="#1B1F25"/><path d="M21.5 119.5h77v7.5h-77z" fill="#14171C"/><path d="M21.5 119.5h77v1.8h-77z" fill="#D4A437" fillOpacity=".8"/><path d="M27 109h66l5.5 10.5H21.5L27 109Z" fill="none" stroke="#D4A437" strokeOpacity=".32" strokeWidth="1"/></>
);

/* `satisfies` garante que os quatro níveis estão cobertos sem depender do
   nome do tipo de elemento JSX, que mudou entre versões do React. */
const ART = {
  bruto: Bruto,
  lixado: Lixado,
  pintado: Pintado,
  premium: Premium,
} satisfies Record<FinishLevel, unknown>;

const ALT: Record<FinishLevel, string> = {
  bruto: "Peça sem tratamento: estrias de camada visíveis e rebarbas de suporte.",
  lixado: "Peça lixada: superfície uniforme, sem linhas de camada.",
  pintado: "Peça pintada: primer, cor e verniz aplicados à mão.",
  premium: "Peça premium: pintura em duas cores, detalhamento e base de exposição.",
};

export function FinishSample({
  level,
  className,
}: {
  level: FinishLevel;
  className?: string;
}) {
  const Art = ART[level];
  return (
    <svg
      viewBox="0 0 120 134"
      role="img"
      aria-label={ALT[level]}
      className={cn("h-auto w-full", className)}
    >
      <Art />
    </svg>
  );
}
