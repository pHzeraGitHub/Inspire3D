import { notFound } from "next/navigation";
import { ReceiptPrintButton } from "@/features/admin/ReceiptPrintButton";
import { formatCurrency } from "@/features/admin/format";
import { getAdminSales, saleCode } from "@/lib/sales";

export const dynamic = "force-dynamic";

export default async function CupomPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const sale = (await getAdminSales()).find((item) => item.id === id);
  if (!sale) notFound();
  const createdAt = new Date(sale.createdAt).toLocaleString("pt-BR", {
    dateStyle: "short", timeStyle: "short", timeZone: "America/Sao_Paulo",
  });

  return <div className="receipt-page">
    <div className="receipt-tools"><p>Confira o cupom antes de imprimir. Na impressora térmica, selecione papel de 80 mm.</p><ReceiptPrintButton /></div>
    <article className="receipt-paper" aria-label={`Comprovante ${saleCode(sale.id)}`}>
      <header><strong>INSPIRE 3D</strong><span>COMPROVANTE DE VENDA</span><small>Documento não fiscal</small></header>
      <div className="receipt-divider" />
      <dl><div><dt>Pedido</dt><dd>{saleCode(sale.id)}</dd></div><div><dt>Data</dt><dd>{createdAt}</dd></div>
        <div><dt>Cliente</dt><dd>{sale.customerName}</dd></div>
        {sale.customerContact ? <div><dt>Contato</dt><dd>{sale.customerContact}</dd></div> : null}
        <div><dt>Pagamento</dt><dd>{sale.paymentStatus === "paid" ? `Pago${sale.paymentMethod ? ` · ${sale.paymentMethod}` : ""}` : "Pendente"}</dd></div></dl>
      <div className="receipt-divider" />
      <div className="receipt-items">{sale.items.map((item) => <div key={item.id}><strong>{item.name}</strong>{Object.entries(item.options).map(([key, value]) => value ? <small key={key}>{key}: {value}</small> : null)}<span>{item.quantity} × {formatCurrency(item.unitPrice)} <b>{formatCurrency(item.quantity * item.unitPrice)}</b></span></div>)}</div>
      <div className="receipt-divider" />
      <dl className="receipt-totals"><div><dt>Subtotal</dt><dd>{formatCurrency(sale.subtotal)}</dd></div>
        {sale.discount > 0 ? <div><dt>Desconto</dt><dd>− {formatCurrency(sale.discount)}</dd></div> : null}
        {sale.shipping > 0 ? <div><dt>Frete</dt><dd>{formatCurrency(sale.shipping)}</dd></div> : null}
        <div><dt>TOTAL</dt><dd>{formatCurrency(sale.total)}</dd></div></dl>
      {sale.notes ? <><div className="receipt-divider" /><p className="receipt-notes">Obs.: {sale.notes}</p></> : null}
      <footer><p>Obrigado por escolher a Inspire 3D.</p><small>Este comprovante não substitui nota fiscal.</small></footer>
    </article>
  </div>;
}
