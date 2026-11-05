---
tags: [handoff]
atualizado: 2026-11-04
---

# Handoff

Sobrescrito pelo Orchestrator ao fim de cada ordem. A próxima conversa começa lendo este arquivo, a daily note mais recente em `docs/05-diario/` e [[licoes-aprendidas]].

## Última ordem: processo de ADR (04/11)

Resumo em [[2026-11-04]].

- PR #199: critério de ADR (três condições juntas), ADR aceito imutável, template curto e linha "Candidatos a ADR" nas entregas de Front, Back e Devops; item 7 no checklist do Reviewer.
- PR dos ADRs retroativos: ADR-008 a ADR-014, daily note, este handoff e a lição do `maestri role edit`.
- Papéis em `.maestri/roles/` atualizados direto nos arquivos. Os terminais que já estavam abertos só leem o papel novo ao reiniciar.

## Estado

- Site em `localhost:3000` (working copy principal, `main`), preview em :3001 (worktree `leguele-rodape`), API em :3333 (worktree `../leguele-api`), Supabase local e Mailpit. Nada disso foi tocado nesta ordem.
- Worktrees desta ordem: `C:/lb-adrp` (`docs/processo-adr`) e `C:/lb-adrr` (`docs/adrs-retroativos`).
- O cadastro de papéis do Maestri (`maestri role show`) está defasado (textos de 27/10); os arquivos de `.maestri/roles/` são a fonte real. Não usar `maestri role edit` (lição de 04/11).
- O papel do Orchestrator ainda diz "Merge é sempre do Diego" na seção 5 (defasado em relação ao [[ADR-006-merge-por-agentes]]). Vale o CLAUDE.md; a edição do próprio papel fica com o Diego.
- O stash `obsidian` é do Diego: não aplicar nem descartar. Nunca adicionar `docs/.obsidian`.

## Próximo

1. Respostas do Diego às perguntas da ordem (status do ADR-004, proposta de ADR para o Complemento do ADR-005, cadastro de papéis do Maestri).
2. Pendências do handoff de 03/11: inspeção de `/entrar` e das telas de acesso sem rodapé; Front `fix/dica-zoom-200` (worktree `leguele-zoom`, só o red 5f189f7); PR do Devops com `@leguele/shared` em watch no `pnpm dev`; fase 2 do [[roteiro-mvp]] (bloco A e depois B).

## Follow-ups

- Sem E2E para 360x600 e zoom de 200% nas telas de acesso (conferido à mão pelo Front e pelo Reviewer).
- Minors do Reviewer no #195/#196: boas-vindas deveria usar o `pinIconRight`; a vitrine `/dev/tokens` não mostra o `pinIconRight`; falta E2E de ausência do rodapé nas 5 telas de acesso; o cenário "Rodapé com avisos e links" da loja ganha teste com o catálogo.
- Selo "issues" do Next em dev aparece em maioridade e recuperar senha: investigar.
- Estados após envio (sucesso/erro) de recuperar senha podem somar altura e rolar.
- Stash `wip-distribuir-nova-senha` no worktree `leguele-espaco` (não usado; pode ser descartado na limpeza).
- LB-8 (nuvem): checklist do [[roteiro-mvp]]. Web: `meta theme-color` e favicon com o LB-16.
- API: `DATABASE_URL` obrigatória no seed; código fixo no log de falha do `signOutOthers`.
- `src/lib/erro-de-redirect.ts` usa caminho interno do Next: conferir a cada upgrade.
- Limpeza dos worktrees e pastas em `C:\Users\Arthur\Desktop\leguele\` e `C:\lb-*` fica com o Diego (agora inclui `C:/lb-adrp` e `C:/lb-adrr` depois do merge).

## Skills sugeridas

- Orchestrator: `maestri`, `handoff`.
- Spec: `grill-with-docs`, `domain-modeling`, `to-spec`, `to-tickets`.
- Front: `implement`, `tdd`, `web-design-guidelines`, `playwright-cli`.
- Back: `implement`, `tdd`, `diagnosing-bugs`.
- Reviewer: `review-spec`, `web-design-guidelines`, `playwright-cli`.
