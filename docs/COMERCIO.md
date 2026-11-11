# Vendas e checkout

## Venda manual

Em `/admin/vendas`, a venda rápida funciona como cardápio: toque nos produtos, ajuste quantidade, preço, desconto e frete, preencha o cliente e registre. A confirmação reserva itens de pronta entrega. O cupom virtual do pedido abre em uma página própria e pode ser impresso em papel térmico de 80 mm ou salvo em PDF. Ele é **comprovante não fiscal**.

## Compra pelo site

Um produto só mostra **Comprar** quando está publicado, lançado, disponível, tem preço maior que zero, ficha técnica com materiais, peso e três dimensões da embalagem, e o checkout está configurado. O comprador informa produto, opções, CEP, endereço e contato no site. A cotação do Melhor Envio mostra transportadora, modalidade, valor e prazo; o comprador escolhe uma opção antes de pagar. O Checkout Pro via API de Orders abre o pagamento seguro do Mercado Pago com Pix e cartão e retorna à página individual do pedido.

O pedido é criado como rascunho. O servidor faz uma nova cotação e compara preço e frete antes de abrir o pagamento. A confirmação pelo Mercado Pago, validada no servidor, marca o pagamento como recebido e coloca o pedido na fila de produção. A linha do tempo mostra produção, conferência, embalagem, envio e entrega. O painel registra os avanços; o envio exige um código de rastreio. A previsão inicial de produção usa o campo **Produção para compra online (dias úteis)** do cadastro do produto, contado após a aprovação do pagamento. A entrega inicial considera a primeira segunda, terça ou quinta após a produção e o prazo de transporte estimado pelo Melhor Envio. A compra da etiqueta e a postagem são feitas no Melhor Envio pela equipe; depois, registre o rastreio no painel.

O link individual de acompanhamento é enviado por e-mail quando `RESEND_API_KEY` e `QUOTE_FROM_EMAIL` estiverem configurados. Sem essas variáveis, o link aparece no retorno do pagamento e deve ser guardado pelo comprador.

## Configurar o Mercado Pago

1. Crie uma aplicação de Checkout Pro com **API de Orders** na conta de vendedor Mercado Pago e obtenha o **Access Token** de produção. Configure a chave Pix na conta para oferecer Pix.
2. Em Railway → `inspire3d-staging` → `inspire3d-web` → Variables, configure `MERCADO_PAGO_ACCESS_TOKEN` e `MERCADO_PAGO_WEBHOOK_SECRET` como segredos. A segunda chave é a assinatura secreta de Webhooks da aplicação.
3. Configure o webhook de **Order (Mercado Pago)** para `https://www.3dinspire.com.br/api/webhooks/mercadopago` no ambiente de produção. Salve e copie a assinatura secreta para `MERCADO_PAGO_WEBHOOK_SECRET`.
4. Para esta loja de desenvolvimento próprio, cadastre um aplicativo em Melhor Envio → Integrações → Área Dev. Use o callback estático `https://www.3dinspire.com.br/api/admin/integrations/melhorenvio/callback`. O painel de tokens pessoais recomenda esse outro fluxo para plataformas parceiras.
5. Configure `MELHOR_ENVIO_CLIENT_ID` e `MELHOR_ENVIO_CLIENT_SECRET` como segredos no Railway. Configure `SHOP_SHIPPING_ORIGIN_CEP=32235225` e, se desejar, `MELHOR_ENVIO_CONTACT_EMAIL` com um e-mail técnico; na ausência dele, o servidor usa `ADMIN_EMAIL`. A origem é sempre o endereço da empresa em Contagem/MG.
6. Confira `NEXT_PUBLIC_SITE_URL=https://www.3dinspire.com.br` e publique uma implantação. Entre no painel do site em `/admin/integracoes`, clique **Conectar Melhor Envio** e autorize apenas `shipping-calculate`. O site guarda os tokens cifrados no banco e renova o acesso antes do vencimento quando o catálogo ou a cotação é acessado. Se a conta ficar sem tráfego por mais tempo que a validade do token de renovação, reconecte pelo mesmo painel.
7. Cadastre peso final e largura, altura e comprimento da embalagem nos produtos vendidos online. O checkout fica oculto enquanto a autorização ou esses dados não estiverem prontos.
8. Antes de aceitar pagamentos reais, faça uma compra de teste com credenciais de teste, confira a cotação, o webhook, a aprovação no painel, a fila de produção, o link de acompanhamento e o cupom.

Não registre Access Token, assinatura de Webhook ou dados de cartão no Git. O site calcula o preço a partir do banco, valida o retorno do Mercado Pago pela API e não confia no valor informado pelo navegador.

Os tokens do Melhor Envio e as credenciais do Mercado Pago nunca devem ir para o navegador ou para o Git. O frete é cotado no servidor e revisto antes da criação do checkout. O prazo de transporte é estimado; a data final pode variar conforme produção, coleta e operação da transportadora.
