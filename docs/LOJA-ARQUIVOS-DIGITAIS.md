# Loja de arquivos digitais — Inspire 3D

## Objetivo

Vender arquivos de corte para Silhouette e modelos para impressão 3D no mesmo catálogo e painel que os produtos físicos. O cliente paga no site e encontra os arquivos em **Minha biblioteca**, com acesso por conta ou link de entrada enviado ao seu e-mail. Cada compra conserva o formato, a versão do arquivo, o preço e a licença adquiridos. A loja ainda não possui checkout nem entrega digital em produção; este documento define a implementação.

**Base preparada no código:** a migração aditiva `20261110_digital_catalog` e o espelho Prisma acrescentam o tipo de produto, ofertas por licença e metadados de versões privadas. A migração ainda **não foi aplicada** ao PGlite real nem ao PostgreSQL da Railway; não há tela de compra, upload ou download liberada. A próxima implementação deve associar essas estruturas a pedidos pagos e autorizar a entrega no servidor.

**Decisões do proprietário em 10/11/2026:** os arquivos e formatos ainda serão definidos; todas as ofertas digitais começam com **licença comercial**. Não cadastrar produtos fictícios nem anunciar compatibilidade sem um arquivo real testado. A licença comercial deverá ser descrita de forma explícita antes da primeira venda. Proposta de escopo a validar: permitir fabricar e vender objetos físicos a partir do arquivo comprado, sem transferir a autoria e sem autorizar a redistribuição ou revenda do arquivo digital em si. O texto final dos termos precisa de revisão jurídica antes de ser publicado. A [Lei 9.610/1998](https://www.planalto.gov.br/ccivil_03/leis/l9610.htm) permite licenciamento de direitos autorais, mas a modalidade e os usos concedidos devem ser definidos no contrato.

## Experiência do cliente

1. A vitrine separa **Produtos físicos**, **Arquivos para corte** e **Modelos para impressão 3D**, com busca por finalidade, formato e processo. O arquivo digital exibe imagens de prévia, formatos incluídos, programa/equipamento compatível, dimensões ou escala, conteúdo do pacote, versão, licença e preço. A prévia nunca contém o arquivo final.
2. O carrinho aceita itens físicos, digitais e mistos. Frete e endereço são exigidos apenas para os itens físicos. Preço, desconto e total são recalculados no servidor.
3. O checkout identifica o comprador por e-mail, cria um pedido pendente e o encaminha ao Mercado Pago. A página de retorno informa que o pagamento está em análise até a confirmação verificada no servidor.
4. Um webhook autenticado e idempotente, seguido de consulta ao estado do pagamento no Mercado Pago, confirma valor, moeda, pedido e situação. Só o estado aprovado cria a licença de acesso aos arquivos. Pagamento pendente, recusado ou apenas a visita à página de sucesso não libera downloads.
5. O cliente recebe uma mensagem com acesso a **Minha biblioteca**. A biblioteca mostra pedidos, licença, versões disponíveis e suporte. Para cada download, o servidor valida sessão, compra e situação do pagamento e gera um link temporário para um único objeto privado. O link direto expira rapidamente e não aparece em páginas públicas.
6. Reembolso, estorno, contestação ou cancelamento revogam o acesso conforme os termos comerciais. Os eventos ficam auditáveis sem expor a URL privada do arquivo em logs ou e-mails.

### Área do cliente e atendimento

**Minha conta** reúne carrinho salvo, dados de contato, pedidos físicos e digitais, situação do pagamento, prazo de produção/expedição, rastreamento, biblioteca de arquivos e histórico de mensagens. O cliente pode pedir ajuda ou correção pelo próprio pedido; o painel mostra ao atendente o contexto e a origem da venda. Notificações por e-mail acompanham mudanças reais de estado. Personalizações e orçamentos aprovados devem virar itens do pedido sem reescrever a conversa nem perder os arquivos enviados pelo cliente. Esses fluxos serão entregues por etapas e testados em celular antes da abertura comercial.

## Catálogo e gestão

- O produto mantém um ID canônico. `kind` distingue `physical`, `digital` e, quando necessário, `hybrid`; o arquivo não consome estoque de filamento nem gera ordem de produção. Uma compra mista cria itens separados no mesmo pedido.
- Uma oferta digital declara família (`silhouette` ou `3d-print`), formatos, licença, preço, prévias, compatibilidade, instruções e notas de versão. Confirmar com o proprietário os formatos reais; exemplos possíveis são SVG/DXF/Studio3 para corte e STL/3MF/ZIP para impressão. Não prometer compatibilidade sem validar o arquivo no programa ou equipamento indicado.
- Para SVG, informar a edição necessária do Silhouette Studio: a [Silhouette informa](https://www.silhouetteamerica.com/heat-transfer) que abrir SVG requer Designer Edition ou superior. Um produto anunciado para a edição básica precisa incluir um formato realmente testado nela.
- Cada arquivo privado tem ID, versão, chave de armazenamento, tamanho, SHA-256, formato e estado. Substituir um arquivo cria nova versão; pedidos antigos mantêm uma referência auditável. Definir se atualizações serão incluídas na compra ou oferecidas separadamente.
- O painel administrativo cadastra a oferta, faz upload privado, calcula o hash, mostra a prévia e permite publicar somente quando preço, licença e pelo menos um arquivo válido estiverem completos. O painel também mostra compras, liberações, reembolsos e tentativas de download.
- A oferta inicial usa licença comercial em todos os arquivos. O modelo mantém `license_code` e preço por oferta para permitir novas modalidades futuramente sem reescrever pedidos antigos. O texto da licença deve dizer claramente o que pode ser produzido, vendido, modificado e redistribuído. Confirmar autoria ou direito de revenda antes de publicar arquivos de terceiros.

## Dados e autorização

| Entidade | Campos e vínculo essenciais |
| --- | --- |
| `products` | `kind`, categoria e campos atuais de descrição/SEO/preço; IDs e slugs existentes são preservados. |
| `digital_offers` | `product_id`, família, licença, preço, termos versionados, política de atualização e estado de publicação. |
| `digital_asset_versions` | `offer_id`, versão, formato, nome exibido, chave privada, tamanho, SHA-256 e data. A chave de armazenamento nunca é enviada pelo catálogo. |
| `orders` / `sale_items` | Origem da venda, comprador, valor e licença/versão como snapshot no item; pedidos físicos e digitais compartilham o mesmo pagamento. |
| `payments` / `payment_events` | ID externo único, estado, valor e eventos idempotentes. Não confiar em valores enviados pelo navegador. |
| `digital_entitlements` | Um direito de acesso por item pago e oferta/versão, com estado ativo ou revogado e referência ao pagamento. Unicidade impede concessão dupla. |
| `download_events` | Direito usado, data, resultado e identificador técnico reduzido para suporte/abuso; retenção limitada conforme política de privacidade. |

A entrada na biblioteca deve usar sessão de cliente ou link de acesso de uso único enviado ao e-mail da compra. O servidor verifica o direito de acesso **a cada pedido de download**. O link para o objeto privado é curto, específico para `GET` e tratado como credencial: quem o recebe pode usá-lo até expirar. Não usar URL pública permanente, caminho em `/public`, nem anexar o arquivo final ao e-mail.

## Armazenamento e custos

Para iniciar dentro do limite de gasto já configurado, o destino recomendado passa a ser um [bucket privado da Railway](https://docs.railway.com/storage-buckets). O Hobby permite buckets S3 compatíveis e links temporários assinados; o [armazenamento custa US$ 0,015 por GB-mês](https://docs.railway.com/storage-buckets/billing), com operações e saída direta do bucket gratuitas. O acesso ao bucket é suspenso quando o limite rígido do workspace é atingido, portanto os downloads também param nesse cenário. Adotaremos links curtos, por exemplo 5 minutos, renováveis pela biblioteca. O arquivo deve ter nome opaco, tamanho e hash conferidos; a prévia pública fica separada.

O R2 **não foi ativado** nesta conta. Seu [plano Standard](https://developers.cloudflare.com/r2/pricing/) pode continuar como opção futura de armazenamento separado, mas excedentes seriam cobrados pela Cloudflare **fora** do limite de US$ 25 da Railway. Antes de criar qualquer bucket, levantar quantidade e tamanho dos arquivos e estimar consumo. O Mercado Pago cobra taxas por transação conforme a conta e o meio de pagamento; essas taxas também não entram no teto da Railway.

O banco de dados precisa de backup e teste de restauração antes de receber pedidos reais. A [Railway documenta backups agendados de volumes](https://docs.railway.com/volumes/backups) com cobrança incremental; confirmar a disponibilidade no Postgres deste Hobby. Os arquivos privados também precisam de cópia e procedimento de recuperação: o bucket Railway ainda não oferece snapshots automáticos, e uma cópia apenas no mesmo provedor não é suficiente para recuperação independente.

## Integração com canais de venda

O painel registra uma origem para cada pedido (`site`, marketplace ou manual), mapeia SKU/oferta por canal e centraliza pagamentos, atendimento e indicadores. Produtos físicos compartilham o controle de estoque entre canais. Arquivos digitais só recebem direito de download quando o canal fornece uma confirmação de pagamento confiável e **permite** entregar arquivos ou links fora da plataforma. Verificar as regras e APIs de cada marketplace antes de anunciar digitais por ele; não enviar links em mensagens para contornar uma proibição do canal.

## Entregas em ordem

1. Carrinho e pedido único para produtos físicos e digitais, com checkout Mercado Pago em **sandbox**, webhook autenticado, reconciliação e testes de eventos repetidos. Checkout real continua desligado.
2. Catálogo digital, licença, upload privado, biblioteca do cliente e downloads temporários, testados em sandbox. Começar com produtos digitais simples e um formato por oferta; ampliar depois para pacotes e licenças.
3. Pedidos mistos, e-mails transacionais, reembolso/estorno e suporte; testar entrega, expedição e recuperação de conta.
4. Integração dos marketplaces escolhidos, com mapeamento de SKUs, conciliação e regras próprias de cada canal.
5. Abrir vendas reais apenas após teste completo do pagamento, da autorização de downloads, de backup/restauração e da operação no domínio público.

## Critérios de aceitação

- Um cliente sem compra não baixa o arquivo, mesmo conhecendo a URL do produto ou um ID de objeto.
- Pagamento pendente, recusado, de valor divergente ou com webhook inválido não concede acesso.
- Webhook duplicado não cria dois pedidos, duas licenças nem duas mensagens de entrega.
- Reembolso ou estorno revoga o direito; o link temporário emitido antes expira em poucos minutos.
- Compra mista calcula frete apenas para itens físicos; o arquivo fica disponível após aprovação, sem esperar expedição.
- Uma nova versão não apaga o arquivo que foi vendido antes; a política de atualização decide se o comprador recebe a nova.
- O arquivo original não aparece em sitemap, prévia, metadados públicos ou logs. Cadastro de produto digital incompleto não pode ser publicado.
- Backup restaurado recupera pedidos, direitos de acesso e arquivos; a contagem e o hash dos objetos são conferidos.

## Decisões de produto pendentes

Confirmar formatos existentes e direitos de comercialização para cada arquivo, política de atualização, prazo de acesso/retorno, marketplaces prioritários e volume estimado dos arquivos. Esses dados definem os textos de produto, o preço, a estimativa do R2 e os primeiros testes de compatibilidade. A modalidade inicial de licença comercial já foi escolhida; falta fechar seu texto e alcance.
