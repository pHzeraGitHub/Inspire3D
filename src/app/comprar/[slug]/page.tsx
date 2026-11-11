import { notFound } from "next/navigation";
import { PageIntro } from "@/components/layout/PageIntro";
import { Container } from "@/components/ui/Container";
import { CheckoutForm } from "@/features/checkout/CheckoutForm";
import { getCatalogProducts } from "@/lib/catalog";
import { commerceConfigured } from "@/lib/commerce";

export const dynamic = "force-dynamic";

export default async function ComprarPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const product = (await getCatalogProducts()).find((item) => item.slug === slug);
  if (!product || !product.available || !product.productionReady || !product.shippingReady || !product.priceFrom || product.priceFrom <= 0 || !(await commerceConfigured())) notFound();
  return <><PageIntro eyebrow="Compra online" title="Finalize seu pedido." description="Confira o produto, informe a entrega e escolha Pix ou cartão com segurança." />
    <section className="pb-(--spacing-section)"><Container><CheckoutForm product={{ id: product.id, name: product.name,
      price: product.priceFrom, productionDays: product.productionDays ?? 7, variants: product.variants ?? [],
      personalizationOptions: product.personalizationOptions ?? [] }} /></Container></section></>;
}
