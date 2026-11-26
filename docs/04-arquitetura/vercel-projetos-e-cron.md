# Vercel: projetos e cron diário (LB-8, parcial)

Registro do que foi criado na conta Vercel (plano Hobby, gratuito) em 26/11/2026, por ordem do Diego. Sem deploy em produção, sem ligação Vercel↔GitHub e sem projeto Supabase de produção. Decisão de hospedagem: [[ADR-002-hospedagem-api]].

## Feito
- Projetos criados na conta já vinculada: `leguele-web` e `leguele-api` (vazios, sem deploy).
- `CRON_SECRET` cadastrado só no projeto `leguele-api`, ambiente **Production**, como variável **sensível** (valor aleatório de 64 caracteres hexadecimais, gerado na hora; não aparece em nenhum arquivo, log, PR ou nota, e a Vercel não o mostra depois).
- Cron diário declarado em `apps/api/vercel.json`: `GET /cron/expirar-pedidos` às 07:00 UTC (Hobby: no máximo 1 vez por dia, precisão de ±59 min). A Vercel envia `Authorization: Bearer <CRON_SECRET>` sozinha, e o `CronController` ([[cron.controller]] no código) compara com o segredo em tempo constante.

## Ainda NÃO feito (depende do Diego)
1. **Vercel↔GitHub:** conectar os dois projetos ao repositório (acesso dele). Ao conectar, definir o **Root Directory** (`apps/web` e `apps/api`) e o comando de build de cada um.
2. **Deploy da API:** a API ainda não tem a entrada serverless pedida no ADR-002 (bootstrap NestJS reaproveitado entre invocações, bundle webpack). O `vercel.json` só passa a valer no primeiro deploy.
3. **Supabase de produção:** criar o projeto (conta/custo) e então cadastrar `DATABASE_URL` (pooler, porta 6543, `pgbouncer=true`), `DIRECT_URL` e as chaves do site na Vercel, sem `NEXT_PUBLIC_*` para a service role.
4. **`trust proxy`** e demais variáveis (`WEB_ORIGIN`, `SITE_URL`, `API_URL`) junto do primeiro deploy.

## Como conferir ou girar o segredo
- Ver que existe (sem mostrar o valor): `vercel env ls production` com o projeto `leguele-api` vinculado.
- Girar: `printf %s "$(openssl rand -hex 32)" | vercel env add CRON_SECRET production --sensitive --force` e fazer novo deploy; nunca colar o valor em chat, log, commit, PR ou nota.

## Rollback
`vercel project rm leguele-web` e `vercel project rm leguele-api` (os projetos estão vazios), e reverter este PR (remove `apps/api/vercel.json` e esta nota).
