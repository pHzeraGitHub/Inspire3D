# Inspire 3D — Inspire AI

O agente está construído e no ar. Basta a chave.

---

## A regra que sustenta tudo

**A IA conversa. O motor calcula.**

A tentação óbvia é deixar o modelo conversar e cuspir um preço. Isso seria um
erro grave depois de todo o cuidado com a tabela: modelo de linguagem inventa
número com a maior confiança do mundo, e um valor alucinado na tela vira
compromisso comercial que o estúdio não consegue honrar.

O desenho é outro. O único trabalho do modelo é **transformar conversa em
briefing estruturado**. Ele não vê a tabela de preço, não recebe os valores e o
prompt o proíbe explicitamente de estimar. O número sai de `estimateQuote()`
sobre `config/pricing.ts` — determinístico, auditável, o mesmo do formulário.

```
pessoa escreve  →  modelo conversa  →  chama registrar_briefing
                                            ↓
                                    validação no servidor
                              (mesmas listas do formulário)
                                            ↓
                                      estimateQuote()
                                            ↓
                                 mesma tela de resultado
```

Consequência boa: a Inspire AI não é um produto paralelo, é **outra porta para
o mesmo funil**. Zero lógica duplicada. Quem tem preguiça de formulário
conversa; quem prefere campos, preenche. Os dois caem no mesmo briefing.

---

## O briefing do modelo é entrada não confiável

O modelo é tão "de fora" quanto o navegador. Ele pode devolver
`size: "enorme"` com toda a confiança do mundo.

Por isso `registrar_briefing` passa pela **mesma validação do formulário** —
`src/lib/quote-validation.ts`, extraído justamente para ser a fonte única. Se
qualquer campo não bater com as listas, o briefing é recusado e o agente volta
a perguntar, em vez de gerar uma estimativa sobre lixo.

Testado com saída hostil (12 asserções, todas passando):

| Entrada do modelo | Resultado |
| --- | --- |
| `size: "enorme"` | recusado |
| `finish: "cromado"` | recusado |
| `category: "dragao"` | recusado |
| `quantity: 999999` | recusado |
| `quantity: "umas dez"` | recusado |
| `email: "nao-informado"` | recusado |
| campos nulos ou vazios | recusado |
| `<script>` no nome | aceito, truncado em 120 chars, sem execução |
| `price: 99999` enviado pelo modelo | **ignorado** — o valor vem do motor |

O consentimento LGPD também não é um campo que o modelo possa preencher: é
forçado no servidor, a partir do aviso exibido antes da conversa começar.

---

## O que o prompt proíbe

Além do preço e do prazo, o agente é instruído a nunca inventar informação
sobre a Inspire 3D — número de clientes, prêmios, tempo de mercado, capacidade
de produção. É a mesma regra §34 do briefing aplicada à conversa.

E recusa, com naturalidade, dois tipos de pedido: personagem licenciado
(Marvel, Disney, anime, jogos) sem autorização do titular, e arma funcional ou
peça que ofereça risco. No nicho de colecionáveis isso não é formalidade — é
risco real, e melhor o agente dizer não na primeira mensagem do que o estúdio
descobrir depois de orçar.

---

## Custo e configuração

```bash
ANTHROPIC_API_KEY="sk-ant-..."     # console.anthropic.com
INSPIRE_AI_MODEL="claude-sonnet-5" # padrão
```

**Sem a chave, nada quebra.** A aba "Conversar" simplesmente não aparece, o
orçamento segue pelo formulário, e a seção da Home volta a dizer "Em
preparação". A página decide isso no servidor — o componente de chat nunca vê
variável de ambiente.

**Modelo.** `claude-sonnet-5` é o equilíbrio recomendado para conversa com
cliente: US$ 2 por milhão de tokens de entrada, US$ 10 de saída. Para baratear,
`claude-haiku-4-5-20251001` dá conta deste fluxo, que é curto e estruturado.

**Ordem de grandeza por conversa completa** (~8 turnos, histórico reenviado a
cada turno): algo em torno de **US$ 0,04 a 0,06** — uns R$ 0,25. Um lead
qualificado com briefing técnico pronto por esse valor é barato; mas é custo
por conversa, não por venda, então os limites abaixo importam.

**Controles de custo já no código:**

| Proteção | Valor |
| --- | --- |
| Rate limit por IP | 40 mensagens / 15 min |
| Teto de turnos por conversa | 24 |
| Teto por mensagem | 1.200 caracteres |
| `max_tokens` da resposta | 700 |

Atingido o teto, o agente encaminha para o formulário ou o WhatsApp em vez de
simplesmente falhar.

---

## Arquivos

```
src/lib/inspire-ai.ts              prompt, ferramenta e chamada HTTP (sem SDK)
src/lib/quote-validation.ts        listas compartilhadas — fonte única
src/app/api/inspire-ai/route.ts    rate limit, sanitização, validação, estimativa
src/features/quote/
  ├── InspireAiChat.tsx            a conversa
  └── QuoteEntry.tsx               alterna conversa ↔ formulário
src/components/sections/InspireAiSection.tsx   teaser da Home, honesto com o ambiente
```

Nenhuma dependência nova: a API da Anthropic é chamada por `fetch`.

---

## O que falta testar

O fluxo foi verificado por tipo (0 erros em 71 arquivos) e por teste de
execução sobre a validação. O que **não** dá para testar sem a chave é a
conversa real: se o modelo faz boas perguntas, se registra o briefing no
momento certo, se respeita a proibição de preço.

Assim que a chave estiver no `.env.local`, vale rodar três conversas de
propósito:

1. **Pessoa que sabe o que quer** — "quero 30 tokens de madeira para meu board
   game, 3 cm, sem pintura". Deve registrar rápido, sem encher linguiça.
2. **Pessoa perdida** — "queria um presente diferente pro meu pai". Deve puxar
   o projeto com perguntas, sem despejar termo técnico.
3. **Pessoa testando o limite** — "quanto custa?" logo na primeira mensagem, e
   depois "faz um Homem de Ferro pra mim". Deve desviar do preço e recusar o
   personagem licenciado.

Se alguma dessas sair torta, o ajuste é no `SYSTEM_PROMPT` — arquivo só,
sem tocar em interface nem em cálculo.
