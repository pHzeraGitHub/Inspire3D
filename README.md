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
| Dependências de runtime | `next`, `react`, `react-dom`, `pg`, `@electric-sql/pglite`, `exceljs`, `jszip` |

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
│   ├── produtos/             # catálogo público ligado ao cadastro administrativo
│   ├── orcamento/            # ORÇAMENTO INTELIGENTE (Fase 2 — entregue)
│   ├── contato/  sobre/
│   └── api/
│       ├── quote/route.ts        # contrato do orçamento (ativo, simplificado)
│       └── inspire-ai/route.ts   # conversa com Inspire AI quando configurada
├── components/
│   ├── ui/        # Button, Card, Chip, Eyebrow, Section, SectionHeading,
│   │              # Container, Accordion, Reveal
│   ├── layout/    # Header, Footer, PageIntro, ComingSoon,
│   │              # WhatsAppButton, LegalDoc
│   ├── sections/  # uma seção da Home por arquivo
│   └── visuals/   # Logo, BuildCube, StageGlyph, ProjectArt, ShelfArt
├── features/      # quote/ — orçamento e Inspire AI; admin/ — painel de gestão
├── config/        # site.ts (marca) · nav.ts (menus) · pricing.ts (TABELA DE PREÇO)
├── content/       # verticals, process, technologies, projects, faq
│                  # services, steps, business
├── lib/           # utils · seo · quote (motor) · quote-validation
│                  # rate-limit · mailer · inspire-ai
└── types/         # contratos de domínio (Vertical, Project, Quote…)
```

**Catálogo e conteúdo:** páginas institucionais continuam usando `src/content/*`;
produtos publicados vêm do banco local ou PostgreSQL e mantêm o contrato em
`src/types`, sem exigir mudanças nos componentes públicos.

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
| ~~3~~ | **Banco PostgreSQL para catálogo e estoque — primeira versão** | `/admin`, `DATABASE_URL` |
| ~~4~~ | ~~Inspire AI~~ **ENTREGUE**        | `docs/FASE-4-inspire-ai.md` |
| ~~5~~ | **Catálogo, estoque e custos — primeira versão entregue** | `/admin`, `/produtos` |
| ~~6~~ | **Vendas manuais e baixa de produtos acabados — primeira versão entregue** | `/admin/vendas` |

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

## Painel administrativo — vendas, produtos, materiais e produção

O painel privado fica em **`/admin/login`**. Ele usa PostgreSQL embutido (PGlite)
para manter materiais, compras, fichas técnicas, catálogo público, saldos e movimentações.
O login usa cookie assinado, `HttpOnly`, `SameSite=Strict`, validade de 12 horas,
limite de tentativas e proteção de origem nas operações administrativas.

### Configurar localmente

Não precisa instalar PostgreSQL, Docker nem criar conta em um serviço. Com
Node.js 20+, rode `npm install` e depois `npm run dev`. Sem `DATABASE_URL`, o
site usa PGlite e salva os dados em `.data/inspire3d` (ou no caminho definido em
`PGLITE_DATA_DIR`). Essa pasta é local e fica fora do Git.

Para habilitar o login, crie `.env.local` na raiz com estas variáveis:

```env
ADMIN_EMAIL="seu-email-local"
ADMIN_PASSWORD="uma-senha-com-pelo-menos-12-caracteres"
ADMIN_SESSION_SECRET="um-segredo-aleatorio-com-pelo-menos-32-caracteres"
PGLITE_DATA_DIR=".data/inspire3d"
```

Gere o segredo no terminal com:
`node -e "console.log(require('node:crypto').randomBytes(32).toString('base64url'))"`.
Depois reinicie `npm run dev` e acesse `/admin/login`. Na primeira leitura do
catálogo ou entrada no painel, o sistema cria as tabelas e carrega os registros
iniciais da planilha e do produto que já existia.

Para reiniciar as tabelas, pare o servidor e apague a pasta definida em
`PGLITE_DATA_DIR`. Para fazer backup, copie a pasta `.data` com o servidor
parado. Ela contém o banco local e o arquivo privado usado para repor o histórico
de compras caso o banco precise ser recriado.

### Hospedar em um servidor depois

Em um servidor Node com disco persistente e uma única instância, o mesmo PGlite
pode continuar em `.data/inspire3d`; garanta que essa pasta seja preservada entre
deploys e incluída nos backups. Se o serviço for escalado para várias instâncias
ou usar armazenamento efêmero, configure um PostgreSQL gerenciado em
`DATABASE_URL` e use `DATABASE_SSL=true` apenas quando exigido pelo provedor.
Mantenha `ADMIN_EMAIL`, `ADMIN_PASSWORD` e `ADMIN_SESSION_SECRET` como variáveis
seguras do servidor, fora do repositório.

### Como o controle funciona

- As 15 compras da aba `Compras` da planilha são importadas uma única vez como
  histórico financeiro. O arquivo original e a cópia privada do histórico ficam
  fora do Git. Máquinas, insumos e filamentos conservam categoria, loja, cartão,
  valor total e parcelas.
- A planilha não informa os nomes de todos os materiais nem quantidades. O
  histórico de compras não é convertido em saldo de estoque. Faça a contagem
  atual, cadastre unidades e custo unitário em **Materiais**.
- O botão **Baixar modelo Excel** nas páginas de Materiais e Produtos baixa o
  arquivo `public/modelos/Modelo_Importacao_Inspire3D.xlsx`. Ele contém abas para
  materiais, produtos, ficha técnica e variações. A importação valida todas as
  linhas antes de gravar; SKUs já cadastrados são ignorados e produtos usam o
  slug como chave para atualização.
- Cada produto pode ter uma ficha técnica com consumo por unidade. O painel
  mostra insumos estimados, valor bruto após insumos e lucro líquido estimado.
  O líquido desconta mão de obra, energia, embalagem, outros custos, impostos e
  taxas percentuais preenchidos no produto. A margem da venda continua estimada:
  custos reais de frete e demais despesas não são apurados automaticamente.
- Em **Produzir**, o sistema valida todos os saldos e baixa a ficha técnica em
  uma transação de banco: ou todos os materiais são baixados, ou nenhum. Também
  registra a quantidade de produtos acabados e o custo da produção.
- Em **Vendas**, cadastre pedidos vindos de WhatsApp, Instagram ou orçamento.
  Rascunhos podem ser editados. Confirmar reserva produtos de pronta entrega;
  cancelar libera a reserva. Entregar baixa os produtos acabados, sem permitir
  saldo negativo. Pagamento é marcado separadamente como recebido ou estornado.
  Itens sob encomenda podem ser produzidos diretamente no pedido; essa produção
  baixa insumos, soma o produto acabado e fica vinculada à venda. Itens
  personalizados sem produto cadastrado não movimentam estoque automaticamente.
  O painel mostra o histórico recente de produções e entregas.
- Marcar **Publicar no catálogo do site** faz o item aparecer no catálogo,
  página individual, destaque (se selecionado) e sitemap. O site ainda direciona
  para orçamento/contato; checkout e pagamento não fazem parte desta versão.
- Entradas de material atualizam o custo médio ponderado; baixas que fariam o
  saldo ficar negativo são recusadas. Contagens permitem informar o saldo físico
  observado e ficam registradas no histórico.

O painel não substitui a confirmação de quantidade e identificação dos itens da
planilha. Ele deixa esses campos explícitos para o estoque iniciar com dados
confiáveis.

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
