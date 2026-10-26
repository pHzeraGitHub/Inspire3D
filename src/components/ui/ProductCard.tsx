import Image from "next/image";
import Link from "next/link";
import type { Product } from "@/types";
import { collections } from "@/content/collections";
import { productStatusLabel } from "@/content/products";
import { CollectionArtwork } from "@/components/visuals/CollectionArtwork";

export function ProductCard({ product }: { product: Product }) {
  const collection = collections.find((item) => item.slug === product.collection);
  const label = productStatusLabel(product);

  return (
    <li>
      <Link
        href={`/produtos/${product.slug}`}
        className="card card--hover group block h-full overflow-hidden"
      >
        <figure className="relative aspect-[4/3] overflow-hidden border-b border-line bg-[radial-gradient(ellipse_at_50%_55%,#282319_0%,#15171B_62%,#111317_100%)]">
          {product.images[0] ? (
            <Image
              src={product.images[0]}
              alt={product.name}
              fill
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
              className="object-cover"
            />
          ) : (
            <CollectionArtwork collection={product.collection} className="size-full transition-transform duration-700 group-hover:scale-[1.04]" />
          )}
          <span className="chip chip--gold absolute left-4 top-4">{label}</span>
          {!product.images[0] ? (
            <figcaption className="absolute bottom-3 left-4 font-mono text-[0.5625rem] uppercase tracking-[0.15em] text-silver/65">
              Estudo visual · não representa o produto final
            </figcaption>
          ) : null}
        </figure>

        <div className="p-6">
          <p className="font-mono text-[0.625rem] uppercase tracking-[0.15em] text-gold">
            {collection?.name} · {product.category}
          </p>
          <h2 className="mt-2 font-display text-xl font-semibold text-chalk group-hover:text-gold-lum">
            {product.name}
          </h2>
          <p className="mt-3 text-sm leading-relaxed text-ash">{product.shortDescription}</p>
          {product.available && product.priceFrom !== undefined ? (
            <p className="mt-4 font-display text-base font-semibold text-chalk">
              A partir de {product.priceFrom.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
            </p>
          ) : null}
          <span className="link-underline mt-6 inline-flex text-sm text-chalk group-hover:text-gold-lum">
            {product.launchStatus === "released" ? "Ver produto" : "Conhecer o projeto"}
            <span aria-hidden className="ml-2">↗</span>
          </span>
        </div>
      </Link>
    </li>
  );
}
