---
status: rascunho
modulo: base-tecnica
card-notion: https://app.notion.com/p/3fd490a7ac7d81169892e34e0e6cc3ef
prioridade: P0
criado: 2026-10-29
atualizado: 2026-10-29
issues:
  - "#10 LB-1"
tags:
  - feature
---

# Base do monorepo

> [!info] Origem
> Derivada do card do Notion **LB-1** (#10), do Complemento do [[ADR-005-monorepo-camadas]] e dos [[ADR-001-stack]] e [[ADR-002-hospedagem-api]], com o escopo definido pelo Orchestrator em 2026-10-29. A spec cobre o esqueleto técnico: cada ferramenta entra configurada e com uma verificação mínima. O que é próprio dos cards LB-2, LB-5, LB-6 e LB-7 continua neles (ver "Tickets propostos").

## História de usuário

- **Como** pessoa que desenvolve a Leguelé Beer (o Diego ou um agente da banda)
- **Quero** um monorepo com front, API, pacotes compartilhados, testes, lint e CI prontos
- **Para** começar cada feature pelo teste, com a regra de camadas verificada desde o primeiro commit

## Cenários

```gherkin
# language: pt
Funcionalidade: Base do monorepo

  Cenário: Subir o site e a API com um comando
    Dado um clone novo do repositório com a versão do Node do arquivo .nvmrc
    E "pnpm install" concluído com o lockfile congelado
    Quando executo "pnpm dev" na raiz
    Então http://localhost:3000 responde com status 200 e mostra o título da página inicial
    E GET http://localhost:3333/health responde com status 200 e o corpo {"status":"ok"}

  Esquema do Cenário: Tipagem estrita acusa acesso a índice possivelmente indefinido
    Dado um arquivo do pacote <pacote> que usa o resultado de um acesso por índice sem checar se ele existe
    Quando executo "pnpm typecheck" na raiz
    Então o comando termina com código diferente de 0
    E a saída aponta o arquivo e a linha do acesso

    Exemplos:
      | pacote          |
      | apps/web        |
      | apps/api        |
      | packages/shared |

  Esquema do Cenário: A camada domain não importa framework
    Dado um arquivo na pasta domain de um módulo de apps/api que importa <dependência>
    Quando executo "pnpm lint" na raiz
    Então o comando termina com código diferente de 0
    E a saída do dependency-cruiser aponta o arquivo e a regra violada

    Exemplos:
      | dependência    |
      | @nestjs/common |
      | @prisma/client |

  Cenário: Build repetido vem do cache do Turborepo
    Dado que "pnpm build" terminou com sucesso
    E nenhum arquivo mudou desde então
    Quando executo "pnpm build" de novo
    Então todas as tarefas de build aparecem como cache hit na saída do Turborepo

  Esquema do Cenário: Comandos de qualidade passam na base recém-criada
    Dado o monorepo recém-criado, sem alterações
    Quando executo <comando> na raiz
    Então o comando termina com código 0

    Exemplos:
      | comando             |
      | "pnpm lint"         |
      | "pnpm format:check" |
      | "pnpm typecheck"    |
      | "pnpm test"         |
      | "pnpm build"        |
      | "pnpm test:e2e"     |

  Esquema do Cenário: O CI reprova um PR com problema
    Dado um PR para a main que contém <problema>
    Quando o workflow de CI roda no GitHub Actions
    Então o check do CI fica vermelho
    E a primeira etapa que falha é <etapa>

    Exemplos:
      | problema                                      | etapa        |
      | um erro de lint                               | lint         |
      | um arquivo fora da formatação do Prettier     | format:check |
      | um import de framework na camada domain       | arquitetura  |
      | um erro de tipo                               | typecheck    |
      | um teste falhando na API                      | testes       |
```

## Regras de negócio

Esta spec é técnica: as "regras" abaixo são os critérios da base, não regras de venda.

- **Workspaces:** pnpm workspaces (`pnpm-workspace.yaml` com `apps/*` e `packages/*`) e Turborepo (`turbo.json` com as tarefas `dev`, `build`, `lint`, `typecheck`, `test` e `test:e2e`; o `format:check` roda o Prettier direto na raiz). Lockfile único na raiz. Node pelo `.nvmrc` (22.23.4); versão do pnpm no campo `packageManager` do `package.json` da raiz.
- **Pacotes:** `apps/web`, `apps/api`, `packages/shared` e `packages/config`, com nomes de escopo próprio (`@leguele/web`, `@leguele/api`, `@leguele/shared`, `@leguele/config`) e dependências internas declaradas com `workspace:*`.
- **`apps/web`:** Next.js com App Router, pasta `src/`, alias `@/`, Tailwind e shadcn/ui com tema escuro, como pede o card. Sem tokens da marca (design system é outro card). Porta 3000.
- **Página inicial:** placeholder técnico com um único título (`<h1>`) "Leguelé Beer", como no plano de testes do card.
- **`apps/api`:** NestJS na porta 3333, com as pastas de camada do [[ADR-005-monorepo-camadas]] em `src/modules/<contexto>/` (`domain`, `application`, `infrastructure`, `presentation`). Endpoint `GET /health` responde 200 com `{"status":"ok"}`, sem acessar banco.
- **`packages/shared`:** só regras puras, sem framework, pronto para receber schemas Zod e tipos de contrato. No LB-1 tem uma única função pura de exemplo, `formatPriceBRL`, feita em TDD (o [[ADR-005-monorepo-camadas]] já prevê `formatBRL` em `shared`). Compilado com `tsc` (saída em `dist/`), e o `turbo.json` declara `dependsOn: ["^build"]`.
- **`packages/config`:** `tsconfig` base com `strict` e `noUncheckedIndexedAccess`, estendido por app (Next e Nest têm opções de módulo e decorators diferentes); configuração flat do ESLint com typescript-eslint; Prettier.
- **Testes:** no front, Vitest + Testing Library (unidade e componente) e Playwright (E2E); no back, Vitest (unidade) + Supertest (HTTP). `pnpm test` roda Vitest nos pacotes; `pnpm test:e2e` roda o Playwright, que sobe web e API sozinho.
- **Regra de camadas:** dependency-cruiser proíbe que arquivos em `apps/api/src/modules/*/domain/**` importem `@nestjs/*`, `@prisma/*` ou qualquer pacote fora de uma lista permitida (no LB-1, nenhum). Roda dentro de `pnpm lint` e como etapa própria no CI.
- **CI:** um workflow em `.github/workflows/ci.yml`, em PR para a `main` e em push na `main`, na ordem: instalar (lockfile congelado) → lint → `format:check` → arquitetura (dependency-cruiser) → typecheck → testes → build → E2E. `permissions: contents: read`, `concurrency` cancelando execuções antigas do mesmo PR, actions fixadas por SHA, cache do store do pnpm e do Turborepo com `actions/cache`. Tudo gratuito enquanto o repositório for público.
- **Documentação:** o README descreve como rodar os comandos, e as seções "Estrutura de pastas", "Comandos", "Convenções de teste" e "Variáveis de ambiente" do CLAUDE.md, hoje "PENDENTE", são preenchidas no PR.

## Seams de teste

> [!info] Proposta, ainda não combinada com o Diego
> Tirada do plano de testes do card LB-1 e do Complemento do ADR-005.

- **Página inicial:** teste de componente (Vitest + Testing Library) que renderiza a página e encontra o título.
- **Saúde da API:** teste HTTP (Vitest + Supertest) de `GET /health`, com o app Nest criado em memória.
- **Fumaça de ponta a ponta:** Playwright abre http://localhost:3000 em viewport de celular, vê o título e chama `GET /health`.
- **Regra de camadas:** teste (Vitest) que roda o dependency-cruiser sobre arquivos de exemplo com import proibido e espera a violação; evita depender de verificação manual.
- **Tipagem estrita, cache do Turborepo e CI vermelho:** verificação manual, registrada na descrição do PR (comando, saída e reversão do arquivo de prova). Os cenários do CI usam um PR de prova, fechado sem merge.

## Fora de escopo

- Configuração da Vercel e deploy (LB-8, #17), inclusive a questão do bundle webpack do [[ADR-002-hospedagem-api]], Remote Cache, Related Projects e produção escalonada.
- Banco e Prisma (LB-3, #12): sem schema, migrations ou Postgres. `GET /health` não consulta banco.
- Conteúdo e identidade da marca: tokens, cores, logo e textos.
- Itens próprios dos outros cards da base técnica:
  - LB-2 (#11): Husky, lint-staged, Commitlint, regras jsx-a11y e de ordem de imports, plugin do Tailwind no Prettier.
  - LB-5 (#14): MSW, cobertura v8, `renderWithProviders`, scripts `test:watch` e `test:coverage`.
  - LB-6 (#15): playwright-bdd, arquivos `.feature`, projetos "iPhone 13" e "Desktop Chrome", fixtures de login e de banco.
  - LB-7 (#16): Testcontainers, drift de migrations, `--filter` por mudança, artefatos de relatório, Dependabot, badge e proteção da branch `main`.
- Swagger e cliente da API tipado.

## Decisões relacionadas

- [[ADR-001-stack]]
- [[ADR-002-hospedagem-api]]
- [[ADR-005-monorepo-camadas]] (decisão e Complemento)
- [[mvp-corte]]

## Decisões tomadas sem consulta

Decisões técnicas, pequenas e fáceis de reverter, tomadas pela política de autonomia do Diego. Qualquer uma pode ser vetada.

- **Título da página inicial:** "Leguelé Beer", como no plano de testes do card LB-1 (decisão do Orchestrator, 2026-10-29: o texto já estava no card do Diego, sem decisão nova de marca).
- **Endpoint de saúde:** `GET /health` com `{"status":"ok"}` no lugar do `GET /` do plano de testes do card, como pediu a ordem.
- **Porta da API:** 3333, como no card.
- **Versão do pnpm:** campo `packageManager` (item "a confirmar" do Complemento do ADR-005).
- **`formatPriceBRL` em `packages/shared`:** mantida no LB-1 como função pura de exemplo, testada, que valida o build e os testes do pacote; o ADR-005 já cita `formatBRL` em `shared` (decisão do Orchestrator na revisão do #123, 2026-10-29).
- **`packages/shared` compilado com `tsc`:** funciona tanto com o Next quanto com o Nest sem `transpilePackages`; o LB-8 revê se o entrypoint da API na Vercel pedir outra coisa.
- **Vitest na API:** adotado pelo ADR-005 independentemente do padrão do `nest new`; a configuração Jest gerada, se vier, é trocada.
- **`pnpm test` sem E2E:** o Playwright fica em `pnpm test:e2e`, porque precisa do app no ar.
- **dependency-cruiser dentro de `pnpm lint`:** um comando local cobre ESLint e camadas; no CI vira etapa separada, para a falha apontar a causa.
- **Esqueleto dos cards LB-2, LB-5, LB-6 e LB-7 no LB-1:** a ordem pediu ESLint, Prettier, dependency-cruiser, Vitest, Testing Library, Playwright, Supertest e CI já no LB-1; a spec traz só o mínimo de cada um e deixa o resto nos cards de origem (planejamento, sem mudar o escopo de nenhum card).
- **Tailwind e shadcn/ui com tema escuro:** mantidos porque estão no escopo do card LB-1, embora a ordem não os cite.
- **Nomes dos pacotes:** escopo `@leguele/`.
- **Verificação manual:** tipagem estrita, cache do Turborepo e CI vermelho são provados no PR, não por teste automatizado.

## Tickets propostos

Sem issue nova: o LB-1 já é a #10. Depois do merge desta spec, reconciliar as issues (aprovação permanente do Diego para refletir specs mergeadas):

| Issue | Ajuste proposto | Motivo |
| --- | --- | --- |
| #10 (LB-1) | Descrição com link para `docs/02-features/base-monorepo.md` e os seis cenários como critérios. | A issue só aponta para o Notion. |
| #11 (LB-2) | Nota: ESLint (typescript-eslint) e Prettier básicos entregues no LB-1; ficam Husky, lint-staged, Commitlint, jsx-a11y, ordem de imports e plugin do Tailwind. O Commitlint segue o padrão do CLAUDE.md (emoji + tipo), não o `config-conventional` puro do card. | Evitar trabalho em dobro e alinhar ao padrão de commits adotado no #118. |
| #14 (LB-5) | Nota: Vitest e Testing Library entregues no LB-1; ficam MSW, cobertura, `renderWithProviders` e scripts extras. | Evitar trabalho em dobro. |
| #15 (LB-6) | Nota: Playwright com fumaça da home entregue no LB-1; ficam playwright-bdd, `.feature`, projetos de dispositivo e fixtures. | Evitar trabalho em dobro. |
| #16 (LB-7) | Nota: workflow com lint, formatação, arquitetura, typecheck, testes, build e E2E entregue no LB-1; ficam Testcontainers, drift de migrations, filtro por mudança, artefatos, Dependabot e proteção da `main`. | Evitar trabalho em dobro. A proteção da `main` mexe em permissões do repositório: decisão do Diego. |
