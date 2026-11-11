"use client";

export function ReceiptPrintButton() {
  return <button type="button" className="admin-button admin-button--gold receipt-print-button" onClick={() => window.print()}>
    Imprimir ou salvar em PDF
  </button>;
}
