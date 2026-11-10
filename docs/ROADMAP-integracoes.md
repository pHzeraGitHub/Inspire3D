# Inspire 3D — Roadmap de integrações

Quatro capacidades pedidas para o "super site": **foto → 3D com IA**, **sincronização
com marketplaces**, **publicação automática nas redes** e **venda de arquivos digitais**.
Este documento registra como cada uma funciona de verdade, o que é armadilha e
em que ordem construir.

Fonte das checagens: setembro de 2026.

**Nova frente em 10/11/2026:** a [loja de arquivos digitais](LOJA-ARQUIVOS-DIGITAIS.md)
usa o mesmo catálogo e pedido, mas precisa de pagamento confirmado, licença e
entrega privada. A venda de arquivos por marketplace depende das regras de cada
canal; a liberação de download não pode depender apenas da página de retorno do
checkout.

---

## 1. Foto / imagem → modelo 3D com IA, dentro do site

### O que é realista hoje

Modelos de *image-to-3D* amadureceram e existem como API paga. Ordem de grandeza
de **US$ 0,08 a 0,50 por modelo gerado**, com 20 segundos a 3 minutos de espera:

| Provedor | Preço aprox./modelo | Formatos | Observação |
| --- | --- | --- | --- |
| TRELLIS.2 (Microsoft) | US$ 0,08 – 0,15 | GLB, STL | Foto única, mais rápido |
| Meshy | US$ 0,10 – 0,25 | GLB, STL, 3MF | Melhor documentação, SOC2/ISO 27001 |
| Tripo AI | US$ 0,10 – 0,25 | só GLB | Estilizações (voxel, LEGO), auto-rig |
| Hunyuan 3D (Tencent) | US$ 0,18 – 0,50 | GLB, OBJ, STL | Texto, imagem e multi-vista |
| Rodin / Hyper3D | US$ 0,50+ (assinatura mín. ~US$ 120/mês) | GLB, OBJ, FBX, USDZ, STL | Maior qualidade, texturas 4K |

### A armadilha

**Malha gerada por IA não é peça imprimível.** O que sai é ótimo para *visualizar*
— e péssimo para mandar direto para a impressora. Faltam: espessura de parede
mínima, malha fechada (watertight), escala real em milímetros, separação de
partes, encaixes, tolerâncias e suportes. Prometer "carregue a foto e imprima"
gera pedido frustrado e retrabalho que come a margem.

### O posicionamento certo para a Inspire 3D

Vender isso como **pré-visualização instantânea que vira orçamento**, não como
fabricação automática. O fluxo:

```
foto do cliente
   → API image-to-3D                    (~30s)
   → visualizador 3D no site            (<model-viewer>, gira, dá zoom)
   → cálculo automático de volume/bbox  (three.js ou trimesh no servidor)
   → faixa de preço e prazo na hora     (motor já existente em lib/quote.ts)
   → "Aprovar e enviar para o estúdio"
   → aqui entra a modelagem humana: reparo, escala, encaixes, suportes
```

O ganho comercial é enorme e honesto: o cliente vê a ideia dele em 3D em 30
segundos e recebe um número — mas quem entrega peça imprimível continua sendo o
estúdio. É exatamente o "IDEIA → DIGITAL" do site, automatizado na primeira metade.

### Peças de código

- `POST /api/ai/image-to-3d` — recebe imagem, chama o provedor, devolve `jobId`
- Job assíncrono + webhook (a geração passa do timeout de request)
- Storage de arquivos (S3/R2) para imagem de entrada e GLB de saída
- `<model-viewer>` no front (Web Component do Google, leve, sem three.js na mão)
- Análise de malha no servidor para alimentar `estimateQuote()`:
  volume, bounding box, se é watertight, contagem de triângulos
- Gate anti-abuso: geração custa dinheiro → limite por IP/sessão, ou e-mail obrigatório

**Nota jurídica:** gerar 3D a partir de foto de personagem de terceiros (Marvel,
Disney, anime) e vender a peça é violação de direito autoral e de marca. O fluxo
precisa de aceite explícito de que o cliente tem direito sobre a imagem enviada,
e o estúdio precisa recusar pedidos de personagem licenciado — isso é risco real
no nicho de colecionáveis, não formalidade.

---

## 2. Site ↔ marketplaces (Mercado Livre, Shopee, Amazon, Shein)

### Como funciona

Todos os grandes têm API pública com OAuth: Mercado Livre
(`developers.mercadolivre.com.br`), Shopee Open Platform, Amazon SP-API.
Publicar por API é possível — cadastrar item, preço, estoque, fotos, atributos e
receber pedidos de volta.

### A armadilha

**Cada marketplace tem um catálogo próprio e incompatível.** Categoria,
atributos obrigatórios, limite de caracteres do título, número e proporção de
fotos, regras de variação, tabela de frete — tudo diferente. Não existe "publicar
igual nos três". O que existe é **um produto canônico no seu banco + um adaptador
por canal** que traduz esse produto para o formato de cada um.

E há o problema que quebra operação de verdade: **estoque compartilhado**. Se o
mesmo item vende no site e no Mercado Livre no mesmo minuto, alguém fica sem
peça. Precisa de reserva de estoque centralizada, com o site como fonte da verdade.

### Duas rotas

**Rota A — hub pronto (recomendada para começar).**
Bling, Tiny, Olist, Anymarket e similares já mantêm os conectores dos
marketplaces atualizados. Você integra **um** ERP e ele fala com todos.
Custa mensalidade, mas some com o trabalho de manter três integrações que mudam
sozinhas. Para um estúdio começando, é quase sempre a decisão certa.

**Rota B — integração direta.**
Faz sentido quando o volume justifica, ou quando o produto é tão fora do padrão
(peça sob encomenda com variações infinitas) que o ERP atrapalha mais que ajuda.
Aí o desenho é:

```
Product (banco Inspire 3D)  ← fonte da verdade
   ├── ChannelListing (mercadolivre)  → status, id externo, preço do canal
   ├── ChannelListing (shopee)
   └── ChannelListing (amazon)

adapters/mercadolivre.ts   toChannelPayload() · syncStock() · pullOrders()
adapters/shopee.ts
adapters/amazon.ts
```

Fila de sincronização (BullMQ/Upstash), webhooks de pedido de cada canal, e um
painel simples mostrando por produto: publicado / pendente / rejeitado, com o
motivo da rejeição.

### Realidade do prazo

Aprovação de aplicação, homologação e o vaivém de atributo obrigatório rejeitado
levam semanas — não é trabalho de código, é trabalho de burocracia. Planeje isso
no cronograma.

---

## 3. Publicação automática no Instagram, TikTok e afins

### O que as APIs permitem hoje

| Plataforma | Limite diário | Agendamento nativo? | Exige aprovação? |
| --- | --- | --- | --- |
| Instagram (Graph API) | ~100 posts / 24h | **Não** — publica na hora | Sim, App Review da Meta (~5 dias úteis, com screencast por permissão). Só contas Business/Creator |
| Facebook Página | 25 posts / 24h | Não | Sim, mesmo App Review |
| TikTok (Content Posting API) | ~15 posts/dia por criador | **Não** | Sim, e é o mais duro: **app não auditado só consegue postar como privado**. Público exige passar na auditoria |
| YouTube (Data API v3) | ~100 uploads/dia | **Sim**, nativo | Auditoria de quota em volume |

### O que isso significa na prática

O agendamento é **seu**, não delas. Instagram e TikTok publicam no instante da
chamada. Então o site precisa de um agendador próprio:

```
tabela ScheduledPost { canal, mediaUrl, legenda, publishAt, status, tentativas }
   → cron a cada 5 min busca o que venceu
   → chama a API do canal
   → grava id do post publicado, ou erro + retry com backoff
```

Nada exótico: Vercel Cron, ou um worker com BullMQ.

### "Melhores horários"

Não use tabela genérica de blog ("poste terça às 11h"). Isso vale para a média da
internet, não para o público da Inspire 3D. O caminho certo:

1. Nos primeiros meses, publique em horários variados de propósito.
2. Puxe o desempenho de cada post pela Insights API (Instagram) e pela
   Analytics API (TikTok): alcance, salvamentos, cliques no link.
3. Depois de ~50 posts, o próprio banco responde qual janela funciona **para o
   seu público**. Aí o agendador passa a sugerir horário com dado seu.

Enquanto não há dados, um padrão razoável para o nicho de colecionáveis e board
games no Brasil é fim de tarde/noite em dias de semana e manhã de sábado — mas
trate como chute inicial a ser substituído por medição.

### Um detalhe que muda o resultado

O post que funciona nesse nicho não é foto do produto pronto: é **o processo**.
Timelapse da impressão, a peça saindo da mesa, o antes-e-depois da pintura.
Isso o estúdio já produz naturalmente. Vale o campo `media` do post aceitar o
vídeo de bancada e a Inspire AI gerar três variações de legenda por canal
(Instagram mais visual, TikTok mais direto) para você escolher.

---

## Ordem sugerida

| Prioridade | O quê | Por quê primeiro |
| --- | --- | --- |
| 1 | Orçamento inteligente (Fase 2, já estruturada) | Nada disso importa sem um funil de pedido funcionando |
| 2 | **Foto → 3D + visualizador + estimativa** | Maior diferencial competitivo, custo baixo, encaixa direto no orçamento |
| 3 | Banco de dados + catálogo de produtos | Pré-requisito técnico dos marketplaces |
| 4 | **Publicação social agendada** | Independe do resto e começa a gerar tráfego cedo |
| 5 | **Marketplaces** (começar por hub tipo Bling/Tiny) | Mais burocracia que código; exige estoque e catálogo maduros |

A arquitetura da Fase 1 já comporta as três: `/api/*` isolado por domínio,
`src/types` com contratos, conteúdo desacoplado da UI. Nenhuma delas obriga a
reescrever a Home.
