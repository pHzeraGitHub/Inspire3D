import Link from "next/link";
import { Section } from "@/components/ui/Section";
import { Container } from "@/components/ui/Container";
import { Button } from "@/components/ui/Button";
import { CollectionArtwork } from "@/components/visuals/CollectionArtwork";
import { collections } from "@/content/collections";
import { productStatusLabel, products } from "@/content/products";

export function FeaturedProductsSection() {
  const featured = products.find((product) => product.featured);
  if (!featured) return null;

  const collection = collections.find((item) => item.slug === featured.collection);

  return (
    <Section id="destaques" className="scroll-mt-24">
      <Container>
        <div className="mb-12 flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="eyebrow">Criações em destaque</p>
            <h2 className="mt-4 max-w-2xl text-title text-chalk">
              Um universo autoral <span className="gold-text">está tomando forma.</span>
            </h2>
          </div>
          <Link href="/produtos" className="link-underline text-sm text-silver hover:text-chalk">
            Ver o catálogo <span aria-hidden>↗</span>
          </Link>
        </div>

        <article className="panel overflow-hidden">
          <div className="grid lg:grid-cols-[1.08fr_0.92fr]">
            <figure className="relative min-h-[300px] overflow-hidden border-b border-line bg-[radial-gradient(ellipse_at_50%_55%,#292319_0%,#16181D_62%,#111317_100%)] lg:min-h-[470px] lg:border-b-0 lg:border-r">
              <CollectionArtwork collection={featured.collection} className="absolute inset-0 size-full" />
              <figcaption className="absolute bottom-5 left-6 font-mono text-[0.625rem] uppercase tracking-[0.15em] text-silver/70">
                Estudo visual · não representa componentes finais
              </figcaption>
            </figure>

            <div className="relative flex flex-col justify-center p-7 md:p-10 lg:p-14">
              <div aria-hidden className="grid-backdrop grid-backdrop--fine" />
              <div className="relative">
                <div className="flex flex-wrap items-center gap-3">
                  <span className="chip chip--gold">{productStatusLabel(featured)}</span>
                  <span className="font-mono text-[0.625rem] uppercase tracking-[0.16em] text-ash">
                    {collection?.name} · {featured.category}
                  </span>
                </div>
                <h3 className="mt-6 font-display text-3xl font-semibold leading-tight text-chalk md:text-4xl">
                  {featured.name}
                </h3>
                <p className="mt-5 max-w-xl text-[0.975rem] leading-relaxed text-silver">
                  {featured.description}
                </p>
                <p className="mt-5 max-w-xl text-sm leading-relaxed text-ash">
                  Personagens, componentes, regras, preço e data de lançamento serão apresentados quando estiverem definidos.
                </p>
                <div className="mt-8 flex flex-wrap gap-3">
                  <Button href={`/produtos/${featured.slug}`}>Conhecer o projeto</Button>
                  <Button href={`/produtos?colecao=${featured.collection}#catalogo`} variant="outline">
                    Explorar Inspire Games
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </article>
      </Container>
    </Section>
  );
}
