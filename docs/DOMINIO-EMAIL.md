# Domínio e e-mail — 3dinspire.com.br

## Estado em 10/11/2026

- O site está implantado em `inspire3d-web` no ambiente `staging` da Railway. A implantação `e6ecaf95-bb2b-42ef-a5c5-a7eafec3f8c9` terminou em `SUCCESS` com `SITE_NOINDEX=false` e canônica `https://www.3dinspire.com.br`. A URL temporária da Railway ainda devolve `X-Robots-Tag: noindex, nofollow, noarchive` para evitar indexação duplicada. O sitemap já contém as cinco páginas de processos.
- `3dinspire.com.br` e `www.3dinspire.com.br` foram adicionados como domínios personalizados ao serviço Railway. Ambos aguardam verificação DNS e certificado.
- A zona `3dinspire.com.br` foi criada no plano gratuito da Cloudflare com 9 registros: CNAME do ápice e de `www` para Railway; os dois TXT de verificação Railway; TXT DKIM e DMARC, dois CNAME de envio e MX de recebimento da Resend.
- Em 10/11/2026 às 16h12, o Registro.br aceitou `dell.ns.cloudflare.com` e `gerardo.ns.cloudflare.com` como servidores DNS e o novo DS da Cloudflare. A propagação ainda está pendente; a página pública pode continuar em `DEPLOYMENT_NOT_FOUND` até a troca ser vista pelos resolvedores.
- O domínio foi criado na Resend com envio e recebimento habilitados; a verificação está pendente de propagação DNS. A caixa `contato@3dinspire.com.br` só poderá ser criada depois da verificação.
- O plano Free da Resend inclui três caixas e 3.000 e-mails por mês (máximo de 100 por dia), mas mantém e-mails e logs por apenas 30 dias. Mensagens comerciais que precisem ser preservadas devem ser exportadas ou encaminhadas para uma caixa de arquivo antes desse prazo.
- O serviço Railway ainda não tem `RESEND_API_KEY`, `QUOTE_NOTIFICATION_EMAIL`, `QUOTE_FROM_EMAIL` nem `NEXT_PUBLIC_CONTACT_EMAIL`.
- Antes do corte, a aplicação local e a Railway foram comparadas por meio do painel administrativo: ambas mostram 1 produto, 0 materiais, 1 venda e 15 compras.
- Cloudflare R2 permanece desativado por escolha do proprietário. Usar o DNS e o encaminhamento de e-mail da Cloudflare não exige R2.

## Destino pretendido

| Uso | Serviço | Configuração |
| --- | --- | --- |
| Site `www` e ápice | Railway | CNAME fornecido pela Railway, com TXT de verificação para cada hostname; no ápice, usar DNS com CNAME flattening. |
| DNS autoritativo | Cloudflare DNS | Plano gratuito; copiar registros necessários antes de mudar os nameservers no Registro.br. |
| E-mail recebido | Resend Inboxes | Criar `contato@3dinspire.com.br` como caixa no painel da Resend após verificar o domínio. |
| E-mail dos formulários | Resend | Criar chave restrita a envio no domínio, configurar `RESEND_API_KEY`, remetente e destinatário na Railway; enviar e conferir uma mensagem de teste. |

## Sequência de corte

1. Aguardar o `.br` publicar os novos NS e DS. Conferir que resolvedores validadores respondem sem `SERVFAIL` e que a Cloudflare marca a zona ativa com DNSSEC íntegro.
2. Conferir status `verified` e certificado emitido para ambos os domínios na Railway, DNS público, HTTPS e páginas essenciais. Na Cloudflare, manter SSL/TLS em `Full`.
3. Verificar domínio na Resend, criar a caixa `contato@3dinspire.com.br` e uma chave de API com permissão de envio limitada ao domínio.
4. Configurar `RESEND_API_KEY`, `QUOTE_NOTIFICATION_EMAIL=contato@3dinspire.com.br` e `QUOTE_FROM_EMAIL=Inspire 3D <contato@3dinspire.com.br>` na Railway. Validar MX, DKIM, DMARC e testar recebimento e envio com contas distintas.
5. Após o recebimento estar verificado, configurar `NEXT_PUBLIC_CONTACT_EMAIL=contato@3dinspire.com.br` na Railway e conferir HTTPS, formulários e logs no domínio público. `NEXT_PUBLIC_SITE_URL` e `SITE_NOINDEX` já foram ajustados.

## Referências dos serviços

- [Railway: configuração de domínios personalizados](https://docs.railway.com/networking/domains/working-with-domains)
- [Resend: preços e limites](https://resend.com/pricing)
- [Resend: retenção de e-mails e logs](https://resend.com/security/gdpr/)

Enquanto o DNS e o e-mail não estiverem verificados, o formulário sinaliza ao visitante quando o envio automático não foi confirmado. Não anunciar o endereço de e-mail no site antes de verificar recebimento.
