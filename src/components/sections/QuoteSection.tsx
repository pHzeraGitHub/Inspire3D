import { Section } from "@/components/ui/Section";
import { Container } from "@/components/ui/Container";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { Button } from "@/components/ui/Button";
import { Reveal } from "@/components/ui/Reveal";

const steps = [
  {
    step: "01",
    title: "Conte o que imagina",
    text: "Descreva o produto, a ocasião ou a ideia. Uma referência, uma foto ou só algumas palavras já ajudam a começar.",
  },
  {
    step: "02",
    title: "Defina suas preferências",
    text: "Organize categoria, personalização, quantidade, tamanho e acabamento sem precisar conhecer os processos de fabricação.",
  },
  {
    step: "03",
    title: "Organize o orçamento",
    text: "Veja uma estimativa baseada nas informações enviadas. A proposta final pode depender da análise técnica do projeto.",
  },
];

export function QuoteSection() {
  return (
    <Section id="orcamento" className="scroll-mt-24">
      <div aria-hidden className="grid-backdrop grid-backdrop--fine" />
      <div aria-hidden className="halo right-0 top-10 size-[440px] opacity-60" />

      <Container className="relative grid gap-14 lg:grid-cols-[1fr_1.05fr] lg:items-center lg:gap-16">
        <div>
          <Eyebrow>Orçamento inteligente</Eyebrow>
          <h2 className="mt-6 text-display text-chalk">
            Um briefing claro para <span className="gold-text">começar.</span>
          </h2>
          <p className="mt-6 max-w-lg text-lead text-ash">
            Conte o produto ou a personalização que procura. O fluxo organiza as preferências e
            prepara as informações para a estimativa, sem exigir que você entenda de fabricação.
          </p>

          <ol className="mt-10 space-y-7">
            {steps.map((item, i) => (
              <Reveal as="li" key={item.step} delay={i * 90}>
                <div className="flex gap-5">
                  <span className="index-num mt-1 flex-none">{item.step}</span>
                  <div className="border-l border-line pl-5">
                    <h3 className="font-display text-lg font-semibold text-chalk">{item.title}</h3>
                    <p className="mt-1.5 max-w-md text-[0.925rem] leading-relaxed text-ash">
                      {item.text}
                    </p>
                  </div>
                </div>
              </Reveal>
            ))}
          </ol>

          <Button href="/orcamento" size="lg" className="mt-11">
            Montar meu orçamento
          </Button>
        </div>

        {/* ── Mock do painel de estimativa ── */}
        <Reveal delay={140}>
          <div className="panel p-6 md:p-8">
            <div aria-hidden className="grid-backdrop grid-backdrop--fine" />

            <div className="relative flex items-center justify-between gap-4 border-b border-line pb-5">
              <span className="font-mono text-[0.625rem] uppercase tracking-[0.2em] text-silver">
                Estimativa do projeto
              </span>
              <span className="chip">Exemplo ilustrativo</span>
            </div>

            <dl className="relative mt-6 grid grid-cols-2 gap-x-6 gap-y-5">
              {[
                ["Coleção", "A definir"],
                ["Categoria", "Conforme o pedido"],
                ["Personalização", "Preferências do cliente"],
                ["Quantidade", "Informada no fluxo"],
                ["Tamanho", "A confirmar"],
                ["Acabamento", "A combinar"],
              ].map(([label, value]) => (
                <div key={label}>
                  <dt className="font-mono text-[0.5625rem] uppercase tracking-[0.16em] text-ash">
                    {label}
                  </dt>
                  <dd className="mt-1.5 text-[0.95rem] text-chalk">{value}</dd>
                </div>
              ))}
            </dl>

            {/* barra de composição do preço */}
            <div className="relative mt-8">
              <div className="flex h-2 overflow-hidden rounded-full bg-white/5">
                <span className="w-[38%] bg-gold" />
                <span className="w-[27%] bg-gold/60" />
                <span className="w-[22%] bg-silver/40" />
                <span className="w-[13%] bg-silver/20" />
              </div>
              <ul className="mt-4 flex flex-wrap gap-x-5 gap-y-2">
                {[
                  ["Impressão", "bg-gold"],
                  ["Acabamento", "bg-gold/60"],
                  ["Modelagem", "bg-silver/40"],
                  ["Materiais", "bg-silver/20"],
                ].map(([label, dot]) => (
                  <li
                    key={label}
                    className="flex items-center gap-2 font-mono text-[0.5625rem] uppercase tracking-[0.12em] text-ash"
                  >
                    <span aria-hidden className={`size-2 rounded-full ${dot}`} />
                    {label}
                  </li>
                ))}
              </ul>
            </div>

            <div className="relative mt-8 flex flex-wrap items-end justify-between gap-4 rounded-xl border border-gold-line bg-gold/[0.06] p-5">
              <div>
                <p className="font-mono text-[0.5625rem] uppercase tracking-[0.18em] text-gold">
                  Faixa de investimento
                </p>
                <p className="mt-2 font-display text-xl font-semibold text-chalk">Calculada no orçamento</p>
              </div>
              <div className="text-right">
                <p className="font-mono text-[0.5625rem] uppercase tracking-[0.18em] text-ash">
                  Prazo estimado
                </p>
                <p className="mt-2 font-display text-lg text-silver">Conforme o projeto</p>
              </div>
            </div>

            <p className="relative mt-4 text-[0.7rem] leading-relaxed text-ash/80">
              Valores e prazos dependem dos detalhes do pedido e da análise do projeto.
            </p>
          </div>
        </Reveal>
      </Container>
    </Section>
  );
}
