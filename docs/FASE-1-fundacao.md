# Inspire 3D — Fase 1 · Fundação do projeto

Documento de decisões. Tudo aqui já está implementado no código.

---

## 1. Leitura do briefing → conceito do site

O briefing pede uma coisa acima de todas: que o visitante entenda, em segundos,
que a Inspire 3D **transforma o digital em matéria**. A decisão central da Fase 1
foi transformar isso na espinha dorsal da página inteira, e não em um slogan
solto no topo:

> **IDEIA → DIGITAL → FABRICAÇÃO → REALIDADE**

Essa cadeia aparece três vezes, em profundidades diferentes:

1. **Hero** — como uma linha de estágios sob o título, e como imagem: um cubo
   isométrico em que a metade de baixo já é matéria dourada com estrias de
   camada e a de cima ainda é wireframe, com o cabeçote depositando a camada
   atual.
2. **Seção Processo** — as quatro etapas explicadas, ligadas por um trilho
   dourado (horizontal no desktop, vertical no mobile).
3. **Seção Inspire AI** — a mesma tradução, agora feita por software: linguagem
   comum entra, especificação de fabricação sai.

O que fica de fora de propósito: qualquer coisa que aproxime a marca de
"gráfica" ou "loja de brinde". Não há banner promocional, não há preço em
destaque, não há depoimento inventado e não há stock photo genérica.

---

## 2. Arquitetura técnica

| Decisão | Motivo |
| --- | --- |
| **Next.js 15 + App Router** | Server Components por padrão: a Home chega ao navegador como HTML, o que é decisivo para SEO local ("impressão 3D", "action figure personalizado") e para o LCP. |
| **TypeScript strict** | Os contratos de `Product`, `Project`, `QuoteRequest` etc. são o que permite trocar conteúdo estático por banco de dados sem reescrever UI. |
| **Tailwind v4 com `@theme`** | O Design System vira token CSS **e** utilitário Tailwind ao mesmo tempo, numa fonte única de verdade (`globals.css`). Sem `tailwind.config.js` para dessincronizar. |
| **Zero dependências de runtime além de React/Next** | Nada de bibliotecas de animação ou 3D. Toda a linguagem visual é SVG autoral + CSS. Bundle pequeno = site rápido = melhor conversão e melhor Core Web Vitals. |
| **`next/font/google`** | As fontes são baixadas no build e servidas pelo próprio domínio: sem FOUT, sem requisição a terceiros. |
| **Client Components pontuais** | Apenas `Header` (scroll/menu) e `Reveal` (IntersectionObserver). Todo o resto é server-rendered. |

### Preparação para as fases seguintes

Nada foi construído "por cima" depois: os pontos de extensão já existem.

- **Orçamento inteligente** — `/orcamento`, `POST /api/quote` (valida e responde
  com estimativa), `src/lib/quote.ts` com o motor de cálculo isolado, e os tipos
  `QuoteRequest` / `QuoteEstimate`. A Fase 2 troca o miolo de `estimateQuote`
  por cálculo sobre a geometria real — a assinatura não muda.
- **Produtos / e-commerce** — rota `/produtos` e tipo `Product` com
  `priceFrom`, `images`, `available`.
- **Projetos / portfólio** — `/projetos` e `/projetos/[slug]` já funcionam com
  `generateStaticParams`; o campo `cover` espera as fotos reais.
- **Inspire AI** — `POST /api/inspire-ai` responde `501` com mensagem, mantendo
  o mesmo formato de resposta que a Fase 4 vai preencher.
- **Banco de dados / CMS** — todo conteúdo está em `src/content/*` no formato
  exato de `src/types`. A migração é trocar a origem do import.
- **Ambiente** — `.env.example` já lista as variáveis de cada fase.

---

## 3. Sitemap

```
/                       Home  (entregue nesta fase)
├── #processo           Da ideia à realidade — 4 etapas
├── #fabricamos         O que fabricamos — 6 verticais
├── #tecnologias        O laboratório — FDM, resina, modelagem, acabamento
├── #orcamento          Orçamento inteligente (chamada)
└── #inspire-ai         Inspire AI (teaser)

/projetos               Portfólio          → grid completo
/projetos/[slug]        Projeto individual → ficha técnica (Fase 2)
/produtos               Catálogo           → reservado (Fase 5)
/orcamento              Orçamento          → reservado (Fase 2)
/contato                Canais diretos     → entregue
/sobre                  O estúdio          → entregue
/sitemap.xml  /robots.txt                  → gerados automaticamente
```

Rotas ainda não construídas não dão 404: entregam uma página premium com o
roadmap daquela função e um CTA para o contato. Nada de "página em branco".

---

## 4. Design System

### Cores

Preto · grafite · prata · dourado, exatamente como no briefing. O dourado é
**destaque, não superfície**: aparece em rótulos, em uma palavra por título, no
botão primário e nos brilhos — nunca como fundo de bloco.

```
void      #08090B   fundo principal
graphite  #111317   fundo secundário (alterna o ritmo das seções)
carbon    #16191E   cards
steel     #1D2127   superfície elevada
gold      #D4A437   dourado principal
gold-lum  #F0C75E   dourado luminoso (brilho, hover)
gold-deep #8A6A1E   sombra do dourado
silver    #B7BBC2   prata (texto técnico, linhas)
chalk     #F5F5F5   texto principal
ash       #8A8F98   texto de apoio
line      rgba(183,187,194,.12)   hairlines
```

### Tipografia

| Papel | Fonte | Onde |
| --- | --- | --- |
| Display | **Space Grotesk** 600 | títulos, botões, números de destaque |
| Texto | **Inter** 400 | parágrafos |
| Técnico | **JetBrains Mono** | eyebrows, specs, índices, rótulos |

Escala fluida (clamp), sem breakpoints de tipografia espalhados:

```
text-hero     clamp(2.4rem, 5vw, 4.5rem)     line-height 1     tracking -0.035em
text-display  clamp(2rem, 3.9vw, 3.25rem)    line-height 1.02  tracking -0.03em
text-title    clamp(1.6rem, 2.6vw, 2.35rem)
text-lead     clamp(1.02rem, 1.25vw, 1.22rem)
```

### Espaçamento

Escala padrão do Tailwind (4px) + um token de ritmo vertical:
`--spacing-section: clamp(4.5rem, 7.5vw, 7.5rem)`, aplicado por `<Section>`.
Container: `.shell` — 1240px, padding 20 / 32 / 40px.

### Botões

`.btn` + variante. Altura 48px (40 no `sm`, 54 no `lg`), raio total.

- **gold** — gradiente metálico, brilho interno no topo, sombra dourada; sobe 2px no hover. Ação primária, uma por tela.
- **outline** — vidro escuro com borda prata; no hover a borda vira dourada.
- **ghost** — link com peso de botão.

### Cards

`.card` — fundo carbono, hairline, filete metálico no topo (`::after`), e no
hover: borda dourada + elevação de 4px + halo radial (`.card__glow`).
`.panel` — versão grande, com gradiente e sombra profunda, para blocos de
destaque (orçamento, Inspire AI, convites).

### Fundos, bordas e efeitos

- `.grid-backdrop` — grid técnico com máscara radial (variante `--fine`, 28px).
- `.noise` — grão de filme em SVG inline, 3,5% de opacidade.
- `.halo` — brilho dourado desfocado, sempre contido por `overflow-x-clip`.
- `.rule` / `.rule--gold` — hairlines com fade nas pontas.
- `.gold-text` / `.silver-text` — gradiente metálico aplicado ao texto.
- `.scanline` — linha de fabricação luminosa.

### Padrões de animação

| Padrão | Onde | Como |
| --- | --- | --- |
| Revelação em scroll | seções e grades | `.reveal` + IntersectionObserver, escalonada por `--reveal-delay` |
| Cabeçote de impressão | Hero | keyframe `printhead`, sobe e some em loop |
| Marquee técnico | barra de capacidades | keyframe `marquee`, 42s linear |
| Hover de card | grades | borda + translateY + halo |
| Cursor piscando | Inspire AI | `animate-caret` |

Curvas: `--ease-out-expo` para entradas, `--ease-in-out-soft` para loops.
Durações: 300ms (micro), 450ms (hover), 900ms (revelação).
Tudo desligado sob `prefers-reduced-motion: reduce`.

---

## 5. Estrutura visual da Home, seção por seção

| # | Seção | Papel | Componente |
| --- | --- | --- | --- |
| 01 | **Hero** | Impacto e promessa. Título, subtítulo, cadeia de 4 estágios, dois CTAs, quatro capacidades, e o cubo em fabricação. Fundo: gradiente radial + grid + halos + grão. | `sections/Hero` |
| 02 | **Barra de capacidades** | Marquee monoespaçado com o que o estúdio faz. Diz "laboratório" antes de qualquer texto. | `sections/CapabilitiesMarquee` |
| 03 | **Processo** | O conceito da marca explicado: 4 etapas com glifo próprio, ligadas por trilho dourado. | `sections/ProcessSection` |
| 04 | **O que fabricamos** | Bento assimétrico de 6 verticais; o card em destaque traz uma composição isométrica. | `sections/VerticalsSection` |
| 05 | **O laboratório** | Ficha técnica das 4 tecnologias em linhas com specs — leitura de datasheet, não de "nossos serviços". | `sections/TechnologiesSection` |
| 06 | **Projetos** | Trilho horizontal de cards com arte gerada + cartão-convite ao final. | `sections/ProjectsSection` |
| 07 | **Orçamento inteligente** | O diferencial comercial: 3 passos + mock do painel de estimativa (marcado como exemplo ilustrativo). | `sections/QuoteSection` |
| 08 | **Inspire AI** | Teaser com badge "em desenvolvimento" e mock de briefing gerado. | `sections/InspireAiSection` |
| 09 | **Como trabalhamos** | Quatro compromissos — confiança antes de tecnologia. | `sections/StudioSection` |
| 10 | **FAQ** | Acordeão nativo (`<details>`), coluna esquerda fixa. | `sections/FaqSection` |
| 11 | **CTA final** | "Você imagina. A gente fabrica." + WhatsApp e e-mail. | `sections/CtaSection` |
| — | Header / Footer | Header transparente que ganha blur no scroll; menu mobile em painel. | `layout/Header`, `layout/Footer` |

---

## 6. Componentes reutilizáveis

**UI (`components/ui`)** — `Button`, `Card`, `Chip`, `Eyebrow`, `Section`,
`SectionHeading`, `Container`, `Accordion`, `Reveal`.

**Layout (`components/layout`)** — `Header`, `Footer`, `PageIntro`
(cabeçalho padrão das páginas internas), `ComingSoon` (bloco de roadmap das
rotas reservadas).

**Visuais (`components/visuals`)** — `Logo`/`LogoMark`, `BuildCube` (hero),
`StageGlyph` (processo), `ProjectArt` (portfólio), `ShelfArt` (card em destaque).

Toda ilustração é SVG autoral e vetorial: escala sem perda, pesa poucos KB e
está sob controle do código, não de um arquivo de imagem.

---

## 7. Acessibilidade e performance

- Contraste do texto de apoio (`ash` sobre `void`) acima de 4.5:1.
- Foco visível dourado em todos os elementos interativos; link "pular para o conteúdo".
- FAQ e menu funcionam com teclado; FAQ funciona até sem JavaScript.
- Elementos decorativos marcados com `aria-hidden`.
- Sem imagens raster na Home → LCP é texto.
- `overflow-x-clip` nas seções: nenhum scroll horizontal em nenhuma largura.
- Metadata completa, Open Graph, Twitter Card, JSON-LD de `Organization`,
  `sitemap.xml` e `robots.txt` automáticos.

---

## 8. Revisão crítica feita antes de fechar a Fase 1

A Home foi renderizada e inspecionada em **390px, 820px, 1100px e 1440px**.
Corrigido nesta rodada:

1. Título do Hero estourava a coluna no desktop → escala e proporção da grade ajustadas.
2. Halos decorativos alargavam o documento em 65px no mobile (empurrando o botão do menu para fora da tela) → `overflow-x-clip` nas seções.
3. Gradiente prata escurecia a última linha de títulos de 3 linhas → gradiente reequilibrado.
4. Card em destaque do bento tinha um vazio de ~250px → recebeu a composição `ShelfArt`.
5. Colunas de specs das tecnologias quebravam valores em duas linhas → proporção 4/3/5.
6. Cabeçote de impressão do Hero atravessava a peça sólida → passou a depositar a camada no topo.
7. Trilho vertical do processo não aparecia no mobile → reposicionado e conectado entre etapas.
8. Rótulos do briefing da Inspire AI (largura fixa de 144px) espremiam os valores no mobile → empilham abaixo de 640px.
9. Trilho do portfólio não alinhava com o container em telas largas → classe `.rail-pad`.
10. Ritmo vertical reduzido para eliminar faixas de vazio entre seções.

---

## 9. O que ficou pendente de decisão sua

Estes pontos dependem do negócio, não de código:

1. **Logo oficial** — o arquivo enviado na pasta está com 0 byte. A marca hoje é uma versão em SVG que segue a descrição do briefing (pórtico + cubo dourado). Envie o arquivo real para eu substituir.
2. **Briefing completo** — o `.docx` da pasta também está vazio; trabalhei com o texto do prompt do projeto. Se houver seções além do item 5, me envie.
3. **Dados de contato** — e-mail, WhatsApp, redes e cidade estão com placeholders em `src/config/site.ts`.
4. **Faixas de preço e prazo** — o painel de orçamento mostra `R$ 000 – 000` e está rotulado como exemplo ilustrativo. Preciso dos seus números reais (ou da regra de cálculo) para a Fase 2.
5. **Portfólio real** — fotos das peças, para substituir as artes geradas.
