---
tags: [handoff]
atualizado: 2026-11-03
---

# Handoff

Sobrescrito pelo Orchestrator ao fim de cada ordem. A próxima conversa começa lendo este arquivo, a daily note mais recente em `docs/05-diario/` e [[licoes-aprendidas]].

## Última ordem: inspeção das telas de acesso (02/11 a 03/11)

Encerrada. Resumo em [[2026-11-02]] e [[2026-11-03]].

- PRs: #186 (exceção da senha do admin na nota do canvas), #187/#188 (1ª rodada), #189/#190 (2ª rodada), #191 (revisão de UI/UX do Front), #192/#193 (3ª rodada: sem rolagem, barra invisível, aceite visível) e o PR de fechamento (decisões 1-C e 2-B).
- Aprovadas pelo Diego: maioridade, acesso negado, boas-vindas, entrar, recuperar senha, nova senha, confirmação, termos e privacidade.
- Decisões do Diego: `/criar-conta` mantém o logo e rola ("1- c"); área de toque da boas-vindas fica como está ("2- B").

## Estado

- Site em `localhost:3000` (working copy principal, `main`, `next dev`). Sem preview de branch no ar.
- API em `localhost:3333` (worktree `../leguele-api`, `node dist/main.js`, sem watch). Para atualizar: `pnpm --filter @leguele/shared build`, build da API, conferir e só então reiniciar.
- Supabase local no Docker, e-mails no Mailpit (`127.0.0.1:54324`). Conta admin: credenciais só na nota "Acesso local (admin)" do canvas.
- Portais "Leguelé iPhone 390" e "Leguelé Android". O Diego remove os portais "Inspeção: ..." depois de ver.
- Para abrir `/nova-senha` na inspeção: pedir link em `/recuperar-senha` com a conta admin e abrir no portal o link `token_hash=...&type=recovery` do Mailpit.
- O stash `obsidian` é do Diego: não aplicar nem descartar. Nunca adicionar `docs/.obsidian`.
- Merge com worktree na branch: `git switch --detach` no worktree antes do `gh pr merge --squash --delete-branch` (lição de 02/11).

## Próximo

1. Diego inspeciona `/criar-conta` final (link no fim, aceite verde, rolagem sem barra).
2. Front: `fix/dica-zoom-200` (worktree `leguele-zoom`, só o red 5f189f7) e o Voltar que cobre o logo no zoom de 200%.
3. PR do Devops: `@leguele/shared` em watch no `pnpm dev`.
4. Fase 2 do [[roteiro-mvp]]: bloco A (base técnica) e depois B (catálogo).

## Follow-ups

- Sem E2E para 360x600 e zoom de 200% nas telas de acesso (conferido à mão pelo Front e pelo Reviewer).
- Selo "issues" do Next em dev aparece em maioridade e recuperar senha: investigar.
- Estados após envio (sucesso/erro) de recuperar senha podem somar altura e rolar; o critério cobre o estado inicial.
- Stash `wip-distribuir-nova-senha` no worktree `leguele-espaco` (não usado; pode ser descartado na limpeza).
- LB-8 (nuvem): checklist do [[roteiro-mvp]]. Web: `meta theme-color` e favicon com o LB-16.
- API: `DATABASE_URL` obrigatória no seed; código fixo no log de falha do `signOutOthers`.
- `src/lib/erro-de-redirect.ts` usa caminho interno do Next: conferir a cada upgrade.
- Limpeza dos worktrees e pastas em `C:\Users\Arthur\Desktop\leguele\` e `C:\lb-*` fica com o Diego (inclui `leguele-espaco2`, meio apagado, e `leguele-login0b`).

## Skills sugeridas

- Orchestrator: `maestri`, `handoff`.
- Spec: `grill-with-docs`, `domain-modeling`, `to-spec`, `to-tickets`.
- Front: `implement`, `tdd`, `web-design-guidelines`, `playwright-cli`.
- Back: `implement`, `tdd`, `diagnosing-bugs`.
- Reviewer: `review-spec`, `web-design-guidelines`, `playwright-cli`.
