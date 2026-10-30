---
tags: [handoff]
atualizado: 2026-10-30
---

# Handoff

Sobrescrito pelo Orchestrator ao fim de cada ordem. A próxima conversa começa lendo este arquivo, a daily note mais recente em `docs/05-diario/` e [[licoes-aprendidas]].

## Última ordem: design da tela de login e usuário admin (30/10)

Encerrada. Resumo em [[2026-10-30]].

- Mergeados: #134 (perfil com papéis e admin de desenvolvimento, LB-28 primeira fatia), #135 (skills Web Design Guidelines e Playwright CLI), #136 (spec sem o slogan lateral) e #133 ([[boas-vindas]], LB-24; issue #39 fechada).

## Estado

- Site em `localhost:3000` (working copy principal, `main`, `next dev`). API em `localhost:3333` (worktree `../leguele-api` em `origin/main`, rodando `node dist/main.js`, sem watch: mudou código, refaz o build e reinicia).
- Supabase local no Docker (`supabase_*_leguele-beer`). Conta admin de desenvolvimento no banco local; credenciais só na nota "Acesso local (admin)" do canvas. O `.env` com a senha do seed se perdeu junto do worktree antigo; o `.env` do `../leguele-api` não tem `ADMIN_*`.
- Portais "Leguelé Desktop", "Leguelé iPhone" e "Leguelé Android" apontando para `/boas-vindas`; nota "Status da banda" atualizada pelo Orchestrator.
- Design base fora do repositório: `C:\Users\Arthur\Desktop\leguele\Imagens\figma\{telas,cervejas,logos}` e assets na raiz de `Imagens\` (barril, folhagens, copos etc.).
- O stash `obsidian` é do Diego: não aplicar nem descartar. O Obsidian altera `docs/.obsidian` sozinho: nunca adicionar esses arquivos.

## Próximo no roteiro (fase 1)

LB-25 ([[cadastro-login]]: telas `/entrar` e `/criar-conta`, que o botão "Entrar" já chama) para o admin conseguir entrar pelo site. Depois LB-28 completo ([[guards-api]]), LB-119 e LB-120, LB-19, LB-22 e LB-27, conforme [[roteiro-mvp]].

## Follow-ups

- Web: `meta theme-color` e favicon com o LB-16; testes extras de contraste, regex do lint de cor fixa e `role="group"` nos chips.
- API: pendências no `apps/api/README.md`; `DATABASE_URL` obrigatória no seed (nit da revisão do #134).
- CLAUDE.md: exemplo do `NO_UPDATE_NOTIFIER` também para PowerShell.

## Skills sugeridas

- Orchestrator: `maestri`, `handoff`.
- Spec: `grill-with-docs`, `domain-modeling`, `to-spec`, `to-tickets`.
- Front: `implement`, `tdd`, `web-design-guidelines`, `playwright-cli`.
- Back: `implement`, `tdd`, `diagnosing-bugs`.
- Reviewer: `review-spec`, `web-design-guidelines`, `playwright-cli`.
