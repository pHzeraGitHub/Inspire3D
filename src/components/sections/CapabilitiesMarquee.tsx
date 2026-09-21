const capabilities = [
  "Impressão 3D FDM",
  "Impressão em resina",
  "Modelagem digital",
  "Escultura 3D",
  "Pintura à mão",
  "Aerografia",
  "Prototipagem rápida",
  "Peças funcionais",
  "Colecionáveis",
  "Board games",
  "Dados personalizados",
  "Miniaturas",
  "Totens",
  "Desenvolvimento de produto",
];

export function CapabilitiesMarquee() {
  const track = [...capabilities, ...capabilities];

  return (
    <div className="relative border-y border-line bg-graphite/40 py-4">
      <div className="marquee-mask overflow-hidden">
        <div className="marquee">
          {track.map((item, i) => (
            <span
              key={`${item}-${i}`}
              className="flex items-center gap-6 whitespace-nowrap px-6 font-mono text-[0.6875rem] uppercase tracking-[0.2em] text-silver/70"
            >
              {item}
              <span aria-hidden className="size-1 rotate-45 bg-gold/70" />
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
