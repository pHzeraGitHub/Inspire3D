import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { PageIntro } from "@/components/layout/PageIntro";
import { Container } from "@/components/ui/Container";
import { OrderRefresh } from "@/features/checkout/OrderRefresh";
import { getOnlineOrder, reconcileMercadoPagoMerchantOrder, reconcileMercadoPagoPayment } from "@/lib/commerce";
import { getMercadoPagoMerchantOrder, getMercadoPagoPayment } from "@/lib/mercado-pago";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Acompanhar pedido | Inspire 3D", robots: { index: false, follow: false } };

const currency = (value: number) => new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(value);
const date = (value: string) => new Date(value).toLocaleString("pt-BR", { dateStyle: "medium", timeStyle: "short", timeZone: "America/Sao_Paulo" });
const stages = [
  { id: "queued", title: "Pagamento aprovado", detail: "Pedido enviado para produção" },
  { id: "production", title: "Produção", detail: "Sua peça está sendo produzida" },
  { id: "quality", title: "Conferência", detail: "Acabamento e qualidade" },
  { id: "packed", title: "Embalagem", detail: "Pedido pronto para envio" },
  { id: "shipped", title: "Enviado", detail: "Acompanhe a entrega" },
  { id: "delivered", title: "Entregue", detail: "Pedido concluído" },
];

export default async function PedidoPage({ params, searchParams }: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ chave?: string; payment_id?: string; collection_id?: string; merchant_order_id?: string }>;
}) {
  const { id } = await params;
  const query = await searchParams;
  const token = query.chave ?? "";
  let order = await getOnlineOrder(id, token);
  if (!order) notFound();
  const paymentId = query.payment_id ?? query.collection_id;
  if (order.paymentStatus === "pending" && paymentId && /^\d{1,30}$/.test(paymentId)) {
    try {
      const payment = await getMercadoPagoPayment(paymentId);
      if (payment.external_reference === id) {
        await reconcileMercadoPagoPayment(payment);
        order = await getOnlineOrder(id, token) ?? order;
      }
    } catch (error) { console.error("Payment return check:", error); }
  }
  if (order.paymentStatus === "pending" && query.merchant_order_id && /^\d{1,30}$/.test(query.merchant_order_id)) {
    try {
      const merchantOrder = await getMercadoPagoMerchantOrder(query.merchant_order_id);
      if (merchantOrder.external_reference === id) {
        await reconcileMercadoPagoMerchantOrder(merchantOrder);
        order = await getOnlineOrder(id, token) ?? order;
      }
    } catch (error) { console.error("Merchant order return check:", error); }
  }
  const stageIndex = stages.findIndex((stage) => stage.id === order.stage);
  return <><PageIntro eyebrow={`Pedido ${order.code}`} title="Acompanhe cada etapa." description={`Olá, ${order.customerName}. Esta é a situação atual da sua compra.`} />
    <section className="pb-(--spacing-section)"><Container><div className="order-layout">
      <div className="panel p-6 md:p-8">
        {order.paymentStatus === "pending" ? <div className="order-payment-note"><OrderRefresh /><strong>Aguardando confirmação do pagamento</strong><p>Se você acabou de pagar, esta página será atualizada automaticamente.</p>{order.paymentCheckoutUrl ? <a href={order.paymentCheckoutUrl} className="mt-3 inline-block text-sm text-gold underline" rel="noopener noreferrer">Voltar ao pagamento seguro ↗</a> : null}</div> : null}
        {order.paymentStatus === "refunded" ? <div className="order-payment-note"><strong>Pagamento estornado</strong><p>Entre em contato com o estúdio se precisar de ajuda.</p></div> : null}
        <p className="eyebrow">Linha do tempo</p><h2 className="mt-3 font-display text-2xl text-chalk">Do pagamento à entrega</h2>
        {order.estimatedProductionAt && order.paymentStatus === "paid" ? <div className="mt-3 space-y-2 text-sm text-silver">
          <p>Produção prevista até <strong className="text-gold">{date(order.estimatedProductionAt)}</strong>.</p>
          {order.estimatedDeliveryAt ? <p>Entrega inicial estimada: <strong className="text-gold">{date(order.estimatedDeliveryAt)}</strong>. Consideramos a primeira segunda, terça ou quinta após a produção como possível postagem; o prazo pode mudar conforme a coleta da transportadora.</p> : null}
        </div> : null}
        <ol className="order-timeline mt-8">{stages.map((stage, index) => <li key={stage.id} className={stageIndex >= index ? "is-complete" : ""}>
          <span aria-hidden>{stageIndex > index ? "✓" : index + 1}</span><div><strong>{stage.title}</strong><small>{stage.detail}</small></div>
        </li>)}</ol>
        {order.trackingCode ? <div className="order-tracking"><strong>Código de rastreio: {order.trackingCode}</strong>{order.trackingUrl ? <a href={order.trackingUrl} target="_blank" rel="noopener noreferrer" className="text-gold underline">Rastrear envio ↗</a> : null}</div> : null}
        {order.events.length ? <div className="mt-8 border-t border-line pt-6"><h3 className="font-display text-lg text-chalk">Atualizações</h3><ul className="mt-4 space-y-4">{order.events.map((event, index) => <li key={`${event.createdAt}-${index}`} className="text-sm text-silver"><strong className="block text-chalk">{event.title}</strong><span>{date(event.createdAt)}{event.detail ? ` · ${event.detail}` : ""}</span></li>)}</ul></div> : null}
      </div>
      <aside className="panel p-6 md:p-7"><p className="eyebrow">Cupom virtual · não fiscal</p><h2 className="mt-2 font-display text-xl text-chalk">{order.code}</h2><p className="mt-1 text-xs text-ash">Criado em {date(order.createdAt)}</p>
        <div className="mt-6 space-y-4">{order.items.map((item, index) => <div key={index} className="flex justify-between gap-3 text-sm text-silver"><span>{item.quantity} × {item.name}{Object.entries(item.options).map(([key, value]) => value ? <small className="block text-ash" key={key}>{key}: {value}</small> : null)}</span><strong className="text-chalk">{currency(item.quantity * item.unitPrice)}</strong></div>)}</div>
        <div className="checkout-prices mt-6"><span>Subtotal <b>{currency(order.subtotal)}</b></span><span>Frete <b>{currency(order.shipping)}</b></span><strong>Total <b>{currency(order.total)}</b></strong></div>
        <p className="mt-4 text-xs text-silver">Entrega: {order.shippingCarrier} · {order.shippingMethod} · {order.shippingDeliveryDays} dias úteis de transporte após postagem.</p>
        <p className="mt-6 text-xs leading-relaxed text-ash">Entrega: {order.address.street}, {order.address.number}{order.address.complement ? `, ${order.address.complement}` : ""} · {order.address.neighborhood}, {order.address.city}/{order.address.state} · CEP {order.address.postalCode}</p>
        <p className="mt-4 text-xs text-ash">Guarde o endereço desta página para acompanhar seu pedido.</p>
        <Link href="/produtos" className="link-underline mt-6 inline-block text-sm text-gold">Voltar aos produtos ↗</Link>
      </aside>
    </div></Container></section></>;
}
