---
tags: [handoff]
atualizado: 2026-11-01
---

# Handoff

Sobrescrito pelo Orchestrator ao fim de cada ordem. A próxima conversa começa lendo este arquivo, a daily note mais recente em `docs/05-diario/` e [[licoes-aprendidas]].

## Última ordem: fase 1 do roteiro (acesso) e ajustes de tela (30/10 a 01/11)

Encerrada. Resumo em [[2026-10-30]] e [[2026-10-31]].

- Entregues: identidade com as cores do Figma, LB-119, LB-120, LB-19, LB-22, LB-24, LB-25, LB-27 e LB-28 (API e site). PRs #139 a #176. Texto da nova senha não salva aprovado pelo Diego ("A").

## Estado

- Site em `localhost:3000` (working copy principal, `main`, `next dev`). Preview da branch em uso em `localhost:3001`, no worktree do Front.
- API em `localhost:3333` (worktree `../leguele-api`, `node dist/main.js`, sem watch). Para atualizar: `pnpm --filter @leguele/shared build`, build da API, conferir e só então reiniciar.
- Supabase local no Docker (`supabase_*_leguele-beer`), JWT ES256 (`signing_keys.json` fora do git), confirmação de e-mail ligada e e-mails no Mailpit. O `SUPABASE_URL` precisa ser `http://127.0.0.1:54321`.
- Conta admin de desenvolvimento no banco local; credenciais só na nota "Acesso local (admin)" do canvas.
- Portais "Leguelé iPhone" e "Leguelé Android" (o Desktop foi removido até o mobile ficar 100%), sempre na página em alteração. Notas "Status da banda" e "Páginas do projeto" mantidas pelo Orchestrator.
- O stash `obsidian` é do Diego: não aplicar nem descartar. Nunca adicionar `docs/.obsidian`.

## Próximo

1. Refatoração de `apps/web/src/components/ui` com export único em `index.ts` e vitrine em `/dev/tokens` (pedido do Diego; regra já no CLAUDE.md e em [[identidade-visual]]).
2. PR do Devops: `@leguele/shared` em watch no `pnpm dev`.
3. Fase 2 do [[roteiro-mvp]]: bloco A (base técnica) e depois B (catálogo). O Diego inspeciona cada página entregue (nota "Páginas do projeto").

## Follow-ups

- LB-8 (nuvem): checklist do [[roteiro-mvp]] (IP real no cadastro, na renovação e no `/recover`; `GRANT SELECT` em `auth.users`; `iss`; `SITE_URL`; `enable_confirmations`).
- Web: `meta theme-color` e favicon com o LB-16; logo com fundo transparente exportado pelo Diego.
- API: `DATABASE_URL` obrigatória no seed; código fixo no log de falha do `signOutOthers` quando houver observabilidade.
- Limpeza dos worktrees e arquivos temporários em `C:\Users\Arthur\Desktop\leguele\` fica com o Diego.

## Skills sugeridas

- Orchestrator: `maestri`, `handoff`.
- Spec: `grill-with-docs`, `domain-modeling`, `to-spec`, `to-tickets`.
- Front: `implement`, `tdd`, `web-design-guidelines`, `playwright-cli`.
- Back: `implement`, `tdd`, `diagnosing-bugs`.
- Reviewer: `review-spec`, `web-design-guidelines`, `playwright-cli`.
