# Railway Hobby — ambiente de migração e testes

Autorização recebida em 10/11/2026: criar ambiente Hobby com limite de US$ 25/mês. **Escopo:** aplicação e PostgreSQL para ensaio da migração, sem abrir checkout ou transferir o domínio de produção nesta etapa.

## Estado em 10/11/2026

- Workspace Railway no plano Hobby. Limite rígido de **US$ 25** para Compute Usage e alerta por email em **US$ 20**, confirmados na página Usage. Railway Agent limitado a US$ 0.
- Projeto privado [`inspire3d-staging`](https://railway.com/project/31b64860-f2a3-43ce-be2d-a8261a441d72) criado com ambiente `staging`.
- Serviço `Postgres` online, com baseline Prisma e dados do PGlite importados. Serviço `inspire3d-web` implantado com `/api/health`, Serverless e URL temporária [`inspire3d-web-staging.up.railway.app`](https://inspire3d-web-staging.up.railway.app). A implantação `0601fc7a-504c-4f5b-953d-f8e91629bf70` terminou em `SUCCESS`; a home foi conferida no navegador.
- CLI oficial Railway 5.71.0 vinculada à conta com consentimento específico para o escopo da Railway (`workspace:admin`, `project:admin`, chaves SSH e sessão persistente), limitado ao workspace da conta e ao projeto `inspire3d-staging` na tela de autorização. A chave SSH temporária usada no túnel foi revogada na Railway após a importação.
- Os arquivos locais da chave temporária (`C:\Users\PH\.ssh\railway_inspire3d_staging_ed25519` e `.pub`) permaneceram: a exclusão local foi rejeitada pela revisão automática de comandos. A chave pública já não está cadastrada na Railway.
- Snapshot atualizado e restaurado em teste: `.data/backups/pglite-2026-11-10T15-12-10-221Z`. A conferência de hashes passou; o PGlite local voltou a responder em `/api/health`.
- `node scripts/migrate-railway-staging.mjs --project 31b64860-f2a3-43ce-be2d-a8261a441d72 --snapshot .data/backups/pglite-2026-11-10T15-12-10-221Z` aplicou o baseline e importou todas as linhas. É um procedimento de uso único: recusa banco não vazio.
- `node scripts/verify-railway-staging.mjs` passou: healthcheck, catálogo, orçamento, login e painel administrativo, contagens de 1 produto, 0 materiais e 1 venda, e visualização das 15 compras.
- `npm run db:validate`, `npm run typecheck` e `npm run build` passaram localmente. As substituições fixadas de `postcss` e `brace-expansion` reduziram `npm audit --omit=dev` para **0 vulnerabilidades altas e 2 moderadas**. O build atualizado foi implantado e verificado novamente.
- Credenciais exclusivas do administrador de staging foram geradas e salvas em `.data/railway-staging-admin.json` (ignorado pelo Git). A Railway recebeu as variáveis seguras; o endereço do banco é uma referência privada a `Postgres.DATABASE_URL`.

## Ordem de implantação

1. Entrar na conta Railway e configurar limite de gasto do workspace em US$ 25/mês antes de provisionar recursos. Confirmar no painel o valor e o comportamento do limite; um limite rígido pode parar os serviços quando atingido.
2. Criar projeto `inspire3d-staging` e PostgreSQL. Usar rede privada entre aplicação e banco. Guardar credenciais de acesso remoto nas variáveis seguras da Railway; a cópia local das credenciais exclusivas de staging fica em `.data/railway-staging-admin.json`.
3. Aplicar o baseline Prisma no banco vazio. Importar o [snapshot PGlite](PRISMA-BASELINE.md) em transação e conferir contagens, IDs e dados. Manter uma cópia local restaurável até concluir o corte.
4. Implantar o commit validado da aplicação com `DATABASE_URL` apontando ao PostgreSQL privado, `DATABASE_SSL` conforme a conexão Railway, `ADMIN_*` em secrets, e `NEXT_PUBLIC_SITE_URL` configurada para o endereço de staging durante o build.
5. Configurar `/api/health` como healthcheck. Verificar catálogo, login administrativo, venda manual, estoque e orçamento na URL temporária. Comparar os totais com o PGlite fonte. Desativar qualquer rota de checkout real até a etapa comercial.
6. Configurar backup e ensaiar restauração **antes** de aceitar novos pedidos reais. Backups nativos são recurso do Pro; no Hobby é necessária rotina própria com cópia externa e monitoramento.

## Custos e limites

- [Railway Hobby](https://docs.railway.com/pricing): mínimo de US$ 5/mês, incluído no consumo; RAM, CPU, volume e saída são medidos. US$ 25/mês é um limite operacional aprovado, não uma previsão garantida.
- O [controle de custos](https://docs.railway.com/pricing/cost-control) permite alertas e limite rígido; ao atingir o rígido os serviços podem ser interrompidos. Conferir essa configuração no painel antes de publicar a loja.
- [Backups nativos Railway](https://station.railway.com/questions/need-to-get-backup-from-database-44a3320b) não estão disponíveis no Hobby. A alternativa é job de backup para armazenamento externo, sujeito a consumo adicional e teste de restauração.
- Usar `DATABASE_URL` privado para o aplicativo evita saída de rede cobrada entre serviços. A [CLI Railway](https://docs.railway.com/cli/connect) permite `railway connect postgres --tunnel-only`: ela abre um túnel SSH local para a importação sem criar um TCP proxy público. Encerrar o túnel após migrar e conferir os dados.

## Retorno

O domínio atual e o PGlite local continuam sem mudança durante o staging. Se a importação ou os testes falharem, interromper o ambiente Railway e manter a aplicação atual no PGlite. Antes de mudar tráfego real no futuro, fazer um snapshot final com escritas pausadas e repetir a reconciliação.
