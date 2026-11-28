# API (`@leguele/api`)

NestJS na porta 3333. Swagger em http://localhost:3333/docs. Spec: `docs/02-features/api-base.md`.

## Banco local (Supabase CLI + Docker)

1. Docker rodando. Copie `apps/api/.env.example` para `apps/api/.env` e preencha (no local, `DATABASE_URL` e `DIRECT_URL` apontam para `postgresql://postgres:postgres@127.0.0.1:54322/postgres`; `WEB_ORIGIN` é `http://localhost:3000`).
2. Antes do primeiro `pnpm db:start`, gere a chave de assinatura do Supabase Auth local com `pnpm db:signing-key` (cria `supabase/signing_keys.json`, ES256, fora do git). Com ela o Auth assina os tokens com chave assimétrica e a API valida só com a chave pública do JWKS (`SUPABASE_URL`/auth/v1/.well-known/jwks.json); tokens HS256 são recusados. **Quem já roda o Supabase local precisa rodar `pnpm db:signing-key` e depois `pnpm db:stop` e `pnpm db:start`:** sem a chave nova o Auth continua assinando com o segredo compartilhado (HS256) e a API recusa todos os tokens com 401. O `SUPABASE_URL` do `apps/api/.env` também é obrigatório para a API subir e, no local, tem de ser exatamente `http://127.0.0.1:54321`, não `localhost`: o `iss` do token é comparado ao pé da letra com `SUPABASE_URL/auth/v1`, e com `localhost` a API responde 401 a tudo. O papel do `DATABASE_URL` também lê `auth.users` (só `id` e `email_confirmed_at`), para conferir o e-mail confirmado antes de conceder admin.
3. `pnpm db:start` sobe o Supabase local (projeto `leguele-beer`; containers `supabase_*_leguele-beer`). `pnpm db:stop` para.
4. `pnpm db:migrate` cria e aplica migrations em desenvolvimento; `pnpm db:reset` recria o banco (migrations + seed); `pnpm db:seed` roda só o seed. O `db:reset` foi validado em 2026-10-29, com autorização do Diego (o Prisma bloqueia `migrate reset` rodado por agente sem consentimento explícito).
5. `pnpm db:check` aplica as migrations e falha se o schema tiver mudanças sem migration (roda no CI).
6. **Deploy: as migrations vêm antes do código** ([[ADR-021-merge-vira-deploy-na-vercel]]). Em especial, `20261128130000_stock_movements` precisa estar aplicada antes do deploy que traz o "Confirmar pagamento" gravando em `stock_movements`: sem ela, toda confirmação falha com 500. A `20261128140000_stock_movements_backfill` preenche o "Saldo inicial" das cervejas existentes e é segura de rodar mais de uma vez. A `20261128150000_stock_movements_reconcile` completa quem já tinha movimentos parciais (abertura = estoque − soma dos movimentos). **Migre fora do horário de uso** e **confira a soma depois**: `SELECT b.slug, b.stock, COALESCE(SUM(m.quantity), 0) FROM beers b LEFT JOIN stock_movements m ON m.beer_id = b.id GROUP BY b.id HAVING b.stock <> COALESCE(SUM(m.quantity), 0);` deve voltar vazio. Se aparecer alguma cerveja, os movimentos somam **mais** que o estoque (a migration só completa diferença positiva e não inventa saída): descubra a causa (movimento duplicado ou estoque ajustado fora do sistema) e corrija com um ajuste de **Correção** na tela de Estoque, com motivo, para a soma voltar a bater; movimento nunca é apagado nem editado (é o histórico).

A Data API (PostgREST) do Supabase fica desligada (`[api] enabled = false` em `supabase/config.toml`); o banco é acessado só pela API.

### Banco de teste

Os testes de integração (`*.integration.test.ts`) usam o banco `leguele_test`, separado do de desenvolvimento, no mesmo Postgres. O `test/global-setup.ts` cria o banco se faltar e aplica as migrations. Ajuste com `TEST_DATABASE_URL`; o nome do banco deve terminar em `_test`. `pnpm test` roda só a unidade (sem Docker); `pnpm test:integration` roda a integração; `pnpm test:coverage` mede as linhas de `domain` e `application` (mínimo de 80%, o CI falha abaixo). O setup recusa um `TEST_DATABASE_URL` igual ao `DATABASE_URL` e, com o banco parado, falha dizendo como subi-lo (`pnpm db:start`). Entre os testes, `resetDatabase` (`src/common/testing/database.ts`) esvazia as tabelas; `createTestTokens` (`src/common/testing/tokens.ts`) gera os JWT de teste e o JWKS falso para os guards.

## Contrato de erro

Todo erro sai como `{ code, message, details? }`, com `message` em pt-BR e `code` em maiúsculas (`VALIDATION_ERROR`, `NOT_FOUND`, `UNAUTHORIZED`, `FORBIDDEN`, `TOO_MANY_REQUESTS`, `INTERNAL_ERROR`). Erros 500 nunca vazam a mensagem original; ela vai ao log em JSON com o `requestId`, o mesmo do cabeçalho `x-request-id` da resposta (a API usa o recebido ou gera um).

## Como criar um módulo

```
src/modules/<contexto>/
  domain/          entidades, value objects, regras puras e portas (interfaces), sem framework e sem outras camadas (ADR-005)
  application/     casos de uso; importa só domain, sem @nestjs, @prisma nem infra comum
  infrastructure/  adaptadores: repositórios Prisma, serviços externos
  presentation/    controllers e DTOs
  <contexto>.module.ts
```

Regras (verificadas no `pnpm lint` pelo dependency-cruiser):

- `domain` não importa framework nem outras camadas; `application` importa só `domain` e não importa `@nestjs`, `@prisma` nem `common/prisma|http|logging` (regras `domain-so-depende-de-domain`, `application-so-depende-de-domain` e `application-sem-framework`).
- `infrastructure` e `presentation` dependem de `application`/`domain`, nunca o contrário.
- O caso de uso recebe suas dependências pelo construtor, como portas declaradas em `domain`, e é testável sem Nest e sem banco, com repositórios em memória.
- Módulo de CRUD simples pode ter domínio fino, sem caso de uso artificial.

Exemplo (`modules/health`): `CheckHealth` (application) depende da porta `DatabaseHealth`; `PrismaDatabaseHealth` (infrastructure) a implementa; `HealthController` (presentation) a chama e devolve 503 quando o banco está fora; `health.module.ts` liga a porta (token `DATABASE_HEALTH`) à implementação.

Para validar a entrada, crie o DTO com `zodDto(schema)` (`common/validation/zod-dto.ts`) e use-o no `@Body()`; o pipe global devolve `VALIDATION_ERROR`. Marque controllers com `@ApiTags("<contexto>")` para o Swagger. Todo endpoint novo aparece no Swagger.

## Cron de expiração de pedidos

`GET /cron/expirar-pedidos` cancela os pedidos aguardando pagamento vencidos (até 100 por disparo; o resto sai no disparo seguinte). A rota é pública e só aceita `Authorization: Bearer <CRON_SECRET>`.

- `CRON_SECRET`: segredo aleatório de **no mínimo 32 caracteres** (a chave fica em `.env.example`, sem valor). Sem ele, a rota recusa tudo (401) e, em produção, a API avisa no boot; com menos de 32 caracteres, também avisa.
- A plataforma (Vercel) envia o segredo como Bearer no cron diário; o cadastro do cron e do segredo é do deploy (LB-8).
- A validade de 30 minutos vale pela checagem no uso; o cron só limpa o que sobrar ([[ADR-002-hospedagem-api]]).

## Entrada serverless (Vercel)

`api/index.ts` é a entrada da função: cria o aplicativo uma vez por instância (`createApp`, a mesma configuração do `main.ts`) e o reaproveita entre invocações; não chama `listen` nem lê `.env` ([[api-vercel]]).

- `GET /live` responde 200 sem tocar no banco (cold start e fumaça do deploy); `GET /health` continua o estado da API e do banco.
- Em produção (`NODE_ENV=production` ou qualquer `VERCEL_ENV`): o Swagger fica desligado (`/docs` e `/docs-json` dão 404) e a CSP do helmet fica ligada; `WEB_ORIGIN` é **obrigatório** (uma única origem `https`, sem curinga, caminho, barra final nem vírgula) e, se faltar ou for inválido, a função não sobe.
- O CORS libera só `WEB_ORIGIN` e nunca liga `Allow-Credentials` (a API recebe `Authorization: Bearer`, sem cookie).
- `trust proxy` de 1 salto (nunca `true`): o limite por IP conta o último valor do `X-Forwarded-For`, o que a Vercel acrescentou, e não o forjado pelo cliente.
- Bundle e `vercel.json` da função (rota e cron) são a fatia 2 de [[api-vercel]].

## Mapas do MVP (MAPS_ADAPTER)

O MVP não usa serviço externo de mapas ([[enderecos-entrega]], decisão de 26/11): a API tem um adaptador **local**, determinístico e sem rede, atrás das portas `Geocoder` e `RouteCalculator`.

- `MAPS_ADAPTER=local` liga o adaptador: as coordenadas são uma aproximação pelo bairro de Maceió (ou pelo centro da cidade, deslocado pelo CEP) e a distância é a linha reta até a origem; o raio e o frete seguem as configurações de entrega.
- Município de Alagoas fora da tabela (a tabela traz Maceió e as cidades vizinhas) usa o ponto central do estado: a linha reta passa bem de 25 km e o endereço é salvo como **"Fora da área"**. Só outra UF não é achada (`ADDRESS_NOT_LOCATED`).
- Ausente ou com outro valor, a API fica **não configurada** (fail-closed): salvar endereço e cotar frete respondem 503 `MAPS_UNAVAILABLE`.
- Para o ambiente local, defina `MAPS_ADAPTER=local` no `apps/api/.env` e reinicie a API (o watch não relê o `.env`); o Playwright já passa a variável à API que ele sobe.
- O adaptador real (Geoapify ou outro, com conta e chave) é pós-MVP.

## Limite de requisições (THROTTLE_LIMIT)

O limite global é de 100 requisições por IP por minuto, contado em memória. Quem roda vários E2E ou agentes no mesmo `127.0.0.1` pode receber `429` (o site mostra erro). Para o ambiente local, defina `THROTTLE_LIMIT` no `apps/api/.env` (ex.: `10000`) e reinicie a API (o watch não relê o `.env`); o Playwright já passa `THROTTLE_LIMIT=10000` à API que ele sobe fora do CI.

- Opcional; ausente ou inválido (vazio, zero, negativo, decimal, texto) vale 100. Nunca é ilimitado.
- Produção é `NODE_ENV=production` ou qualquer `VERCEL_ENV` (preview inclusive, porque o endereço é público): lá o valor é limitado a 1000. Só o local e o E2E (sem `VERCEL_ENV`) aceitam valor maior. Não defina um valor alto no deploy.

## Pendências conhecidas

Follow-ups da revisão do #129, fora do escopo desta entrega:

- **`trust proxy`:** atrás do proxy da Vercel o limite de 100 req/min por IP enxerga o IP do proxy; configurar `trust proxy` junto do deploy (LB-8, #17).
- **Pool do Postgres:** definir `connectionTimeoutMillis` no `PrismaPg`, para o health não esperar indefinidamente com o banco fora.
- **Log e cabeçalhos:** o log de erro grava `originalUrl` (pode ter query string sensível); o `x-request-id` recebido só tem limite de tamanho, sem validação de formato; o CSP do helmet está desligado por causa do Swagger UI.
- **`db:diff` duplicado:** o script `db:diff` repete o que `db:check` faz; manter só um.
- **Dois mecanismos de env:** `process.loadEnvFile()` no `main.ts` e `dotenv` no `prisma.config.ts`; unificar (a validação de variáveis com Zod é o LB-9, #18).
- **Porta do health:** `DatabaseHealth` ainda está em `application/`; pelo ADR-005 as portas ficam em `domain/`. Mover junto do primeiro módulo de negócio.
