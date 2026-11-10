"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";

export function AdminLoginForm({ configured }: { configured: boolean }) {
  const router = useRouter();
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); setError(""); setBusy(true);
    const form = new FormData(event.currentTarget);
    try {
      const response = await fetch("/api/admin/session", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: form.get("email"), password: form.get("password") }),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error ?? "Não foi possível entrar.");
      router.replace("/admin"); router.refresh();
    } catch (cause) { setError(cause instanceof Error ? cause.message : "Falha ao entrar."); }
    finally { setBusy(false); }
  }

  return (
    <main className="admin-login-page">
      <div aria-hidden className="admin-login-grid" />
      <section className="admin-login-card">
        <Link className="admin-brand admin-brand--login" href="/"><span className="admin-brand__mark">I</span><span>INSPIRE <b>3D</b><small>GESTÃO DE OPERAÇÕES</small></span></Link>
        <p className="admin-kicker">ACESSO RESTRITO</p>
        <h1>O estúdio, em ordem.</h1>
        <p className="admin-login-lead">Entre para gerir suas vendas, produtos, custos e materiais.</p>
        {!configured ? (
          <div className="admin-alert admin-alert--setup"><strong>Configure as credenciais do administrador.</strong><span>No modo local, preencha ADMIN_EMAIL, ADMIN_PASSWORD e ADMIN_SESSION_SECRET no arquivo .env.local. O banco local é criado automaticamente.</span></div>
        ) : (
          <form onSubmit={submit} className="admin-login-form">
            <label>E-mail<input className="input" name="email" type="email" autoComplete="username" required placeholder="seu@email.com" /></label>
            <label>Senha<input className="input" name="password" type="password" autoComplete="current-password" required /></label>
            {error ? <p className="admin-alert admin-alert--error" role="alert">{error}</p> : null}
            <button className="admin-button admin-button--gold admin-login-submit" disabled={busy}>{busy ? "Verificando acesso…" : "Entrar no painel →"}</button>
          </form>
        )}
        <Link href="/" className="admin-login-back">← Voltar ao site Inspire 3D</Link>
      </section>
      <p className="admin-login-caption">CATÁLOGO · MATERIAIS · PRODUÇÃO <i>·</i> INSPIRE 3D</p>
    </main>
  );
}
