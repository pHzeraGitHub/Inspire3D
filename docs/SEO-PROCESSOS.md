# Termos e processos para busca

Em 10/11/2026, foram acrescentadas páginas públicas em `/processos` para impressão 3D FDM, impressão em resina, modelagem 3D, pintura e acabamento, e cartonagem/caixas premium. Cada página tem título, resumo, descrição do processo, aplicações, etapas, termos relacionados visíveis, URL própria, link interno e dados estruturados `Service` e `BreadcrumbList`. Os serviços, o catálogo e o rodapé apontam para essas páginas. O sitemap inclui as seis novas URLs.

Os termos são ligados ao conteúdo real de cada processo. O Google [ignora `meta keywords`](https://developers.google.com/search/docs/crawling-indexing/special-tags), por isso o trabalho prioriza texto útil, títulos, descrições e navegação. A marcação estruturada ajuda a descrever o conteúdo, mas não garante destaque nem posição nas buscas. Não há marcação de preço, avaliações ou disponibilidade de produtos ainda em desenvolvimento. A marcação `HowTo` não foi usada porque o Google [descontinuou seu resultado enriquecido](https://developers.google.com/search/blog/2023/08/howto-faq-changes).

O staging Railway está intencionalmente com `SITE_NOINDEX=true`, `Disallow: /` e `X-Robots-Tag: noindex`. Essas páginas serão indexáveis apenas quando o código for publicado no domínio comercial sem essa variável. No corte, conferir o sitemap e as URLs canônicas do domínio, cadastrar o site no Google Search Console e enviar `/sitemap.xml`. A indexação e a posição dependem do mecanismo de busca.

Para novos produtos, escrever nome e descrição próprios, especificar materiais e processo **somente quando confirmados**, publicar fotos reais com texto alternativo e manter os campos de SEO do produto atualizados. Tags úteis descrevem a peça; repetir palavras-chave sem contexto não ajuda o visitante.
