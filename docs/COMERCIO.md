# Vendas e checkout

## Venda manual

Em `/admin/vendas`, a venda rápida funciona como cardápio: toque nos produtos, ajuste quantidade, preço, desconto e frete, preencha o cliente e registre. A confirmação reserva itens de pronta entrega. O cupom virtual do pedido abre em uma página própria e pode ser impresso em papel térmico de 80 mm ou salvo em PDF. Ele é **comprovante não fiscal**.

## Compra pelo site

Um produto só mostra **Comprar** quando está publicado, lançado, disponível, tem preço maior que zero, possui ficha técnica com materiais e o checkout está configurado. O comprador informa produto, opções, endereço e contato no site. O Checkout Pro abre o pagamento seguro do Mercado Pago com Pix e cartão e retorna à página individual do pedido. O Mercado Pago também pode mostrar saldo em conta, pois essa opção não pode ser excluída nas preferências do Checkout Pro.

O pedido é criado como rascunho. A confirmação pelo Mercado Pago, validada no servidor, marca o pagamento como recebido e coloca o pedido na fila de produção. A linha do tempo mostra produção, conferência, embalagem, envio e entrega. O painel registra os avanços; o envio exige um código de rastreio. A previsão inicial de produção usa o campo **Produção para compra online (dias úteis)** do cadastro do produto, contado após a aprovação do pagamento.

O link individual de acompanhamento é enviado por e-mail quando `RESEND_API_KEY` e `QUOTE_FROM_EMAIL` estiverem configurados. Sem essas variáveis, o link aparece no retorno do pagamento e deve ser guardado pelo comprador.

## Configurar o Mercado Pago

1. Crie uma aplicação de Checkout Pro na conta de vendedor Mercado Pago e obtenha o **Access Token** de produção. Configure a chave Pix na conta para oferecer Pix.
2. Em Railway → `inspire3d-staging` → `inspire3d-web` → Variables, configure `MERCADO_PAGO_ACCESS_TOKEN` e `MERCADO_PAGO_WEBHOOK_SECRET` como segredos. A segunda chave é a assinatura secreta de Webhooks da aplicação.
3. Configure o webhook de **Pagamentos** e **Ordens comerciais** para `https://www.3dinspire.com.br/api/webhooks/mercadopago`.
4. Configure `SHOP_SHIPPING_FLAT_RATE` com o valor em reais do frete fixo inicial. O valor `0` significa frete grátis. O checkout fica oculto enquanto esse valor não estiver definido.
5. Confira `NEXT_PUBLIC_SITE_URL=https://www.3dinspire.com.br` e publique uma nova implantação para carregar as variáveis.
6. Antes de aceitar pagamentos reais, faça uma compra de teste com credenciais de teste, confira o webhook, a aprovação no painel, a fila de produção, o link de acompanhamento e o cupom.

Não registre Access Token, assinatura de Webhook ou dados de cartão no Git. O site calcula o preço a partir do banco, valida o retorno do Mercado Pago pela API e não confia no valor informado pelo navegador.

O frete desta primeira integração é fixo. Para cotação automática por CEP, será necessário escolher e integrar uma transportadora ou serviço de frete com credenciais próprias; o valor deverá ser calculado no servidor antes de abrir o pagamento.
