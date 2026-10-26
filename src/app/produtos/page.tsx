import Link from "next/link";
import { PageIntro } from "@/components/layout/PageIntro";
import { Container } from "@/components/ui/Container";
import { Button } from "@/components/ui/Button";
import { ProductCard } from "@/components/ui/ProductCard";
import { collections } from "@/content/collections";
import { products } from "@/content/products";
import { breadcrumbJsonLd, pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata({
  title: "Produtos e coleções",
  description:
    "Explore Inspire Gifts, Inspire Collectibles, Inspire Games e Inspire Solutions. Conheça os projetos autorais da Inspire 3D.",
  path: "/produtos",
});

type SearchParams = {
  colecao?: string | string[];
  categoria?: string | string[];
  disponibilidade?: string | string[];
};

const first = (value?: string | string[]) => (Array.isArray(value) ? value[0] : value) ?? "";

const availabilityOptions = [
  { value: "available", label: "Disponível" },
  { value: "not-announced", label: "Em desenvolvimento / sem lançamento anunciado" },
  { value: "unavailable", label: "Indisponível" },
] as const;

const collectionQuoteCategory: Record<string, string> = {
  "inspire-gifts": "personalizado",
  "inspire-collectibles": "colecionavel",
  "inspire-games": "jogos",
  "inspire-solutions": "funcional",
};

export default async function ProdutosPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const params = await searchParams;
  const collection = first(params.colecao);
  const category = first(params.categoria);
  const availability = first(params.disponibilidade);

  const validCollection = collections.some((item) => item.slug === collection) ? collection : "";
  const categories = [...new Set(products.map((product) => product.category))].sort((a, b) =>
    a.localeCompare(b, "pt-BR"),
  );
  const validCategory = categories.includes(category) ? category : "";
  const validAvailability = availabilityOptions.some((item) => item.value === availability)
    ? availability
    : "";

  const filtered = products.filter((product) => {
    if (validCollection && product.collection !== validCollection) return false;
    if (validCategory && product.category !== validCategory) return false;
    if (validAvailability && product.availability !== validAvailability) return false;
    return true;
  });

  const selectedCollection = collections.find((item) => item.slug === validCollection);
  const quoteCategory = collectionQuoteCategory[validCollection] ?? "outro";

  return (
    <>
      <PageIntro
        eyebrow="Produtos Inspire 3D"
        title={
          <>
            Produtos que carregam <span className="gold-text">identidade.</span>
          </>
        }
        description="Conheça nossas coleções e projetos autorais. Cada item mostra seu estágio real de desenvolvimento, sem disponibilidade ou preço presumidos."
      >
        <div className="flex flex-wrap gap-3">
          <Button href="/#colecoes">Conhecer as coleções</Button>
          <Button href="/orcamento" variant="outline">Conversar sobre uma ideia</Button>
        </div>
      </PageIntro>

      <section id="catalogo" className="scroll-mt-24 pb-(--spacing-section)">
        <Container>
          <form
            action="/produtos"
            method="get"
            className="panel grid gap-4 p-5 md:grid-cols-4 md:items-end md:p-6"
          >
            <div>
              <label htmlFor="filter-collection" className="field-label">Coleção</label>
              <select id="filter-collection" name="colecao" defaultValue={validCollection} className="input">
                <option value="">Todas as coleções</option>
                {collections.map((item) => (
                  <option key={item.slug} value={item.slug}>{item.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label htmlFor="filter-category" className="field-label">Categoria</label>
              <select id="filter-category" name="categoria" defaultValue={validCategory} className="input">
                <option value="">Todas as categorias</option>
                {categories.map((item) => <option key={item} value={item}>{item}</option>)}
              </select>
            </div>
            <div>
              <label htmlFor="filter-availability" className="field-label">Disponibilidade</label>
              <select id="filter-availability" name="disponibilidade" defaultValue={validAvailability} className="input">
                <option value="">Todos os status</option>
                {availabilityOptions.map((item) => (
                  <option key={item.value} value={item.value}>{item.label}</option>
                ))}
              </select>
            </div>
            <div className="flex gap-3">
              <Button type="submit" className="flex-1">Filtrar</Button>
              {(validCollection || validCategory || validAvailability) ? (
                <Link href="/produtos" className="link-underline self-center text-sm text-ash hover:text-chalk">
                  Limpar
                </Link>
              ) : null}
            </div>
          </form>

          {selectedCollection ? (
            <div className="mt-10 flex flex-col gap-3 border-l border-gold pl-5 md:flex-row md:items-end md:justify-between">
              <div>
                <p className="font-mono text-[0.625rem] uppercase tracking-[0.16em] text-gold">{selectedCollection.subtitle}</p>
                <h2 className="mt-2 font-display text-2xl font-semibold text-chalk">{selectedCollection.name}</h2>
                <p className="mt-2 max-w-2xl text-sm leading-relaxed text-ash">{selectedCollection.description}</p>
              </div>
              <Link
                href={`/orcamento?categoria=${collectionQuoteCategory[validCollection] ?? "outro"}`}
                className="link-underline shrink-0 text-sm text-silver hover:text-chalk"
              >
                Converse sobre sua ideia ↗
              </Link>
            </div>
          ) : null}

          {filtered.length ? (
            <ul className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {filtered.map((product) => <ProductCard key={product.id} product={product} />)}
            </ul>
          ) : (
            <div className="panel mt-8 p-8 md:p-12">
              <div aria-hidden className="grid-backdrop grid-backdrop--fine" />
              <div className="relative max-w-2xl">
                <p className="eyebrow">Novas criações estão sendo preparadas</p>
                <h2 className="mt-4 text-title text-chalk">
                  {selectedCollection ? `A ${selectedCollection.name} está tomando forma.` : "Nenhum produto nesta combinação."}
                </h2>
                <p className="mt-4 text-[0.95rem] leading-relaxed text-ash">
                  Ainda não há produtos publicados com esses filtros. Conte o que você gostaria de ver nessa coleção ou comece um projeto personalizado.
                </p>
                <div className="mt-7 flex flex-wrap gap-3">
                  <Button href={`/orcamento?categoria=${quoteCategory}`}>Conte sua ideia</Button>
                  <Button href="/produtos" variant="outline">Ver todos os produtos</Button>
                </div>
              </div>
            </div>
          )}

          <p className="mt-8 text-xs leading-relaxed text-ash/70">
            As artes conceituais identificam linhas e projetos em desenvolvimento; não substituem fotos de produtos finais.
          </p>
        </Container>
      </section>

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(breadcrumbJsonLd([{ name: "Produtos", path: "/produtos" }])),
        }}
      />
    </>
  );
}
