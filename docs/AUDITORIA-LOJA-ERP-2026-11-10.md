# Inspire 3D — auditoria e plano incremental para loja + ERP

Data: 10/11/2026. Escopo desta entrega: análise do repositório e desenho de migração. Nenhuma infraestrutura, plano pago, banco de produção ou integração de pagamento foi alterada.

**Atualização posterior em 10/11/2026:** com autorização do usuário para o Hobby e limite rígido de US$ 25/mês, foi criado o [staging na Railway](RAILWAY-STAGING.md). O PostgreSQL privado recebeu o snapshot do PGlite, o site está implantado na URL temporária e as contagens foram conferidas. O PGlite local continua sendo a fonte comercial; checkout e domínio de produção não foram alterados. As referências abaixo a pendências de infraestrutura descrevem o momento da auditoria inicial.

## 1. Estado verificado

Branch analisada: `codex/vercel-setup-3dinspire` (`d503f09`). O repositório tem Next.js 15.5, React 19, TypeScript, Tailwind 4, App Router e rotas API no mesmo processo. `npm run typecheck`, `npm run lint` e `npm run build` passaram em 10/11/2026. O build usou um diretório PGlite temporário, separado dos dados locais existentes. O comando de lint ainda usa `next lint`, que o próprio Next.js 15 marca como obsoleto.

| Área | Implementado hoje | Evidência principal |
| --- | --- | --- |
| Site público | Home, serviços, projetos, catálogo, páginas de produto, orçamento, contato, SEO e páginas legais | `src/app`, `src/components`, `src/lib/catalog.ts` |
| Catálogo administrativo | Produtos, publicação, preço, imagens por caminho local, variações e personalização em JSON | `src/features/admin/ProductManager.tsx`, `src/lib/admin-product-writer.ts` |
| Materiais e custos | Saldo, custo médio, movimentações, mínimo, ficha técnica e importação Excel | `src/lib/db.ts`, `src/app/api/admin/stock-movements`, `src/lib/admin-import.ts` |
| Produção | Registro de lotes concluídos, consumo transacional de insumos e entrada de produto acabado | `src/app/api/admin/production/route.ts` |
| Vendas | Pedidos manuais, rascunho, confirmação, reserva lógica de itens prontos, entrega, cancelamento e pagamento marcado manualmente | `src/lib/sales.ts`, `src/features/admin/SalesManager.tsx` |
| Orçamentos | Cálculo, anexos e aviso por Resend; Inspire AI opcional | `src/app/api/quote`, `src/lib/quote-lead.ts`, `src/app/api/inspire-ai` |

Há **nove tabelas atuais** criadas por SQL em `src/lib/db.ts`: `inventory_materials`, `products`, `product_materials`, `inventory_movements`, `inventory_purchases`, `sales`, `sale_items`, `production_runs` e `finished_stock_movements`. A inicialização também insere produtos iniciais de `src/content/products.ts` e compras de `.data/inspire3d-purchases.json` com `ON CONFLICT DO NOTHING`.

O acesso usa PGlite em `.data/inspire3d` quando `DATABASE_URL` não existe, ou `pg` com PostgreSQL externo quando existe. A branch atual impede PGlite nas funções Vercel e mostra catálogo inicial na prévia sem banco. O usuário confirmou que `.data/inspire3d` nesta máquina contém os dados reais. Em 10/11/2026 foi criado e restaurado um snapshot em `.data/backups/pglite-2026-11-10T14-34-42-179Z`: 1 produto, 1 venda, 1 item e 15 compras históricas. O snapshot contém dados privados, está fora do Git e ainda precisa ser importado e conferido no PostgreSQL de destino.

O repositório ainda contém `render.yaml` com plano `free` e `docs/DEPLOY.md` com instruções de Render. A branch atual contém ajustes para Vercel. Não há manifesto de Railway nem Prisma instalado. A hospedagem efetiva e o domínio publicado precisam ser confirmados no inventário de operação antes do corte; não inferir isso do arquivo de deploy.

## 2. Lacunas e riscos que orientam a ordem

1. **Venda online não está pronta.** Não há carrinho, checkout, integração Mercado Pago, webhook, cálculo de frete, cupom ou rastreamento. O catálogo leva a orçamento/contato. `STRIPE_*` em `.env.example` é apenas um marcador antigo; não há Stripe implementado.
2. **Administração de uma pessoa.** O login usa um e-mail e uma senha em variáveis de ambiente e cookie assinado com 12 horas. Há proteção de origem e limitação de tentativas, mas não há contas por usuário, papéis, MFA, revogação individual de sessões nem auditoria de ações administrativas. A senha é comparada com `scrypt`, mas o valor original permanece no ambiente do servidor.
3. **Estoque é consistente no fluxo manual existente, mas faltam reservas de checkout.** Confirmação e entrega bloqueiam produtos e consultam reservas em transação. Produção bloqueia insumos e produto. O carrinho online precisará de reserva persistente com validade, liberação e chave idempotente; uma soma de vendas confirmadas não cobre tentativas de pagamento pendentes. Testar disputa simultânea entre canais antes de vender online.
4. **Produção registra o resultado, não o planejamento.** `production_runs` guarda quantidade e custo de material; faltam ordem aberta, etapas, máquina, operador, tempo real, refugo e manutenção. O vínculo existente com `sale_id` é por pedido, não por item. Evitar somar uma produção a duas linhas do mesmo produto ao normalizar.
5. **Dados e arquivos não estão centralizados.** Imagens são caminhos em `public/`. Anexos de orçamento seguem por e-mail, sem tabela de lead e sem armazenamento privado no app. Arquivos STL autorais exigirão bucket privado e autorização para leitura; fotos podem ser públicas. Não há histórico de leads do site que possa ser migrado do banco atual.
6. **Operação e segurança precisam amadurecer.** O limitador usa memória do processo; muda de comportamento em várias instâncias. `DATABASE_SSL=true` atualmente usa `rejectUnauthorized: false`, sem validação de certificado. Não há rotina versionada de backup/restauração, observabilidade de pedidos ou migrações SQL controladas. O SQL de criação/alteração roda no início da aplicação, o que precisa sair do caminho de requisição antes de operar vários processos.

## 3. Modelo relacional proposto

Regra de transição: **preservar IDs, slugs e tabelas existentes**. A camada Prisma pode expor nomes de domínio com `@@map`/`@map`; renomear tabelas no primeiro corte não traz benefício. Campos de dinheiro ficam em `NUMERIC`, nunca `float`; quantidades de materiais usam `NUMERIC(14,3)` ou precisão por unidade definida. Datas em UTC com apresentação em `America/Sao_Paulo`.

### Núcleo existente a manter e expandir

| Tabela física | Papel futuro e mudança inicial |
| --- | --- |
| `products` | Produto canônico, publicação, preço base e política de atendimento (`stock`, `made_to_order` ou ambos). Manter JSON de imagens/variantes durante a migração. |
| `inventory_materials` | Insumo e saldo atual. Preservar unidade, custo médio e mínimos. |
| `product_materials` | Ficha técnica por produto. Acrescentar versão para que pedidos antigos conservem a composição e o custo estimados no momento da venda. |
| `inventory_movements`, `finished_stock_movements` | Razão de movimentação imutável; acrescentar referência de origem/idempotência e autor. Saldos são projeções reconciliadas com o razão. |
| `inventory_purchases` | Histórico financeiro importado. Não converter compras antigas automaticamente em estoque. |
| `sales`, `sale_items` | Pedido e itens canônicos para vendas manuais e do site, expostos como `Order`/`OrderItem` no código. Acrescentar origem externa, snapshots de SKU/variante/personalização, endereço, frete e estados de pagamento/expedição sem destruir os estados atuais. |
| `production_runs` | Registro de execução concluída e custo real, associado a `production_order_id` e `sale_item_id` novos; conservar `sale_id` legado durante a transição. |

### Novas entidades em ordem de dependência

| Domínio | Tabelas e vínculos principais | Restrições essenciais |
| --- | --- | --- |
| Identidade | `users`, `roles`, `user_roles`, `sessions`, `audit_logs` | E-mail único; sessão revogável; `audit_logs` com ator, ação, entidade, ID, data e metadados redigidos. MFA para administradores antes de habilitar o ERP comercial. |
| Catálogo | `categories`, `product_categories`, `product_variants`, `variant_options`, `product_media`, `stored_objects` | SKU e slug únicos; mídia com ordem e chave R2; `stored_objects.visibility` pública/privada; variante vendável com preço e prazo próprios. |
| Clientes | `customers`, `customer_addresses` | E-mail normalizado quando presente; endereço snapshot no pedido; política de retenção e acesso por papel. Não confundir contato manual com conta autenticada. |
| Pedidos | `inventory_reservations`, `order_events`, `shipping_quotes`, `shipments`, `coupons`, `coupon_redemptions` | Reserva por item/SKU e prazo; unicidade do resgate por pedido; total e frete calculados no servidor; histórico de transições. |
| Pagamentos | `payments`, `payment_events` | `provider + provider_payment_id` único; ID de notificação único por provedor; valor, moeda e pedido conferidos antes da confirmação; evento repetido sem efeito. |
| Produção | `bill_of_material_versions`, `bill_of_material_lines`, `production_orders`, `production_steps`, `production_entries`, `machines`, `machine_maintenance` | Uma ordem por item/lote planejado; consumo real ligado à ordem; índices por status/prazo/máquina; não apagar apontamentos concluídos. |
| Lotes e financeiro | `material_lots`, `expenses`, `receipts`, `production_cost_entries` | Lote ligado ao insumo e origem; lançamento monetário com referência e status; custos e margens calculados a partir de snapshots e lançamentos, sem alterar vendas históricas. |

Relações centrais: `customers 1—N sales`, `sales 1—N sale_items`, `sale_items 1—N production_orders`, `production_orders 1—N production_steps/production_entries`, `products 1—N product_variants`, `products 1—N bill_of_material_versions`, `inventory_materials 1—N material_lots/inventory_movements`, `sales 1—N payments/shipments`. Para item pronto, reservar unidade acabada; para item sob encomenda, confirmar pagamento e capacidade/insumos antes de abrir a ordem. O fluxo deve permitir pedido misto.

## 4. Estrutura modular de código

Manter `src/app` como composição de páginas e rotas. Mover regras de negócio gradualmente de `src/lib` para módulos, sem trocar contratos públicos durante o primeiro corte:

```text
src/modules/
  catalog/       domain.ts repository.ts service.ts
  inventory/     domain.ts repository.ts reservations.ts service.ts
  orders/        domain.ts repository.ts transitions.ts service.ts
  payments/      mercado-pago.ts webhook.ts reconciliation.ts
  production/    bom.ts scheduling.ts entries.ts service.ts
  finance/       ledger.ts reporting.ts
  identity/      auth.ts permissions.ts audit.ts
  media/         r2.ts access.ts
src/lib/db/       prisma.ts transactions.ts
src/app/api/      adaptadores HTTP finos
src/features/     componentes de loja, orçamento e admin
prisma/          schema e migrações versionadas
```

Isolar integração externa em adaptadores: Mercado Pago, R2, e-mail e frete. Serviços de pedidos, reservas, pagamentos e produção compartilham **uma transação PostgreSQL** quando alteram saldos e estados; chamadas externas ocorrem fora da transação e são reconciliadas por IDs idempotentes. Não guardar credenciais ou chaves de objeto privado no navegador.

## 5. Migração incremental e retorno seguro

| Etapa | Entrega e validação | Retorno possível |
| --- | --- | --- |
| 0. Inventário | Identificar hosting/domínio, banco efetivo, tamanho, versões, permissões, imagens, IDs e saldos; guardar contagens por tabela e checksums de exportação. Fazer cópia consistente da origem e **restaurá-la em ambiente isolado**. | Nenhum tráfego alterado. |
| 1. Base PostgreSQL | Preparar ambiente separado e credenciais mínimas. Se a origem for PGlite, parar escritas, gerar exportação lógica determinística de cada tabela, preservar IDs/tempos/JSON e importar em ordem de FK. Se já for PostgreSQL, usar dump consistente/restore. Conferir contagens, totais de saldos, pedidos e amostras por ID. | Origem preservada, reabrir versão atual apontando para ela. |
| 2. Prisma sobre o legado | Fixar uma versão de Prisma, introspectar o PostgreSQL copiado, revisar `@map`/`@@map`, criar baseline da estrutura existente e validar diferenças em staging. O procedimento exato de baseline deve seguir a versão fixada. Migrar leitores/escritores um módulo por vez com comparação de resultados. Retirar DDL automático de `ensureDatabase` depois que migrações versionadas assumirem o esquema. | Voltar ao código SQL antigo com **o mesmo banco**; migrações inicialmente só acrescentam estruturas compatíveis. |
| 3. Identidade e catálogo | Usuários, papéis, MFA, auditoria, variantes e mídia R2. Fazer backfill de JSON/caminhos, comparar catálogo e manter leitura dos campos antigos até estabilizar. | Desligar novas telas e manter catálogo antigo; objetos R2 e colunas antigas preservados. |
| 4. Loja e pagamento | Carrinho, pedido pendente, reserva com expiração, Checkout Pro em sandbox, assinatura de webhook, consulta ao estado efetivo no provedor, conciliação e repetição de eventos. Manter checkout real desligado até o corte de hospedagem e os portões de aceitação. | Desligar checkout via chave de recurso; pedidos existentes continuam no banco e seguem tratamento manual. |
| 5. PCP e financeiro | Ordens por item, máquinas, etapas, consumo real, expedição, lançamentos e indicadores. Migrar `production_runs` sem reescrever histórico. | Desligar novos módulos; ledger e estados anteriores continuam acessíveis. |
| 6. Corte de hospedagem | Reproduzir build e variáveis no Railway, conectar ao PostgreSQL escolhido, configurar R2, domínio, alertas, backups e restauração testada. Congelar escritas por uma janela curta, exportar delta final, reconciliar e só então trocar DNS/tráfego. Após estabilizar o domínio, ativar checkout real gradualmente por chave de recurso. | Reverter deploy/DNS e apontar a versão anterior para **o mesmo PostgreSQL atualizado** sempre que possível. |

**Condição para afirmar “sem perda de dados”:** backup restaurado, contagens e checksums conferidos, fluxos de escrita suspensos na cópia final, e nenhuma escrita aceita em dois bancos sem replicação definida. Depois de abrir a nova loja, voltar simplesmente para uma cópia antiga do PGlite perderia pedidos novos. Por isso o plano de retorno preserva o PostgreSQL como fonte única e usa alterações de esquema compatíveis; se for necessário retornar ao banco de origem, primeiro bloquear novas escritas e reconciliar/exportar todas as mudanças posteriores ao corte. Definir responsável, janela e limiar de erro para acionar o retorno antes de publicar.

### Portões de aceitação antes de abrir pedidos reais

- Concorrência: dois pedidos pela última unidade; apenas um reserva. Cancelamento/expiração libera exatamente uma reserva.
- Pagamento: webhook com assinatura inválida rejeitado; evento duplicado não duplica reserva, receita nem ordem; valor e referência divergentes não liberam produção; reconciliação resolve notificação perdida.
- Produção: consumo de vários insumos é integral ou nulo; refugo e custos reais deixam rastro; pedido misto não é entregue antes da parte sob encomenda.
- Recuperação: restauração de backup em ambiente isolado, com catálogo, pedidos, anexos privados e saldos conferidos.
- Operação: catálogo público, orçamento, Inspire AI opcional, vendas manuais e SEO continuam funcionando no domínio de produção.

## 6. Custos e decisões pendentes

O orçamento de **US$ 10–25/mês do texto recebido é uma hipótese de planejamento**, não preço fechado. A [Railway](https://docs.railway.com/pricing) informa mínimo Hobby de US$ 5/mês com esse valor incluído no consumo, e cobra RAM, CPU, volume e saída conforme uso; o Pro inicia em US$ 20/mês. Aplicação, PostgreSQL e eventuais ambientes de staging consomem recursos. Medir a carga real e configurar alerta/limite antes de escolher o plano. A [documentação atual dos backups nativos](https://docs.railway.com/volumes/backups) descreve agendamentos para serviços com volume e cobrança incremental, sem restringi-los ao Pro. Confirmar sua disponibilidade no painel do Postgres Hobby; para independência do provedor, manter também uma exportação externa e testar a restauração.

O [R2 Standard](https://developers.cloudflare.com/r2/pricing/) tem franquia mensal de 10 GB-mês, 1 milhão de operações A e 10 milhões B; acima disso há cobrança. A franquia não se aplica à classe Infrequent Access. O [Mercado Pago](https://www.mercadopago.com.br/ferramentas-para-vender/check-out) não cobra mensalidade do checkout, mas cobra por venda conforme meio e prazo de recebimento; confirmar taxas na conta comercial. Somar domínio, e-mail, IA, frete, impostos e eventuais backups externos ao orçamento operacional.

Nenhuma contratação ou mudança de plano deve ocorrer sem aprovação específica sobre uma estimativa revisada. Próxima decisão necessária para a implantação: configurar o PostgreSQL de destino e aprovar o limite mensal; a fonte PGlite já foi identificada e copiada localmente.

## Referências técnicas

- [Prisma: introspecção de banco existente](https://www.prisma.io/docs/orm/v7/prisma-schema/introspection) e [baseline de banco existente](https://www.prisma.io/docs/orm/prisma-migrate/workflows/baselining). A CLI exata depende da versão que for fixada.
- [Mercado Pago: validação de assinatura de webhooks](https://www.mercadopago.com.br/developers/en/docs/checkout-bricks/additional-content/your-integrations/notifications/webhooks) e [Checkout Pro](https://www.mercadopago.com.br/developers/pt/docs/checkout-pro-orders/overview?scope=prod).
- [Render: limitações do serviço gratuito](https://render.com/docs/free), relevantes para o manifesto legado do repositório.
