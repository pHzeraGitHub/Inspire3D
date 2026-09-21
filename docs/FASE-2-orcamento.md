# Inspire 3D — Fase 2 · Orçamento inteligente

A parte mais importante do site, segundo o briefing (§14). Entregue.

---

## O que foi construído

Um fluxo guiado em três passos em `/orcamento`, que substitui a página de
roadmap. Não é formulário de contato com campos a mais: o cliente entende o
que muda o preço enquanto responde, e sai com uma leitura técnica do próprio
projeto na tela.

```
Passo 1  O que você quer criar?        7 caminhos (§14)
Passo 2  Sobre a peça                  categoria · descrição · tamanho ·
                                       dimensões · quantidade · modelagem ·
                                       acabamento · tecnologia · prazo · arquivos
Passo 3  Como falamos com você         nome · e-mail · WhatsApp · empresa · LGPD
   ↓
Resultado                              tecnologia recomendada + por quê ·
                                       complexidade · prazo estimado ·
                                       briefing completo · CTA de WhatsApp
                                       já com o projeto escrito na mensagem
```

---

## Precificação

A tabela está **calibrada e no ar** com os números do estúdio.
Tudo vive em **`src/config/pricing.ts`** — o motor em `src/lib/quote.ts` só
aplica, não contém preço algum.

### Fórmula

```
por unidade:
  máquina+material = basePrice × sizeFactor
  acabamento       = MAIOR( máquina+material × (finishFactor − 1), finishFloor )

no total:
  total = máquina+material × qtd^0.82        ← escala de máquina
        + acabamento      × qtd^0.96,         ← escala de mão de obra
          travado em nunca ficar abaixo de finishFloor × qtd
        + modelagem (uma vez)
        × urgencyFactor
```

### Os números

| | FDM | Resina |
| --- | --- | --- |
| Peça pequena (até 8 cm), bruta | R$ 39,90 | R$ 79,90 |

| Tamanho | × | | Acabamento | × | Piso de mão de obra |
| --- | --- | --- | --- | --- | --- |
| Pequeno (até 8 cm) | 1,0 | | Bruto | 1,0 | — |
| Médio (8–15 cm) | 2,1 | | Lixado | 1,35 | **R$ 20** |
| Grande (15–25 cm) | 4,2 | | Pintado | 2,1 | **R$ 50** |
| Extra (25 cm+) | 7,5 | | Premium | 3,2 | **R$ 100** |

| Modelagem | Automático | Referência/hora |
| --- | --- | --- |
| Arquivo pronto | R$ 0 | — |
| Ajuste simples | R$ 35 | R$ 70/h para ajuste complexo |
| Modelagem do zero | R$ 120 | R$ 80/h para projeto maior |

Prazos em dias úteis, somados: FDM 2–4 · resina 3–5 · lixado +1–2 ·
pintado +2–4 · premium +4–7 · ajuste +1–2 · modelagem do zero +2–5.
Acima de 12 unidades, +1 dia no teto a cada 12.

### Por que existem dois expoentes de escala

Máquina e material diluem bem em lote — imprimir 50 peças de uma vez custa
bem menos por peça. Mão de obra manual dilui pouco: pintar 50 peças é quase
50 vezes o trabalho de pintar uma.

Usar o mesmo expoente para os dois derrubava o acabamento **abaixo do próprio
piso** em pedidos grandes: um lote de 200 peças pintadas pagava R$ 40 de mão de
obra por peça num acabamento cujo mínimo declarado é R$ 50 — o prejuízo exato
que o piso existe para evitar. Daí a trava: o ganho de escala só pode consumir
a parte que está **acima** do piso.

Efeito prático, verificado em teste:

| | 1 un | 10 un | 50 un | 200 un | 1.000 un |
| --- | --- | --- | --- | --- | --- |
| Mão de obra por unidade (pintado) | R$ 50 | R$ 50 | R$ 50 | R$ 50 | R$ 50 |

E o ganho de escala continua funcionando onde a mão de obra já paga sozinha:
resina grande pintada cai de R$ 710 (1 un) para R$ 482 por unidade (50 un).

### Dois números que ainda são seus

Ambos estão marcados « DEFINIR » no arquivo e hoje são neutros — nada não
autorizado chega na tela do cliente.

**`urgencyFactor: 1.0`** — hoje pedido urgente não custa mais caro. Furar a
fila desloca outros projetos; mercado costuma cobrar entre 1,15 e 1,30.

**`minUnitPrice: 0`** — hoje não há piso para a parte de máquina+material.
O acabamento tem pisos, essa parte não. Consequência: 50 peças FDM pequenas
brutas saem a **R$ 19,80 por unidade**, metade do "a partir de". Se abaixo de
certo valor a peça não paga máquina, falha e manuseio, ponha aqui o mínimo.
Com `minUnitPrice: 25`, o mesmo lote passa a R$ 25/un (R$ 1.250 em vez de R$ 990).

### O que o motor produz hoje

| Cenário | Faixa | Por unidade | Prazo |
| --- | --- | --- | --- |
| FDM pequena bruta | R$ 40 – 60 | — | 2–4 d |
| FDM pequena lixada | R$ 60 – 90 | — | 3–6 d |
| FDM pequena pintada | R$ 90 – 130 | — | 4–8 d |
| FDM pequena premium | R$ 140 – 200 | — | 6–11 d |
| Resina pequena bruta | R$ 80 – 120 | — | 3–5 d |
| Resina pequena pintada | R$ 170 – 240 | — | 5–9 d |
| FDM média pintada | R$ 180 – 260 | — | 4–8 d |
| Resina média pintada + modelagem do zero | R$ 480 – 680 | — | 7–14 d |
| FDM grande lixada + ajuste de arquivo | R$ 270 – 380 | — | 4–8 d |
| Resina grande premium + modelagem | R$ 1.200 – 1.730 | — | 9–17 d |
| FDM extra grande bruta | R$ 300 – 430 | — | 2–4 d |
| 50 tokens FDM pequenos brutos | R$ 990 – 1.430 | R$ 20 | 2–8 d |
| 50 peões FDM pequenos pintados | R$ 3.490 – 5.060 | R$ 70 | 4–12 d |
| 200 peças FDM pequenas pintadas | R$ 13.080 – 18.960 | R$ 65 | 4–24 d |

Peça de complexidade padrão. O próprio site avisa ao cliente que geometria,
suportes e tempo de máquina podem mudar o valor, e que a proposta final sai
após a análise do arquivo.

---

## Como o lead chega até você

WhatsApp e e-mail, como combinado.

**E-mail** — via Resend, por HTTP puro (sem SDK, sem dependência nova).
Chega formatado, legível no celular, com os arquivos do cliente **anexados**,
e com `reply_to` no e-mail dele — responder o e-mail já responde o cliente.

Sem `RESEND_API_KEY`, o formulário **continua funcionando**: o lead vai para o
log do servidor e o cliente vê a tela de resultado normalmente. Nada quebra por
configuração faltando.

**WhatsApp** — o botão da tela final abre a conversa com o briefing inteiro já
escrito: categoria, tamanho, acabamento, modelagem, quantidade, prazo,
complexidade e a descrição. O cliente só aperta enviar.

Variáveis novas em `.env.example`: `QUOTE_NOTIFICATION_EMAIL`,
`QUOTE_FROM_EMAIL`, `RESEND_API_KEY`.

---

## Upload

Aceita STL, OBJ, 3MF, STEP/STP, ZIP, PDF, PNG, JPG. Arrastar ou clicar.
Até 5 arquivos, 10 MB cada, 15 MB no total — limite casado com anexo de e-mail.
Acima disso o próprio site sugere o WhatsApp.

Validado nos dois lados: no cliente por conveniência, no servidor por segurança
(extensão, tamanho por arquivo e tamanho total). Arquivo nenhum é gravado em
disco — vai direto para o anexo e some da memória.

---

## Segurança (briefing §39)

| Proteção | Como |
| --- | --- |
| Rate limiting | 5 envios por IP a cada 10 minutos, com `Retry-After`. `src/lib/rate-limit.ts`, janela deslizante em memória — trocar por Redis é só manter a assinatura |
| Honeypot | Campo invisível `_gotcha`. Nome neutro de propósito: `website`/`url` são preenchidos por gerenciadores de senha e dariam falso positivo em gente real. Bot que preenche recebe 200 e nada acontece |
| Validação de runtime | Toda a entrada passa por listas de valores aceitos antes de virar cálculo ou e-mail |
| Limites de texto | Nome 120, e-mail 180, descrição 4.000, quantidade 1–10.000 |
| Segredos | Só em variáveis de ambiente. Nada de chave no frontend |

## LGPD (briefing §40)

Só os campos necessários para responder. Consentimento explícito, **nunca
pré-marcado**, com link para a Política de Privacidade abrindo em nova aba.
Sem cadastro, sem senha, sem dado que o estúdio não vá usar.

---

## Verificação feita

Sem `npm install` disponível no ambiente (registro npm bloqueado por política de
rede), a verificação foi feita assim:

**Typecheck real.** O TypeScript do sistema rodou sobre os 66 arquivos do
projeto com stubs fiéis de `react`/`next` — **0 erros**.

**Testes de execução.** As partes puras (motor, rate limit, briefing) foram
compiladas para JS e executadas com 19 asserções. Todas passam.

Um bug real apareceu aqui e foi corrigido: com enum fora da lista
(`size: "gigante"`) ou `quantity: "abc"`, o motor devolvia `NaN`. A rota já
validava antes, mas `estimateQuote` é exportado e vai ser reusado pela Inspire
AI na Fase 4 — então agora cada campo cai num padrão explícito e o resultado é
sempre finito.

**QA visual.** Wizard e tela de resultado renderizados em Chromium a 390 px e
1440 px: sem estouro horizontal, alvos de toque adequados, estado de seleção
legível.

**O que ainda falta você rodar:**

```bash
npm run typecheck && npm run lint && npm run build
```

---

## Arquivos

```
src/config/pricing.ts              ← A TABELA. único arquivo a editar
src/lib/quote.ts                   motor: preço, prazo, complexidade, recomendação
src/lib/rate-limit.ts              janela deslizante por IP
src/lib/mailer.ts                  Resend por HTTP + template do e-mail
src/features/quote/
  ├── QuoteWizard.tsx              os três passos, validação e envio
  ├── QuoteResult.tsx              tela de resultado
  ├── OptionGroup.tsx              radiogroup acessível com cara de card
  ├── FileUpload.tsx               arrastar-e-soltar com validação
  ├── options.ts                   opções e limites
  └── summary.ts                   briefing + mensagem de WhatsApp
src/app/orcamento/page.tsx         a página
src/app/api/quote/route.ts         multipart, validação, rate limit, e-mail
src/app/globals.css                estilos de formulário no Design System
```

---

## Próximo passo natural

Foto → 3D com IA (prioridade 2 do roadmap). O orçamento já é o lugar certo
para encaixar: o cliente sobe a foto, vê a peça girando em 30 segundos e a
estimativa se refina com volume e bounding box reais — trocando
`estimateQuote` por cálculo sobre a geometria, sem mudar a assinatura.
