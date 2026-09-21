# Inspire 3D — QA da Fase 1

Revisão completa do que já estava construído, com evidências. Rodada em
setembro de 2026, antes de abrir a Fase 2.

**Como foi verificado:** a Home foi renderizada em Chromium em 390, 768, 1100 e
1440 px (fold e página inteira), com medição programática de estouro horizontal,
leitura do outline de headings, varredura de links, e auditoria de código sobre
as 57 fontes TypeScript.

**Limite desta rodada:** o registro npm está bloqueado pela política de rede do
ambiente em que a revisão rodou, então `npm run build`, `npm run typecheck` e
`npm run lint` **não foram executados** aqui. Todas as correções foram feitas de
forma conservadora, seguindo os padrões já existentes no projeto, mas precisam
de uma passada de build na sua máquina (veja o final).

---

## O que passou

| Verificação | Resultado |
| --- | --- |
| Estouro horizontal | `scrollWidth == innerWidth` em **todas** as 4 larguras. O `overflow-x-clip` está segurando halos e marquee corretamente. |
| Erros de console | Nenhum, em nenhuma largura. |
| Outline de headings | Um único `h1`, `h2` por seção, `h3` nos itens. Hierarquia correta, sem salto de nível. |
| Landmarks | `header`, `nav`, `main`, `footer` — um de cada, com `aria-label` nas navegações. |
| Imports `@/…` | 100% resolvem. Nenhum import órfão. |
| Links vazios / sem rótulo | Nenhum. |
| `target="_blank"` sem `rel` | Nenhum. |
| `prefers-reduced-motion` | Implementado e correto, inclusive desligando o estado inicial do `.reveal`. |
| Ritmo visual | Hero, bento de verticais, datasheet de tecnologias e mocks de orçamento/IA se sustentam em desktop e mobile. Nada parece template. |
| Honestidade do conteúdo | Os mocks estão rotulados (“Exemplo ilustrativo”, “Em desenvolvimento”, “Interface conceitual”). Nenhuma métrica ou depoimento inventado. |

---

## Problemas encontrados e corrigidos

### 1. O CTA principal do site dava em página morta — e apontava para si mesma
`/orcamento` é destino de **13 links** (é a conversão número 1 do site), mas é
uma página de roadmap. Pior: o botão primário dessa página era
`href="/orcamento"` — ou seja, um link para ela mesma. Quem chegasse ali por
qualquer CTA ficava sem saída.

**Correção:** `ComingSoon` passou a aceitar `primaryCta`/`secondaryCta`. Em
`/orcamento` o botão primário agora abre o WhatsApp com mensagem pronta e o
secundário vai para `/contato`.

### 2. O endpoint de orçamento devolvia `null` em vez de erro
`QuoteRequest` é um tipo TypeScript — não valida nada em runtime. Um POST com
`technology: "SLA"` passava pela checagem de campos obrigatórios, caía em
`technologyFactor["SLA"] → undefined`, e a resposta saía assim:

```json
{ "ok": true, "estimate": { "min": null, "max": null } }
```

O mesmo com `quantity: "abc"`. E `quantity: 1e9` produzia uma estimativa de
R$ 5,5 bilhões com prazo de 83 mil dias.

**Correção:** `/api/quote` agora valida de verdade — formato do JSON, tamanho do
corpo (413), e-mail, comprimento de nome e descrição, enums `technology` e
`finish` contra a lista real, e `quantity` como inteiro entre 1 e 10.000.
Erros voltam em 422 com o campo culpado.

### 3. O menu mobile ficava focável mesmo fechado
O painel vive sempre no DOM, colapsado por `grid-rows-[0fr]`. Quem navega por
teclado passava do botão do menu e caía em 5 links invisíveis.

**Correção:** `inert` no painel quando fechado, e `Esc` agora fecha o menu.

### 4. Sem JavaScript, a página ficava em branco
`.reveal { opacity: 0 }` só vira visível quando o `IntersectionObserver` roda.
Com JS bloqueado ou falhando, todo o conteúdo abaixo do Hero somia.

**Correção:** fallback em `<noscript>` no `layout.tsx`.

### 5. Compartilhar o link não gerava preview nenhum
`twitter:card` estava como `summary_large_image` sem imagem, e não havia
`og:image`, favicon nem manifest. Todo compartilhamento em WhatsApp, Instagram
ou LinkedIn sairia como caixa cinza.

**Correção:** `public/og-image.png` (1200×630, gerado na identidade da marca),
`favicon.svg`, `favicon.png`, `apple-touch-icon.png`, `icon-512.png` e
`site.webmanifest`, todos referenciados no metadata — na Home e nas internas.

### 6. Faltava o botão flutuante de WhatsApp (briefing §15)
Não existia. Sendo o canal de conversão prioritário, é uma perda direta.

**Correção:** `WhatsAppButton` — pílula em grafite com hairline e ícone dourado,
integrada à identidade (nada de bolha verde). Aparece só depois de 520 px de
scroll, para não competir com o CTA do Hero. Aceita mensagem customizada, então
nas páginas de projeto pode já citar a peça.

### 7. Faltavam as páginas jurídicas (briefing §22 e §40)
`/politica-de-privacidade` e `/termos` não existiam, e o rodapé não tinha os
links — exigência de LGPD.

**Correção:** as duas páginas foram criadas com texto-base substantivo
(controlador, dados coletados, bases legais, tratamento de arquivos 3D,
retenção, direitos do titular, cookies; e termos cobrindo estimativa × proposta,
propriedade intelectual dos arquivos, variação inerente à impressão 3D,
personalizado × arrependimento, limitação de responsabilidade). Links no rodapé
e entradas no `sitemap.xml`.

> **Isto não é parecer jurídico.** Revise com advogado e preencha razão social,
> CNPJ e foro antes de publicar.

### 8. `/sobre` era uma página órfã
Existia, tinha metadata e estava no sitemap — mas nenhum link no site levava até
ela. **Correção:** entrada no rodapé.

### 9. `mailto:` abria aba em branco
`Button` tratava `mailto:` e `tel:` como link externo e aplicava
`target="_blank"`, deixando uma aba vazia para trás no desktop.
**Correção:** protocolo de sistema não recebe mais `target`.

### 10. SEO local sem `LocalBusiness`
Só havia `Organization`. Para “impressão 3D BH” e “impressão 3D Contagem”
(§32 do briefing), `LocalBusiness` é o schema que conta. E a seção de FAQ não
estava marcada.

**Correção:** `localBusinessJsonLd()` (área atendida, serviços oferecidos,
telefone, imagem), `faqJsonLd()` na Home — habilita o rich result de perguntas —
e `breadcrumbJsonLd()` pronto para as páginas internas.

---

## Pendências que deixei apontadas, não resolvidas

| # | Item | Por quê |
| --- | --- | --- |
| 1 | **`/servicos` não existe** (briefing §22) | Hoje o conteúdo vive na Home em `#fabricamos`. Criar a página é trabalho de conteúdo, não de correção — entra junto com a Fase 2 ou 4. |
| 2 | **Menu principal enxuto** | O briefing §7 pede Início, O que fazemos, Produtos, Projetos, Como funciona, Sobre, Contato. O menu atual tem 5 itens. A redução é uma decisão de design defensável (menos é melhor), mas é sua chamada. |
| 3 | **Animação de abertura** (briefing §6) | Não existe. Custa performance no LCP; vale discutir se entra. |
| 4 | **Redes sociais** | `site.ts` tem TikTok e YouTube configurados, mas o rodapé só mostra Instagram e WhatsApp. Assim que os perfis existirem, é só exibir. |
| 5 | **Hero no mobile** | O cubo em fabricação fica abaixo da dobra em telas pequenas — o visual assinatura não aparece de cara para quem chega pelo celular. Vale testar uma versão compacta acima da dobra. |
| 6 | **Logo oficial** | Segue a versão em SVG feita a partir da descrição do briefing. O arquivo da marca continua pendente. |
| 7 | **Rate limiting e anti-spam** (briefing §39) | O endpoint valida, mas não limita. Entra na Fase 2, junto com o formulário real. |
| 8 | **Fotos reais do portfólio** | As artes geradas seguram bem, mas peça real converte muito mais. |

---

## O que rodar na sua máquina

```bash
npm run typecheck
npm run lint
npm run build
```

Se algo reclamar, me manda a saída que eu corrijo. Dois pontos que valem
atenção específica no build:

- `inert={!open}` em `Header.tsx` — sintaxe do React 19 (o projeto usa
  `react ^19.1.0`, então deve passar).
- `faqJsonLd()` importado em `app/page.tsx` — a Home continua Server Component,
  então o `<script type="application/ld+json">` é renderizado no servidor.
