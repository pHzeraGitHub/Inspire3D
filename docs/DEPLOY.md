# Inspire 3D — colocar o site no ar

Caminho escolhido: **Render**, começando no plano gratuito para validar o deploy
inteiro sem gastar nada, e subindo para o de US$ 7 quando for apontar o domínio.

Por que Render e não Vercel: o plano gratuito da Vercel proíbe uso comercial, e
o plano pago dela custa três vezes mais. Além disso o Render pago roda um
**servidor Node único** — o que faz o rate limiting deste projeto funcionar como
foi escrito, sem precisar contratar Redis.

---

## Antes de começar

O que já está pronto no repositório:

| Arquivo | Para quê |
| --- | --- |
| `render.yaml` | Descreve o serviço. O Render lê e configura sozinho. |
| `.node-version` | Fixa o Node em 22, a mesma versão que roda na sua máquina. |
| `package.json` → `engines` | Segunda trava da versão do Node. |
| `.gitignore` | Já ignora `.env*.local`, `.env`, `node_modules` e `.next`. |

O que você precisa ter em mãos:

- Conta no **GitHub** (o Render puxa o código de lá)
- Conta no **Render** (render.com — dá para entrar com o GitHub)
- A chave da **Anthropic**, se quiser a Inspire AI no ar já
- A chave da **Resend**, se quiser os orçamentos chegando por e-mail já

As duas chaves são opcionais no primeiro deploy. Sem elas o site sobe e funciona
— a aba "Conversar" some e o lead vai para o log em vez do e-mail.

---

## 1. Limpar o que não deve subir

Na pasta do projeto, apague os relatórios que geramos:

```powershell
Remove-Item check-lint.txt, check-build.txt -ErrorAction SilentlyContinue
```

Confira que nada sensível está rastreado:

```powershell
git status
```

Se aparecer `.env.local` nessa lista, **pare** e me avise — o `.gitignore` deveria
estar impedindo isso.

---

## 2. Subir para o GitHub

A pasta já é um repositório git. Falta criar o repositório remoto e empurrar.

```powershell
git add .
git commit -m "Site Inspire 3D: orçamento, Inspire AI e deploy"
```

No GitHub, crie um repositório **privado** chamado `inspire3d-site`. Não marque
nenhuma opção de inicializar com README — o repositório já tem conteúdo.

Depois, com a URL que o GitHub mostrar:

```powershell
git remote add origin https://github.com/SEU-USUARIO/inspire3d-site.git
git branch -M main
git push -u origin main
```

---

## 3. Criar o serviço no Render

1. Em **render.com**, clique em **New** → **Blueprint**
2. Conecte sua conta do GitHub e escolha o repositório `inspire3d-site`
3. O Render vai ler o `render.yaml` e propor um serviço chamado `inspire3d-site`
4. Ele vai pedir os valores das variáveis marcadas como `sync: false` — são as
   que não ficam no repositório. Preencha conforme a tabela abaixo
5. Clique em **Apply**

O primeiro build leva alguns minutos. Quando terminar, o Render te dá uma URL
tipo `https://inspire3d-site.onrender.com`.

> **Se o Blueprint der erro no campo `plan`:** apague a linha `plan: free` do
> `render.yaml`, empurre de novo, e escolha o tipo de instância pelo painel.
> O resto do arquivo continua valendo.

### Variáveis a preencher

| Variável | O que pôr | Obrigatória? |
| --- | --- | --- |
| `NEXT_PUBLIC_SITE_URL` | A URL que o Render te deu, sem barra no fim. Ex: `https://inspire3d-site.onrender.com` | **Sim** |
| `ANTHROPIC_API_KEY` | `sk-ant-...` do console.anthropic.com | Não |
| `RESEND_API_KEY` | `re_...` do resend.com | Não |
| `QUOTE_NOTIFICATION_EMAIL` | Onde você quer receber os orçamentos | Não |
| `QUOTE_FROM_EMAIL` | No começo: `Inspire 3D <onboarding@resend.dev>` | Não |

**Atenção ao `NEXT_PUBLIC_SITE_URL`.** Variáveis que começam com `NEXT_PUBLIC_`
entram no código durante o *build*, não na hora da requisição. Se você mudar o
valor depois, precisa disparar um novo deploy para ele valer — não basta salvar
no painel.

---

## 4. Conferir no ar

Abra a URL do Render e teste, nesta ordem:

1. **Home** carrega, com o cubo e o menu
2. **`/orcamento`** abre o formulário. Preencha e envie — a tela de resultado
   deve aparecer com tecnologia, complexidade, prazo e a faixa de preço
3. **`/servicos`**, **`/projetos`**, **`/termos`** e **`/politica-de-privacidade`**
   abrem sem erro
4. **`/sitemap.xml`** lista as URLs com o domínio certo (não o placeholder)
5. Se pôs a chave da Anthropic: a aba **"Conversar"** aparece em `/orcamento`

Nos **Logs** do Render você vê o que aconteceu no servidor. Se o e-mail não
estiver configurado, vai aparecer o aviso `RESEND_API_KEY ausente` e o lead
inteiro logo abaixo — ele não se perde.

### O sono do plano gratuito

No plano gratuito o serviço hiberna depois de um tempo sem acesso. A primeira
visita seguinte demora uns 30 a 50 segundos para responder, enquanto ele acorda.

Isso é aceitável para testar, e **inaceitável** para um site que recebe cliente.
É o principal motivo de subir para o plano pago antes de divulgar o endereço.

---

## 5. Subir para o plano pago e apontar o domínio

Quando os testes passarem:

1. No painel do serviço, **Settings** → mude o tipo de instância para o de
   US$ 7/mês. O serviço para de hibernar
2. **Settings** → **Custom Domains** → adicione `inspire3d.com.br` e
   `www.inspire3d.com.br`
3. O Render mostra os registros de DNS. Configure-os onde o domínio está
   registrado. O certificado HTTPS é emitido automaticamente
4. Volte em **Environment** e troque o `NEXT_PUBLIC_SITE_URL` para
   `https://www.inspire3d.com.br`
5. **Dispare um novo deploy** — sem isso a variável antiga continua valendo

---

## 6. Depois que o domínio estiver no ar

**Verifique o domínio na Resend.** Enquanto o remetente for `onboarding@resend.dev`,
o e-mail só chega em teste. Com o domínio verificado, troque o `QUOTE_FROM_EMAIL`
para `Inspire 3D <orcamento@inspire3d.com.br>` e faça novo deploy.

**Cadastre o site no Google Search Console** e envie o `sitemap.xml`. É o que
começa a fazer o site aparecer em busca por "impressão 3D BH", "miniaturas
personalizadas" e os outros termos que a estrutura já contempla.

**Confira o compartilhamento.** Mande a URL para você mesmo no WhatsApp e veja
se a imagem de pré-visualização aparece — deve ser o card preto com o cubo
dourado.

---

## Como funcionam os deploys daqui em diante

O `autoDeploy: true` no `render.yaml` faz o Render publicar sozinho a cada push
na branch `main`. Fluxo normal:

```powershell
git add .
git commit -m "o que mudou"
git push
```

O build roda no Render. Se falhar, o site **continua no ar com a versão
anterior** — o deploy só troca quando o build passa.

---

## Se algo der errado

| Sintoma | Causa provável |
| --- | --- |
| Build falha em `npm ci` | `package-lock.json` desatualizado. Rode `npm install` local, commite o lock e empurre de novo |
| Site sobe mas `/orcamento` dá erro 500 | Veja os Logs. Quase sempre é variável de ambiente faltando |
| Sitemap e URLs canônicas com endereço errado | `NEXT_PUBLIC_SITE_URL` mudou mas não houve novo deploy |
| Aba "Conversar" não aparece | `ANTHROPIC_API_KEY` não está no painel, ou o deploy é anterior a ela |
| Primeira visita demora 40 segundos | Plano gratuito hibernando. É o comportamento esperado |

Qualquer erro que você não reconhecer, me manda o trecho dos Logs do Render que
eu leio.
