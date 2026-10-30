# Leguelé Beer

E-commerce mobile-first da cervejaria artesanal Leguelé Beer (projeto de portfólio). Monorepo com Next.js (`apps/web`) e NestJS (`apps/api`).

## Requisitos

- Node na versão do `.nvmrc` (22.23.4)
- pnpm na versão do campo `packageManager` do `package.json` (via Corepack ou `npm i -g pnpm`)

## Comandos

Todos na raiz do repositório.

| Comando | O que faz |
| --- | --- |
| `pnpm install` | Instala as dependências |
| `pnpm dev` | Sobe o site (http://localhost:3000) e a API (http://localhost:3333/health) |
| `pnpm test` | Testes unitários e de componente (Vitest) |
| `pnpm test:e2e` | Testes E2E (Playwright); sobe web e API sozinho |
| `pnpm lint` | ESLint e regra de camadas (dependency-cruiser) |
| `pnpm format:check` | Verifica a formatação (Prettier); `pnpm format` corrige |
| `pnpm typecheck` | Checagem de tipos |
| `pnpm build` | Build de todos os pacotes |
| `pnpm db:start` / `pnpm db:stop` | Sobe e para o Supabase local (precisa de Docker) |
| `pnpm db:migrate` / `pnpm db:reset` / `pnpm db:seed` | Migrations, recriação do banco e seed |
| `pnpm db:check` | Falha se o schema do Prisma não tiver migration |

Banco local, variáveis (`apps/api/.env`) e como criar módulos: `apps/api/README.md`.

Na primeira vez, rode `pnpm --filter @leguele/web exec playwright install chromium` para o E2E.

Convenções do projeto e documentação: `CLAUDE.md` e `docs/`.
