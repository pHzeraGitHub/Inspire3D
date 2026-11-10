import { getImportedPurchases } from "@/lib/admin-data";
import { formatCurrency } from "@/features/admin/format";

export const dynamic = "force-dynamic";

export default async function ComprasPage() {
  const purchases = await getImportedPurchases();
  const byCategory = new Map<string, number>();
  for (const purchase of purchases) byCategory.set(purchase.category, (byCategory.get(purchase.category) ?? 0) + purchase.amount);
  return <div className="admin-stack">
    <header className="admin-page-heading"><div><p className="admin-kicker">Origem · Compras-Inspire3D-2026.xlsx</p><h1>Histórico de compras.</h1><p>Valores e parcelas importados da aba Compras, sem alterar a contagem do estoque.</p></div></header>
    <div className="admin-metrics admin-metrics--compact">{Array.from(byCategory, ([category, amount]) => <article className="admin-metric" key={category}><span>Investimento · {category}</span><strong>{formatCurrency(amount)}</strong><small>{purchases.filter((item) => item.category === category).length} aquisições</small></article>)}</div>
    <aside className="admin-callout"><span className="admin-callout__icon">i</span><div><h2>Histórico financeiro não é saldo físico.</h2><p>O arquivo não detalha os nomes dos insumos nem a quantidade comprada. Para calcular custo por grama/unidade e controlar consumo, cadastre o material e faça uma contagem atual. As compras importadas ficam aqui como referência.</p></div></aside>
    <section className="admin-panel admin-panel--table"><div className="admin-panel__heading"><div><p className="admin-kicker">{purchases.length} linhas · valores totais</p><h2>Aquisições registradas</h2></div><span className="admin-record-count">{formatCurrency(purchases.reduce((sum, item) => sum + item.amount, 0))}</span></div>
      <div className="admin-table-wrap"><table className="admin-table"><thead><tr><th>Compra</th><th>Categoria</th><th>Loja / pagamento</th><th>Valor total</th><th>Parcelas</th></tr></thead><tbody>{purchases.map((item) => <tr key={item.id}><td><strong>{item.description}</strong><small>{item.source}</small></td><td><span className="admin-pill">{item.category}</span></td><td>{item.store}<small>{item.card}</small></td><td><strong>{formatCurrency(item.amount)}</strong></td><td>{item.installments === 1 ? "À vista" : `${item.installments}×`}</td></tr>)}</tbody></table></div>
    </section>
  </div>;
}
