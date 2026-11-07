---
status: aceito
data: 2026-10-29
tags:
  - adr
---

# ADR-015: Ferramentas do monorepo

> [!info] Status
> **Aceito.** Registro retroativo (2026-11-07), por decisão do Diego (resposta "2: A"): o Complemento do [[ADR-005-monorepo-camadas]] deveria ter sido um ADR próprio. As escolhas foram propostas no Complemento de 2026-10-28 e implementadas no LB-1 ([[base-monorepo]], PR #123, mergeado em 2026-10-29). O ADR-005 não foi editado e continua com o Complemento; este ADR registra o que o código de fato faz.

## Contexto

O [[ADR-005-monorepo-camadas]] fixou a estrutura (`apps/web`, `apps/api`, `packages/shared`, `packages/config`) e deixou as ferramentas em aberto. O LB-1 tinha de escolhê-las e deixar o CI como portão. O Complemento listava itens "a confirmar".

## Decisão

- **pnpm workspaces + Turborepo já vêm do [[ADR-005-monorepo-camadas]]** (`pnpm-workspace.yaml` lista `apps/*` e `packages/*`; `turbo.json` define as tarefas). O que este ADR fixa são as versões: a do pnpm em `packageManager` (`pnpm@12.16.1`, `package.json`) e a do Node em `.nvmrc` (22.23.4) e em `engines`; e o `dependsOn: ["^build"]` das tarefas do `turbo.json` (ver o item seguinte).
- **`@leguele/shared` é compilado com `tsc`** (`packages/shared/package.json`, script `build`, saída em `dist/`; `main`, `types` e `exports` apontam para `dist/`). Por isso `build`, `lint`, `typecheck` e `test` do `turbo.json` têm `dependsOn: ["^build"]`: o Next e o NestJS consomem JavaScript pronto, sem `transpilePackages`.
- **Vitest em todos os pacotes**, em vez de Jest (`apps/api`, `apps/web`, `packages/shared`). Na API entram Supertest para HTTP; no web, Testing Library para componentes e Playwright (`@playwright/test`) para E2E.
- **dependency-cruiser faz cumprir as camadas e a pureza do `shared`** (`.dependency-cruiser.cjs`, `pnpm arch`, etapa do CI): `domain` e `application` não importam framework, `domain` não importa as outras camadas, e `packages/shared/src` não importa Node nem framework.
- **Banco dos testes de integração:** ver [[ADR-007-banco-de-teste]].

## Por quê

- **Compilar o `shared`** troca um passo de build (e o cuidado de recompilar o `dist/`, que já causou erro no ambiente local duas vezes; ver [[licoes-aprendidas]]) por não depender de `transpilePackages` nem de o bundle da API compilar TypeScript de outro pacote.
- **Vitest único** evita dois runners e dois formatos de configuração para o mesmo TypeScript.
- **dependency-cruiser** transforma a regra de camadas do ADR-005 em falha de CI; só o código revisado não a sustentaria.

## Em aberto (LB-8)

Dois projetos na Vercel, o bundle com webpack do [[ADR-002-hospedagem-api]], o banco dos previews e "merge = deploy" ([[ADR-006-merge-por-agentes]]) continuam abertos e serão decididos no LB-8.
