type Stage = "corte" | "montagem" | "revestimento";

/** Diagramas vetoriais autorais: mostram a sequência do trabalho, não uma máquina específica. */
export function CartonagemIllustration({ stage }: { stage: Stage }) {
  const common = "fill-none stroke-[#D4A437] stroke-[3] stroke-linecap-round stroke-linejoin-round";

  return (
    <svg viewBox="0 0 360 240" aria-hidden="true" className="h-full w-full">
      <rect width="360" height="240" fill="#111317" />
      <path d="M0 201H360M0 40H360" stroke="#D4A437" strokeOpacity=".12" />
      <path d="M35 0V240M325 0V240" stroke="#D4A437" strokeOpacity=".08" />
      {stage === "corte" ? (
        <>
          <path d="M73 169 183 196 297 160 189 134Z" fill="#443827" stroke="#D4A437" strokeWidth="2" />
          <path d="M73 169v12l110 27v-12m114-36v12l-114 36" className={common} />
          <path d="M153 141 234 161m-42-31 65 16" stroke="#F0C75E" strokeWidth="2" strokeDasharray="6 7" />
          <path d="M95 62h179v11H95z" fill="#B7BBC2" />
          <path d="M101 73v55m169-55v55" stroke="#B7BBC2" strokeWidth="5" />
          <path d="M98 121h175l-20 14H119z" fill="#888F98" stroke="#D4A437" strokeWidth="2" />
          <path d="M159 37h49v25h-49z" fill="#1D2127" stroke="#B7BBC2" strokeWidth="3" />
          <path d="M181 37V20" stroke="#B7BBC2" strokeWidth="4" />
          <path d="m296 79 15 17m-15 0 15-17" stroke="#D4A437" strokeWidth="2" />
        </>
      ) : null}
      {stage === "montagem" ? (
        <>
          <path d="M93 128 179 90l91 37-91 38Z" fill="#493A24" stroke="#F0C75E" strokeWidth="3" />
          <path d="M93 128v50l86 37v-50m91-38v51l-91 37" fill="#25231E" stroke="#D4A437" strokeWidth="3" strokeLinejoin="round" />
          <path d="M112 135v-34l67-27v16m74 44v-34l-74-26" className={common} />
          <path d="m179 165 0 50" stroke="#F0C75E" strokeWidth="2" strokeDasharray="5 7" />
          <path d="m57 91 21-15 15 21m-15-21 10 37" className={common} />
          <path d="m293 83-22-14-17 22m17-22-12 37" className={common} />
          <path d="M140 39h70m-35-9v19" stroke="#B7BBC2" strokeWidth="2" strokeLinecap="round" />
        </>
      ) : null}
      {stage === "revestimento" ? (
        <>
          <path d="M85 143 179 105l95 38-95 39Z" fill="#D4A437" stroke="#FBE39C" strokeWidth="3" />
          <path d="M85 143v42l94 39v-42m95-39v42l-95 39" fill="#9D7627" stroke="#F0C75E" strokeWidth="3" strokeLinejoin="round" />
          <path d="M60 127 179 78l120 49-25 16-95-38-94 38Z" fill="#B7BBC2" stroke="#E4E4E4" strokeWidth="2" />
          <path d="m60 127 5 27 20 8m214-35-5 27-20 8" className={common} />
          <path d="m94 85 85-35 88 36" stroke="#D4A437" strokeWidth="2" strokeDasharray="5 6" />
          <path d="m179 50 0 28" stroke="#D4A437" strokeWidth="2" />
          <path d="M137 30h84" stroke="#B7BBC2" strokeWidth="6" strokeLinecap="round" />
          <path d="m98 161 18 16m142-16-18 16" stroke="#FBE39C" strokeWidth="2" />
        </>
      ) : null}
    </svg>
  );
}
