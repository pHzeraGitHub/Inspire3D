# Prisma 7: base compatível com o banco atual

Esta etapa acrescenta o esquema Prisma e uma migração inicial que descrevem as **nove tabelas legadas**. O site continua usando `src/lib/db.ts` e SQL direto em produção. Nenhum dado é transferido apenas por instalar o Prisma ou gerar o cliente.

Em 10/11/2026, foi confirmado que os dados reais estão no PGlite desta máquina. O snapshot usado na migração para staging é `.data/backups/pglite-2026-11-10T15-12-10-221Z`; ele foi restaurado em memória para conferência. Contém 1 produto, 1 venda, 1 item de venda e 15 compras históricas; as demais tabelas estão vazias. O diretório `.data` é ignorado pelo Git e o snapshot contém dados privados. O servidor de desenvolvimento foi religado após a cópia.

## Arquivos

- `prisma/schema.prisma`: nomes de domínio em TypeScript mapeados às tabelas e colunas físicas existentes com `@map` e `@@map`.
- `prisma/migrations/0_legacy_baseline/migration.sql`: cópia do DDL final de `src/lib/db.ts`, incluindo `CHECK`, índices e alterações legadas. A pasta `0_` garante a primeira posição no histórico.
- `prisma.config.ts`: só fornece URL de banco à CLI se `DATABASE_URL` estiver definida no ambiente. `db:validate` e `db:generate` funcionam sem conexão.
- `scripts/snapshot-pglite.mjs`: exporta dados lógicos, tarball físico e manifest com hashes; restaura o tarball e compara todas as linhas antes de concluir. Exige que o servidor PGlite esteja parado e a opção `--source-stopped`.
- `scripts/import-pglite-snapshot.mjs`: verifica hashes sem conexão por padrão. Com `--apply` e `MIGRATION_TARGET_DATABASE_URL` no ambiente, importa somente para PostgreSQL vazio com baseline aplicado, em uma transação, e confere todas as linhas antes do commit.

Para gerar um `prisma migrate diff` offline a partir do esquema, a CLI 7 ainda precisa de uma URL PostgreSQL sintaticamente válida em `DATABASE_URL`; `--from-empty --to-schema` não abre essa conexão. Não usar uma URL de produção nesse comando de inspeção.

O Prisma não representa todos os `CHECK` do PostgreSQL no arquivo `.prisma`; eles permanecem no SQL versionado. Uma mudança futura nesses limites exige migração SQL explícita.

## Verificação local

```powershell
npm ci
npm run db:validate
npm run db:generate
npm run typecheck
npm run build
```

O baseline também pode ser executado em **banco de teste vazio** e deve produzir nove tabelas. O teste executado nesta entrega usou PGlite em memória; não tocou nos registros de `.data/inspire3d`.

## Antes de ligar Prisma a um banco com dados

1. Confirmar qual banco é a fonte comercial atual: PGlite local ou PostgreSQL externo. Preservar também `.data/inspire3d-purchases.json` e imagens de `public/` se forem parte da operação.
2. Fazer backup consistente e restaurá-lo em ambiente isolado. Reconciliar contagem de linhas, IDs, slugs, saldos, totais de vendas, vínculos e esquema SQL. Não assumir que o esquema de produção corresponde ao arquivo atual sem comparar.
3. Se a fonte for PGlite, exportar as nove tabelas com IDs, datas e JSON preservados; importar em um PostgreSQL isolado e conferir os mesmos controles. Durante a cópia final, suspender escritas na origem.
4. Em um PostgreSQL **novo e vazio**, `npx prisma migrate deploy` aplica o baseline para criar as tabelas. Esse comando não importa registros legados. Configurar `DATABASE_URL` no ambiente seguro da execução.
5. Rodar `node scripts/import-pglite-snapshot.mjs --snapshot .data/backups/pglite-2026-11-10T15-12-10-221Z` para conferir o backup. Depois configurar `MIGRATION_TARGET_DATABASE_URL` apontando para esse PostgreSQL isolado e repetir com `--apply`. O importador recusa tabelas não vazias e faz rollback se a reconciliação falhar.
6. Converter leitores e escritores para Prisma por módulo, com comparação de resultados. Manter as rotas atuais e SQL existente até cada módulo passar nos testes de regressão.

Se um PostgreSQL **já populado** for adotado no futuro, comparar primeiro seu esquema e marcar o baseline com `npx prisma migrate resolve --applied 0_legacy_baseline`; não aplicar a importação sobre registros existentes. Para o PGlite atual, o caminho é criar o PostgreSQL vazio, aplicar baseline e importar o snapshot.

O PostgreSQL de staging foi criado na Railway e a etapa `--apply` foi executada em 10/11/2026 por túnel SSH privado, sem TCP proxy público. O baseline Prisma e as nove tabelas foram aplicados; o importador confirmou igualdade de todas as linhas antes do commit. A aplicação no staging também confirmou as contagens de produtos, materiais e vendas, e exibiu as 15 compras no painel administrativo. O PGlite local continua sendo a origem comercial. Para abrir pedidos comerciais no Railway, configurar e testar backup e restauração. A [documentação atual](https://docs.railway.com/volumes/backups) descreve backups de volumes manuais e agendados com cobrança incremental; confirmar disponibilidade no painel deste Postgres Hobby e manter cópia externa independente.

Não executar `prisma migrate reset` nem `prisma db push` em banco com dados comerciais. Para um retorno, a versão anterior da aplicação deve apontar para o mesmo PostgreSQL e continuar compatível com o esquema expandido.

Referência: [Prisma 7 — adicionar Migrate a um projeto existente](https://www.prisma.io/docs/orm/v7/prisma-migrate/getting-started).
