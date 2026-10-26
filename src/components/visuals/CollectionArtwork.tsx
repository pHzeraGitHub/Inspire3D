import { useId } from "react";
import type { CollectionSlug } from "@/types";

/** Original vector studies used as collection art until real product photos exist. */
export function CollectionArtwork({
  collection,
  className,
}: {
  collection: CollectionSlug;
  className?: string;
}) {
  const uid = useId().replace(/:/g, "");
  const gold = `gold-${uid}`;
  const silver = `silver-${uid}`;
  const glow = `glow-${uid}`;

  return (
    <svg
      viewBox="0 0 440 330"
      className={className ?? "size-full"}
      fill="none"
      aria-hidden="true"
      preserveAspectRatio="xMidYMid meet"
    >
      <defs>
        <linearGradient id={gold} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#F0C75E" />
          <stop offset="0.52" stopColor="#D4A437" />
          <stop offset="1" stopColor="#765719" />
        </linearGradient>
        <linearGradient id={silver} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#E0E2E6" />
          <stop offset="1" stopColor="#555B65" />
        </linearGradient>
        <radialGradient id={glow} cx="0.5" cy="0.72" r="0.6">
          <stop offset="0" stopColor="#D4A437" stopOpacity="0.2" />
          <stop offset="1" stopColor="#D4A437" stopOpacity="0" />
        </radialGradient>
      </defs>

      <ellipse cx="220" cy="258" rx="178" ry="55" fill={`url(#${glow})`} />
      <path d="M34 258 220 195l186 63-186 62L34 258Z" fill="#101318" stroke="#B7BBC2" strokeOpacity="0.13" />
      <path d="M65 257 220 207l155 50-155 51-155-51Z" stroke="#B7BBC2" strokeOpacity="0.1" />

      {collection === "inspire-gifts" ? (
        <g strokeLinejoin="round">
          <path d="m133 158 87-37 87 37-87 38-87-38Z" fill={`url(#${gold})`} />
          <path d="M133 158v72l87 38v-72l-87-38Z" fill="#9B7426" />
          <path d="M307 158v72l-87 38v-72l87-38Z" fill="#624A18" />
          <path d="m204 128 16-7 16 7v133l-16 7-16-7V128Z" fill={`url(#${silver})`} />
          <path d="M220 121c-31-36-59-17-32 4l32 15 32-15c27-21-1-40-32-4Z" stroke={`url(#${gold})`} strokeWidth="8" />
          <path d="M220 132v135" stroke="#FFF0C4" strokeOpacity="0.55" strokeWidth="2" />
        </g>
      ) : null}

      {collection === "inspire-collectibles" ? (
        <g strokeLinejoin="round">
          <path d="m154 216 66-28 66 28v25l-66 28-66-28v-25Z" fill="#272B31" stroke="#69707A" strokeOpacity="0.7" />
          <path d="m179 194 41-17 41 17v21l-41 18-41-18v-21Z" fill={`url(#${gold})`} />
          <path d="M197 146c0-21 10-34 23-34s23 13 23 34v11c0 14-9 23-23 23s-23-9-23-23v-11Z" fill={`url(#${silver})`} />
          <path d="M183 204c2-22 18-34 37-34s35 12 37 34l-13 11h-48l-13-11Z" fill="#A47B28" />
          <path d="m210 138 10-9 10 9" stroke="#F5F5F5" strokeOpacity="0.7" strokeWidth="2" />
          <path d="M211 151h1m17 0h1" stroke="#111317" strokeWidth="4" strokeLinecap="round" />
        </g>
      ) : null}

      {collection === "inspire-games" ? (
        <g strokeLinejoin="round">
          <path d="m220 105 125 47-125 48-125-48 125-48Z" fill="#242931" stroke="#B7BBC2" strokeOpacity="0.5" />
          <path d="M220 122 308 152l-88 34-88-34 88-30Z" fill="#14171C" stroke={`url(#${gold})`} strokeOpacity="0.8" />
          <path d="m220 138 25 9-25 10-25-10 25-9Z" fill={`url(#${gold})`} />
          <path d="M220 138v19" stroke="#FFF0C4" strokeOpacity="0.45" />
          <circle cx="172" cy="151" r="10" fill={`url(#${silver})`} />
          <circle cx="268" cy="151" r="10" fill={`url(#${gold})`} />
          <path d="m221 83 13 22h-26l13-22Z" fill={`url(#${gold})`} />
          <path d="m134 172 9 16-18-6 9-10Zm172 0 9 10-18 6 9-16Z" fill="#B7BBC2" fillOpacity="0.72" />
        </g>
      ) : null}

      {collection === "inspire-solutions" ? (
        <g strokeLinejoin="round">
          <path d="m116 158 104-43 104 43v69l-104 45-104-45v-69Z" fill="#242931" stroke="#737A84" strokeOpacity="0.75" />
          <path d="m116 158 104 45 104-45" stroke={`url(#${gold})`} strokeWidth="2" />
          <path d="M220 203v69" stroke="#737A84" strokeOpacity="0.75" />
          <path d="m139 168 66 29v52l-66-29v-52Z" fill="#15181D" stroke="#626873" />
          <path d="m155 178 34 15v30l-34-15v-30Z" fill="#2A2F36" stroke={`url(#${gold})`} strokeOpacity="0.75" />
          <path d="m235 197 66-29v52l-66 29v-52Z" fill="#181B20" stroke="#626873" />
          <path d="M251 195v-18l34-15v18l-34 15Z" fill={`url(#${silver})`} fillOpacity="0.8" />
          <path d="m206 111 14-6 14 6" stroke="#F0C75E" strokeWidth="3" strokeLinecap="round" />
        </g>
      ) : null}

      <path d="M220 46v20m0 0-7-7m7 7 7-7" stroke="#D4A437" strokeOpacity="0.65" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="220" cy="42" r="2" fill="#F0C75E" />
    </svg>
  );
}
