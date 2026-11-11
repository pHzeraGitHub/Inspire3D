"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import type { ReactNode } from "react";

const links = [
  { href: "/admin", label: "Visão geral", icon: "◫" },
  { href: "/admin/materiais", label: "Materiais", icon: "◈" },
  { href: "/admin/produtos", label: "Produtos", icon: "◇" },
  { href: "/admin/vendas", label: "Vendas", icon: "▣" },
  { href: "/admin/integracoes", label: "Integrações", icon: "↔" },
  { href: "/admin/movimentacoes", label: "Movimentações", icon: "↗" },
  { href: "/admin/compras", label: "Compras", icon: "▤" },
];

export function AdminShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();

  async function logout() {
    await fetch("/api/admin/session", { method: "DELETE" });
    router.replace("/admin/login");
    router.refresh();
  }

  return (
    <div className="admin-app">
      <aside className="admin-sidebar">
        <Link className="admin-brand" href="/admin"><span className="admin-brand__mark">I</span><span>INSPIRE <b>3D</b><small>PAINEL DO ESTÚDIO</small></span></Link>
        <p className="admin-nav-label">OPERAÇÃO</p>
        <nav aria-label="Navegação administrativa" className="admin-nav">
          {links.map((link) => {
            const active = link.href === "/admin" ? pathname === link.href : pathname.startsWith(link.href);
            return <Link key={link.href} href={link.href} className={active ? "is-active" : ""}><span aria-hidden>{link.icon}</span>{link.label}{active ? <i aria-hidden /> : null}</Link>;
          })}
        </nav>
        <div className="admin-sidebar__bottom"><span className="admin-status-dot" /> Sistema de gestão <small>VENDAS + ESTOQUE</small></div>
      </aside>

      <div className="admin-main">
        <header className="admin-topbar">
          <Link href="/" className="admin-back-link">← Ver site público</Link>
          <div><span className="admin-topbar__live"><i /> Ambiente seguro</span><button type="button" className="admin-logout" onClick={logout}>Sair ↗</button></div>
        </header>
        <div className="admin-mobile-nav" aria-label="Navegação administrativa">
          {links.map((link) => <Link key={link.href} href={link.href} aria-current={pathname === link.href ? "page" : undefined}>{link.label}</Link>)}
        </div>
        <div className="admin-content">{children}</div>
        <footer className="admin-footer"><span>INSPIRE 3D <i>·</i> GESTÃO DE OPERAÇÕES</span><span>VENDAS, ESTOQUE E PRODUTOS</span></footer>
      </div>
    </div>
  );
}
