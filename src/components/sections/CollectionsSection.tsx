import Link from "next/link";
import { Section } from "@/components/ui/Section";
import { Container } from "@/components/ui/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { CollectionArtwork } from "@/components/visuals/CollectionArtwork";
import { collections } from "@/content/collections";

export function CollectionsSection() {
  return (
    <Section id="colecoes" tone="graphite" className="scroll-mt-24 border-y border-line">
      <Container>
        <SectionHeading
          eyebrow="Nossas coleções"
          title={
            <>
              Quatro linhas. <span className="gold-text">Muitas formas de inspirar.</span>
            </>
          }
          description="Cada coleção parte de uma intenção diferente: surpreender, colecionar, jogar ou resolver algo do dia a dia."
        />

        <ul className="mt-12 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {collections.map((collection, index) => (
            <li key={collection.slug}>
              <Link
                href={`/produtos?colecao=${collection.slug}#catalogo`}
                className="card card--hover group block h-full overflow-hidden"
              >
                <figure className="relative aspect-[4/3] overflow-hidden border-b border-line bg-[radial-gradient(ellipse_at_50%_55%,#26231B_0%,#15171B_62%,#111317_100%)]">
                  <CollectionArtwork collection={collection.slug} className="size-full transition-transform duration-700 group-hover:scale-[1.04]" />
                  <figcaption className="absolute bottom-3 left-4 font-mono text-[0.5625rem] uppercase tracking-[0.15em] text-silver/65">
                    Estudo visual · coleção {String(index + 1).padStart(2, "0")}
                  </figcaption>
                </figure>

                <div className="p-6">
                  <p className="font-mono text-[0.625rem] uppercase tracking-[0.15em] text-gold">
                    {collection.subtitle}
                  </p>
                  <h3 className="mt-2 font-display text-xl font-semibold text-chalk">
                    {collection.name}
                  </h3>
                  <p className="mt-3 text-sm leading-relaxed text-ash">{collection.description}</p>
                  <ul className="mt-5 flex flex-wrap gap-2" aria-label={`Possibilidades de ${collection.name}`}>
                    {collection.possibilities.map((possibility) => (
                      <li
                        key={possibility}
                        className="rounded-full border border-line px-2.5 py-1 font-mono text-[0.5625rem] uppercase tracking-[0.08em] text-silver/75"
                      >
                        {possibility}
                      </li>
                    ))}
                  </ul>
                  <span className="link-underline mt-6 inline-flex text-sm text-chalk group-hover:text-gold-lum">
                    Conhecer a coleção <span aria-hidden className="ml-2">↗</span>
                  </span>
                </div>
              </Link>
            </li>
          ))}
        </ul>
        <p className="mt-5 text-xs leading-relaxed text-ash/70">
          As artes desta seção são estudos visuais das coleções; não representam produtos disponíveis para compra.
        </p>
      </Container>
    </Section>
  );
}
