import { Section } from "@/components/ui/Section";
import { Container } from "@/components/ui/Container";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { Button } from "@/components/ui/Button";
import { Chip } from "@/components/ui/Chip";
import { Reveal } from "@/components/ui/Reveal";

const briefing = [
  ["Categoria", "Colecionável · exemplo"],
  ["Tamanho", "A confirmar no projeto"],
  ["Tecnologia", "A definir após análise"],
  ["Acabamento", "Preferência do cliente"],
  ["Próximo passo", "Completar o orçamento"],
];

export function InspireAiSection() {
  /* Server Component: lê a chave sem expor nada ao navegador. A seção conta
     a verdade do ambiente — ou o agente está no ar, ou está em preparação. */
  const live = Boolean(process.env.ANTHROPIC_API_KEY);

  return (
    <Section id="inspire-ai" tone="graphite" className="scroll-mt-24 border-y border-line">
      <div aria-hidden className="halo left-1/2 top-0 size-[520px] -translate-x-1/2 opacity-70" />

      <Container className="relative grid gap-14 lg:grid-cols-[1fr_1.1fr] lg:items-center lg:gap-16">
        <div>
          <div className="flex flex-wrap items-center gap-4">
            <Eyebrow>Inspire AI</Eyebrow>
            <Chip tone="gold">{live ? "No ar" : "Em preparação"}</Chip>
          </div>

          <h2 className="mt-6 text-display text-chalk">
            Sua ideia.
            <br />
            Nossa criatividade. <span className="gold-text">Infinitas possibilidades.</span>
          </h2>

          <p className="mt-6 max-w-lg text-lead text-ash">
              A Inspire AI ajuda a explorar possibilidades, faz perguntas para entender suas
              preferências e organiza as respostas para o orçamento. Ela apoia a conversa; não gera
              arquivos 3D prontos nem uma prévia visual final do produto.
          </p>

          <ul className="mt-9 grid gap-3 sm:grid-cols-2">
            {[
              "Ajuda a explorar ideias e produtos",
              "Faz perguntas para completar o briefing",
              "Organiza preferências e detalhes do pedido",
              "Encaminha a conversa ao fluxo de orçamento",
            ].map((item) => (
              <li key={item} className="flex items-start gap-2.5 text-[0.925rem] text-silver">
                <span aria-hidden className="mt-2 size-1 flex-none rotate-45 bg-gold" />
                {item}
              </li>
            ))}
          </ul>

          <div className="mt-10 flex flex-wrap items-center gap-4">
            <Button href={live ? "/orcamento?assistente=ia#quote" : "/orcamento#quote"} variant={live ? "gold" : "outline"}>
              {live ? "Crie com a Inspire AI" : "Comece seu orçamento"}
            </Button>
          </div>
        </div>

        {/* ── Mock da conversa ── */}
        <Reveal delay={120}>
          <div className="panel p-5 md:p-7">
            <div aria-hidden className="grid-backdrop grid-backdrop--fine" />

            <div className="relative flex items-center gap-3 border-b border-line pb-4">
              <span aria-hidden className="relative flex size-2">
                <span className="absolute inline-flex size-full rounded-full bg-gold opacity-60" />
                <span className="relative inline-flex size-2 rounded-full bg-gold" />
              </span>
              <span className="font-mono text-[0.625rem] uppercase tracking-[0.2em] text-silver">
              Exemplo de conversa · Inspire AI
              </span>
            </div>

            <div className="relative mt-6 space-y-5">
              <div className="ml-auto max-w-[85%] rounded-2xl rounded-br-sm border border-line bg-white/[0.03] px-5 py-4">
                <p className="text-[0.925rem] leading-relaxed text-chalk">
                  Quero um busto do personagem do meu RPG, uns 15 cm, bem detalhado e pintado.
                </p>
              </div>

              <div className="max-w-[92%] rounded-2xl rounded-bl-sm border border-gold-line bg-gold/[0.05] px-5 py-5">
                <p className="font-mono text-[0.5625rem] uppercase tracking-[0.18em] text-gold">
                  Briefing gerado
                </p>
                <dl className="mt-4 space-y-2.5">
                  {briefing.map(([label, value]) => (
                    <div
                      key={label}
                      className="flex flex-col gap-0.5 text-[0.85rem] sm:flex-row sm:gap-3"
                    >
                      <dt className="flex-none font-mono text-[0.6875rem] uppercase tracking-[0.08em] text-ash sm:w-36">
                        {label}
                      </dt>
                      <dd className="text-silver">{value}</dd>
                    </div>
                  ))}
                </dl>
                <p className="mt-5 border-t border-gold-line/50 pt-4 text-[0.85rem] text-chalk">
                  Posso enviar isso como pedido de orçamento?
                  <span aria-hidden className="ml-1 inline-block h-4 w-px translate-y-0.5 bg-gold animate-caret" />
                </p>
              </div>
            </div>

            <p className="relative mt-6 border-t border-line pt-4 font-mono text-[0.5625rem] uppercase leading-relaxed tracking-[0.14em] text-ash/70">
              {live
                ? "Exemplo ilustrativo. A conversa real organiza o briefing; não cria arquivos 3D nem visualizações finais."
                : "Exemplo ilustrativo. A conversa com IA estará disponível quando a integração estiver configurada."}
            </p>
          </div>
        </Reveal>
      </Container>
    </Section>
  );
}
