import { getAdminMovements } from "@/lib/admin-data";
import { formatCurrency, formatQuantity } from "@/features/admin/format";

export const dynamic = "force-dynamic";

export default async function MovimentacoesPage() {
  const movements = await getAdminMovements(100);
  return <div className="admin-stack">
    <header className="admin-page-heading"><div><p className="admin-kicker">Auditoria do estoque</p><h1>Movimentações.</h1><p>Cada entrada, baixa e produção deixa um registro rastreável.</p></div></header>
    <section className="admin-panel admin-panel--table"><div className="admin-panel__heading"><div><p className="admin-kicker">Livro-razão</p><h2>Atividade recente</h2></div><span className="admin-record-count">Últimas {movements.length}</span></div>
      {movements.length ? <div className="admin-table-wrap"><table className="admin-table"><thead><tr><th>Data e hora</th><th>Material</th><th>Tipo</th><th>Quantidade</th><th>Custo unitário</th><th>Referência</th></tr></thead><tbody>{movements.map((item) => <tr key={item.id}><td>{new Date(item.createdAt).toLocaleString("pt-BR", { dateStyle: "short", timeStyle: "short", timeZone: "America/Sao_Paulo" })}</td><td><strong>{item.materialName}</strong><small>{item.note}</small></td><td><span className="admin-pill">{item.kind}</span></td><td className={item.quantityDelta < 0 ? "admin-value-warning" : "admin-color-success"}>{item.quantityDelta > 0 ? "+" : ""}{formatQuantity(item.quantityDelta)} {item.unit}</td><td>{formatCurrency(item.unitCost)} / {item.unit}</td><td>{item.productName ?? "Ajuste manual"}</td></tr>)}</tbody></table></div> : <p className="admin-empty admin-empty--large">Ainda não há movimentações. Registre uma entrada ou faça a contagem de um material para começar.</p>}
    </section>
  </div>;
}
