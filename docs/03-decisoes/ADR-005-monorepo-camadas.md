---
status: aceito
data: 2026-10-28
notion-adr: ADR-004
fonte-notion: https://app.notion.com/p/3fd490a7ac7d81489b71fd1051140e49
tags:
  - adr
---

# ADR-005: Monorepo com arquitetura em camadas

> [!info] Status
> **Aceito.** Migrado do ADR-004 do Notion ("Organizar em monorepo com arquitetura em camadas"). Ver "Ajustes na migração".

## Contexto

Com front e back separados ([[ADR-001-stack]]), validações e tipos precisam ser os mesmos dos dois lados. O recrutador deve encontrar tudo num só repositório.

## Decisão

Um único repositório com **Turborepo e pnpm**:

```txt
apps/
  web/      Next.js (front)
  api/      NestJS (back)
    src/modules/<contexto>/
      domain/          entidades, value objects, regras puras, portas
      application/     casos de uso
      infrastructure/  repositórios Prisma, adaptadores externos
      presentation/    controllers e DTOs
packages/
  shared/   schemas Zod, tipos de contrato, formatBRL, regras puras reutilizáveis
  config/   eslint, tsconfig, prettier
```

- **Regra de dependência:** `domain` não importa nada de framework, e isso é verificado no CI com dependency-cruiser.
- **Cliente da API tipado**, gerado a partir do OpenAPI (Swagger) ou dos schemas compartilhados.
- **Deploy:** `apps/web` e `apps/api` viram dois projetos na Vercel a partir do mesmo repositório. A API roda como função serverless, conforme o [[ADR-002-hospedagem-api]].

## Alternativas consideradas

| Opção | Prós | Contras |
| --- | --- | --- |
| **Monorepo Turborepo + pnpm** (escolhida) | Tipos e schemas compartilhados, um CI, cache de build, um link no portfólio | Configuração inicial maior |
| Dois repositórios | Independência total | Tipos duplicados ou pacote publicado, dois CIs |
| Nx | Muito completo | Mais complexo do que o projeto precisa |

## Consequências

- **Positivas:** uma única fonte de verdade para validação, testes de domínio rápidos, arquitetura fácil de explicar.
- **Negativas:** curva inicial de configuração do monorepo e dos dois deploys.

## Pós-MVP

- **Tempo real** (status do pedido ao vivo, card LB-69) fica para o Pós-MVP.
- No MVP não há processos de longa duração ([[ADR-002-hospedagem-api]]): a camada `presentation` só tem controllers e DTOs HTTP.
- Ao retomar o tempo real, rever este ADR e o ADR-002 juntos.

## Ajustes na migração

| No Notion | Aqui | Por quê |
| --- | --- | --- |
| `presentation/` com "controllers, DTOs, **gateways WebSocket**" | `presentation/` com controllers e DTOs; tempo real em "Pós-MVP" | Decisão de hospedagem do MVP sem processos de longa duração ([[ADR-002-hospedagem-api]]); LB-69 é Pós-MVP no [[mvp-corte]] |
| Consequência "curva dos deploys separados" | Deploy explícito: dois projetos Vercel, API serverless | Alinhado ao ADR-002 |
| Numerado como ADR-004 | ADR-005 | O ADR-002 do repositório é o de hospedagem |

## Complemento

> [!info] Escopo
> Complemento de 2026-10-28 para o card LB-1 (issue #10). **Não altera a decisão original nem o status** deste ADR. Cada item abaixo detalha o que o ADR deixou em aberto e não contradiz os ADRs aceitos ([[ADR-001-stack]], [[ADR-002-hospedagem-api]], [[ADR-003-pwa-mobile-first]]); por isso não foi criado ADR novo. O que ainda não foi confirmado numa fonte oficial está marcado como **a confirmar**; versões de ferramentas não foram fixadas aqui e ficam para o LB-1. Fontes no fim desta seção.

### Revisão contra os ADRs 001, 002 e 003 e contra "tudo gratuito"

| Ponto | Resultado |
| --- | --- |
| [[ADR-001-stack]]: Next.js + NestJS + Prisma, Supabase só para banco, auth e arquivos | Consistente. Prisma e o schema ficam só em `apps/api`; o front nunca fala com o banco |
| [[ADR-002-hospedagem-api]]: API como função serverless no plano Hobby da Vercel | Consistente. A Vercel hoje trata o NestJS como "um único Vercel Function", com Fluid compute por padrão e detecção do entrypoint (`src/main.ts` entre os nomes aceitos). O ADR-002 recomenda bundle com webpack e cache da instância do app; a página atual da Vercel não menciona isso. **A confirmar** no LB-1 se o bundle ainda é necessário (limite de 250 MB do bundle Node). Dispensar o bundle webpack do ADR-002 muda uma decisão já aceita: se o LB-1 confirmar que ele não é necessário, a mudança vai ao Diego antes de valer (política de autonomia, item 3) |
| [[ADR-003-pwa-mobile-first]]: Next.js mobile-first, PWA no Pós-MVP | Consistente. Nada deste complemento depende de PWA |
| Gratuito: Vercel Hobby | Dois projetos ligados ao mesmo repositório cabem no limite do Hobby (25 projetos por repositório; 100 deploys por dia; 45 min de build por deploy). O Hobby é só para uso pessoal e não comercial, como já registrado no ADR-002 |
| Gratuito: GitHub Actions | Runners padrão do GitHub em repositório **público** não consomem a franquia (o repositório é público hoje). Em repositório privado, o GitHub Free inclui US$ 12 de uso de computação por mês. Se o repositório virar privado, rever o CI |
| Gratuito: Turborepo e pnpm | Ferramentas de código aberto, sem custo. O Vercel Remote Cache é opcional; seus limites no Hobby estão **a confirmar** |
| Item pendente deste ADR | A nota "Revisar e completar este ADR antes de iniciar o LB-1" continua no fim do ADR, reescrita: este complemento cobre ferramentas e deploy, e a nota passa a listar só o que falta resolver (os itens **a confirmar**). Quem fechar o LB-1 pode removê-la quando esses itens estiverem resolvidos |

### 1. Gerenciador de pacotes e workspaces

| Escolha | Prós | Contras |
| --- | --- | --- |
| **pnpm workspaces** com `pnpm-workspace.yaml` listando `apps/*` e `packages/*`, mais **Turborepo** (`turbo.json` com `tasks`). Lockfile único na raiz, instalado com lockfile congelado no CI. Node fixado pelo `.nvmrc` que já existe no repositório (22.23.4); a versão do pnpm vai declarada no `package.json` da raiz (campo a confirmar entre `packageManager` e `devEngines`) | Já decidido neste ADR. A Vercel detecta pnpm pelo lockfile ou por `packageManager` e usa o grafo de dependências entre pacotes para pular builds não afetados. Pacotes internos com protocolo `workspace:*` | Exige nome único por pacote e dependências internas declaradas no `package.json`, senão o skip de builds da Vercel não enxerga o grafo. O Turborepo não aceita pacotes aninhados (`apps/**`) |
| npm ou yarn workspaces | Sem ferramenta extra | Instalação mais lenta e sem o armazenamento compartilhado do pnpm; já descartado neste ADR |

### 2. Organização de `apps/` e `packages/`

| Escolha | Prós | Contras |
| --- | --- | --- |
| **Manter a estrutura do ADR**: `apps/web`, `apps/api`, `packages/shared`, `packages/config`. Pacotes internos com escopo próprio (nomes únicos, por exemplo `@leguele/shared`; o escopo final fica para o LB-1). O schema e as migrations do Prisma ficam em `apps/api/prisma`. `packages/config` é um único pacote com ESLint, `tsconfig` base e Prettier | Casa com o ADR e com a convenção do Turborepo (aplicações em `apps/`, o resto em `packages/`). Um só pacote de config evita pastas aninhadas | Um pacote `config` com três ferramentas mistura responsabilidades; se crescer, dividir em pacotes separados |
| `packages/shared` **compilado** (`tsc`, saída em `dist/`) | O NestJS (bundle) e o Next consomem JavaScript pronto; sem depender de `transpilePackages` | Um passo de build a mais; o `turbo.json` precisa de `dependsOn: ["^build"]` |
| `packages/shared` **consumido como TypeScript**, sem build | Sem passo de build; menos arquivos | O Next precisa de `transpilePackages` e o bundle do NestJS precisa compilar o TypeScript do pacote. **A confirmar** no LB-1 qual das duas opções funciona com o entrypoint da API na Vercel |

Regra mantida: `packages/shared` só tem schemas Zod, tipos de contrato e regras puras; nada de framework. O `domain` da API continua sem importar framework, verificado no CI (ver item 5).

### 3. Ferramentas de teste

| Escolha | Prós | Contras |
| --- | --- | --- |
| **Back (`apps/api`): Vitest** para unidade de domínio e casos de uso, **mais Supertest** para HTTP/integração. Testes de `domain` e `application` rodam sem Nest e sem banco | A documentação do NestJS diz que projetos novos usam Vitest por padrão, que o Nest não impõe runner e que o Supertest simula as requisições HTTP. Um só runner nos dois apps; combina com o TDD em fatias da skill `/tdd` | Quem usar Jest por hábito precisa adaptar. **A confirmar** a versão e a geração do projeto no LB-1 |
| **Front (`apps/web`): Vitest + Testing Library** para unidade e componentes; **Playwright** para E2E | O guia do Next.js cobre Vitest, Jest, Playwright e Cypress, e recomenda E2E em vez de teste unitário para Server Components `async` | Dois níveis de teste no front; o E2E precisa de app e API no ar |
| Jest nos dois apps | Muito conhecido | Dois runners se o Nest já vier com Vitest; configuração de TypeScript mais pesada |
| Banco para testes de integração com Prisma | **Em aberto, a confirmar:** (a) Postgres como *service container* do GitHub Actions no CI; (b) Postgres local para desenvolvimento (Docker Compose, Supabase CLI local ou um projeto Supabase Free só para testes); (c) quantos projetos o plano Free do Supabase permite | O CI com *service container* é gratuito, mas o ambiente local ainda precisa de uma escolha; Docker só para desenvolvimento e testes não conflita com a restrição de "sem Docker em produção" |

### 4. Lint e formatação

| Escolha | Prós | Contras |
| --- | --- | --- |
| **ESLint (typescript-eslint, configuração flat) + Prettier**, configs em `packages/config`, tarefas `lint` e `format:check` no Turborepo. **dependency-cruiser** para a regra de dependência das camadas (já decidida acima) | Ecossistema que Next e Nest já usam; regras de import e de camadas no mesmo fluxo; casa com o `packages/config` do ADR | Duas ferramentas e mais configuração que uma só. Versões **a confirmar** no LB-1 |
| Biome (lint e formatação numa ferramenta) | Uma ferramenta, mais rápida | Cobertura de regras específicas de Next e Nest menor; mais uma peça fora do ecossistema comum. Não avaliado em fonte oficial neste complemento |
| Hook de pré-commit (por exemplo lint-staged) e de `commit-msg` para o padrão de commits | Falha cedo, antes do CI | Opcional e fora do LB-1; só vale se o padrão de commits do #118 for aceito. O CI continua sendo o portão real |

### 5. CI no GitHub Actions

| Escolha | Prós | Contras |
| --- | --- | --- |
| **Um workflow por PR**, na ordem do mais barato ao mais caro: instalar com lockfile congelado → lint e `format:check` → dependency-cruiser → typecheck → testes (front e back) → build. `permissions: contents: read` por padrão, `concurrency` cancelando execuções antigas do mesmo PR, actions fixadas em versão (de preferência SHA), Dependabot para actions e dependências, cache pelo lockfile. Tarefas disparadas via `turbo run` | Falha rápida; gratuito enquanto o repositório for público; segue o papel do Devops | Cada etapa extra aumenta o tempo do PR; fixar SHA exige manutenção (o Dependabot ajuda) |
| Cache do Turborepo com `actions/cache` | Sem conta nem token extra | Cache menos eficiente que o remoto |
| Cache remoto da Vercel (Remote Cache) | Compartilha o cache entre máquina local e CI | Exige token/OIDC no CI. Disponibilidade e limites no plano Hobby **a confirmar** |
| `prisma migrate deploy` em job separado, só no fluxo da `main`, com a URL direta do banco (`DIRECT_URL`) guardada como segredo de um *environment* do GitHub | Nunca roda em PR; nunca `migrate dev` em produção | Corrida entre a migration e o deploy da Vercel, que acontece no mesmo merge. Mitigação: migrations compatíveis com a versão anterior do código (adicionar antes de remover). **A confirmar** a ordem exata no LB-1 |

### 6. Dois projetos na Vercel (front e API)

| Escolha | Prós | Contras |
| --- | --- | --- |
| **Dois projetos importados do mesmo repositório**, com *Root Directory* `apps/web` e `apps/api`, integração Git da Vercel (preview por PR, produção na `main`) e *skip deployment* para pular o projeto não afetado. Comando de build via `turbo run build`; instalação filtrada (`pnpm install --filter web...`) opcional | Documentado pela Vercel para monorepos; o skip automático só vale para GitHub com workspaces pnpm, nomes únicos e dependências declaradas; builds pulados não ocupam vagas de build simultâneo | Dois conjuntos de variáveis para manter; cada projeto conta nos 100 deploys por dia do Hobby |
| **API:** NestJS com detecção automática do entrypoint (`src/main.ts`), `vercel.json` em `apps/api` com o cron diário do [[ADR-002-hospedagem-api]] e checagem do `CRON_SECRET` na rota chamada pelo cron | Sem configuração própria de função; mesmo provedor do front | Um único Vercel Function para o app inteiro; cold start (já aceito no ADR-002) |
| **Variáveis separadas para Preview e Produção** em cada projeto. `DATABASE_URL` (pooler, porta 6543) e `DIRECT_URL` só na API; a service role key do Supabase nunca em `NEXT_PUBLIC_*`. URL da API no front configurada por variável | Alinhado ao ADR-001 e ao ADR-002 | **Ponto em aberto (a confirmar):** em qual banco os previews rodam. Usar o banco de produção em preview é arriscado; outro projeto Supabase Free depende do limite de projetos do plano |
| Recurso *Related Projects* da Vercel para o preview do front achar o preview da API (até 3 projetos, mesmo repositório) | Evita URL fixa por ambiente | Disponibilidade no Hobby **a confirmar** |

### Ponto em aberto: merge na `main` = deploy em produção ([[ADR-006-merge-por-agentes]])

Com os dois projetos ligados à `main`, cada merge vira deploy em produção, e pelo [[ADR-006-merge-por-agentes]] o merge pode ser feito sem o Diego PR a PR. Isso conflita com "deploy só com confirmação do Diego" ([[maestri-banda]]). **Decisão do Diego, a tomar ao configurar a Vercel no card LB-8.** Opções levantadas:

| Opção | Prós | Contras |
| --- | --- | --- |
| Aceitar: merge = deploy | Simples; o Reviewer e o CI são o portão | Deploy sem confirmação humana; migrations e deploy no mesmo merge |
| *Staged production*: desligar a atribuição automática dos domínios de produção e **promover** manualmente o deploy no painel ou pela CLI | Merge e deploy separados; o Diego (ou quem ele indicar) promove; a promoção não refaz o build | Passo manual a cada release. Disponibilidade no plano Hobby **a confirmar** |
| `git.deploymentEnabled` com `false` para a `main` num projeto | Impede o deploy automático da `main` naquele projeto | Perde a integração Git para produção; o deploy passa a ser por CLI ou outro gatilho |

Se o Diego escolher uma das duas últimas, registrar a decisão como ADR novo (próximo número livre, hoje ADR-007) e ajustar a regra de merge do `CLAUDE.md`.

### Fontes (consultadas em 2026-10-28)

- Vercel, Monorepos: https://vercel.com/docs/monorepos (atualizada em 2026-08-11)
- Vercel, Deploying Turborepo: https://vercel.com/docs/monorepos/turborepo (atualizada em 2026-08-28)
- Vercel, NestJS: https://vercel.com/docs/frameworks/backend/nestjs (atualizada em 2026-08-10)
- Vercel, Git Configuration: https://vercel.com/docs/project-configuration/git-configuration (atualizada em 2026-08-25)
- Vercel, Promoting Deployments: https://vercel.com/docs/deployments/promoting-a-deployment (atualizada em 2026-06-26)
- Vercel, Limits: https://vercel.com/docs/limits (atualizada em 2026-09-16)
- Turborepo, Structuring a repository: https://turborepo.dev/docs/crafting-your-repository/structuring-a-repository
- pnpm, Workspaces: https://pnpm.io/workspaces
- GitHub Docs, About billing for GitHub Actions: https://docs.github.com/en/billing/managing-billing-for-your-products/about-billing-for-github-actions
- Next.js, Testing: https://nextjs.org/docs/app/guides/testing
- NestJS, Testing: https://docs.nestjs.com/fundamentals/testing

> [!todo] Resolver durante o card LB-1 (criar o monorepo) os itens **a confirmar** do Complemento:
> - campo da versão do pnpm (`packageManager` ou `devEngines`) e versões das ferramentas;
> - `packages/shared` compilado ou consumido como TypeScript com o entrypoint da API na Vercel;
> - se o bundle webpack do ADR-002 ainda é necessário (mudança de decisão aceita: vai ao Diego);
> - Vitest como padrão em projetos Nest novos;
> - Remote Cache, Related Projects e produção escalonada (staged production) no plano Hobby;
> - em qual banco rodam os previews e quantos projetos o Supabase Free permite;
> - banco local e de CI para os testes de integração;
> - ordem entre `prisma migrate deploy` e o deploy da Vercel no mesmo merge.
