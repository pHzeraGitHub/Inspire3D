import { PageIntro } from "@/components/layout/PageIntro";
import { ComingSoon } from "@/components/layout/ComingSoon";
import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata({
  title: "Produtos",
  description:
    "Catálogo de produtos autorais da Inspire 3D — colecionáveis, componentes para board games e objetos de design.",
  path: "/produtos",
});

export default function ProdutosPage() {
  return (
    <>
      <PageIntro
        eyebrow="Catálogo"
        title="Produtos autorais Inspire 3D."
        description="Uma linha própria de peças prontas para comprar, além da fabricação sob demanda. O catálogo abre quando as primeiras séries estiverem finalizadas."
      />
      <ComingSoon
        title="Fase 5 — Loja"
        description="O tipo Product e a rota /produtos já existem no projeto. A vitrine, o carrinho e o checkout entram junto com o e-commerce."
        roadmap={[
          "Catálogo com filtros por categoria e tecnologia",
          "Página de produto com variações e prazo de produção",
          "Carrinho e checkout com pagamento",
          "Acompanhamento de pedido e frete",
        ]}
      />
    </>
  );
}
