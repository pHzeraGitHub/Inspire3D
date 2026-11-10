import Link from "next/link";
import { getAdminOverview } from "@/lib/admin-data";
import { formatCurrency, formatQuantity } from "@/features/admin/format";
import { getSalesOverview } from "@/lib/sales";

export const dynamic = "force-dynamic";

export default async function AdminDashboard() {
  const [overview, sales] = await Promise.all([getAdminOverview(), getSalesOverview()]);
  return (
    <div className="admin-stack">
      <header className="admin-page-heading">
        <div>
          <p className="admin-kicker">Visão geral · Inspire 3D</p>
          <h1>Estúdio em números.</h1>
          <p>Custos, matérias-primas e catálogo em um só lugar.</p>
        </div>
        <Link className="admin-button admin-button--gold" href="/admin/produtos#novo-produto">+ Novo produto</Link>
      </header>

      <div className="admin-metrics">
        <article className="admin-metric"><span>Vendas recebidas</span><strong>{formatCurrency(sales.receivedTotal)}</strong><small>Pedidos marcados como pagos</small></article>
        <article className="admin-metric"><span>Pedidos em andamento</span><strong>{sales.openOrders}</strong><small>Confirmados e ainda não entregues</small></article>
        <article className="admin-metric"><span>Valor em compras importadas</span><strong>{formatCurrency(overview.totalPurchases)}</strong><small>Máquinas e materiais · planilha 2026</small></article>
        <article className="admin-metric"><span>Investido em materiais</span><strong>{formatCurrency(overview.materialPurchases)}</strong><small>Insumos + filamentos · histórico de compras</small></article>
        <article className="admin-metric"><span>Valor do estoque contado</span><strong>{formatCurrency(overview.stockValue)}</strong><small>Saldo físico × custo médio</small></article>
        <article className="admin-metric"><span>Produtos no catálogo</span><strong>{overview.publishedCount}<small className="admin-metric__suffix"> / {overview.productCount}</small></strong><small>Publicados / cadastrados</small></article>
      </div>

      <section className="admin-callout">
        <span className="admin-callout__icon">i</span>
        <div>
          <h2>Próxima etapa: contar os insumos</h2>
          <p>A planilha informa os valores das compras, mas não lista os materiais nem suas quantidades. Cadastre cada material com a unidade e o saldo físico atual para que a ficha técnica calcule custos e a produção desconte o estoque com segurança.</p>
          <Link href="/admin/materiais">Cadastrar e contar materiais <span aria-hidden>↗</span></Link>
        </div>
        <div className="admin-callout__count"><strong>{overview.needsInventoryCount}</strong><span>itens sem saldo contado</span></div>
      </section>

      <div className="admin-grid-two">
        <section className="admin-panel">
          <div className="admin-panel__heading"><div><p className="admin-kicker">Atenção de estoque</p><h2>Reposição</h2></div><Link href="/admin/materiais">Ver materiais ↗</Link></div>
          {overview.lowStock.length ? (
            <ul className="admin-stock-list">
              {overview.lowStock.map((material) => <li key={material.id}><span><strong>{material.name}</strong><small>{material.category}</small></span><span className="admin-stock-list__qty">{formatQuantity(material.quantity)} {material.unit}<small>Mínimo: {formatQuantity(material.minimumQuantity)}</small></span></li>)}
            </ul>
          ) : <p className="admin-empty">Nenhum material precisa de reposição.</p>}
        </section>
        <section className="admin-panel">
          <div className="admin-panel__heading"><div><p className="admin-kicker">Rastro do estoque</p><h2>Movimentações recentes</h2></div><Link href="/admin/movimentacoes">Histórico ↗</Link></div>
          {overview.movements.length ? (
            <ul className="admin-stock-list">
              {overview.movements.map((movement) => <li key={movement.id}><span><strong>{movement.materialName}</strong><small>{movement.note || movement.kind}</small></span><span className={`admin-movement-amount ${movement.quantityDelta < 0 ? "is-negative" : ""}`}>{movement.quantityDelta > 0 ? "+" : ""}{formatQuantity(movement.quantityDelta)} {movement.unit}</span></li>)}
            </ul>
          ) : <p className="admin-empty">As entradas, contagens e produções vão aparecer aqui.</p>}
        </section>
      </div>

      <section className="admin-panel admin-panel--purchase-note">
        <div><p className="admin-kicker">Importação concluída</p><h2>Compras da planilha já estão no histórico.</h2><p>Foram importados {overview.purchaseCount} registros de aquisição, preservando a divisão entre máquinas, insumos e filamentos. Esse valor não altera as quantidades do estoque.</p></div>
        <Link className="admin-button admin-button--outline" href="/admin/compras">Ver compras importadas</Link>
      </section>
    </div>
  );
}
