import { Button } from "@/components/ui/Button";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { BuildCube } from "@/components/visuals/BuildCube";

const chain = ["Ideia", "Digital", "Fabricação", "Realidade"];

const capabilities = [
  { value: "FDM + Resina", label: "Duas tecnologias" },
  { value: "Alta definição", label: "Detalhe e acabamento" },
  { value: "Sob demanda", label: "Peça única ou pequenas séries" },
  { value: "Manual", label: "Pintura e acabamento" },
];

export function Hero() {
  return (
    <section className="relative isolate overflow-hidden pt-[68px] md:pt-[76px]">
      {/* fundo */}
      <div aria-hidden className="absolute inset-0 -z-10">
        <div className="absolute inset-0 bg-[radial-gradient(120%_85%_at_78%_18%,#15181E_0%,#08090B_58%)]" />
        <div className="grid-backdrop" />
        <div className="halo -right-24 top-4 size-[560px] md:right-4" />
        <div className="halo -left-40 bottom-0 size-[420px] opacity-60" />
        <div className="noise" />
        <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-b from-transparent to-void" />
      </div>

      <div className="shell grid items-center gap-10 pb-16 pt-12 md:pb-24 md:pt-16 lg:min-h-[calc(100svh-76px)] lg:grid-cols-[1.12fr_0.88fr] lg:gap-8 lg:pb-16 lg:pt-6">
        {/* ── Coluna de conteúdo ── */}
        <div className="relative z-10 max-w-2xl">
          <Eyebrow>Estúdio de fabricação criativa</Eyebrow>

          <h1 className="mt-6 text-hero font-semibold text-chalk">
            Transformando
            <br />
            ideias em <span className="gold-text">realidade</span>.
          </h1>

          <p className="mt-7 max-w-xl text-lead text-ash">
            Modelagem 3D, impressão FDM e resina, pintura e acabamento manual sob o mesmo teto.
            Você chega com uma referência, um rascunho ou só a ideia — e sai com a peça na mão.
          </p>

          {/* cadeia conceitual da marca */}
          <div className="mt-9 flex flex-wrap items-center gap-x-3 gap-y-3">
            {chain.map((step, i) => (
              <div key={step} className="flex items-center gap-3">
                <span className="flex items-center gap-2 font-mono text-[0.6875rem] uppercase tracking-[0.18em] text-silver">
                  <span
                    aria-hidden
                    className={
                      i === chain.length - 1
                        ? "size-1.5 rounded-full bg-gold shadow-[0_0_10px_2px_rgba(212,164,55,0.6)]"
                        : "size-1.5 rounded-full bg-silver/40"
                    }
                  />
                  {step}
                </span>
                {i < chain.length - 1 ? (
                  <span aria-hidden className="h-px w-6 bg-line-strong md:w-9" />
                ) : null}
              </div>
            ))}
          </div>

          <div className="mt-10 flex flex-col gap-3 sm:flex-row sm:items-center">
            <Button href="/orcamento" size="lg">
              Pedir orçamento
              <svg viewBox="0 0 16 16" className="size-4" fill="none" aria-hidden>
                <path
                  d="M2 8h11M9 4l4 4-4 4"
                  stroke="currentColor"
                  strokeWidth="1.6"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </Button>
            <Button href="/#processo" variant="outline" size="lg">
              Como funciona
            </Button>
          </div>

          {/* capacidades */}
          <dl className="mt-12 grid grid-cols-2 gap-x-5 gap-y-6 border-t border-line pt-8 sm:grid-cols-4">
            {capabilities.map((item) => (
              <div key={item.label}>
                <dt className="font-display text-base font-semibold text-chalk md:text-lg">
                  {item.value}
                </dt>
                <dd className="mt-1 font-mono text-[0.625rem] uppercase tracking-[0.14em] text-ash">
                  {item.label}
                </dd>
              </div>
            ))}
          </dl>
        </div>

        {/* ── Coluna visual ── */}
        <div className="relative -mx-4 lg:mx-0">
          <BuildCube className="mx-auto w-full max-w-[440px] lg:max-w-none" />
          <div
            aria-hidden
            className="pointer-events-none absolute inset-x-0 bottom-0 h-24 bg-gradient-to-b from-transparent to-void"
          />
        </div>
      </div>
    </section>
  );
}
