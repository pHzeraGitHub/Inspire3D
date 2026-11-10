import Image from "next/image";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { PageIntro } from "@/components/layout/PageIntro";
import { Container } from "@/components/ui/Container";
import { Button } from "@/components/ui/Button";
import { Chip } from "@/components/ui/Chip";
import { CollectionArtwork } from "@/components/visuals/CollectionArtwork";
import { collections } from "@/content/collections";
import { productStatusLabel } from "@/content/products";
import { getCatalogProducts } from "@/lib/catalog";
import { pageMetadata, breadcrumbJsonLd } from "@/lib/seo";
import { whatsappLink } from "@/config/site";

type PageProps = { params: Promise<{ slug: string }> };

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const products = await getCatalogProducts();
  const product = products.find((item) => item.slug === slug);
  if (!product) return { title: "Produto não encontrado", robots: { index: false, follow: false } };

  return pageMetadata({ title: product.seo.title, description: product.seo.description, path: `/produtos/${product.slug}` });
}

export default async function ProdutoPage({ params }: PageProps) {
  const { slug } = await params;
  const products = await getCatalogProducts();
  const product = products.find((item) => item.slug === slug);
  if (!product) notFound();

  const collection = collections.find((item) => item.slug === product.collection);
  const interestedLink = whatsappLink(`Olá! Gostaria de conversar sobre ${product.name}, da Inspire 3D.`);
  const quoteCategory = {
    "inspire-gifts": "personalizado",
    "inspire-collectibles": "colecionavel",
    "inspire-games": "jogos",
    "inspire-solutions": "funcional",
  }[product.collection];
  const isAvailable = product.available && product.availability === "available";

  return (
    <>
      <PageIntro
        eyebrow={`${collection?.name ?? "Produtos Inspire 3D"} · ${product.category}`}
        title={product.name}
        description={product.shortDescription}
      >
        <Chip tone="gold">{productStatusLabel(product)}</Chip>
      </PageIntro>

      <section className="pb-(--spacing-section)">
        <Container>
          <div className="grid gap-8 lg:grid-cols-[1.05fr_0.95fr] lg:items-start">
            <figure className="panel relative overflow-hidden bg-[radial-gradient(ellipse_at_50%_55%,#292319_0%,#16181D_62%,#111317_100%)]">
              <div className="relative aspect-[4/3]">
                {product.images[0] ? (
                  <Image src={product.images[0]} alt={product.name} fill sizes="(max-width: 1024px) 100vw, 52vw" className="object-cover" />
                ) : (
                  <CollectionArtwork collection={product.collection} className="size-full" />
                )}
              </div>
              <figcaption className="border-t border-line px-5 py-3 font-mono text-[0.5625rem] uppercase tracking-[0.15em] text-ash">
                {product.images[0] ? "Imagem do produto" : "Estudo visual · não representa o produto final"}
              </figcaption>
            </figure>

            <div className="panel p-6 md:p-8">
              <p className="font-mono text-[0.625rem] uppercase tracking-[0.16em] text-gold">Status do projeto</p>
              <h2 className="mt-3 font-display text-2xl font-semibold text-chalk">{productStatusLabel(product)}</h2>
              <p className="mt-4 text-[0.95rem] leading-relaxed text-silver">{product.description}</p>

              {!isAvailable ? (
                <div className="mt-7 rounded-xl border border-line bg-void/55 p-4">
                  <p className="text-sm leading-relaxed text-ash">
                    {product.launchStatus === "released"
                      ? "Este produto não está disponível no momento. Consulte o estúdio sobre próximos passos."
                      : "Preço, disponibilidade, componentes e data de lançamento ainda não foram anunciados."}
                  </p>
                </div>
              ) : null}

              <div className="mt-7 flex flex-wrap gap-3">
                <Button href={isAvailable ? `/orcamento?categoria=${quoteCategory}` : interestedLink}>
                  {isAvailable ? "Solicitar orçamento" : "Tenho interesse"}
                </Button>
                <Button href={`/produtos?colecao=${product.collection}#catalogo`} variant="outline">
                  Ver {collection?.name ?? "a coleção"}
                </Button>
              </div>
              <p className="mt-5 text-xs leading-relaxed text-ash/70">
                {isAvailable
                  ? "O orçamento não fecha compra nem processa pagamento pelo site."
                  : "O contato registra seu interesse pelo WhatsApp; ainda não há pré-venda ou pedido de compra."}
              </p>
            </div>
          </div>

          {(product.technicalCharacteristics?.length || product.dimensions || product.variants?.length || product.personalizationOptions?.length || product.leadTime) ? (
            <div className="mt-8 grid gap-4 sm:grid-cols-2">
              {product.technicalCharacteristics?.length ? (
                <div className="card p-6"><h2 className="font-display text-lg text-chalk">Características</h2><ul className="mt-4 space-y-2 text-sm text-ash">{product.technicalCharacteristics.map((item) => <li key={item}>{item}</li>)}</ul></div>
              ) : null}
              {product.dimensions ? <div className="card p-6"><h2 className="font-display text-lg text-chalk">Dimensões</h2><p className="mt-3 text-sm text-ash">{product.dimensions}</p></div> : null}
              {product.variants?.length ? <div className="card p-6"><h2 className="font-display text-lg text-chalk">Variações</h2>{product.variants.map((variant) => <p key={variant.label} className="mt-3 text-sm text-ash">{variant.label}: {variant.options.join(", ")}</p>)}</div> : null}
              {product.personalizationOptions?.length ? <div className="card p-6"><h2 className="font-display text-lg text-chalk">Personalização</h2><p className="mt-3 text-sm text-ash">{product.personalizationOptions.join(", ")}</p></div> : null}
              {product.leadTime ? <div className="card p-6"><h2 className="font-display text-lg text-chalk">Prazo estimado</h2><p className="mt-3 text-sm text-ash">{product.leadTime}</p></div> : null}
            </div>
          ) : null}

          <div className="mt-10 flex flex-wrap items-center justify-between gap-4 border-t border-line pt-6">
            <Link href="/produtos" className="link-underline text-sm text-silver hover:text-chalk">← Voltar ao catálogo</Link>
            <Link href={`/orcamento?categoria=${quoteCategory}`} className="link-underline text-sm text-silver hover:text-chalk">
              Falar de um projeto ↗
            </Link>
          </div>
        </Container>
      </section>

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(
            breadcrumbJsonLd([
              { name: "Produtos", path: "/produtos" },
              { name: product.name, path: `/produtos/${product.slug}` },
            ]),
          ),
        }}
      />
    </>
  );
}
