<<<<<<< HEAD
# Inspire 3D — Site oficial

> **Transformando ideias em realidade.**
> Estúdio de fabricação criativa: impressão 3D, modelagem e personalização.

Fase 1 do projeto: fundação técnica, Design System e Home page completa.

---

## Como rodar

Requisitos: **Node.js 20+**.

```bash
npm install
npm run dev       # http://localhost:3000
```

Outros scripts:

```bash
npm run build     # build de produção
npm run start     # servidor de produção
npm run lint      # ESLint
npm run typecheck # TypeScript sem emitir
```

> Na primeira execução o Next baixa as fontes do Google (Space Grotesk, Inter,
> JetBrains Mono) — é preciso estar online. Depois disso elas ficam no cache e
> são servidas pelo seu próprio domínio.

---

## Stack

| Camada      | Escolha                                    |
| ----------- | ------------------------------------------ |
| Framework   | Next.js 15 · App Router · Server Components |
| Linguagem   | TypeScript (strict)                        |
| Estilo      | Tailwind CSS v4 (tokens em `@theme`)       |
| Fontes      | `next/font/google` (self-hosted no build)  |
| Animação    | CSS puro + IntersectionObserver            |
| Ilustração  | SVG autoral (sem WebGL, sem bibliotecas 3D) |
| Dependências de runtime | apenas `next`, `react`, `react-dom` |

---

## Estrutura

```
src/
├── app/
│   ├── layout.tsx            # shell, fontes, metadata, JSON-LD
│   ├── page.tsx              # HOME (composição das seções)
│   ├── globals.css           # DESIGN SYSTEM (tokens + componentes)
│   ├── sitemap.ts robots.ts not-found.tsx
│   ├── servicos/            # SERVIÇOS — capacidades, passos, B2B
│   ├── projetos/             # listagem + [slug]
│   ├── politica-de-privacidade/  termos/   # LGPD
│   ├── produtos/             # reservado (Fase 5 — e-commerce)
│   ├── orcamento/            # ORÇAMENTO INTELIGENTE (Fase 2 — entregue)
│   ├── contato/  sobre/
│   └── api/
│       ├── quote/route.ts        # contrato do orçamento (ativo, simplificado)
│       └── inspire-ai/route.ts   # contrato do agente (501 até a Fase 4)
├── components/
│   ├── ui/        # Button, Card, Chip, Eyebrow, Section, SectionHeading,
│   │              # Container, Accordion, Reveal
│   ├── layout/    # Header, Footer, PageIntro, ComingSoon,
│   │              # WhatsAppButton, LegalDoc
│   ├── sections/  # uma seção da Home por arquivo
│   └── visuals/   # Logo, BuildCube, StageGlyph, ProjectArt, ShelfArt
├── features/      # quote/ — wizard, upload, resultado, briefing, Inspire AI
├── config/        # site.ts (marca) · nav.ts (menus) · pricing.ts (TABELA DE PREÇO)
├── content/       # verticals, process, technologies, projects, faq
│                  # services, steps, business
├── lib/           # utils · seo · quote (motor) · quote-validation
│                  # rate-limit · mailer · inspire-ai
└── types/         # contratos de domínio (Vertical, Project, Quote…)
```

**Regra de ouro:** `src/content/*` tem o mesmo formato dos tipos em
`src/types`. Quando entrar CMS ou banco de dados, troca-se a origem dos dados
sem tocar em nenhum componente.

---

## Design System

Todos os tokens vivem em `src/app/globals.css`, dentro de `@theme` — o que os
transforma automaticamente em utilitários do Tailwind
(`bg-void`, `text-gold`, `border-line`, `text-hero`, `rounded-panel`…).

| Token             | Valor     | Uso                       |
| ----------------- | --------- | ------------------------- |
| `--color-void`    | `#08090B` | fundo principal           |
| `--color-graphite`| `#111317` | fundo secundário          |
| `--color-carbon`  | `#16191E` | cards                     |
| `--color-steel`   | `#1D2127` | superfície elevada        |
| `--color-gold`    | `#D4A437` | dourado principal         |
| `--color-gold-lum`| `#F0C75E` | dourado luminoso          |
| `--color-silver`  | `#B7BBC2` | prata                     |
| `--color-chalk`   | `#F5F5F5` | texto principal           |
| `--color-ash`     | `#8A8F98` | texto de apoio            |

Tipografia: **Space Grotesk** (display) · **Inter** (texto) · **JetBrains Mono**
(rótulos técnicos). Escalas fluidas: `text-hero`, `text-display`, `text-title`,
`text-lead`.

Classes de sistema disponíveis: `.shell`, `.eyebrow`, `.gold-text`,
`.silver-text`, `.card`, `.panel`, `.btn` (+`--gold/--outline/--ghost/--sm/--lg`),
`.chip`, `.rule`, `.grid-backdrop`, `.noise`, `.halo`, `.scanline`, `.reveal`,
`.marquee`, `.rail-pad`, `.link-underline`, `.index-num`.

Movimento respeita `prefers-reduced-motion`.

---

## Fases seguintes (já preparadas na arquitetura)

| Fase | Escopo                              | Onde já existe âncora                          |
| ---- | ----------------------------------- | ---------------------------------------------- |
| ~~2~~ | ~~Orçamento inteligente~~ **ENTREGUE** | `docs/FASE-2-orcamento.md` |
| 3    | Banco de dados / CMS                | `src/content/*` com o shape de `src/types`     |
| ~~4~~ | ~~Inspire AI~~ **ENTREGUE**        | `docs/FASE-4-inspire-ai.md` |
| 5    | Produtos e e-commerce               | `/produtos`, tipo `Product`                    |

Variáveis de ambiente de cada fase estão listadas em `.env.example`.

---

## Inspire AI

O agente de conversa está construído. Ponha `ANTHROPIC_API_KEY` no `.env.local`
e a aba "Conversar" aparece em `/orcamento`. Sem a chave nada quebra — o
formulário continua sendo o caminho.

A regra do desenho: **a IA conversa, o motor calcula**. O modelo nunca diz
preço. Detalhes e custo por conversa em `docs/FASE-4-inspire-ai.md`.

---

## Preços

A tabela está calibrada e no ar. Toda a política comercial vive em
**`src/config/pricing.ts`** — preço base, multiplicadores de tamanho e
acabamento, pisos de mão de obra, modelagem, escala e prazos. É o único
arquivo a editar para mexer em valor.

Dois campos seguem marcados « DEFINIR » e hoje são neutros: `urgencyFactor`
(acréscimo por urgência) e `minUnitPrice` (piso por unidade de
máquina+material). Detalhes em `docs/FASE-2-orcamento.md`.

---

## QA

`docs/QA-fase-1.md` registra a revisão completa da Fase 1: o que foi verificado,
os 10 problemas encontrados e corrigidos, e as pendências que dependem de
decisão sua.

---

## Antes de publicar

- [ ] Substituir o conteúdo de `src/components/visuals/Logo.tsx` pelo arquivo oficial da marca
- [ ] Preencher `NEXT_PUBLIC_SITE_URL` e `NEXT_PUBLIC_WHATSAPP`
- [ ] Conferir e-mail, redes sociais e dados legais em `src/config/site.ts`
- [ ] Trocar as artes geradas do portfólio por fotos reais (campo `cover` em `Project`)
- [ ] **Revisar `/politica-de-privacidade` e `/termos` com advogado** e preencher razão social, CNPJ e foro
- [x] `public/og-image.png` (1200×630), favicon, apple-touch-icon e webmanifest
=======
# Inspire3D
>>>>>>> 24e8a7ee6fcf78edcadca74113521d42f47158fb
