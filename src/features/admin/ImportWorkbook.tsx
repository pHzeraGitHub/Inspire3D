"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";

type ImportResult = {
  materialsCreated: number;
  materialsSkipped: number;
  productsCreated: number;
  productsUpdated: number;
  recipesUpdated: number;
  variantsUpdated: number;
};

export function ImportWorkbook({ context }: { context: "materiais" | "produtos" }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [details, setDetails] = useState<string[]>([]);
  const [result, setResult] = useState<ImportResult | null>(null);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    setBusy(true); setError(""); setDetails([]); setResult(null);
    try {
      const response = await fetch("/api/admin/import", { method: "POST", body: new FormData(form) });
      const data = await response.json();
      if (!response.ok) {
        setError(data.error ?? "Não foi possível importar a planilha.");
        setDetails(Array.isArray(data.details) ? data.details : []);
        return;
      }
      setResult(data as ImportResult);
      form.reset();
      router.refresh();
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Falha ao importar a planilha.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <section className="admin-panel admin-import-panel">
      <div className="admin-panel__heading">
        <div>
          <p className="admin-kicker">Carga em lote · {context}</p>
          <h2>Importar pela planilha</h2>
          <p>Use o mesmo modelo para materiais, produtos e fichas técnicas. O arquivo é validado antes de qualquer alteração.</p>
        </div>
        <a className="admin-button admin-button--outline" href="/modelos/Modelo_Importacao_Inspire3D.xlsx" download>
          Baixar modelo Excel
        </a>
      </div>
      <form className="admin-import-form" onSubmit={submit}>
        <label className="admin-import-file">Arquivo .xlsx<input name="workbook" type="file" accept=".xlsx,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" required /></label>
        <button className="admin-button admin-button--gold" type="submit" disabled={busy}>{busy ? "Validando e importando…" : "Validar e importar"}</button>
      </form>
      <p className="admin-field-hint">Materiais com SKU já cadastrado são ignorados, sem alterar saldos. Produtos com o mesmo slug são atualizados. A importação não publica produtos automaticamente.</p>
      {error ? <div className="admin-alert admin-alert--error" role="alert"><strong>{error}</strong>{details.length ? <ul className="admin-import-errors">{details.map((detail, index) => <li key={`${index}-${detail}`}>{detail}</li>)}</ul> : null}</div> : null}
      {result ? <p className="admin-alert admin-alert--success" role="status">
        Importação concluída: {result.materialsCreated} materiais novos; {result.materialsSkipped} SKUs existentes ignorados; {result.productsCreated} produtos criados; {result.productsUpdated} atualizados; {result.recipesUpdated} fichas técnicas vinculadas; {result.variantsUpdated} produtos com variações atualizadas.
      </p> : null}
    </section>
  );
}
