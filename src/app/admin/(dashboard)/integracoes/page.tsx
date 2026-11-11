import Link from "next/link";
import { melhorEnvioAuthorizationStatus, melhorEnvioOAuthConfigured } from "@/lib/melhor-envio-oauth";

export const dynamic = "force-dynamic";

export default async function IntegracoesPage({ searchParams }: { searchParams: Promise<{ status?: string }> }) {
  const [{ status }, shipping] = await Promise.all([searchParams, melhorEnvioAuthorizationStatus()]);
  const ready = melhorEnvioOAuthConfigured();
  return <div className="admin-stack">
    <header className="admin-page-heading"><div><p className="admin-kicker">Loja online · Inspire 3D</p>
      <h1>Integrações.</h1><p>Conecte a cotação de frete do checkout.</p></div></header>
    <section className="admin-panel">
      <div className="admin-panel__heading"><div><p className="admin-kicker">Melhor Envio</p><h2>Cotação por CEP</h2></div></div>
      {status === "conectado" ? <p>Conta conectada. O site poderá consultar preços e prazos de entrega.</p> : null}
      {status === "erro" ? <p>Não foi possível concluir a autorização. Tente conectar novamente.</p> : null}
      {status === "configuracao" ? <p>Cadastre o ID e o segredo do aplicativo do Melhor Envio no Railway.</p> : null}
      <p>{shipping.connected ? "Conta conectada" : "Aguardando autorização"}{shipping.expiresAt ? ` · token atual válido até ${new Date(shipping.expiresAt).toLocaleDateString("pt-BR", { timeZone: "America/Sao_Paulo" })}` : ""}.</p>
      {ready ? <Link className="admin-button admin-button--gold" href="/api/admin/integrations/melhorenvio/start">
        {shipping.connected ? "Reconectar Melhor Envio" : "Conectar Melhor Envio"}</Link> : <p>O aplicativo ainda precisa ser configurado no servidor.</p>}
      <p>Esta conexão solicita apenas permissão para calcular frete. A compra de etiquetas permanece no painel do Melhor Envio.</p>
    </section>
  </div>;
}
