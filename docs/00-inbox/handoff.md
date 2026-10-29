---
tags: [handoff]
atualizado: 2026-10-29
---

# Handoff

Sobrescrito pelo Orchestrator ao fim de cada ordem. A próxima conversa começa lendo este arquivo, a daily note mais recente em `docs/05-diario/` e [[licoes-aprendidas]].

## Última ordem: LB-1, criar o monorepo (29/10)

Encerrada. #123 mergeado (8205a95), issue #10 fechada. Spec: [[base-monorepo]]. Resumo em [[2026-10-29]].

## Estado

- `main` limpa. O stash `obsidian` (docs/.obsidian/) é do Diego: não aplicar nem descartar.
- Servidores de desenvolvimento rodando em segundo plano: site em `localhost:3000` (subido pelo Front) e API em `localhost:3333` (subida pelo Back). A API caiu uma vez na troca de branch depois do merge e foi religada. Os portais "Leguelé Desktop", "Leguelé iPhone" e "Leguelé Android" mostram o site.
- O Devops tem `gh pr merge` liberado. Merge segue o [[ADR-006-merge-por-agentes]].
- pnpm 12.16.1 foi instalado globalmente com `npm -g` no PC do Diego.

## Follow-ups técnicos (da revisão do #123)

- `apps/api/src/main.ts`: helmet e `enableShutdownHooks` antes do primeiro endpoint de negócio.
- `.dependency-cruiser.cjs`: barrar `domain` → `application`/`infrastructure`/`presentation` quando entrar o primeiro caso de uso.
- Partes de LB-2 (#11), LB-5 (#14), LB-6 (#15) e LB-7 (#16) que o LB-1 só esboçou estão em "Fora de escopo" de [[base-monorepo]]; reconciliar essas issues (aprovação permanente).

## Pendências com o Diego

1. Valores das faixas de teor alcoólico, IBU e preço (LB-36), em aberto em [[catalogo]].
2. Cadastro de papéis do Maestri desatualizado em relação a [[maestri-banda]], se ainda não foi atualizado pela interface.
3. Merge = deploy em produção ([[ADR-006-merge-por-agentes]], [[ADR-005-monorepo-camadas]]): decidir no LB-8.

## Próxima ordem provável

LB-2 a LB-8 do épico "Base técnica" (qualidade, banco/Prisma no LB-3, Vercel no LB-8) ou o catálogo (LB-4, LB-33 a LB-38). Ao citar um card, dizer o que ele é.

## Skills sugeridas

- Orchestrator: `maestri`, `handoff`.
- Spec: `grill-with-docs`, `domain-modeling`, `to-spec`, `to-tickets`.
- Front e Back: `implement`, `tdd`, `diagnosing-bugs`.
- Reviewer: `review-spec`.
