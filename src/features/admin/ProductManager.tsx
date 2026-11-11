"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState, type FormEvent } from "react";
import type { AdminProductRecord, MaterialRecord } from "@/lib/admin-data";
import { formatCurrency, formatQuantity } from "@/features/admin/format";
import { ImportWorkbook } from "@/features/admin/ImportWorkbook";

type Draft = {
  name: string; slug: string; collection: string; category: string; price: string;
  availability: string; launchStatus: string; shortDescription: string; description: string;
  dimensions: string; leadTime: string; productionDays: string; images: string; technicalCharacteristics: string;
  packageWeightKg: string; packageWidthCm: string; packageHeightCm: string; packageLengthCm: string;
  estimatedLaborCost: string; estimatedEnergyCost: string; estimatedPackagingCost: string;
  estimatedOtherCost: string; estimatedTaxPercent: string; estimatedPaymentFeePercent: string;
  personalizationOptions: string; featured: boolean; published: boolean;
  variants: { label: string; options: string[] }[];
  recipe: { materialId: string; quantityPerUnit: string }[];
};

const emptyDraft: Draft = {
  name: "", slug: "", collection: "inspire-gifts", category: "", price: "",
  availability: "not-announced", launchStatus: "in-development", shortDescription: "", description: "",
  dimensions: "", leadTime: "", productionDays: "7", images: "", technicalCharacteristics: "", personalizationOptions: "",
  packageWeightKg: "", packageWidthCm: "", packageHeightCm: "", packageLengthCm: "",
  estimatedLaborCost: "0", estimatedEnergyCost: "0", estimatedPackagingCost: "0", estimatedOtherCost: "0",
  estimatedTaxPercent: "0", estimatedPaymentFeePercent: "0",
  featured: false, published: false, variants: [], recipe: [],
};

const lineArray = (value: string) => value.split("\n").map((line) => line.trim()).filter(Boolean);
const toCost = (value: string) => { const number = Number(value); return Number.isFinite(number) && number > 0 ? number : 0; };

export function ProductManager({ products, materials, reserved }: { products: AdminProductRecord[]; materials: MaterialRecord[]; reserved: Record<string, number> }) {
  const router = useRouter();
  const [draft, setDraft] = useState<Draft>(emptyDraft);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formOpen, setFormOpen] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [busy, setBusy] = useState(false);
  const [productionQty, setProductionQty] = useState<Record<string, string>>({});
  const activeMaterials = materials.filter((item) => !item.archived);

  const calculatedCost = useMemo(() => draft.recipe.reduce((total, line) => {
    const material = activeMaterials.find((item) => item.id === line.materialId);
    return total + (material?.unitCost ?? 0) * (Number(line.quantityPerUnit) || 0);
  }, 0), [draft.recipe, activeMaterials]);
  const missingMaterialCost = draft.recipe.length === 0 || draft.recipe.some((line) => {
    const material = activeMaterials.find((item) => item.id === line.materialId);
    return Boolean(line.materialId && material && material.unitCost <= 0);
  });
  const targetPrice = Number(draft.price) || 0;
  const estimatedFixedCosts = toCost(draft.estimatedLaborCost) + toCost(draft.estimatedEnergyCost)
    + toCost(draft.estimatedPackagingCost) + toCost(draft.estimatedOtherCost);
  const estimatedVariableCosts = targetPrice * (toCost(draft.estimatedTaxPercent) + toCost(draft.estimatedPaymentFeePercent)) / 100;
  const estimatedNet = targetPrice - calculatedCost - estimatedFixedCosts - estimatedVariableCosts;

  function update<K extends keyof Draft>(key: K, value: Draft[K]) {
    setDraft((current) => ({ ...current, [key]: value }));
  }

  function startEdit(product: AdminProductRecord) {
    setEditingId(product.id);
    setDraft({
      name: product.name, slug: product.slug, collection: product.collection, category: product.category,
      price: product.price === null ? "" : String(product.price), availability: product.availability,
      launchStatus: product.launchStatus, shortDescription: product.shortDescription, description: product.description,
      dimensions: product.dimensions, leadTime: product.leadTime, productionDays: String(product.productionDays), images: product.images.join("\n"),
      packageWeightKg: product.packageWeightKg === null ? "" : String(product.packageWeightKg),
      packageWidthCm: product.packageWidthCm === null ? "" : String(product.packageWidthCm),
      packageHeightCm: product.packageHeightCm === null ? "" : String(product.packageHeightCm),
      packageLengthCm: product.packageLengthCm === null ? "" : String(product.packageLengthCm),
      technicalCharacteristics: product.technicalCharacteristics.join("\n"),
      personalizationOptions: product.personalizationOptions.join("\n"), featured: product.featured, published: product.published,
      estimatedLaborCost: String(product.estimatedLaborCost), estimatedEnergyCost: String(product.estimatedEnergyCost),
      estimatedPackagingCost: String(product.estimatedPackagingCost), estimatedOtherCost: String(product.estimatedOtherCost),
      estimatedTaxPercent: String(product.estimatedTaxPercent), estimatedPaymentFeePercent: String(product.estimatedPaymentFeePercent),
      variants: product.variants,
      recipe: product.recipe.map((line) => ({ materialId: line.materialId, quantityPerUnit: String(line.quantityPerUnit) })),
    });
    setFormOpen(true); setError(""); setNotice(""); window.setTimeout(() => document.getElementById("novo-produto")?.scrollIntoView({ behavior: "smooth" }), 0);
  }

  async function saveProduct(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); setError(""); setNotice(""); setBusy(true);
    const payload = {
      ...draft,
      recipe: draft.recipe.filter((line) => line.materialId && Number(line.quantityPerUnit) > 0).map((line) => ({ materialId: line.materialId, quantityPerUnit: Number(line.quantityPerUnit) })),
      price: draft.price,
      images: lineArray(draft.images),
      technicalCharacteristics: lineArray(draft.technicalCharacteristics),
      personalizationOptions: lineArray(draft.personalizationOptions),
      seoTitle: draft.name.trim(), seoDescription: draft.shortDescription.trim(),
    };
    try {
      const response = await fetch(editingId ? `/api/admin/products/${editingId}` : "/api/admin/products", {
        method: editingId ? "PUT" : "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error ?? "Não foi possível salvar o produto.");
      setNotice(editingId ? "Produto atualizado no catálogo." : draft.published ? "Produto cadastrado e publicado no site." : "Produto cadastrado como rascunho.");
      setEditingId(null); setDraft(emptyDraft); setFormOpen(false); router.refresh();
    } catch (cause) { setError(cause instanceof Error ? cause.message : "Falha ao salvar o produto."); }
    finally { setBusy(false); }
  }

  async function produce(product: AdminProductRecord) {
    setError(""); setNotice("");
    const quantity = Number(productionQty[product.id]);
    if (!Number.isInteger(quantity) || quantity <= 0) { setError("Informe uma quantidade inteira para produzir."); return; }
    setBusy(true);
    try {
      const response = await fetch("/api/admin/production", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ productId: product.id, quantity }) });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error ?? "Não foi possível registrar a produção.");
      setNotice(`${quantity} unidade(s) produzida(s). Custo de material: ${formatCurrency(result.materialCost)}. Estoque baixado.`);
      setProductionQty((current) => ({ ...current, [product.id]: "" })); router.refresh();
    } catch (cause) { setError(cause instanceof Error ? cause.message : "Falha ao registrar a produção."); }
    finally { setBusy(false); }
  }

  function cancelEdit() { setEditingId(null); setDraft(emptyDraft); setFormOpen(false); }

  return (
    <div className="admin-stack">
      <header className="admin-page-heading">
        <div><p className="admin-kicker">Catálogo · custo · produção</p><h1>Produtos do estúdio.</h1><p>Cadastre a ficha técnica, publique no catálogo e registre produções para baixar insumos.</p></div>
        <button type="button" className="admin-button admin-button--gold" onClick={() => { if (formOpen && !editingId) setFormOpen(false); else { setEditingId(null); setDraft(emptyDraft); setFormOpen(true); } }}>+ Novo produto</button>
      </header>

      {error ? <p className="admin-alert admin-alert--error" role="alert">{error}</p> : null}
      {notice ? <p className="admin-alert admin-alert--success" role="status">{notice}</p> : null}
      <ImportWorkbook context="produtos" />

      {formOpen ? (
        <section className="admin-panel" id="novo-produto">
          <div className="admin-panel__heading"><div><p className="admin-kicker">{editingId ? "Editar produto" : "Novo produto"}</p><h2>{editingId ? draft.name : "Detalhes do produto"}</h2></div><button type="button" className="admin-text-button" onClick={cancelEdit}>Fechar</button></div>
          <form className="admin-form" onSubmit={saveProduct}>
            <div className="admin-form-grid">
              <label>Nome do produto<input className="input" required maxLength={120} value={draft.name} onChange={(e) => update("name", e.target.value)} placeholder="Ex.: Vaso Aurora" /></label>
              <label>URL (opcional)<input className="input" value={draft.slug} onChange={(e) => update("slug", e.target.value)} placeholder="gera-automaticamente-do-nome" /><small className="admin-field-hint">Usada em 3dinspire.com.br/produtos/...</small></label>
              <label>Coleção<select className="input" value={draft.collection} onChange={(e) => update("collection", e.target.value)}><option value="inspire-gifts">Inspire Gifts</option><option value="inspire-collectibles">Inspire Collectibles</option><option value="inspire-games">Inspire Games</option><option value="inspire-solutions">Inspire Solutions</option></select></label>
              <label>Categoria<input className="input" required maxLength={80} value={draft.category} onChange={(e) => update("category", e.target.value)} placeholder="Decoração, colecionável…" /></label>
              <label>Preço público (R$)<input className="input" type="number" min="0" step="0.01" value={draft.price} onChange={(e) => update("price", e.target.value)} placeholder="Opcional" /></label>
              <label>Fase do produto<select className="input" value={draft.launchStatus} onChange={(e) => update("launchStatus", e.target.value)}><option value="in-development">Em desenvolvimento</option><option value="coming-soon">Em breve</option><option value="released">Lançado</option></select></label>
              <label>Disponibilidade<select className="input" value={draft.availability} onChange={(e) => update("availability", e.target.value)}><option value="not-announced">Não anunciada</option><option value="available">Disponível</option><option value="unavailable">Indisponível</option></select></label>
              <label>Prazo estimado<input className="input" maxLength={120} value={draft.leadTime} onChange={(e) => update("leadTime", e.target.value)} placeholder="Ex.: 5 a 7 dias úteis" /></label>
              <label>Produção para compra online (dias úteis)<input className="input" type="number" min="1" max="90" step="1" required value={draft.productionDays} onChange={(e) => update("productionDays", e.target.value)} /><small className="admin-field-hint">Usado na previsão inicial do pedido.</small></label>
              <label>Peso da embalagem (kg)<input className="input" type="number" min="0.001" max="50" step="0.001" value={draft.packageWeightKg} onChange={(e) => update("packageWeightKg", e.target.value)} placeholder="Ex.: 0.350" /><small className="admin-field-hint">Peso final com proteção e caixa.</small></label>
              <label>Largura da embalagem (cm)<input className="input" type="number" min="0.01" max="200" step="0.01" value={draft.packageWidthCm} onChange={(e) => update("packageWidthCm", e.target.value)} /></label>
              <label>Altura da embalagem (cm)<input className="input" type="number" min="0.01" max="200" step="0.01" value={draft.packageHeightCm} onChange={(e) => update("packageHeightCm", e.target.value)} /></label>
              <label>Comprimento da embalagem (cm)<input className="input" type="number" min="0.01" max="200" step="0.01" value={draft.packageLengthCm} onChange={(e) => update("packageLengthCm", e.target.value)} /><small className="admin-field-hint">Preencha os quatro dados para habilitar a cotação por CEP.</small></label>
              <label className="admin-field--wide">Resumo curto<textarea className="input" required maxLength={400} value={draft.shortDescription} onChange={(e) => update("shortDescription", e.target.value)} placeholder="Uma frase clara para o cartão no catálogo." /></label>
              <label className="admin-field--wide">Descrição completa<textarea className="input" required maxLength={8000} value={draft.description} onChange={(e) => update("description", e.target.value)} placeholder="Materiais, uso, acabamentos, diferenciais…" /></label>
              <label>Dimensões<input className="input" maxLength={200} value={draft.dimensions} onChange={(e) => update("dimensions", e.target.value)} placeholder="15 × 10 × 8 cm" /></label>
              <label>Imagens (caminho em /public)<textarea className="input" value={draft.images} onChange={(e) => update("images", e.target.value)} placeholder="/produtos/vaso-aurora.jpg" /><small className="admin-field-hint">Salve os arquivos na pasta public/ do site.</small></label>
              <label>Características (uma por linha)<textarea className="input" value={draft.technicalCharacteristics} onChange={(e) => update("technicalCharacteristics", e.target.value)} placeholder="PLA biodegradável\nAcabamento fosco" /></label>
              <label>Personalização disponível<textarea className="input" value={draft.personalizationOptions} onChange={(e) => update("personalizationOptions", e.target.value)} placeholder="Cor\nNome gravado" /></label>
            </div>

            <section className="admin-panel">
              <div className="admin-panel__heading"><div><p className="admin-kicker">Formação do preço · por unidade</p><h3>Custos além dos materiais</h3><p>Use estimativas médias. Taxas e impostos são percentuais sobre o preço de venda.</p></div></div>
              <div className="admin-form-grid">
                <label>Mão de obra estimada (R$)<input className="input" type="number" min="0" step="0.01" value={draft.estimatedLaborCost} onChange={(e) => update("estimatedLaborCost", e.target.value)} /></label>
                <label>Energia estimada (R$)<input className="input" type="number" min="0" step="0.01" value={draft.estimatedEnergyCost} onChange={(e) => update("estimatedEnergyCost", e.target.value)} /></label>
                <label>Embalagem estimada (R$)<input className="input" type="number" min="0" step="0.01" value={draft.estimatedPackagingCost} onChange={(e) => update("estimatedPackagingCost", e.target.value)} /></label>
                <label>Outros custos por unidade (R$)<input className="input" type="number" min="0" step="0.01" value={draft.estimatedOtherCost} onChange={(e) => update("estimatedOtherCost", e.target.value)} /></label>
                <label>Impostos estimados (%)<input className="input" type="number" min="0" max="100" step="0.001" value={draft.estimatedTaxPercent} onChange={(e) => update("estimatedTaxPercent", e.target.value)} /></label>
                <label>Taxa de pagamento / marketplace (%)<input className="input" type="number" min="0" max="100" step="0.001" value={draft.estimatedPaymentFeePercent} onChange={(e) => update("estimatedPaymentFeePercent", e.target.value)} /></label>
              </div>
            </section>

            <section className="admin-recipe">
              <div className="admin-panel__heading"><div><p className="admin-kicker">Ficha técnica · por unidade</p><h3>Materiais consumidos</h3><p>Informe o consumo na mesma unidade base do material (ex.: g com g) para calcular custo e descontar na produção.</p></div><button className="admin-button admin-button--outline" type="button" onClick={() => update("recipe", [...draft.recipe, { materialId: "", quantityPerUnit: "" }])}>+ Adicionar insumo</button></div>
              {activeMaterials.length === 0 ? <p className="admin-callout admin-callout--compact"><span>i</span><span>Cadastre e conte materiais primeiro. Sem custo e saldo de insumos, o sistema não libera a baixa automática da produção.</span></p> : null}
              {draft.recipe.length ? <div className="admin-recipe-list">{draft.recipe.map((line, index) => {
                const material = activeMaterials.find((item) => item.id === line.materialId);
                return <div className="admin-recipe-row" key={`${index}-${line.materialId}`}><label>Material<select className="input" value={line.materialId} onChange={(event) => update("recipe", draft.recipe.map((item, position) => position === index ? { ...item, materialId: event.target.value } : item))}><option value="">Selecionar material</option>{activeMaterials.map((item) => <option key={item.id} value={item.id}>{item.name} · {formatCurrency(item.unitCost)}/{item.unit}</option>)}</select></label><label>Consumo por unidade<input className="input" type="number" min="0.001" step="0.001" value={line.quantityPerUnit} onChange={(event) => update("recipe", draft.recipe.map((item, position) => position === index ? { ...item, quantityPerUnit: event.target.value } : item))} placeholder="0" /></label><span className="admin-recipe-row__cost">{material ? `${formatCurrency((Number(line.quantityPerUnit) || 0) * material.unitCost)} nesta linha` : "Selecione um material"}</span><button className="admin-text-button admin-text-button--danger" type="button" onClick={() => update("recipe", draft.recipe.filter((_, position) => position !== index))}>Remover</button></div>;
              })}</div> : <p className="admin-empty admin-empty--compact">Adicione os materiais e a quantidade consumida para produzir uma unidade.</p>}
              <div className="admin-cost-preview">
                <span>Insumos estimados por unidade <small>ficha técnica × custo médio atual</small></span><strong className={missingMaterialCost ? "admin-value-warning" : ""}>{missingMaterialCost ? "Ficha/custo incompleto" : formatCurrency(calculatedCost)}</strong>
                <span>Preço bruto de venda</span><strong>{targetPrice ? formatCurrency(targetPrice) : "Não definido"}</strong>
                <span>Margem bruta após insumos <small>antes de mão de obra, taxas e impostos</small></span><strong className={!missingMaterialCost && targetPrice > calculatedCost ? "admin-color-success" : ""}>{targetPrice && !missingMaterialCost ? formatCurrency(targetPrice - calculatedCost) : "—"}</strong>
                <span>Lucro líquido estimado <small>deduz custos informados, taxas e impostos</small></span><strong className={!missingMaterialCost && estimatedNet > 0 ? "admin-color-success" : "admin-value-warning"}>{targetPrice && !missingMaterialCost ? formatCurrency(estimatedNet) : "—"}</strong>
              </div>
            </section>

            <div className="admin-checkboxes"><label><input type="checkbox" checked={draft.featured} onChange={(e) => update("featured", e.target.checked)} /> Exibir também como destaque na página inicial</label><label><input type="checkbox" checked={draft.published} onChange={(e) => update("published", e.target.checked)} /> Publicar no catálogo do site</label></div>
            <div className="admin-form__actions"><button className="admin-button admin-button--gold" type="submit" disabled={busy}>{busy ? "Salvando…" : editingId ? "Salvar produto" : "Cadastrar produto"}</button><span>{draft.published ? "O produto será publicado no site assim que salvar." : "O produto ficará privado até a publicação ser ativada."}</span></div>
          </form>
        </section>
      ) : null}

      <section className="admin-panel admin-panel--table">
        <div className="admin-panel__heading"><div><p className="admin-kicker">Catálogo do estúdio</p><h2>Produtos cadastrados</h2></div><span className="admin-record-count">{products.length} produtos</span></div>
        {products.length ? <div className="admin-table-wrap"><table className="admin-table"><thead><tr><th>Produto</th><th>Publicação</th><th>Preço</th><th>Custo / margem estimada</th><th>Estoque produzido</th><th><span className="sr-only">Ações</span></th></tr></thead><tbody>
          {products.map((product) => {
            const netEstimate = product.price === null ? null : product.price - product.materialCost
              - product.estimatedLaborCost - product.estimatedEnergyCost - product.estimatedPackagingCost - product.estimatedOtherCost
              - product.price * (product.estimatedTaxPercent + product.estimatedPaymentFeePercent) / 100;
            const costsComplete = product.recipe.length > 0 && product.recipe.every((line) => line.unitCost > 0);
            return <tr key={product.id}><td><strong>{product.name}</strong><small>{product.category} · {product.recipe.length} materiais na ficha</small></td><td><span className={`admin-pill ${product.published ? "admin-pill--success" : ""}`}>{product.published ? "No site" : "Rascunho"}</span>{product.featured ? <small>Destaque</small> : null}</td><td>{product.price === null ? "—" : formatCurrency(product.price)}</td><td>{costsComplete ? <><strong>Insumos: {formatCurrency(product.materialCost)}</strong>{product.price !== null ? <small>Bruto após insumos: {formatCurrency(product.price - product.materialCost)} · Líquido est.: {formatCurrency(netEstimate ?? 0)}</small> : null}</> : <span className="admin-value-muted">{product.recipe.length ? "Custo incompleto" : "Sem ficha técnica"}</span>}</td><td>{formatQuantity(product.finishedStock)} un.<small>{formatQuantity(reserved[product.id] ?? 0)} reservada(s) · {formatQuantity(product.finishedStock - (reserved[product.id] ?? 0))} livre(s)</small></td><td><div className="admin-row-actions admin-row-actions--stack"><button type="button" onClick={() => startEdit(product)}>Editar</button>{product.published ? <Link href={`/produtos/${product.slug}`} target="_blank" rel="noreferrer">Ver no site ↗</Link> : null}<div><input aria-label={`Quantidade de ${product.name} a produzir`} className="admin-qty-input" type="number" min="1" step="1" value={productionQty[product.id] ?? ""} onChange={(e) => setProductionQty((current) => ({ ...current, [product.id]: e.target.value }))} placeholder="Qtd." /><button className="admin-row-actions__gold" type="button" disabled={busy || product.recipe.length === 0 || product.recipe.some((line) => line.unitCost <= 0)} title={product.recipe.length === 0 ? "Adicione uma ficha técnica primeiro" : product.recipe.some((line) => line.unitCost <= 0) ? "Cadastre custo médio dos materiais primeiro" : "Registrar produção e descontar insumos"} onClick={() => void produce(product)}>Produzir</button></div></div></td></tr>;
          })}
        </tbody></table></div> : <div className="admin-empty admin-empty--large"><span>◇</span><h3>Crie o primeiro produto autoral.</h3><p>Defina preço, descrição e ficha técnica. Depois publique no site ou registre a produção para acompanhar o estoque.</p><button type="button" className="admin-button admin-button--gold" onClick={() => setFormOpen(true)}>Cadastrar produto</button></div>}
      </section>
      <p className="admin-footnote">O líquido exibido é uma estimativa por unidade. Ele considera a ficha técnica, os custos informados e percentuais de taxa e imposto. Custos reais de venda dependem do registro da venda.</p>
    </div>
  );
}
