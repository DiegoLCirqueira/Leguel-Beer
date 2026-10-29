---
tags: [handoff]
atualizado: 2026-10-29
---

# Handoff

Sobrescrito pelo Orchestrator ao fim de cada ordem. A próxima conversa começa lendo este arquivo, a daily note mais recente em `docs/05-diario/` e [[licoes-aprendidas]].

## Última ordem: spec do catálogo e complemento do ADR-005 (28–29/10)

Encerrada. O resumo está em [[2026-10-28]] e [[2026-10-29]].

- Mergeados: #116, #117 ([[ADR-006-merge-por-agentes]]), #118 (commits emoji + tipo), #119 (política de autonomia), #120 ([[catalogo]], [[destaques-home]], [[adicionar-do-card]], [[GLOSSARY]], [[mapa-do-projeto]], Complemento do [[ADR-005-monorepo-camadas]]) e #121 (memória da banda).
- Issues #13, #20, #22, #23, #24, #25 e #27 reconciliadas com as specs.

## Estado

- `main` limpa. O stash `obsidian` (docs/.obsidian/) é do Diego: não aplicar nem descartar.
- Backup local, não versionado, dos corpos das issues antes da reconciliação: `docs/00-inbox/backup-issues-2026-10-29.md`.
- Portais no canvas do Maestri ("Leguelé Desktop", "Leguelé iPhone", "Leguelé Android") apontam para `http://localhost:3000`. Recarregar quando o front subir. Sem Android SDK, o Android é só viewport.
- O Devops tem `gh pr merge` liberado pelo Diego. O merge segue o ADR-006.

## Pendências com o Diego

1. Registrar o "sempre sim" (aprovação permanente para ajustes de issue que só refletem decisões dele) no primeiro item de "Prioridades" do CLAUDE.md e em `docs/agents/issue-tracker.md:10`. O classificador negou a edição ao Devops; o Diego faz ou autoriza no terminal do Devops.
2. Valores das faixas de teor alcoólico, IBU e preço (LB-36), em aberto em [[catalogo]].
3. Cadastro de papéis do Maestri (`maestri role show`) desatualizado em relação a [[maestri-banda]]. O Diego atualiza pela interface.
4. Ponto em aberto do ADR-006 e do ADR-005: com a Vercel ligada à `main`, merge = deploy em produção (decidir no LB-8).

## Próxima ordem provável

LB-1 (criar o monorepo) a partir do Complemento do [[ADR-005-monorepo-camadas]], com TDD/BDD, resolvendo os itens "a confirmar". Quando o dev server do front subir, recarregar os três portais.

## Skills sugeridas

- Orchestrator: `maestri`, `handoff`.
- Spec: `grill-with-docs`, `domain-modeling`, `to-spec`, `to-tickets`.
- Front e Back: `implement`, `tdd`, `diagnosing-bugs`.
- Reviewer: `review-spec`.
