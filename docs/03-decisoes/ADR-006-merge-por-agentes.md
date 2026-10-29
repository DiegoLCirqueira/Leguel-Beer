---
status: aceito
data: 2026-10-28
tags:
  - adr
---

# ADR-006: Merge de PRs pelo Orchestrator e pelo Devops

> [!info] Status
> **Aceito.** Decisão do Diego em 2026-10-28.

## Contexto

Até aqui só o Diego fazia merge (CLAUDE.md, papel do Orchestrator em [[maestri-banda]] e `docs/agents/issue-tracker.md`). Isso trava a banda entre ordens: cada PR aprovado espera o Diego para seguir. O squash já é o padrão nos PRs mergeados até agora (#1, #112 a #116).

## Decisão

O Orchestrator decide o merge e o Devops executa, sem aprovação do Diego PR a PR, quando TODAS as condições valem:

1. O Reviewer deu veredito "Aprovar" para o commit atual do PR (commit novo depois da aprovação exige nova aprovação).
2. O CI está verde, quando houver CI configurado.
3. A mensagem do squash e a descrição do PR foram conferidas sem atribuição ao Claude.
4. A base é `main` e não há conflitos.

Método único: `gh pr merge <n> --squash --delete-branch`. Nenhum outro agente faz merge. Se alguma condição falhar, não há merge e o Orchestrator reporta ao Diego. O Diego pode fazer merge a qualquer momento.

## Alternativas consideradas

| Opção | Prós | Contras |
| --- | --- | --- |
| Só o Diego (regra anterior) | Controle total sobre a `main` | Cada PR espera o Diego; trava a banda entre ordens |
| Só o Devops, com ordem do Diego por PR | Um único executor; o Diego decide cada merge | Continua dependendo do Diego a cada PR |
| Merge automático só de PRs em `docs/` com Reviewer | Libera o fluxo mais frequente com risco baixo | Duas regras diferentes para manter; PRs de código ainda esperam o Diego |
| Orchestrator decide e Devops executa em qualquer PR aprovado (escolhida) | Fluxo sem espera; um executor e um método; vale para docs e código | Reviewer e CI viram o único portão antes da `main` |

## Consequências

- **Positivas:** fluxo sem espera entre ordens; um único executor e um único método (`--squash --delete-branch`); histórico linear na `main`.
- **Negativas:**
  - A aprovação do Reviewer e o CI viram o único portão antes da `main`, inclusive para código.
  - Quando a Vercel estiver ligada à `main` (LB-1, ver [[ADR-005-monorepo-camadas]]), merge na `main` = deploy em produção, o que conflita com "deploy só com confirmação do Diego". Ponto em aberto para o Diego decidir ao configurar a Vercel.
  - Enquanto não houver CI, o portão é só o Reviewer.
