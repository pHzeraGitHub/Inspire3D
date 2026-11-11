# Backup diário do PostgreSQL no R2

O ambiente de staging usa PostgreSQL privado no Railway Hobby. O job em `backup/` cria um arquivo `pg_dump` no formato customizado, envia para um **bucket R2 privado** e confirma no R2 o tamanho e o SHA-256 registrados no objeto. A restauração é feita em outro banco, vazio, cujo nome termina em `_restore_test`.

## Estado

O código está preparado, mas **o agendamento ainda não está ativo**. Em 10/11/2026, o usuário optou por manter o R2 desativado por enquanto. A ativação futura depende de um bucket R2 e de credenciais específicas para ele. O snapshot PGlite local já restaurado continua sendo a cópia de segurança atual para os dados migrados ao staging; ele não cobre escritas futuras feitas no PostgreSQL. Não aceitar pedidos comerciais na Railway antes de executar um backup do PostgreSQL e uma restauração completa de teste.

**Alternativa dentro da Railway:** a [documentação atual](https://docs.railway.com/volumes/backups) descreve backup manual e agendado do volume PostgreSQL com cobrança incremental. Confirmar no painel deste Hobby; essa opção não ativa o R2 e fica sujeita ao limite rígido de gasto da Railway. Para uma cópia independente do provedor, manter também uma exportação externa.

O R2 Standard tem franquia mensal de [10 GB-mês, 1 milhão de operações de escrita e 10 milhões de leitura](https://developers.cloudflare.com/r2/pricing/). O snapshot físico local atual mede cerca de 4,9 MB; 30 arquivos desse tamanho somariam cerca de 147 MB, como ordem de grandeza, mas o tamanho do `pg_dump` e o crescimento do banco precisam ser medidos. Uso acima da franquia é cobrado pela Cloudflare, separadamente do limite Railway. [Ativar o R2 exige uma assinatura na conta Cloudflare](https://developers.cloudflare.com/r2/get-started/); nenhum bucket ou assinatura foi criado nesta etapa.

## Configuração do R2

1. Criar um bucket chamado, por exemplo, `inspire3d-backups`, sem domínio público nem acesso `r2.dev`. Preferir a classe Standard.
2. Criar credenciais S3 com permissão **Object Read & Write**, limitadas a esse bucket. Guardar o Secret Access Key fora do Git; a Cloudflare só o mostra uma vez. O token de backup precisa ler e escrever para conferir o objeto. Não usar uma chave administrativa da conta.
3. No serviço de backup Railway, configurar `DATABASE_URL=${{Postgres.DATABASE_URL}}`, `R2_ENDPOINT=https://<account-id>.r2.cloudflarestorage.com`, `R2_BACKUP_BUCKET`, `R2_ACCESS_KEY_ID`, `R2_SECRET_ACCESS_KEY` e `R2_BACKUP_PREFIX=inspire3d/staging` como variáveis privadas.
4. Configurar `RAILWAY_DOCKERFILE_PATH=backup/Dockerfile`. O Dockerfile usa `pg_dump` 18, correspondente ao PostgreSQL 18 do staging, e instala o cliente Python S3.
5. Criar um serviço Railway separado, sem domínio público, com início `python3 backup.py`. Agendar `0 6 * * *` (06:00 UTC, 03:00 em São Paulo fora de horário de verão). O processo termina ao concluir, requisito dos [Cron Jobs Railway](https://docs.railway.com/cron-jobs).

Um erro de backup deve terminar com status não zero. Conferir a aba de execuções do cron e receber alerta operacional em caso de falha. O limite rígido de uso da Railway pode interromper o job; monitorar seu consumo junto com a aplicação e o banco.

## Primeira execução e restauração

Executar uma vez fora do agendamento e guardar a chave do objeto exibida pelo script. Para verificar download, SHA-256 e legibilidade do arquivo:

```text
python3 restore.py --key inspire3d/staging/AAAA/MM/DD/<arquivo>.dump
```

Para ensaiar restauração, criar **outro banco PostgreSQL vazio**, com nome terminado em `_restore_test`, e definir `RESTORE_DATABASE_URL` apenas nessa execução. O script rejeita banco com tabelas e destino que seja o mesmo banco indicado em `DATABASE_URL`. A restauração ocorre em uma transação única:

```text
RESTORE_DATABASE_URL=<url-do-banco-vazio> python3 restore.py --key inspire3d/staging/AAAA/MM/DD/<arquivo>.dump
```

Depois, comparar contagens de produtos, vendas e demais tabelas com a origem. O script não apaga o banco de ensaio. Repetir a restauração periodicamente e após mudanças de esquema.

O bucket não recebe uma política de exclusão automática nesta etapa. Definir retenção e testar a restauração antes de ativar uma regra de expiração. Os backups incluem dados pessoais e devem permanecer privados.

Referências: [PostgreSQL 18: pg_dump](https://www.postgresql.org/docs/18/app-pgdump.html) e [pg_restore](https://www.postgresql.org/docs/18/app-pgrestore.html), [Railway Cron Jobs](https://docs.railway.com/cron-jobs), [Railway Dockerfile customizado](https://docs.railway.com/builds/dockerfiles), [Cloudflare R2 S3 e token limitado ao bucket](https://developers.cloudflare.com/r2/get-started/s3/).
