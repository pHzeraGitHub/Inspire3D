"use client";

import Link from "next/link";
import { useEffect, useState, type FormEvent } from "react";
import { Button } from "@/components/ui/Button";

type Address = { postalCode: string; street: string; number: string; complement: string; neighborhood: string; city: string; state: string };
type CheckoutFields = { customerName: string; customerEmail: string; customerPhone: string; address: Address };
const emptyAddress: Address = { postalCode: "", street: "", number: "", complement: "", neighborhood: "", city: "", state: "" };
const currency = (value: number) => new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(value);
type ShippingOption = { id: string; name: string; carrier: string; price: number; deliveryDays: number };

export function CheckoutForm({ product }: {
  product: { id: string; name: string; price: number; productionDays: number;
    variants: { label: string; options: string[] }[]; personalizationOptions: string[] };
}) {
  const [quantity, setQuantity] = useState(1);
  const [fields, setFields] = useState<CheckoutFields>({ customerName: "", customerEmail: "", customerPhone: "", address: emptyAddress });
  const [choices, setChoices] = useState<Record<string, string>>({});
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [shippingOptions, setShippingOptions] = useState<ShippingOption[]>([]);
  const [selectedServiceId, setSelectedServiceId] = useState("");
  const [shippingBusy, setShippingBusy] = useState(false);
  const [shippingError, setShippingError] = useState("");
  const [quoteVersion, setQuoteVersion] = useState(0);
  const postalCode = fields.address.postalCode.replace(/\D/g, "");
  const selectedShipping = shippingOptions.find((option) => option.id === selectedServiceId);
  const total = product.price * quantity + (selectedShipping?.price ?? 0);
  const updateAddress = (key: keyof Address, value: string) => setFields((current) => ({ ...current, address: { ...current.address, [key]: value } }));

  useEffect(() => {
    setShippingOptions([]); setSelectedServiceId(""); setShippingError("");
    if (postalCode.length !== 8) { setShippingBusy(false); return; }
    const controller = new AbortController();
    setShippingBusy(true);
    const timer = window.setTimeout(async () => {
      try {
        const response = await fetch("/api/shipping/quote", {
          method: "POST", headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ productId: product.id, quantity, postalCode }), signal: controller.signal,
        });
        const result = await response.json();
        if (!response.ok) throw new Error(result.error ?? "Não foi possível cotar a entrega.");
        const options = result.options as ShippingOption[];
        setShippingOptions(options); setSelectedServiceId(options[0]?.id ?? "");
      } catch (cause) {
        if (!controller.signal.aborted) setShippingError(cause instanceof Error ? cause.message : "Não foi possível cotar a entrega.");
      } finally {
        if (!controller.signal.aborted) setShippingBusy(false);
      }
    }, 350);
    return () => { controller.abort(); window.clearTimeout(timer); };
  }, [product.id, quantity, postalCode, quoteVersion]);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!selectedShipping || shippingBusy) { setError("Selecione uma opção de entrega antes de pagar."); return; }
    setError(""); setBusy(true);
    try {
      const response = await fetch("/api/checkout", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId: product.id, quantity, ...fields, choices,
          shippingServiceId: selectedShipping.id, expectedShipping: selectedShipping.price,
          expectedUnitPrice: product.price }),
      });
      const result = await response.json();
      if (!response.ok) {
        if (response.status === 409) setQuoteVersion((value) => value + 1);
        throw new Error(result.error ?? "Não foi possível iniciar o pagamento.");
      }
      window.location.assign(result.checkoutUrl);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Não foi possível iniciar o pagamento.");
      setBusy(false);
    }
  }

  return <form className="checkout-layout" onSubmit={submit}>
    <div className="checkout-fields">
      {product.variants.length || product.personalizationOptions.length ? <section className="panel p-6 md:p-8">
        <p className="eyebrow">Seu produto</p><h2 className="mt-3 font-display text-2xl text-chalk">Escolha os detalhes</h2>
        <div className="checkout-grid mt-6">
          {product.variants.map((variant) => <label key={variant.label}>{variant.label}<select className="input" required value={choices[variant.label] ?? ""} onChange={(event) => setChoices({ ...choices, [variant.label]: event.target.value })}>
            <option value="">Selecione</option>{variant.options.map((option) => <option key={option} value={option}>{option}</option>)}
          </select></label>)}
          {product.personalizationOptions.map((label) => <label key={label}>{label}<input className="input" maxLength={120} value={choices[label] ?? ""} onChange={(event) => setChoices({ ...choices, [label]: event.target.value })} placeholder="Opcional" /></label>)}
        </div>
      </section> : null}
      <section className="panel p-6 md:p-8">
        <p className="eyebrow">01 · Seus dados</p><h2 className="mt-3 font-display text-2xl text-chalk">Para acompanhar seu pedido</h2>
        <div className="checkout-grid mt-6">
          <label className="checkout-wide">Nome completo<input className="input" autoComplete="name" required maxLength={120} value={fields.customerName} onChange={(e) => setFields({ ...fields, customerName: e.target.value })} /></label>
          <label>E-mail<input className="input" type="email" autoComplete="email" required maxLength={180} value={fields.customerEmail} onChange={(e) => setFields({ ...fields, customerEmail: e.target.value })} /></label>
          <label>WhatsApp<input className="input" type="tel" autoComplete="tel" maxLength={30} value={fields.customerPhone} onChange={(e) => setFields({ ...fields, customerPhone: e.target.value })} /></label>
        </div>
      </section>
      <section className="panel p-6 md:p-8">
        <p className="eyebrow">02 · Entrega</p><h2 className="mt-3 font-display text-2xl text-chalk">Onde receber</h2>
        <div className="checkout-grid mt-6">
          <label>CEP<input className="input" inputMode="numeric" autoComplete="postal-code" required minLength={8} maxLength={9} value={fields.address.postalCode} onChange={(e) => updateAddress("postalCode", e.target.value)} placeholder="00000-000" /></label>
          <label>Estado (UF)<input className="input" autoComplete="address-level1" required minLength={2} maxLength={2} value={fields.address.state} onChange={(e) => updateAddress("state", e.target.value.toUpperCase())} placeholder="MG" /></label>
          <label className="checkout-wide">Rua / avenida<input className="input" autoComplete="address-line1" required maxLength={120} value={fields.address.street} onChange={(e) => updateAddress("street", e.target.value)} /></label>
          <label>Número<input className="input" required maxLength={20} value={fields.address.number} onChange={(e) => updateAddress("number", e.target.value)} /></label>
          <label>Complemento<input className="input" autoComplete="address-line2" maxLength={120} value={fields.address.complement} onChange={(e) => updateAddress("complement", e.target.value)} /></label>
          <label>Bairro<input className="input" required maxLength={120} value={fields.address.neighborhood} onChange={(e) => updateAddress("neighborhood", e.target.value)} /></label>
          <label>Cidade<input className="input" autoComplete="address-level2" required maxLength={120} value={fields.address.city} onChange={(e) => updateAddress("city", e.target.value)} /></label>
        </div>
      </section>
      <section className="panel p-6 md:p-8">
        <p className="eyebrow">03 · Frete</p><h2 className="mt-3 font-display text-2xl text-chalk">Escolha a entrega</h2>
        <p className="mt-3 text-sm text-ash">Origem: empresa em Contagem/MG. Dias previstos para postagem: segunda, terça e quinta, após a produção.</p>
        {postalCode.length !== 8 ? <p className="mt-5 text-sm text-silver">Informe o CEP de destino para ver preço e prazo.</p> : null}
        {shippingBusy ? <p className="mt-5 text-sm text-silver" role="status">Calculando opções de entrega…</p> : null}
        {shippingError ? <p className="mt-5 text-sm text-red-200" role="alert">{shippingError}</p> : null}
        {shippingOptions.length ? <div className="mt-5 grid gap-3">{shippingOptions.map((option) => <label key={option.id} className="flex cursor-pointer items-start gap-3 rounded-xl border border-line p-4 text-sm text-silver">
          <input type="radio" name="shipping" className="mt-1" checked={selectedServiceId === option.id} onChange={() => setSelectedServiceId(option.id)} />
          <span className="flex-1"><strong className="block text-chalk">{option.carrier} · {option.name}</strong><small>Transporte estimado: {option.deliveryDays} dias úteis após a postagem</small></span>
          <strong className="text-gold">{currency(option.price)}</strong>
        </label>)}</div> : null}
      </section>
      <section className="panel p-6 md:p-8">
        <p className="eyebrow">04 · Pagamento</p><h2 className="mt-3 font-display text-2xl text-chalk">Pix ou cartão</h2>
        <p className="mt-3 text-sm leading-relaxed text-ash">Ao continuar, você escolhe Pix ou cartão na página segura do Mercado Pago. Depois retorna ao acompanhamento da Inspire 3D.</p>
        <label className="mt-6 flex items-start gap-3 text-sm text-silver"><input type="checkbox" required className="mt-1" /><span>Li e concordo com os <Link href="/termos" target="_blank" className="text-gold underline">termos de uso</Link> e a <Link href="/politica-de-privacidade" target="_blank" className="text-gold underline">política de privacidade</Link>.</span></label>
      </section>
    </div>
    <aside className="checkout-summary panel p-6 md:p-7">
      <p className="eyebrow">Resumo da compra</p><h2 className="mt-2 font-display text-xl text-chalk">{product.name}</h2>
      <p className="mt-2 text-sm text-ash">Produção prevista em até {product.productionDays} dias úteis após o pagamento.</p>
      <label className="mt-6 block text-sm text-silver">Quantidade<input className="input mt-2" type="number" min="1" max="20" step="1" value={quantity} onChange={(e) => setQuantity(Math.max(1, Math.min(20, Number(e.target.value) || 1)))} /></label>
      <div className="checkout-prices mt-6"><span>Produto · {quantity} × {currency(product.price)} <b>{currency(product.price * quantity)}</b></span><span>Frete <b>{selectedShipping ? selectedShipping.price === 0 ? "Grátis" : currency(selectedShipping.price) : "A calcular"}</b></span><strong>Total <b>{selectedShipping ? currency(total) : "Após cotação"}</b></strong></div>
      {error ? <p className="mt-5 rounded-lg border border-red-500/35 bg-red-500/10 p-3 text-sm text-red-200" role="alert">{error}</p> : null}
      <Button type="submit" disabled={busy || shippingBusy || !selectedShipping} className="mt-6 w-full">{busy ? "Preparando pagamento…" : "Ir para pagamento seguro →"}</Button>
      <p className="mt-4 text-xs leading-relaxed text-ash">O pedido entra na produção após o Mercado Pago confirmar o pagamento. Ao voltar para a Inspire 3D, guarde o link para acompanhar cada etapa.</p>
    </aside>
  </form>;
}
