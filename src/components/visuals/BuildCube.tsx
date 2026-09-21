import { cn } from "@/lib/utils";

/* Geometria isométrica ─────────────────────────────────────────────────
   Um cubo sendo fabricado camada por camada:
   a parte de baixo já é matéria (dourado metálico),
   a de cima ainda é wireframe (digital), e o cabeçote percorre a fronteira.
   Tudo em SVG + CSS — sem WebGL, sem custo de runtime.                   */

const CX = 260;
const RX = 124; // meia-largura do losango
const RY = 62; // meia-altura do losango
const Y_BASE = 430; // centro do losango da base
const Y_BUILD = 316; // altura já fabricada
const Y_TOP = 214; // topo do volume digital

const rhombus = (cy: number, rx = RX, ry = RY) =>
  `${CX},${cy - ry} ${CX + rx},${cy} ${CX},${cy + ry} ${CX - rx},${cy}`;

/** Estrias de camada nas faces já fabricadas. */
const layerLines = Array.from({ length: 11 }, (_, i) => Y_BUILD + ((Y_BASE - Y_BUILD) / 11) * i);

/** Losangos de wireframe da parte ainda não fabricada. */
const ghostLayers = Array.from({ length: 6 }, (_, i) => Y_BUILD - ((Y_BUILD - Y_TOP) / 6) * (i + 1));

export function BuildCube({ className }: { className?: string }) {
  return (
    <div className={cn("relative", className)} aria-hidden>
      <svg viewBox="0 120 520 500" className="w-full" fill="none">
        <defs>
          <linearGradient id="bc-top" x1="0.1" y1="0" x2="0.9" y2="1">
            <stop offset="0%" stopColor="#FFF0C4" />
            <stop offset="45%" stopColor="#E7BC55" />
            <stop offset="100%" stopColor="#B98D2C" />
          </linearGradient>
          <linearGradient id="bc-right" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#C89A31" />
            <stop offset="100%" stopColor="#7A5C1A" />
          </linearGradient>
          <linearGradient id="bc-left" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#8E6E22" />
            <stop offset="100%" stopColor="#513D12" />
          </linearGradient>
          <linearGradient id="bc-plate" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#2A2F37" />
            <stop offset="100%" stopColor="#12151A" />
          </linearGradient>
          <radialGradient id="bc-glow" cx="0.5" cy="0.5" r="0.5">
            <stop offset="0%" stopColor="#D4A437" stopOpacity="0.45" />
            <stop offset="100%" stopColor="#D4A437" stopOpacity="0" />
          </radialGradient>
          <clipPath id="bc-solid">
            <polygon
              points={`${CX},${Y_BUILD - RY} ${CX + RX},${Y_BUILD} ${CX + RX},${Y_BASE} ${CX},${Y_BASE + RY} ${CX - RX},${Y_BASE} ${CX - RX},${Y_BUILD}`}
            />
          </clipPath>
        </defs>

        {/* halo */}
        <ellipse cx={CX} cy={365} rx={235} ry={215} fill="url(#bc-glow)" />

        {/* chão técnico */}
        <g stroke="#B7BBC2" strokeOpacity="0.1" strokeWidth="1">
          {[0, 1, 2, 3].map((i) => (
            <polygon key={i} points={rhombus(Y_BASE + 46, RX + 46 + i * 52, RY + 23 + i * 26)} />
          ))}
        </g>

        {/* mesa de impressão */}
        <polygon points={rhombus(Y_BASE + 46, RX + 34, RY + 17)} fill="url(#bc-plate)" />
        <polygon
          points={rhombus(Y_BASE + 46, RX + 34, RY + 17)}
          stroke="#D4A437"
          strokeOpacity="0.35"
          strokeWidth="1.25"
        />

        {/* ── volume ainda digital (wireframe) ── */}
        <g stroke="#B7BBC2" strokeOpacity="0.3" strokeWidth="1.1">
          <polygon points={rhombus(Y_TOP)} strokeOpacity="0.45" />
          <line x1={CX - RX} y1={Y_TOP} x2={CX - RX} y2={Y_BUILD} />
          <line x1={CX + RX} y1={Y_TOP} x2={CX + RX} y2={Y_BUILD} />
          <line x1={CX} y1={Y_TOP + RY} x2={CX} y2={Y_BUILD + RY} />
          {ghostLayers.map((y, i) => (
            <polygon
              key={y}
              points={rhombus(y)}
              strokeOpacity={0.06 + i * 0.035}
              strokeDasharray="5 7"
            />
          ))}
        </g>

        {/* ── volume já fabricado (matéria) ── */}
        <polygon
          points={`${CX},${Y_BASE + RY} ${CX + RX},${Y_BASE} ${CX + RX},${Y_BUILD} ${CX},${Y_BUILD + RY}`}
          fill="url(#bc-right)"
        />
        <polygon
          points={`${CX},${Y_BASE + RY} ${CX - RX},${Y_BASE} ${CX - RX},${Y_BUILD} ${CX},${Y_BUILD + RY}`}
          fill="url(#bc-left)"
        />
        <polygon points={rhombus(Y_BUILD)} fill="url(#bc-top)" />

        {/* estrias de camada */}
        <g clipPath="url(#bc-solid)" stroke="#000" strokeOpacity="0.28" strokeWidth="1">
          {layerLines.map((y) => (
            <g key={y}>
              <line x1={CX} y1={y + RY} x2={CX + RX} y2={y} />
              <line x1={CX} y1={y + RY} x2={CX - RX} y2={y} />
            </g>
          ))}
        </g>
        {/* aresta viva do topo fabricado */}
        <polyline
          points={`${CX - RX},${Y_BUILD} ${CX},${Y_BUILD + RY} ${CX + RX},${Y_BUILD}`}
          stroke="#FFF3D0"
          strokeOpacity="0.5"
          strokeWidth="1.25"
        />

        {/* ── cabeçote de impressão ── */}
        <g
          className="printhead"
          style={{ "--travel": "-26px" } as React.CSSProperties}
        >
          <g>
            <polygon
              points={rhombus(Y_BUILD)}
              stroke="#F0C75E"
              strokeWidth="1.6"
              fill="#F0C75E"
              fillOpacity="0.06"
            />
            <line
              x1={CX - RX - 92}
              y1={Y_BUILD - RY - 34}
              x2={CX + RX + 92}
              y2={Y_BUILD - RY - 34}
              stroke="#B7BBC2"
              strokeOpacity="0.35"
              strokeWidth="1.5"
            />
            <path
              d={`M${CX - 15},${Y_BUILD - RY - 34} h30 l-8,17 h-14 Z`}
              fill="#20242B"
              stroke="#B7BBC2"
              strokeOpacity="0.6"
              strokeWidth="1.2"
            />
            <line
              x1={CX}
              y1={Y_BUILD - RY - 17}
              x2={CX}
              y2={Y_BUILD - RY + 4}
              stroke="#F0C75E"
              strokeWidth="2"
              strokeLinecap="round"
            />
          </g>
        </g>

        {/* ── cotas técnicas ── */}
        <g stroke="#B7BBC2" strokeOpacity="0.28" strokeWidth="1">
          <line x1="70" y1={Y_TOP} x2="70" y2={Y_BASE + RY} />
          <line x1="64" y1={Y_TOP} x2="76" y2={Y_TOP} />
          <line x1="64" y1={Y_BASE + RY} x2="76" y2={Y_BASE + RY} />
        </g>
        <text
          x="58"
          y={(Y_TOP + Y_BASE) / 2}
          fill="#8A8F98"
          fontSize="11"
          fontFamily="var(--font-mono, monospace)"
          letterSpacing="0.14em"
          textAnchor="middle"
          transform={`rotate(-90 58 ${(Y_TOP + Y_BASE) / 2})`}
        >
          LAYER 0.08 MM
        </text>
        <text
          x={CX + RX + 34}
          y={Y_BUILD + 4}
          fill="#D4A437"
          fontSize="11"
          fontFamily="var(--font-mono, monospace)"
          letterSpacing="0.16em"
        >
          BUILDING
        </text>
        <text
          x={CX + RX + 34}
          y={Y_TOP + 4}
          fill="#8A8F98"
          fontSize="11"
          fontFamily="var(--font-mono, monospace)"
          letterSpacing="0.16em"
        >
          MODELO 3D
        </text>
      </svg>
    </div>
  );
}
