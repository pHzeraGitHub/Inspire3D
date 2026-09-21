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

## A decisão central: preço só quando for real

O briefing (§34) é explícito — **não inventar números**. Um valor não calibrado
na tela ancora o cliente num preço errado e depois obriga a desdizer.

Então o motor foi construído inteiro, testado, e **desligado por uma chave**.

Enquanto `pricing.calibrated` for `false`, o cliente vê:

> **Investimento** — O valor sai junto da proposta, depois que o estúdio olhar
> a geometria da peça — é o que evita um número que muda depois.

E já vê o que importa para confiar: tecnologia recomendada com justificativa,
complexidade e prazo em dias úteis. Isso sozinho já é muito acima de um
formulário comum.

### Para ligar o preço

Abra **`src/config/pricing.ts`** — é o único arquivo a mexer. Troque os campos
marcados com « PREENCHER », mude `calibrated` para `true`, pronto.

| Campo | O que é | O que eu preciso de você |
| --- | --- | --- |
| `basePrice.fdm` / `.resina` | Preço de **uma** peça pequena (até 8 cm), acabamento bruto | Os dois números |
| `sizeFactor` | Multiplicador por faixa de tamanho | Confirmar se 2.1× / 4.2× / 7.5× bate com a sua realidade |
| `finishFactor` | Multiplicador por acabamento | Confirmar 1.35× lixado, 2.1× pintado, 3.2× premium |
| `modelingPrice` | Modelagem cobrada à parte | Quanto custa ajuste de arquivo e modelagem do zero |
| `quantityExponent` | Desconto por volume. 0.82 ≈ 11% mais barato por unidade a cada dobra | Confirmar |
| `leadTime` | Prazos base, por acabamento e por modelagem | Confirmar |

Com os valores de exemplo atuais, o motor produz:

| Cenário | Faixa | Prazo |
| --- | --- | --- |
| Busto 15 cm, resina, pintado, modelagem do zero, 1 un | R$ 920 – 1.480 | 16–21 d |
| Mesma peça, 10 unidades | R$ 3.860 – 6.210 | 16–21 d |
| 50 tokens FDM pequenos, bruto | R$ 1.820 – 2.940 | 3–12 d |
| Protótipo grande FDM lixado, com ajuste de arquivo | R$ 520 – 830 | 7–12 d |

São **exemplos de comportamento do motor**, não a sua tabela.

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
