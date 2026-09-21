"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import type { LeadDeliveryStatus, QuoteEstimate, QuoteRequest } from "@/types";
import { QuoteResult } from "./QuoteResult";

/**
 * Inspire AI — a porta de entrada conversacional do orçamento.
 *
 * Não importa nada de `lib/inspire-ai.ts` de propósito: aquele módulo lê
 * variáveis de ambiente do servidor e não tem por que ir para o bundle do
 * navegador. Este componente só fala com `/api/inspire-ai`.
 */

type Msg = { role: "user" | "assistant"; content: string };

const OPENING =
  "Oi! Me conta o que você quer criar. Pode ser em uma frase, do jeito que estiver na sua cabeça — eu puxo os detalhes daqui.";

const MAX_CHARS = 1200;

export function InspireAiChat({ onPreferForm }: { onPreferForm: () => void }) {
  const [messages, setMessages] = useState<Msg[]>([{ role: "assistant", content: OPENING }]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<{ data: QuoteRequest; estimate: QuoteEstimate; delivery: LeadDeliveryStatus } | null>(
    null,
  );

  const listRef = useRef<HTMLDivElement | null>(null);
  const inputRef = useRef<HTMLTextAreaElement | null>(null);

  useEffect(() => {
    listRef.current?.scrollTo({ top: listRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, sending]);

  const send = async () => {
    const clean = input.trim().slice(0, MAX_CHARS);
    if (!clean || sending) return;

    const next: Msg[] = [...messages, { role: "user", content: clean }];
    setMessages(next);
    setInput("");
    setError(null);
    setSending(true);

    try {
      const response = await fetch("/api/inspire-ai", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        // A primeira fala é da interface, não do modelo — não vai no histórico.
        body: JSON.stringify({ messages: next.slice(1) }),
      });

      const json = (await response.json()) as {
        ok?: boolean;
        done?: boolean;
        reply?: string;
        data?: QuoteRequest;
        estimate?: QuoteEstimate;
        error?: string;
        delivery?: LeadDeliveryStatus;
      };

      if (!response.ok || !json.ok) {
        setError(json.error ?? "Não consegui responder agora.");
        return;
      }

      if (json.reply) {
        setMessages((m) => [...m, { role: "assistant", content: json.reply! }]);
      }

      if (json.done && json.data && json.estimate) {
        setResult({ data: json.data, estimate: json.estimate, delivery: json.delivery ?? "failed" });
      }
    } catch {
      setError("Falha de conexão. Tenta de novo ou use o formulário.");
    } finally {
      setSending(false);
      inputRef.current?.focus();
    }
  };

  if (result) {
    return (
      <QuoteResult
        data={result.data}
        estimate={result.estimate}
        delivery={result.delivery}
        onRestart={() => {
          setResult(null);
          setMessages([{ role: "assistant", content: OPENING }]);
          setError(null);
        }}
      />
    );
  }

  return (
    <div className="panel overflow-hidden">
      <div aria-hidden className="grid-backdrop grid-backdrop--fine" />

      <div className="relative flex flex-col">
        {/* ── Cabeçalho ─────────────────────────────────────────────── */}
        <div className="flex items-center gap-3 border-b border-line px-6 py-4">
          <span className="relative grid size-8 flex-none place-items-center rounded-full border border-gold/45 bg-gold/10">
            <span aria-hidden className="size-1.5 rounded-full bg-gold-lum" />
          </span>
          <div className="min-w-0">
            <p className="font-display text-[0.95rem] font-semibold text-chalk">Inspire AI</p>
            <p className="hidden truncate text-xs text-ash sm:block">
              Conversa para montar seu briefing. O valor é calculado pelo estúdio.
            </p>
          </div>
          <button
            type="button"
            onClick={onPreferForm}
            className="link-underline ml-auto hidden flex-none text-xs text-ash transition-colors hover:text-chalk sm:block"
          >
            Prefiro o formulário
          </button>
        </div>

        {/* ── Conversa ──────────────────────────────────────────────── */}
        <div
          ref={listRef}
          className="chat-scroll flex max-h-[52vh] min-h-[280px] flex-col gap-4 overflow-y-auto px-6 py-6"
          role="log"
          aria-live="polite"
          aria-label="Conversa com a Inspire AI"
        >
          {messages.map((m, i) => (
            <div key={i} className={m.role === "user" ? "bubble bubble--me" : "bubble"}>
              {m.role === "assistant" ? (
                <span aria-hidden className="bubble__mark" />
              ) : null}
              <p className="whitespace-pre-wrap">{m.content}</p>
            </div>
          ))}

          {sending ? (
            <div className="bubble">
              <span aria-hidden className="bubble__mark" />
              <p className="text-ash">
                escrevendo
                <span className="animate-caret">▍</span>
              </p>
            </div>
          ) : null}
        </div>

        {/* ── Erro ──────────────────────────────────────────────────── */}
        {error ? (
          <div className="mx-6 mb-4 rounded-xl border border-[#F0A0A0]/30 bg-[#F0A0A0]/[0.07] px-4 py-3" role="alert">
            <p className="text-sm text-[#F0A0A0]">{error}</p>
            <button
              type="button"
              onClick={onPreferForm}
              className="link-underline mt-1.5 text-xs text-ash transition-colors hover:text-chalk"
            >
              Ir para o formulário
            </button>
          </div>
        ) : null}

        {/* ── Entrada ───────────────────────────────────────────────── */}
        <form
          className="border-t border-line px-6 py-5"
          onSubmit={(e) => {
            e.preventDefault();
            void send();
          }}
        >
          <label htmlFor="ai-input" className="sr-only">
            Sua mensagem
          </label>
          <div className="flex items-end gap-3">
            <textarea
              id="ai-input"
              ref={inputRef}
              rows={1}
              value={input}
              maxLength={MAX_CHARS}
              placeholder="Escreva aqui…"
              disabled={sending}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  void send();
                }
              }}
              className="input input--line mt-0 max-h-32 flex-1"
            />
            <Button type="submit" disabled={sending || !input.trim()} size="sm">
              Enviar
            </Button>
          </div>

          <p className="mt-3 text-[0.6875rem] leading-relaxed text-ash">
            Ao conversar, você concorda que a Inspire 3D use estas informações para orçar seu
            projeto, conforme a{" "}
            <Link href="/politica-de-privacidade" target="_blank" className="link-underline text-silver">
              Política de Privacidade
            </Link>
            . Não escreva dados sensíveis aqui.
          </p>
        </form>
      </div>
    </div>
  );
}
