"use client";

import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import type { MaterialRecord } from "@/lib/admin-data";
import { formatCurrency, formatQuantity } from "@/features/admin/format";
import { ImportWorkbook } from "@/features/admin/ImportWorkbook";

const units = ["g", "kg", "ml", "l", "un", "cm", "m", "folha", "rolo", "caixa"];

export function MaterialManager({ materials }: { materials: MaterialRecord[] }) {
  const router = useRouter();
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<MaterialRecord | null>(null);
  const [movementFor, setMovementFor] = useState<MaterialRecord | null>(null);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [busy, setBusy] = useState(false);

  async function submitMaterial(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); setError(""); setNotice(""); setBusy(true);
    const data = new FormData(event.currentTarget);
    const payload = {
      name: String(data.get("name") ?? "").trim(), sku: String(data.get("sku") ?? "").trim(),
      category: String(data.get("category") ?? "").trim(), unit: String(data.get("unit") ?? ""),
      quantity: Number(data.get("quantity") ?? 0), unitCost: Number(data.get("unitCost") ?? 0),
      minimumQuantity: Number(data.get("minimumQuantity") ?? 0),
    };
    try {
      const response = await fetch(editing ? `/api/admin/materials/${editing.id}` : "/api/admin/materials", {
        method: editing ? "PATCH" : "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error ?? "Não foi possível salvar o insumo.");
      setNotice(editing ? "Material atualizado." : "Material cadastrado."); setEditing(null); setFormOpen(false); router.refresh();
    } catch (cause) { setError(cause instanceof Error ? cause.message : "Falha ao salvar."); }
    finally { setBusy(false); }
  }

  async function submitMovement(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); if (!movementFor) return;
    setError(""); setNotice(""); setBusy(true);
    const data = new FormData(event.currentTarget);
    const payload = { materialId: movementFor.id, kind: String(data.get("kind")), quantity: Number(data.get("quantity")), unitCost: data.get("unitCost") === "" ? undefined : Number(data.get("unitCost")), note: String(data.get("note") ?? "") };
    try {
      const response = await fetch("/api/admin/stock-movements", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error ?? "Não foi possível registrar a movimentação.");
      setNotice("Estoque atualizado e movimentação registrada no histórico."); setMovementFor(null); router.refresh();
    } catch (cause) { setError(cause instanceof Error ? cause.message : "Falha ao registrar."); }
    finally { setBusy(false); }
  }

  async function toggleArchive(material: MaterialRecord) {
    setError(""); setNotice("");
    try {
      const response = await fetch(`/api/admin/materials/${material.id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ archived: !material.archived }) });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error ?? "Não foi possível atualizar o material.");
      setNotice(material.archived ? "Material reativado." : "Material arquivado. Ele deixa de aparecer nas novas fichas técnicas."); router.refresh();
    } catch (cause) { setError(cause instanceof Error ? cause.message : "Falha ao atualizar."); }
  }

  const active = materials.filter((item) => !item.archived);
  const editingForm = editing ?? null;

  return (
    <div className="admin-stack">
      <header className="admin-page-heading">
        <div><p className="admin-kicker">Inventário · matéria-prima</p><h1>Materiais e insumos.</h1><p>Saldo físico, custo médio e um histórico claro para cada movimentação.</p></div>
        <button className="admin-button admin-button--gold" type="button" onClick={() => { setEditing(null); setFormOpen((value) => !value); setMovementFor(null); }}>+ Cadastrar material</button>
      </header>

      <div className="admin-inline-metrics"><span><strong>{active.length}</strong> materiais ativos</span><span><strong>{active.filter((item) => item.quantity <= item.minimumQuantity).length}</strong> no mínimo ou abaixo</span><span><strong>{formatCurrency(active.reduce((sum, item) => sum + item.quantity * item.unitCost, 0))}</strong> em estoque contado</span></div>

      {error ? <p className="admin-alert admin-alert--error" role="alert">{error}</p> : null}
      {notice ? <p className="admin-alert admin-alert--success" role="status">{notice}</p> : null}
      <ImportWorkbook context="materiais" />

      {formOpen ? (
        <section className="admin-panel" id="novo-material">
          <div className="admin-panel__heading"><div><p className="admin-kicker">{editingForm ? "Editar cadastro" : "Novo cadastro"}</p><h2>{editingForm ? editingForm.name : "Adicionar um material"}</h2></div><button className="admin-text-button" type="button" onClick={() => { setFormOpen(false); setEditing(null); }}>Fechar</button></div>
          <form className="admin-form" onSubmit={submitMaterial} key={editingForm?.id ?? "novo-material"}>
            <div className="admin-form-grid">
              <label>Nome do material<input className="input" name="name" required maxLength={120} defaultValue={editingForm?.name ?? ""} placeholder="PLA preto fosco" /></label>
              <label>SKU / código interno<input className="input" name="sku" maxLength={80} defaultValue={editingForm?.sku ?? ""} placeholder="PLA-PRETO-01" /></label>
              <label>Categoria<input className="input" name="category" required maxLength={80} defaultValue={editingForm?.category ?? ""} placeholder="Filamento, resina, embalagem…" /></label>
              <label>Unidade base<select className="input" name="unit" defaultValue={editingForm?.unit ?? "g"}>{units.map((unit) => <option key={unit} value={unit}>{unit}</option>)}</select></label>
              {!editingForm ? <label>Saldo inicial<input className="input" name="quantity" type="number" min="0" step="0.001" defaultValue="0" /><small className="admin-field-hint">Use 0 se ainda vai fazer a contagem.</small></label> : null}
              {!editingForm ? <label>Custo por unidade base (R$)<input className="input" name="unitCost" type="number" min="0" step="0.0001" defaultValue="0" /><small className="admin-field-hint">Ex.: custo por grama ou por unidade.</small></label> : <label>Custo médio por unidade base (R$)<input className="input" name="unitCost" type="number" min="0" step="0.0001" defaultValue={editingForm.unitCost} /></label>}
              <label>Alerta de estoque mínimo<input className="input" name="minimumQuantity" type="number" min="0" step="0.001" defaultValue={editingForm?.minimumQuantity ?? "0"} /></label>
            </div>
            <div className="admin-form__actions"><button disabled={busy} className="admin-button admin-button--gold" type="submit">{busy ? "Salvando…" : editingForm ? "Salvar alterações" : "Cadastrar material"}</button><span>Custos com até 4 casas decimais para calcular corretamente o consumo.</span></div>
          </form>
        </section>
      ) : null}

      {movementFor ? (
        <section className="admin-panel admin-panel--gold" id="movimentar-material">
          <div className="admin-panel__heading"><div><p className="admin-kicker">Movimentação de estoque</p><h2>{movementFor.name}</h2><p>Saldo atual: {formatQuantity(movementFor.quantity)} {movementFor.unit} · custo médio {formatCurrency(movementFor.unitCost)}/{movementFor.unit}</p></div><button className="admin-text-button" type="button" onClick={() => setMovementFor(null)}>Fechar</button></div>
          <form className="admin-form" onSubmit={submitMovement}>
            <div className="admin-form-grid admin-form-grid--movement">
              <label>Tipo<select className="input" name="kind"><option value="entrada">Entrada de compra</option><option value="saida">Baixa / perda</option><option value="contagem">Definir saldo contado</option></select></label>
              <label>Quantidade<input className="input" name="quantity" type="number" min="0" step="0.001" required placeholder="0" /></label>
              <label>Custo unitário da entrada (R$)<input className="input" name="unitCost" type="number" min="0" step="0.0001" placeholder={movementFor.unitCost.toFixed(4)} /><small className="admin-field-hint">Obrigatório para entrada; vazio mantém o custo médio.</small></label>
              <label>Observação<input className="input" name="note" maxLength={400} placeholder="Fornecedor, lote, ajuste de inventário…" /></label>
            </div>
            <div className="admin-form__actions"><button disabled={busy} className="admin-button admin-button--gold" type="submit">{busy ? "Registrando…" : "Registrar movimentação"}</button><span>Saídas acima do saldo disponível são bloqueadas.</span></div>
          </form>
        </section>
      ) : null}

      <section className="admin-panel admin-panel--table">
        <div className="admin-panel__heading"><div><p className="admin-kicker">Cadastro ativo</p><h2>Seu estoque</h2></div><span className="admin-record-count">{active.length} materiais</span></div>
        {active.length ? <div className="admin-table-wrap"><table className="admin-table"><thead><tr><th>Material</th><th>Categoria</th><th>Saldo</th><th>Custo médio</th><th>Estoque mínimo</th><th><span className="sr-only">Ações</span></th></tr></thead><tbody>
          {active.map((material) => {
            const low = material.quantity <= material.minimumQuantity;
            return <tr key={material.id}><td><strong>{material.name}</strong><small>{material.sku || "Sem SKU"} · por {material.unit}</small></td><td>{material.category}</td><td><strong className={low ? "admin-value-warning" : ""}>{formatQuantity(material.quantity)} {material.unit}</strong>{low ? <small className="admin-warning-label">Abaixo do mínimo</small> : null}</td><td>{formatCurrency(material.unitCost)}<small>por {material.unit}</small></td><td>{formatQuantity(material.minimumQuantity)} {material.unit}</td><td><div className="admin-row-actions"><button type="button" onClick={() => { setMovementFor(material); setFormOpen(false); }}>Movimentar</button><button type="button" onClick={() => { setEditing(material); setFormOpen(true); setMovementFor(null); }}>Editar</button><button className="admin-row-actions__muted" type="button" onClick={() => void toggleArchive(material)}>Arquivar</button></div></td></tr>;
          })}
        </tbody></table></div> : <div className="admin-empty admin-empty--large"><span>◈</span><h3>Seu inventário começa aqui.</h3><p>Cadastre um material e informe unidade, saldo contado e custo. Depois, adicione cada um à ficha técnica dos produtos.</p><button type="button" className="admin-button admin-button--gold" onClick={() => setFormOpen(true)}>Cadastrar primeiro material</button></div>}
      </section>

      {materials.some((item) => item.archived) ? <details className="admin-archived"><summary>Materiais arquivados ({materials.filter((item) => item.archived).length})</summary><ul>{materials.filter((item) => item.archived).map((item) => <li key={item.id}><span>{item.name} · {item.category}</span><button type="button" onClick={() => void toggleArchive(item)}>Reativar</button></li>)}</ul></details> : null}
    </div>
  );
}
