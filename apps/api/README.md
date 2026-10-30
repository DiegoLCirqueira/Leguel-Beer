# API (`@leguele/api`)

NestJS na porta 3333. Swagger em http://localhost:3333/docs. Spec: `docs/02-features/api-base.md`.

## Banco local (Supabase CLI + Docker)

1. Docker rodando. Copie `apps/api/.env.example` para `apps/api/.env` e preencha (no local, `DATABASE_URL` e `DIRECT_URL` apontam para `postgresql://postgres:postgres@127.0.0.1:54322/postgres`; `WEB_ORIGIN` é `http://localhost:3000`).
2. Antes do primeiro `pnpm db:start`, gere a chave de assinatura do Supabase Auth local com `pnpm db:signing-key` (cria `supabase/signing_keys.json`, ES256, fora do git). Com ela o Auth assina os tokens com chave assimétrica e a API valida só com a chave pública do JWKS (`SUPABASE_URL`/auth/v1/.well-known/jwks.json); tokens HS256 são recusados. Se o Supabase já estava rodando, `pnpm db:stop` e `pnpm db:start` de novo.
3. `pnpm db:start` sobe o Supabase local (projeto `leguele-beer`; containers `supabase_*_leguele-beer`). `pnpm db:stop` para.
4. `pnpm db:migrate` cria e aplica migrations em desenvolvimento; `pnpm db:reset` recria o banco (migrations + seed); `pnpm db:seed` roda só o seed. O `db:reset` foi validado em 2026-10-29, com autorização do Diego (o Prisma bloqueia `migrate reset` rodado por agente sem consentimento explícito).
5. `pnpm db:check` aplica as migrations e falha se o schema tiver mudanças sem migration (roda no CI).

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

## Pendências conhecidas

Follow-ups da revisão do #129, fora do escopo desta entrega:

- **`trust proxy`:** atrás do proxy da Vercel o limite de 100 req/min por IP enxerga o IP do proxy; configurar `trust proxy` junto do deploy (LB-8, #17).
- **Pool do Postgres:** definir `connectionTimeoutMillis` no `PrismaPg`, para o health não esperar indefinidamente com o banco fora.
- **Log e cabeçalhos:** o log de erro grava `originalUrl` (pode ter query string sensível); o `x-request-id` recebido só tem limite de tamanho, sem validação de formato; o CSP do helmet está desligado por causa do Swagger UI.
- **`db:diff` duplicado:** o script `db:diff` repete o que `db:check` faz; manter só um.
- **Dois mecanismos de env:** `process.loadEnvFile()` no `main.ts` e `dotenv` no `prisma.config.ts`; unificar (a validação de variáveis com Zod é o LB-9, #18).
- **Porta do health:** `DatabaseHealth` ainda está em `application/`; pelo ADR-005 as portas ficam em `domain/`. Mover junto do primeiro módulo de negócio.
