"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import type { QuoteEstimate, QuoteRequest } from "@/types";
import { FinishSample } from "@/components/visuals/FinishSample";
import { estimateQuote } from "@/lib/quote";
import { FileUpload } from "./FileUpload";
import { OptionGroup } from "./OptionGroup";
import { QuoteResult } from "./QuoteResult";
import {
  categoryOptions,
  deadlineOptions,
  finishOptions,
  modelingOptions,
  pathOptions,
  sizeOptions,
  technologyOptions,
} from "./options";

type Draft = Partial<QuoteRequest>;
type Errors = Partial<Record<keyof QuoteRequest | "form", string>>;

const STEPS = ["O projeto", "A peça", "Você"] as const;

const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

export function QuoteWizard() {
  const [step, setStep] = useState(0);
  const [draft, setDraft] = useState<Draft>({
    technology: "indefinido",
    quantity: 1,
    consent: false,
  });
  const [files, setFiles] = useState<File[]>([]);
  const [errors, setErrors] = useState<Errors>({});
  const [sending, setSending] = useState(false);
  const [result, setResult] = useState<{ data: QuoteRequest; estimate: QuoteEstimate } | null>(null);
  /** Honeypot: bot preenche, humano não vê. */
  const honeypot = useRef<HTMLInputElement>(null);
  const topRef = useRef<HTMLDivElement>(null);

  const set = <K extends keyof QuoteRequest>(key: K, value: QuoteRequest[K]) => {
    setDraft((d) => ({ ...d, [key]: value }));
    setErrors((e) => ({ ...e, [key]: undefined, form: undefined }));
  };

  const scrollTop = () =>
    topRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });

  /* ── Provas de acabamento ──────────────────────────────────────────
     A mesma peça nos quatro tratamentos. Responde visualmente o que o
     texto não responde: o que muda de um acabamento para o outro.     */
  const finishVisuals = Object.fromEntries(
    finishOptions.map((o) => [o.value, <FinishSample key={o.value} level={o.value} />]),
  ) as Partial<Record<QuoteRequest["finish"], React.ReactNode>>;

  /* ── Quanto cada acabamento soma, ao vivo ──────────────────────────
     O tamanho já foi escolhido neste ponto, então dá para calcular de
     verdade. É a promessa da página: "você entende o que muda o preço
     enquanto responde". Só aparece com a tabela calibrada.            */
  const finishMeta = (() => {
    if (!draft.size) return undefined;
    const at = (finish: QuoteRequest["finish"]) =>
      estimateQuote({ ...draft, finish, quantity: Number(draft.quantity) || 1 }).price;

    const base = at("bruto");
    if (!base) return undefined;

    return Object.fromEntries(
      finishOptions.map((o) => {
        const price = at(o.value);
        const delta = price ? price.min - base.min : 0;
        return [
          o.value,
          delta <= 0 ? "incluso" : `+ R$ ${delta.toLocaleString("pt-BR")}`,
        ];
      }),
    ) as Partial<Record<QuoteRequest["finish"], React.ReactNode>>;
  })();

  /* ── Validação por passo ───────────────────────────────────────────── */
  const validateStep = (index: number): Errors => {
    const e: Errors = {};
    if (index === 0 && !draft.path) e.path = "Escolha por onde começar.";
    if (index === 1) {
      if (!draft.category) e.category = "Escolha a categoria.";
      if (!draft.description || draft.description.trim().length < 15)
        e.description = "Conte um pouco mais — pelo menos uma frase completa.";
      if (!draft.size) e.size = "Escolha o tamanho aproximado.";
      if (!draft.finish) e.finish = "Escolha o acabamento.";
      if (!draft.modeling) e.modeling = "Diga se já tem o arquivo.";
      if (!draft.deadline) e.deadline = "Escolha o prazo desejado.";
      const q = Number(draft.quantity);
      if (!Number.isInteger(q) || q < 1 || q > 10000)
        e.quantity = "Quantidade entre 1 e 10.000.";
    }
    if (index === 2) {
      if (!draft.name || draft.name.trim().length < 2) e.name = "Informe seu nome.";
      if (!draft.email || !emailRe.test(draft.email.trim())) e.email = "E-mail inválido.";
      if (!draft.consent) e.consent = "Precisamos do seu aceite para tratar os dados.";
    }
    return e;
  };

  const next = () => {
    const e = validateStep(step);
    setErrors(e);
    if (Object.keys(e).length) return;
    setStep((s) => s + 1);
    scrollTop();
  };

  const back = () => {
    setErrors({});
    setStep((s) => Math.max(0, s - 1));
    scrollTop();
  };

  /* ── Envio ─────────────────────────────────────────────────────────── */
  const submit = async () => {
    const e = validateStep(2);
    setErrors(e);
    if (Object.keys(e).length) return;

    setSending(true);
    try {
      const form = new FormData();
      form.append(
        "payload",
        JSON.stringify({
          ...draft,
          quantity: Number(draft.quantity) || 1,
          // honeypot vai junto para o servidor decidir
          _gotcha: honeypot.current?.value ?? "",
        }),
      );
      files.forEach((file) => form.append("files", file));

      const response = await fetch("/api/quote", { method: "POST", body: form });
      const json = (await response.json()) as {
        ok?: boolean;
        estimate?: QuoteEstimate;
        data?: QuoteRequest;
        error?: string;
        fields?: Record<string, string>;
      };

      if (!response.ok || !json.ok || !json.estimate || !json.data) {
        setErrors({
          ...(json.fields as Errors),
          form: json.error ?? "Não consegui enviar agora. Tente de novo ou chame no WhatsApp.",
        });
        return;
      }

      setResult({ data: json.data, estimate: json.estimate });
      scrollTop();
    } catch {
      setErrors({
        form: "Falha de conexão. Tente de novo ou chame no WhatsApp — o estúdio responde igual.",
      });
    } finally {
      setSending(false);
    }
  };

  if (result) {
    return (
      <div ref={topRef} className="scroll-mt-32">
        <QuoteResult
          data={result.data}
          estimate={result.estimate}
          onRestart={() => {
            setResult(null);
            setDraft({ technology: "indefinido", quantity: 1, consent: false });
            setFiles([]);
            setStep(0);
            setErrors({});
            scrollTop();
          }}
        />
      </div>
    );
  }

  return (
    <div ref={topRef} className="scroll-mt-32">
      {/* ── Progresso ───────────────────────────────────────────────── */}
      <ol className="flex flex-wrap items-center gap-x-7 gap-y-3">
        {STEPS.map((label, i) => (
          <li
            key={label}
            className="step-dot"
            data-state={i === step ? "current" : i < step ? "done" : "todo"}
          >
            <span className="step-dot__mark">
              {i < step ? (
                <svg viewBox="0 0 16 16" aria-hidden className="size-3" fill="none">
                  <path
                    d="m4 8.2 2.6 2.6L12 5.4"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              ) : (
                String(i + 1).padStart(2, "0")
              )}
            </span>
            {label}
          </li>
        ))}
      </ol>

      <div className="mt-7 panel p-6 md:p-9">
        <div aria-hidden className="grid-backdrop grid-backdrop--fine" />

        <form
          className="relative"
          onSubmit={(event) => {
            event.preventDefault();
            if (step < STEPS.length - 1) next();
            else void submit();
          }}
          noValidate
        >
          {/* honeypot — invisível para gente, irresistível para bot */}
          <input
            ref={honeypot}
            type="text"
            name="_gotcha"
            tabIndex={-1}
            autoComplete="off"
            aria-hidden
            className="pointer-events-none absolute left-[-9999px] size-0 opacity-0"
          />

          {/* ── Passo 1 ──────────────────────────────────────────────── */}
          {step === 0 ? (
            <div className="space-y-2">
              <h2 className="font-display text-2xl font-semibold text-chalk md:text-3xl">
                O que você quer criar?
              </h2>
              <p className="max-w-xl text-[0.95rem] leading-relaxed text-ash">
                Não precisa saber de material nem de tecnologia. Escolha o que mais se parece com
                a sua situação hoje.
              </p>
              <div className="pt-6">
                <OptionGroup
                  name="path"
                  legend="Ponto de partida"
                  options={pathOptions}
                  value={draft.path ?? null}
                  onChange={(v) => set("path", v)}
                  error={errors.path}
                />
              </div>
            </div>
          ) : null}

          {/* ── Passo 2 ──────────────────────────────────────────────── */}
          {step === 1 ? (
            <div className="space-y-9">
              <div className="space-y-2">
                <h2 className="font-display text-2xl font-semibold text-chalk md:text-3xl">
                  Sobre a peça.
                </h2>
                <p className="max-w-xl text-[0.95rem] leading-relaxed text-ash">
                  Quanto mais concreto, mais precisa fica a estimativa. Se não souber alguma
                  coisa, escolha a opção que diz isso — ninguém é obrigado a saber.
                </p>
              </div>

              <OptionGroup
                name="category"
                legend="Categoria"
                options={categoryOptions}
                value={draft.category ?? null}
                onChange={(v) => set("category", v)}
                columns={3}
                error={errors.category}
              />

              <div>
                <label htmlFor="description" className="field-label">
                  Descreva o projeto
                </label>
                <p className="field-hint">
                  O que é, para quem é, e qualquer referência que ajude a imaginar.
                </p>
                <textarea
                  id="description"
                  className="input"
                  placeholder="Ex.: um busto do personagem do meu RPG, uns 15 cm, bem detalhado e pintado. Tenho desenhos de referência."
                  value={draft.description ?? ""}
                  maxLength={4000}
                  aria-invalid={Boolean(errors.description)}
                  onChange={(e) => set("description", e.target.value)}
                />
                {errors.description ? (
                  <p className="field-error" role="alert">
                    {errors.description}
                  </p>
                ) : null}
              </div>

              <OptionGroup
                name="size"
                legend="Tamanho aproximado"
                options={sizeOptions}
                value={draft.size ?? null}
                onChange={(v) => set("size", v)}
                error={errors.size}
              />

              <div className="grid gap-6 sm:grid-cols-2">
                <div>
                  <label htmlFor="dimensions" className="field-label">
                    Dimensões (opcional)
                  </label>
                  <input
                    id="dimensions"
                    type="text"
                    className="input"
                    placeholder="18 × 9 × 9 cm"
                    maxLength={120}
                    value={draft.dimensions ?? ""}
                    onChange={(e) => set("dimensions", e.target.value)}
                  />
                </div>
                <div>
                  <label htmlFor="quantity" className="field-label">
                    Quantidade
                  </label>
                  <input
                    id="quantity"
                    type="number"
                    inputMode="numeric"
                    min={1}
                    max={10000}
                    className="input"
                    value={draft.quantity ?? 1}
                    aria-invalid={Boolean(errors.quantity)}
                    onChange={(e) => set("quantity", Number(e.target.value))}
                  />
                  {errors.quantity ? (
                    <p className="field-error" role="alert">
                      {errors.quantity}
                    </p>
                  ) : null}
                </div>
              </div>

              <OptionGroup
                name="modeling"
                legend="Você já tem o arquivo 3D?"
                options={modelingOptions}
                value={draft.modeling ?? null}
                onChange={(v) => set("modeling", v)}
                columns={3}
                error={errors.modeling}
              />

              <OptionGroup
                name="finish"
                legend="Acabamento"
                hint="A mesma peça, quatro tratamentos. É aqui que o preço mais muda."
                options={finishOptions}
                value={draft.finish ?? null}
                onChange={(v) => set("finish", v)}
                columns={4}
                visuals={finishVisuals}
                meta={finishMeta}
                footnote={
                  finishMeta
                    ? "Ilustração — acréscimo sobre a peça escolhida, antes da análise técnica"
                    : "Ilustração — as peças reais podem variar conforme a geometria"
                }
                error={errors.finish}
              />

              <OptionGroup
                name="technology"
                legend="Tecnologia"
                hint="Se não souber, deixe com a gente — é o mais comum."
                options={technologyOptions}
                value={draft.technology ?? "indefinido"}
                onChange={(v) => set("technology", v)}
                columns={3}
              />

              <OptionGroup
                name="deadline"
                legend="Prazo desejado"
                options={deadlineOptions}
                value={draft.deadline ?? null}
                onChange={(v) => set("deadline", v)}
                error={errors.deadline}
              />

              <FileUpload files={files} onChange={setFiles} />
            </div>
          ) : null}

          {/* ── Passo 3 ──────────────────────────────────────────────── */}
          {step === 2 ? (
            <div className="space-y-9">
              <div className="space-y-2">
                <h2 className="font-display text-2xl font-semibold text-chalk md:text-3xl">
                  Como falamos com você?
                </h2>
                <p className="max-w-xl text-[0.95rem] leading-relaxed text-ash">
                  Só o necessário para responder. Nada de cadastro.
                </p>
              </div>

              <div className="grid gap-6 sm:grid-cols-2">
                <div>
                  <label htmlFor="name" className="field-label">
                    Nome *
                  </label>
                  <input
                    id="name"
                    type="text"
                    autoComplete="name"
                    className="input"
                    maxLength={120}
                    value={draft.name ?? ""}
                    aria-invalid={Boolean(errors.name)}
                    onChange={(e) => set("name", e.target.value)}
                  />
                  {errors.name ? (
                    <p className="field-error" role="alert">
                      {errors.name}
                    </p>
                  ) : null}
                </div>

                <div>
                  <label htmlFor="email" className="field-label">
                    E-mail *
                  </label>
                  <input
                    id="email"
                    type="email"
                    autoComplete="email"
                    className="input"
                    maxLength={180}
                    value={draft.email ?? ""}
                    aria-invalid={Boolean(errors.email)}
                    onChange={(e) => set("email", e.target.value)}
                  />
                  {errors.email ? (
                    <p className="field-error" role="alert">
                      {errors.email}
                    </p>
                  ) : null}
                </div>

                <div>
                  <label htmlFor="phone" className="field-label">
                    WhatsApp
                  </label>
                  <input
                    id="phone"
                    type="tel"
                    autoComplete="tel"
                    className="input"
                    placeholder="(31) 99999-0000"
                    maxLength={40}
                    value={draft.phone ?? ""}
                    onChange={(e) => set("phone", e.target.value)}
                  />
                </div>

                <div>
                  <label htmlFor="company" className="field-label">
                    Empresa (se for o caso)
                  </label>
                  <input
                    id="company"
                    type="text"
                    autoComplete="organization"
                    className="input"
                    maxLength={140}
                    value={draft.company ?? ""}
                    onChange={(e) => set("company", e.target.value)}
                  />
                </div>
              </div>

              <div>
                <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-line bg-void/40 p-4">
                  <input
                    type="checkbox"
                    className="mt-0.5 size-4 flex-none accent-[#D4A437]"
                    checked={Boolean(draft.consent)}
                    aria-invalid={Boolean(errors.consent)}
                    onChange={(e) => set("consent", e.target.checked)}
                  />
                  <span className="text-[0.875rem] leading-relaxed text-silver">
                    Autorizo a Inspire 3D a usar estes dados e arquivos para analisar e orçar o meu
                    projeto, conforme a{" "}
                    <Link
                      href="/politica-de-privacidade"
                      className="link-underline text-chalk"
                      target="_blank"
                    >
                      Política de Privacidade
                    </Link>
                    .
                  </span>
                </label>
                {errors.consent ? (
                  <p className="field-error" role="alert">
                    {errors.consent}
                  </p>
                ) : null}
              </div>
            </div>
          ) : null}

          {/* ── Erro geral ───────────────────────────────────────────── */}
          {errors.form ? (
            <p
              className="mt-8 rounded-xl border border-[#F0A0A0]/30 bg-[#F0A0A0]/[0.07] px-4 py-3 text-sm text-[#F0A0A0]"
              role="alert"
            >
              {errors.form}
            </p>
          ) : null}

          {/* ── Navegação ────────────────────────────────────────────── */}
          <div className="mt-10 flex flex-wrap items-center gap-3 border-t border-line pt-7">
            {step > 0 ? (
              <button
                type="button"
                onClick={back}
                className="link-underline text-sm text-ash transition-colors hover:text-chalk"
              >
                Voltar
              </button>
            ) : null}

            <div className="ml-auto flex items-center gap-4">
              <span className="font-mono text-[0.6875rem] uppercase tracking-[0.16em] text-ash">
                Passo {step + 1} de {STEPS.length}
              </span>
              <Button type="submit" disabled={sending}>
                {sending
                  ? "Enviando…"
                  : step < STEPS.length - 1
                    ? "Continuar"
                    : "Enviar e ver a estimativa"}
              </Button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
