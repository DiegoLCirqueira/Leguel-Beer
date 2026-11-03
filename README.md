<div align="center">
  <h1>🍺 Leguelé Beer</h1>
  <p>E-commerce mobile-first da cervejaria artesanal Leguelé Beer</p>
</div>

> **Projeto de portfólio.** Os dados da empresa são fictícios e os pagamentos, quando existirem, rodarão em sandbox, sem cobrança real. A venda de bebida alcoólica é proibida para menores de 18 anos. O site ainda não está publicado: este repositório existe para mostrar o código.

---

## O que é

Uma loja online de cervejas artesanais para o celular. O cliente monta a compra numa "Geladeira" (o carrinho), finaliza o pedido e recebe em Maceió e região. O foco do projeto é a qualidade do código: back-end em camadas, testes primeiro (BDD/TDD) e decisões registradas em ADRs.

## Funcionalidades

**Já está na `main`:**

- **Maioridade:** pergunta de 18+ na entrada do site e tela de acesso negado para menores.
- **Boas-vindas:** tela inicial com entrada para quem tem conta, para quem quer criar uma e para convidados.
- **Conta:** cadastro e login com confirmação por e-mail, recuperação e troca de senha, e página da conta.
- **Papéis:** a API distingue cliente e administrador (`GET /me/role`) e protege rotas por papel.
- **Páginas legais:** termos de uso, privacidade e entregas.
- **Base visual:** tokens de cor e componentes reutilizáveis, mostrados na vitrine `/dev/tokens`.

**Planejado para o MVP** (ver `docs/01-produto/mvp-corte.md`):

- Catálogo com filtros e página de produto.
- Geladeira (carrinho), guardada no aparelho e na conta.
- Checkout com Pix e cartão, entrega por distância e e-mail de confirmação do pedido.
- Lista de pedidos do cliente e painel admin para cadastrar cervejas e ver pedidos.

**Depois do MVP:** Mix & Match (packs personalizados) e Clube do Leguelé (assinatura).

## Stack

Monorepo com pnpm e Turborepo:

| Pacote | Tecnologias |
|---|---|
| `apps/web` (site) | Next.js (App Router), React, TypeScript, Tailwind CSS, Lucide |
| `apps/api` (API) | NestJS, Prisma, PostgreSQL, Zod, Swagger, Helmet, rate limit |
| `packages/shared` | Código puro compartilhado entre site e API (Zod) |
| `packages/config` | ESLint, `tsconfig` base e Prettier |

**Dados e login:** Supabase só para PostgreSQL, autenticação e arquivos. A API valida o JWT e é a única a acessar o banco.
**Testes:** Vitest e Testing Library (site), Vitest e Supertest (API), Playwright com viewport de celular (E2E) e axe-core (acessibilidade).
**CI:** GitHub Actions a cada PR: lint, formatação, regra de camadas, tipos, migrations em sincronia, testes, build e E2E.
**Hospedagem prevista:** site e API na Vercel (a API como função serverless). Ver o ADR-002.

## Onde olhar no código

| Assunto | Caminho |
|---|---|
| Módulos da API em camadas (`domain`, `application`, `infrastructure`, `presentation`) | `apps/api/src/modules/` |
| Contas, perfil e papéis | `apps/api/src/modules/account/` |
| Modelo de dados, migrations e seed | `apps/api/prisma/` |
| Telas do site | `apps/web/src/app/` |
| Componentes reutilizáveis e tokens de cor | `apps/web/src/components/ui/` e `apps/web/src/app/globals.css` |
| Testes E2E | `apps/web/e2e/` |
| Regra "o domínio não importa framework" | `.dependency-cruiser.cjs` |
| Specs com cenários Gherkin | `docs/02-features/` |
| Decisões de arquitetura (ADRs) | `docs/03-decisoes/` |

Cada módulo da API separa as camadas, e o `dependency-cruiser` falha o `pnpm lint` se o domínio importar framework.

## Como rodar

Requisitos: Node na versão do `.nvmrc` e pnpm na versão do campo `packageManager` do `package.json` (via Corepack ou `npm i -g pnpm`). O banco local precisa de Docker.

Todos os comandos na raiz do repositório:

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
| `pnpm db:start` / `pnpm db:stop` | Sobe e para o Supabase local |
| `pnpm db:migrate` / `pnpm db:reset` / `pnpm db:seed` | Migrations, recriação do banco e seed |
| `pnpm db:check` | Falha se o schema do Prisma não tiver migration |

Na primeira vez, rode `pnpm --filter @leguele/web exec playwright install chromium` para o E2E.

Banco local, variáveis de ambiente (`apps/api/.env`, a partir do `.env.example`) e como criar módulos: `apps/api/README.md`.

## Documentação

A pasta `docs/` é um vault do Obsidian: visão do produto, corte do MVP, specs, ADRs e diário. Para começar, veja `docs/01-produto/visao.md` e os ADRs em `docs/03-decisoes/`.
## Licença

[MIT](LICENSE)

---

<div align="center">
  Feito por <a href="https://github.com/DiegoLCirqueira">Diego Lins Cirqueira</a>
</div>
