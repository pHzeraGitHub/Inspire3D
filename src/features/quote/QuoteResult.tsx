"use client";

import { Button } from "@/components/ui/Button";
import { site, whatsappLink } from "@/config/site";
import type { LeadDeliveryStatus, QuoteEstimate, QuoteRequest } from "@/types";
import { briefingLines, complexityLabel, whatsappMessage } from "./summary";

const complexityNote = {
  simples: "Projeto direto. Entra na fila sem etapa extra.",
  media: "Projeto com alguma exigência — vale uma conversa rápida antes de fechar.",
  alta: "Projeto exigente. Provavelmente vamos sugerir ajustes para reduzir custo e risco.",
} as const;

export function QuoteResult({
  data,
  estimate,
  onRestart,
  delivery,
}: {
  data: QuoteRequest;
  estimate: QuoteEstimate;
  onRestart: () => void;
  delivery: LeadDeliveryStatus;
}) {
  const lines = briefingLines(data, estimate);

  return (
    <div className="panel p-7 md:p-10">
      <div aria-hidden className="grid-backdrop grid-backdrop--fine" />

      <div className="relative">
        <div className="flex items-center gap-3">
          <span className="grid size-9 flex-none place-items-center rounded-full border border-gold/45 bg-gold/12">
            <svg viewBox="0 0 16 16" aria-hidden className="size-4 text-gold-lum" fill="none">
              <path
                d="m4 8.4 2.6 2.6L12.2 5.4"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </span>
          <div>
            <h2 className="font-display text-xl font-semibold text-chalk">
              {delivery === "sent" ? "Pedido enviado" : "Estimativa pronta"}, {data.name.trim().split(" ")[0]}.
            </h2>
            <p className="mt-0.5 text-sm text-ash">
              {delivery === "sent"
                ? "Seu briefing foi encaminhado ao estúdio. Resposta com a proposta em até 1 dia útil."
                : "Não conseguimos confirmar o envio automático do briefing. A estimativa continua válida; envie pelo WhatsApp ou e-mail abaixo para não perder o contato."}
            </p>
          </div>
        </div>

        <div className="mt-9 rule" />

        {/* ── Leitura técnica ──────────────────────────────────────── */}
        <div className="mt-9 grid gap-5 sm:grid-cols-3">
          <div className="card p-5">
            <p className="font-mono text-[0.625rem] uppercase tracking-[0.18em] text-ash">
              Tecnologia indicada
            </p>
            <p className="mt-2 font-display text-lg font-semibold text-chalk">
              {estimate.recommendedTechnology === "resina" ? "Resina" : "FDM"}
            </p>
          </div>
          <div className="card p-5">
            <p className="font-mono text-[0.625rem] uppercase tracking-[0.18em] text-ash">
              Complexidade
            </p>
            <p className="mt-2 font-display text-lg font-semibold text-chalk">
              {complexityLabel[estimate.complexity]}
            </p>
          </div>
          <div className="card p-5">
            <p className="font-mono text-[0.625rem] uppercase tracking-[0.18em] text-ash">
              Prazo estimado
            </p>
            <p className="mt-2 font-display text-lg font-semibold text-chalk">
              {estimate.leadTimeDays[0]} – {estimate.leadTimeDays[1]}{" "}
              <span className="text-sm font-normal text-silver">dias úteis</span>
            </p>
          </div>
        </div>

        <p className="mt-5 text-[0.9rem] leading-relaxed text-silver">
          {estimate.recommendationReason}
        </p>
        <p className="mt-2 text-[0.9rem] leading-relaxed text-ash">
          {complexityNote[estimate.complexity]}
        </p>

        {/* ── Faixa de investimento (só quando a tabela está calibrada) ── */}
        {estimate.price ? (
          <div className="mt-8 rounded-2xl border border-gold/30 bg-gold/[0.06] p-6">
            <div className="flex flex-wrap items-end justify-between gap-4">
              <div>
                <p className="font-mono text-[0.625rem] uppercase tracking-[0.18em] text-gold">
                  Faixa estimada
                </p>
                <p className="mt-2 font-display text-3xl font-semibold text-chalk">
                  R$ {estimate.price.min.toLocaleString("pt-BR")}
                  <span className="mx-2 text-silver">–</span>
                  {estimate.price.max.toLocaleString("pt-BR")}
                </p>
              </div>
              <p className="max-w-xs text-xs leading-relaxed text-ash">
                Estimativa preliminar. A proposta final sai depois da análise técnica do arquivo.
              </p>
            </div>
          </div>
        ) : (
          <div className="mt-8 rounded-2xl border border-line bg-void/50 p-6">
            <p className="font-mono text-[0.625rem] uppercase tracking-[0.18em] text-silver">
              Investimento
            </p>
            <p className="mt-2.5 text-[0.95rem] leading-relaxed text-silver">
              O valor sai junto da proposta, depois que o estúdio olhar a geometria da peça —
              é o que evita um número que muda depois.
            </p>
          </div>
        )}

        {/* ── Briefing ─────────────────────────────────────────────── */}
        <div className="mt-9">
          <p className="font-mono text-[0.625rem] uppercase tracking-[0.18em] text-ash">
            Briefing enviado
          </p>
          <dl className="mt-4 grid gap-x-8 gap-y-3 sm:grid-cols-2">
            {lines.map((line) => (
              <div key={line.label} className="flex flex-wrap gap-x-3 border-b border-line pb-2.5">
                <dt className="font-mono text-[0.625rem] uppercase tracking-[0.14em] text-ash">
                  {line.label}
                </dt>
                <dd className="ml-auto text-[0.9rem] text-chalk">{line.value}</dd>
              </div>
            ))}
          </dl>

          {data.files?.length ? (
            <p className="mt-4 text-sm text-ash">
              {data.files.length} arquivo{data.files.length > 1 ? "s" : ""} anexado
              {data.files.length > 1 ? "s" : ""}: {data.files.map((f) => f.name).join(", ")}
            </p>
          ) : null}
        </div>

        <ul className="mt-7 space-y-1.5">
          {estimate.assumptions.map((item) => (
            <li key={item} className="flex gap-2.5 text-xs leading-relaxed text-ash">
              <span aria-hidden className="mt-1.5 size-1 flex-none rotate-45 bg-gold/70" />
              {item}
            </li>
          ))}
        </ul>

        <div className="mt-9 rule" />

        <div className="mt-8 flex flex-wrap items-center gap-3">
          <Button href={whatsappLink(whatsappMessage(data, estimate))}>
            Adiantar pelo WhatsApp
          </Button>
          <Button href={`mailto:${site.contact.email}`} variant="outline">
            Escrever por e-mail
          </Button>
          <button
            type="button"
            onClick={onRestart}
            className="link-underline ml-auto text-sm text-ash transition-colors hover:text-chalk"
          >
            Montar outro orçamento
          </button>
        </div>
      </div>
    </div>
  );
}
