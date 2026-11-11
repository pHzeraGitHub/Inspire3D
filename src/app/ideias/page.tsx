import Image from "next/image";
import { Container } from "@/components/ui/Container";
import { Button } from "@/components/ui/Button";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { IdeaGallery } from "@/components/ideas/IdeaGallery";
import { breadcrumbJsonLd, pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata({
  title: "Ideias em criação",
  description: "Explore conceitos de caixas premium, impressão 3D, colecionáveis, festas e arquivos digitais da Inspire 3D.",
  path: "/ideias",
});

export default function IdeiasPage() {
  return (
    <>
      <section className="relative overflow-hidden pt-[120px] pb-14 md:pt-[132px] md:pb-20">
        <div aria-hidden className="absolute inset-0 -z-10 bg-[radial-gradient(110%_80%_at_60%_0%,#15181E_0%,#08090B_60%)]" />
        <Container className="grid items-center gap-10 lg:grid-cols-[0.95fr_1.05fr] lg:gap-14">
          <div>
            <Eyebrow>Ateliê de ideias</Eyebrow>
            <h1 className="mt-6 text-display font-semibold text-chalk">A próxima criação <span className="gold-text">pode começar aqui.</span></h1>
            <p className="mt-6 max-w-xl text-lead text-ash">Uma vitrine de possibilidades para imaginar, adaptar e desenvolver. Explore as ideias e conte qual delas mais se parece com o que você procura.</p>
            <div className="mt-9 flex flex-wrap gap-3">
              <Button href="/orcamento">Conte a sua ideia</Button>
              <Button href="/processos/cartonagem-caixas-premium" variant="outline">Conheça a fabricação</Button>
            </div>
          </div>
          <div className="relative mx-auto w-full max-w-[620px]">
            <div className="relative aspect-[1.5] overflow-hidden rounded-[24px] border border-gold-line bg-carbon shadow-panel">
              <Image src="/ideias/caixas-premium.png" alt="Estudo visual das caixas premium da Inspire 3D" fill priority sizes="(max-width: 1024px) 100vw, 50vw" className="object-cover object-center" />
            </div>
            <div className="absolute -bottom-5 -left-3 hidden w-[38%] overflow-hidden rounded-2xl border-4 border-void bg-carbon shadow-panel sm:block">
              <div className="relative aspect-[1.3]"><Image src="/ideias/trama-3d.png" alt="Estudo visual das miniaturas Trama 3D" fill sizes="220px" className="object-cover" /></div>
            </div>
            <span className="absolute bottom-4 right-4 rounded-full border border-gold-line bg-void/90 px-3 py-1.5 font-mono text-[0.6rem] uppercase tracking-[0.14em] text-gold-lum backdrop-blur">Artes conceituais</span>
          </div>
        </Container>
      </section>
      <section className="pb-(--spacing-section)">
        <Container>
          <div className="mb-9 rounded-2xl border border-gold-line bg-gold-veil p-5 text-sm leading-relaxed text-silver md:p-6">
            <strong className="text-gold-lum">Sobre os conceitos:</strong> as imagens mostram direções criativas, não fotografias de produtos finalizados. Arquivos digitais e downloads ainda estão em planejamento; formatos e licença serão confirmados antes da venda.
          </div>
          <IdeaGallery />
        </Container>
      </section>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd([{ name: "Ideias em criação", path: "/ideias" }])) }} />
    </>
  );
}
