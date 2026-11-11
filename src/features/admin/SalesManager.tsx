"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState, type FormEvent } from "react";
import type { FinishedStockMovement, Fulfillment, SaleRecord, SaleStatus } from "@/lib/sales";
import { formatCurrency } from "@/features/admin/format";

type DraftItem = { productId: string; name: string; fulfillment: Fulfillment; quantity: string; unitPrice: string };
type ProductOption = { id: string; name: string; price: number | null; finishedStock: number };
type Draft = {
  customerName: string; customerContact: string; channel: string; paymentMethod: string;
  discount: string; shipping: string; notes: string; items: DraftItem[];
};

const newItem = (): DraftItem => ({ productId: "", name: "", fulfillment: "stock", quantity: "1", unitPrice: "" });
const newDraft = (): Draft => ({ customerName: "", customerContact: "", channel: "whatsapp",
  paymentMethod: "", discount: "0", shipping: "0", notes: "", items: [] });
const statusLabel: Record<SaleStatus, string> = {
  draft: "Rascunho", confirmed: "Confirmado", delivered: "Entregue", cancelled: "Cancelado",
};
const channelLabel: Record<string, string> = {
  whatsapp: "WhatsApp", instagram: "Instagram", site: "Site / orçamento", outro: "Outro",
};
const code = (id: string) => `VEN-${id.slice(0, 8).toUpperCase()}`;
const onlineStageLabel: Record<string, string> = { awaiting_payment: "Aguardando pagamento", queued: "Na fila de produção",
  production: "Em produção", quality: "Em conferência", packed: "Embalado", shipped: "Enviado", delivered: "Entregue", cancelled: "Cancelado" };
const nextOnlineAction: Record<string, string> = { queued: "Iniciar produção", production: "Enviar para conferência",
  quality: "Marcar embalado", packed: "Registrar envio", shipped: "Registrar entrega" };

export function SalesManager({ sales, products, reserved, stockMovements }: {
  sales: SaleRecord[]; products: ProductOption[]; reserved: Record<string, number>;
  stockMovements: FinishedStockMovement[];
}) {
  const router = useRouter();
  const [draft, setDraft] = useState<Draft>(newDraft);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formOpen, setFormOpen] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [filter, setFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [paymentMethods, setPaymentMethods] = useState<Record<string, string>>({});
  const [productionQty, setProductionQty] = useState<Record<string, string>>({});
  const [trackingCodes, setTrackingCodes] = useState<Record<string, string>>({});
  const [trackingUrls, setTrackingUrls] = useState<Record<string, string>>({});
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [productSearch, setProductSearch] = useState("");

  const selected = sales.find((sale) => sale.id === selectedId);
  const visible = useMemo(() => sales.filter((sale) => {
    if (filter !== "all" && sale.status !== filter) return false;
    const term = search.trim().toLocaleLowerCase("pt-BR");
    return !term || [sale.customerName, sale.customerContact, code(sale.id), ...sale.items.map((item) => item.name)]
      .some((value) => value.toLocaleLowerCase("pt-BR").includes(term));
  }), [sales, filter, search]);
  const subtotal = draft.items.reduce((sum, item) => sum + (Number(item.quantity) || 0) * (Number(item.unitPrice) || 0), 0);
  const total = Math.max(0, subtotal - (Number(draft.discount) || 0) + (Number(draft.shipping) || 0));
  const filteredProducts = products.filter((product) => product.name.toLocaleLowerCase("pt-BR")
    .includes(productSearch.trim().toLocaleLowerCase("pt-BR")));

  function addProduct(product: ProductOption) {
    const available = product.finishedStock - (reserved[product.id] ?? 0);
    setDraft((current) => {
      const inCartStock = current.items.filter((item) => item.productId === product.id && item.fulfillment === "stock")
        .reduce((sum, item) => sum + (Number(item.quantity) || 0), 0);
      const fulfillment: Fulfillment = available > inCartStock ? "stock" : "made_to_order";
      const existing = current.items.findIndex((item) => item.productId === product.id && item.fulfillment === fulfillment);
      if (existing >= 0) return { ...current, items: current.items.map((item, index) => index === existing
        ? { ...item, quantity: String(Number(item.quantity || 0) + 1) } : item) };
      if (current.items.length >= 20) return current;
      return { ...current, items: [...current.items, { productId: product.id, name: "", fulfillment,
        quantity: "1", unitPrice: product.price === null ? "" : String(product.price) }] };
    });
  }

  function updateItem(index: number, patch: Partial<DraftItem>) {
    setDraft((current) => ({ ...current, items: current.items.map((item, position) =>
      position === index ? { ...item, ...patch } : item) }));
  }

  function startNew() {
    setEditingId(null); setDraft(newDraft()); setFormOpen(true); setProductSearch("");
    setError(""); setNotice("");
  }

  function startEdit(sale: SaleRecord) {
    setEditingId(sale.id);
    setDraft({
      customerName: sale.customerName, customerContact: sale.customerContact, channel: sale.channel,
      paymentMethod: sale.paymentMethod, discount: String(sale.discount), shipping: String(sale.shipping),
      notes: sale.notes, items: sale.items.map((item) => ({ productId: item.productId ?? "",
        name: item.fulfillment === "custom" ? item.name : "", fulfillment: item.fulfillment,
        quantity: String(item.quantity), unitPrice: String(item.unitPrice) })),
    });
    setFormOpen(true); setSelectedId(null); setError(""); setNotice("");
    window.setTimeout(() => document.getElementById("nova-venda")?.scrollIntoView({ behavior: "smooth" }), 0);
  }

  async function request(url: string, method: string, body: object) {
    const response = await fetch(url, { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
    const data = await response.json();
    if (!response.ok) throw new Error(data.error ?? "Não foi possível concluir a operação.");
    return data;
  }

  async function save(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); setBusy(true); setError(""); setNotice("");
    const mode = (event.nativeEvent as SubmitEvent).submitter?.getAttribute("value") === "draft" ? "draft" : "confirm";
    try {
      const payload = { ...draft, discount: Number(draft.discount) || 0, shipping: Number(draft.shipping) || 0,
        items: draft.items.map((item) => ({ productId: item.fulfillment === "custom" ? null : item.productId,
          name: item.fulfillment === "custom" ? item.name : "", fulfillment: item.fulfillment,
          quantity: Number(item.quantity), unitPrice: Number(item.unitPrice) })) };
      const data = await request(editingId ? `/api/admin/sales/${editingId}` : "/api/admin/sales",
        editingId ? "PUT" : "POST", payload);
      setFormOpen(false); setEditingId(null); setDraft(newDraft()); setSelectedId(data.id);
      if (mode === "confirm") {
        try {
          await request(`/api/admin/sales/${data.id}`, "PATCH", { action: "confirm" });
          setNotice(`Venda ${code(data.id)} registrada. O cupom virtual está nos detalhes do pedido.`);
        } catch (cause) {
          setError(`Pedido ${code(data.id)} salvo como rascunho, mas não confirmado: ${cause instanceof Error ? cause.message : "tente novamente."}`);
        }
      } else {
        setNotice(`Pedido ${code(data.id)} salvo como rascunho.`);
      }
      router.refresh();
    } catch (cause) { setError(cause instanceof Error ? cause.message : "Falha ao salvar a venda."); }
    finally { setBusy(false); }
  }

  async function change(id: string, action: "confirm" | "deliver" | "cancel" | "paid" | "refunded") {
    if (action === "deliver" && !window.confirm("Registrar a entrega e baixar os produtos do estoque?")) return;
    if (action === "cancel" && !window.confirm("Cancelar este pedido? A reserva será liberada.")) return;
    setBusy(true); setError(""); setNotice("");
    try {
      await request(`/api/admin/sales/${id}`, "PATCH", { action, paymentMethod: paymentMethods[id] ?? selected?.paymentMethod ?? "" });
      setNotice(`Pedido ${code(id)} atualizado.`); router.refresh();
    } catch (cause) { setError(cause instanceof Error ? cause.message : "Falha ao atualizar a venda."); }
    finally { setBusy(false); }
  }

  async function produce(sale: SaleRecord, item: SaleRecord["items"][number]) {
    const remaining = item.quantity - item.producedQuantity;
    const quantity = Number(productionQty[item.id] || remaining);
    if (!Number.isInteger(quantity) || quantity < 1 || quantity > remaining) {
      setError(`Informe de 1 a ${remaining} unidade(s) para esta encomenda.`); return;
    }
    setBusy(true); setError(""); setNotice("");
    try {
      await request("/api/admin/production", "POST", { productId: item.productId, saleId: sale.id, quantity });
      setNotice(`${quantity} unidade(s) produzida(s) para ${code(sale.id)}. Materiais baixados do estoque.`);
      setProductionQty((current) => ({ ...current, [item.id]: "" })); router.refresh();
    } catch (cause) { setError(cause instanceof Error ? cause.message : "Falha ao produzir a encomenda."); }
    finally { setBusy(false); }
  }

  async function advanceOnline(sale: SaleRecord) {
    setBusy(true); setError(""); setNotice("");
    try {
      await request(`/api/admin/sales/${sale.id}/online`, "PATCH", {
        trackingCode: trackingCodes[sale.id] ?? "", trackingUrl: trackingUrls[sale.id] ?? "",
      });
      setNotice(`Etapa de ${code(sale.id)} atualizada. O cliente já pode ver na linha do tempo.`);
      router.refresh();
    } catch (cause) { setError(cause instanceof Error ? cause.message : "Falha ao atualizar a etapa."); }
    finally { setBusy(false); }
  }

  return <div className="admin-stack">
    <header className="admin-page-heading">
      <div><p className="admin-kicker">Pedidos · estoque · recebimentos</p><h1>Vendas do estúdio.</h1>
        <p>Registre pedidos recebidos por WhatsApp, Instagram e pelo site. O estoque acompanha a confirmação e a entrega.</p></div>
      <button type="button" className="admin-button admin-button--gold" onClick={startNew}>+ Nova venda</button>
    </header>

    {error ? <div className="admin-alert admin-alert--error" role="alert">{error}</div> : null}
    {notice ? <div className="admin-alert admin-alert--success" role="status">{notice}</div> : null}

    <div className="admin-metrics">
      <article className="admin-metric"><span>Pedidos confirmados</span><strong>{sales.filter((sale) => sale.status === "confirmed").length}</strong><small>Aguardando entrega</small></article>
      <article className="admin-metric"><span>Vendas entregues</span><strong>{sales.filter((sale) => sale.status === "delivered").length}</strong><small>Baixadas do estoque</small></article>
      <article className="admin-metric"><span>Recebido</span><strong>{formatCurrency(sales.filter((sale) => sale.paymentStatus === "paid").reduce((sum, sale) => sum + sale.total, 0))}</strong><small>Pedidos marcados como pagos</small></article>
      <article className="admin-metric"><span>A produzir</span><strong>{sales.filter((sale) => sale.status === "confirmed").flatMap((sale) => sale.items).filter((item) => item.fulfillment === "made_to_order").reduce((sum, item) => sum + Math.max(0, item.quantity - item.producedQuantity), 0)}</strong><small>Unidades sob encomenda</small></article>
    </div>

    {formOpen ? <section className="admin-panel" id="nova-venda">
      <div className="admin-panel__heading"><div><p className="admin-kicker">{editingId ? "Editar pedido" : "Venda rápida"}</p><h2>Monte a venda como um cardápio.</h2><p>Toque nos produtos para adicionar. O total e o cupom são atualizados enquanto você preenche.</p></div>
        <button className="admin-text-button" type="button" onClick={() => setFormOpen(false)}>Fechar</button></div>
      <form className="admin-menu-layout" onSubmit={save}>
        <div className="admin-menu-products">
          <label className="admin-menu-search">Buscar no catálogo<input className="input" type="search" value={productSearch} onChange={(event) => setProductSearch(event.target.value)} placeholder="Nome do produto" /></label>
          <div className="admin-menu-grid">
            {filteredProducts.map((product) => {
              const available = product.finishedStock - (reserved[product.id] ?? 0);
              return <button className="admin-menu-product" type="button" key={product.id} onClick={() => addProduct(product)} disabled={draft.items.length >= 20}>
                <span className="admin-menu-product__icon" aria-hidden>◈</span>
                <strong>{product.name}</strong>
                <small>{available > 0 ? `${available} pronta(s) para entrega` : "Produção sob encomenda"}</small>
                <span>{product.price === null ? "Defina o preço no pedido" : formatCurrency(product.price)} <b aria-hidden>＋</b></span>
              </button>;
            })}
          </div>
          {!filteredProducts.length ? <p className="admin-empty">Nenhum produto encontrado. Você pode incluir um item personalizado.</p> : null}
          <button type="button" className="admin-button admin-button--outline" onClick={() => setDraft((current) => ({ ...current, items: [...current.items, { ...newItem(), fulfillment: "custom" }] }))} disabled={draft.items.length >= 20}>+ Item personalizado ou serviço</button>
        </div>
        <div className="admin-menu-cart">
          <div className="admin-panel__heading"><div><p className="admin-kicker">Cupom virtual · prévia</p><h3>Pedido atual</h3></div><strong>{draft.items.length} item(ns)</strong></div>
          {draft.items.length ? <div className="admin-menu-lines">{draft.items.map((item, index) => {
            const product = products.find((row) => row.id === item.productId);
            return <div className="admin-menu-line" key={index}>
              {item.fulfillment === "custom" ? <label>Descrição<input className="input" required maxLength={160} value={item.name} onChange={(event) => updateItem(index, { name: event.target.value })} placeholder="Descrição do item" /></label> : <strong>{product?.name ?? "Produto"}</strong>}
              <div className="admin-menu-line__fields">
                <label>Entrega<select className="input" value={item.fulfillment} onChange={(event) => updateItem(index, { fulfillment: event.target.value as Fulfillment })}>
                  {item.fulfillment === "custom" ? <option value="custom">Personalizado</option> : <><option value="stock">Pronta entrega</option><option value="made_to_order">Sob encomenda</option></>}</select></label>
                <label>Qtd.<input className="input" type="number" required min="1" max="10000" step="1" value={item.quantity} onChange={(event) => updateItem(index, { quantity: event.target.value })} /></label>
                <label>R$ / un.<input className="input" type="number" required min="0" step="0.01" value={item.unitPrice} onChange={(event) => updateItem(index, { unitPrice: event.target.value })} /></label>
              </div>
              <div className="admin-menu-line__bottom"><span>{formatCurrency((Number(item.quantity) || 0) * (Number(item.unitPrice) || 0))}</span><button type="button" className="admin-text-button admin-text-button--danger" onClick={() => setDraft((current) => ({ ...current, items: current.items.filter((_, position) => position !== index) }))}>Remover</button></div>
            </div>;
          })}</div> : <p className="admin-empty admin-empty--compact">Escolha um produto no cardápio para começar.</p>}
          <div className="admin-menu-adjustments">
            <label>Desconto (R$)<input className="input" type="number" min="0" step="0.01" value={draft.discount} onChange={(event) => setDraft({ ...draft, discount: event.target.value })} /></label>
            <label>Frete (R$)<input className="input" type="number" min="0" step="0.01" value={draft.shipping} onChange={(event) => setDraft({ ...draft, shipping: event.target.value })} /></label>
          </div>
          <div className="admin-menu-totals"><span>Subtotal <b>{formatCurrency(subtotal)}</b></span><span>Desconto <b>− {formatCurrency(Number(draft.discount) || 0)}</b></span><span>Frete <b>{formatCurrency(Number(draft.shipping) || 0)}</b></span><strong>Total <b>{formatCurrency(total)}</b></strong></div>
          <div className="admin-menu-customer">
            <h3>Cliente e pagamento</h3>
            <label>Nome do cliente<input className="input" required maxLength={120} value={draft.customerName} onChange={(event) => setDraft({ ...draft, customerName: event.target.value })} placeholder="Nome para o pedido" /></label>
            <label>Contato<input className="input" maxLength={180} value={draft.customerContact} onChange={(event) => setDraft({ ...draft, customerContact: event.target.value })} placeholder="WhatsApp ou e-mail" /></label>
            <div className="admin-menu-adjustments"><label>Canal<select className="input" value={draft.channel} onChange={(event) => setDraft({ ...draft, channel: event.target.value })}><option value="whatsapp">WhatsApp</option><option value="instagram">Instagram</option><option value="site">Site / orçamento</option><option value="outro">Outro</option></select></label>
              <label>Pagamento<input className="input" maxLength={80} value={draft.paymentMethod} onChange={(event) => setDraft({ ...draft, paymentMethod: event.target.value })} placeholder="Pix, cartão, dinheiro…" /></label></div>
            <label>Observações<textarea className="input" maxLength={1000} value={draft.notes} onChange={(event) => setDraft({ ...draft, notes: event.target.value })} placeholder="Prazo combinado ou personalização" /></label>
          </div>
          <div className="admin-menu-actions"><button className="admin-button admin-button--gold" type="submit" value="confirm" disabled={busy || !draft.items.length}>{busy ? "Salvando…" : "Registrar venda"}</button>
            <button className="admin-button admin-button--outline" type="submit" value="draft" disabled={busy || !draft.items.length}>Salvar rascunho</button></div>
          <p className="admin-footnote">O comprovante para impressão fica disponível após registrar a venda. Itens em estoque são reservados na confirmação.</p>
        </div>
      </form>
    </section> : null}

    <section className="admin-panel admin-panel--table">
      <div className="admin-panel__heading"><div><p className="admin-kicker">Histórico comercial</p><h2>Pedidos registrados</h2></div><span className="admin-record-count">{sales.length} pedidos</span></div>
      <div className="admin-sale-filters">
        <input className="input" aria-label="Buscar pedido" placeholder="Buscar cliente, produto ou número" value={search} onChange={(e) => setSearch(e.target.value)} />
        <select className="input" aria-label="Filtrar status" value={filter} onChange={(e) => setFilter(e.target.value)}><option value="all">Todos</option><option value="draft">Rascunhos</option><option value="confirmed">Confirmados</option><option value="delivered">Entregues</option><option value="cancelled">Cancelados</option></select>
      </div>
      {visible.length ? <div className="admin-table-wrap"><table className="admin-table"><thead><tr><th>Pedido</th><th>Cliente</th><th>Canal</th><th>Status</th><th>Pagamento</th><th>Total</th><th><span className="sr-only">Ações</span></th></tr></thead><tbody>
        {visible.map((sale) => <tr key={sale.id}><td><strong>{code(sale.id)}</strong><small>{new Date(sale.createdAt).toLocaleString("pt-BR", { dateStyle: "short", timeStyle: "short", timeZone: "America/Sao_Paulo" })}</small></td><td><strong>{sale.customerName}</strong><small>{sale.items.length} item(ns)</small></td><td>{channelLabel[sale.channel] ?? sale.channel}</td><td><span className={`admin-pill ${sale.status === "delivered" ? "admin-pill--success" : ""}`}>{statusLabel[sale.status]}</span></td><td>{sale.paymentStatus === "paid" ? "Pago" : sale.paymentStatus === "refunded" ? "Estornado" : "Pendente"}</td><td><strong>{formatCurrency(sale.total)}</strong></td><td><button type="button" className="admin-text-button admin-color-gold" onClick={() => setSelectedId(selectedId === sale.id ? null : sale.id)}>{selectedId === sale.id ? "Fechar" : "Detalhes"}</button></td></tr>)}
      </tbody></table></div> : <div className="admin-empty admin-empty--large"><span>▣</span><h3>{sales.length ? "Nenhum pedido encontrado." : "Registre sua primeira venda."}</h3><p>Pedidos de WhatsApp, Instagram e orçamentos ficam reunidos aqui.</p>{!sales.length ? <button className="admin-button admin-button--gold" onClick={startNew}>Criar pedido</button> : null}</div>}
    </section>

    {selected ? <section className="admin-panel admin-panel--gold" id="detalhe-venda">
      <div className="admin-panel__heading"><div><p className="admin-kicker">{code(selected.id)} · {channelLabel[selected.channel] ?? selected.channel}</p><h2>{selected.customerName}</h2><p>{selected.customerContact || "Contato não informado"}</p></div><span className="admin-pill">{statusLabel[selected.status]}</span></div>
      <div className="admin-sale-lines">{selected.items.map((item) => <div key={item.id} className="admin-sale-line">
        <div><strong>{item.name}</strong><small>{item.fulfillment === "stock" ? "Pronta entrega" : item.fulfillment === "made_to_order" ? `Sob encomenda · ${item.producedQuantity}/${item.quantity} produzida(s)` : "Personalizado / serviço"}</small>{Object.entries(item.options).map(([key, value]) => value ? <small key={key}>{key}: {value}</small> : null)}</div>
        <span>{item.quantity} × {formatCurrency(item.unitPrice)}</span><strong>{formatCurrency(item.quantity * item.unitPrice)}</strong>
        {selected.status === "confirmed" && item.fulfillment === "made_to_order" && item.productId && item.producedQuantity < item.quantity ?
          <div className="admin-sale-production"><input className="admin-qty-input" type="number" min="1" max={item.quantity - item.producedQuantity} aria-label={`Quantidade a produzir de ${item.name}`} placeholder={String(item.quantity - item.producedQuantity)} value={productionQty[item.id] ?? ""} onChange={(e) => setProductionQty({ ...productionQty, [item.id]: e.target.value })} />
            <button type="button" className="admin-button admin-button--outline" disabled={busy} onClick={() => void produce(selected, item)}>Produzir para pedido</button></div> : null}
      </div>)}</div>
      <div className="admin-sale-summary"><span>Subtotal {formatCurrency(selected.subtotal)} · desconto {formatCurrency(selected.discount)} · frete {formatCurrency(selected.shipping)}</span><strong>Total {formatCurrency(selected.total)}</strong></div>
      <Link className="admin-button admin-button--outline" href={`/admin/vendas/${selected.id}/cupom`} target="_blank" rel="noopener noreferrer">Abrir cupom virtual ↗</Link>
      <p className="admin-footnote">Pagamento: {selected.paymentStatus === "paid" ? "pago" : selected.paymentStatus === "refunded" ? "estornado" : "pendente"}{selected.paymentMethod ? ` · ${selected.paymentMethod}` : ""}. {selected.notes ? `Observações: ${selected.notes}` : ""}</p>
      {selected.onlineStage ? <div className="admin-online-stage"><strong>Compra pelo site · {onlineStageLabel[selected.onlineStage] ?? selected.onlineStage}</strong>
        <p>Cada avanço aparece na linha do tempo do cliente.</p>
        <p>Frete contratado pelo cliente: {selected.shippingCarrier} · {selected.shippingMethod}{selected.shippingServiceId ? ` (serviço ${selected.shippingServiceId})` : ""}.</p>
        {selected.shippingAddress ? <p>Destino: {selected.shippingAddress.street}, {selected.shippingAddress.number}{selected.shippingAddress.complement ? `, ${selected.shippingAddress.complement}` : ""} · {selected.shippingAddress.neighborhood}, {selected.shippingAddress.city}/{selected.shippingAddress.state} · CEP {selected.shippingAddress.postalCode}.</p> : null}
        <p>Origem das etiquetas: empresa em Contagem/MG, CEP 32235-225. Postagens: segunda, terça e quinta.</p>
        {selected.onlineStage === "packed" ? <div className="admin-menu-adjustments"><label>Código de rastreio<input className="input" value={trackingCodes[selected.id] ?? selected.trackingCode} onChange={(e) => setTrackingCodes({ ...trackingCodes, [selected.id]: e.target.value })} placeholder="Código da transportadora" /></label>
          <label>Link de rastreio (opcional)<input className="input" type="url" value={trackingUrls[selected.id] ?? ""} onChange={(e) => setTrackingUrls({ ...trackingUrls, [selected.id]: e.target.value })} placeholder="https://..." /></label></div> : null}
        {nextOnlineAction[selected.onlineStage] ? <button className="admin-button admin-button--gold" type="button" disabled={busy} onClick={() => void advanceOnline(selected)}>{nextOnlineAction[selected.onlineStage]} →</button> : null}
      </div> : null}
      {selected.status === "cancelled" && selected.paymentStatus === "paid" ? <p className="admin-alert admin-alert--error">O pagamento ainda consta como recebido. Faça o estorno no meio de pagamento e depois marque o estorno aqui.</p> : null}
      {selected.items.every((item) => item.unitCostEstimate !== null) ? <p className="admin-footnote">Margem estimada dos itens, após desconto: {formatCurrency(selected.subtotal - selected.discount - selected.items.reduce((sum, item) => sum + item.quantity * (item.unitCostEstimate ?? 0), 0))}. Não inclui custo real do frete.</p> : null}
      <div className="admin-sale-actions">
        {selected.status === "draft" && !selected.onlineStage ? <><button className="admin-button admin-button--outline" onClick={() => startEdit(selected)}>Editar rascunho</button><button className="admin-button admin-button--gold" disabled={busy} onClick={() => void change(selected.id, "confirm")}>Confirmar pedido</button></> : null}
        {selected.status === "confirmed" && !selected.onlineStage ? <button className="admin-button admin-button--gold" disabled={busy} onClick={() => void change(selected.id, "deliver")}>Registrar entrega e baixar estoque</button> : null}
        {!selected.onlineStage && (["confirmed", "delivered"] as SaleStatus[]).includes(selected.status) && selected.paymentStatus === "pending" ? <div className="admin-sale-payment"><input className="input" aria-label="Forma de pagamento recebida" placeholder="Pix, cartão, dinheiro…" value={paymentMethods[selected.id] ?? selected.paymentMethod} onChange={(e) => setPaymentMethods({ ...paymentMethods, [selected.id]: e.target.value })} /><button className="admin-button admin-button--outline" disabled={busy} onClick={() => void change(selected.id, "paid")}>Marcar pago</button></div> : null}
        {(["draft", "confirmed"] as SaleStatus[]).includes(selected.status) && !(selected.onlineStage && selected.status === "draft") ? <button className="admin-text-button admin-text-button--danger" disabled={busy} onClick={() => void change(selected.id, "cancel")}>Cancelar pedido</button> : null}
        {selected.status === "cancelled" && selected.paymentStatus === "paid" ? <button className="admin-button admin-button--outline" disabled={busy} onClick={() => void change(selected.id, "refunded")}>Marcar estorno realizado</button> : null}
        {selected.status === "confirmed" && selected.items.some((item) => item.fulfillment === "made_to_order") ? <Link className="admin-text-button" href="/admin/produtos">Ver fichas técnicas ↗</Link> : null}
      </div>
    </section> : null}
    <section className="admin-panel admin-panel--table">
      <div className="admin-panel__heading"><div><p className="admin-kicker">Rastro de produtos acabados</p><h2>Produções e entregas recentes</h2></div><span className="admin-record-count">Últimas 40 movimentações</span></div>
      {stockMovements.length ? <div className="admin-table-wrap"><table className="admin-table"><thead><tr><th>Data</th><th>Produto</th><th>Movimentação</th><th>Quantidade</th><th>Pedido</th></tr></thead><tbody>
        {stockMovements.map((movement) => <tr key={movement.id}><td>{new Date(movement.createdAt).toLocaleString("pt-BR", { dateStyle: "short", timeStyle: "short", timeZone: "America/Sao_Paulo" })}</td><td><strong>{movement.productName}</strong><small>{movement.note}</small></td><td>{movement.kind === "production" ? "Produção" : "Entrega"}</td><td className={movement.quantityDelta < 0 ? "admin-value-warning" : "admin-color-success"}>{movement.quantityDelta > 0 ? "+" : ""}{movement.quantityDelta} un.</td><td>{movement.saleId ? code(movement.saleId) : "—"}</td></tr>)}
      </tbody></table></div> : <p className="admin-empty">As próximas produções e entregas vão aparecer aqui.</p>}
    </section>
  </div>;
}
