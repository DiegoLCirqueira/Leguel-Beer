---
tags: [handoff]
atualizado: 2026-11-01
---

# Handoff

Sobrescrito pelo Orchestrator ao fim de cada ordem. A próxima conversa começa lendo este arquivo, a daily note mais recente em `docs/05-diario/` e [[licoes-aprendidas]].

## Última ordem: ajustes das telas de acesso (01/11)

Encerrada. Resumo em [[2026-11-01]].

- Entregues: logo e símbolo transparentes (#178), aviso de erro que piscava no login e na nova senha (#180, #181), dica do (i) acima do ícone com 12 px e fechamento em 5 s, contorno `borda-campo` nos campos e aviso de `/entrar` que some ao editar (#182), specs e docs (#179, #183, #184).
- Decisões do Diego: logo agora com os PNGs de preview ("1- A"); dica pode cobrir só "Continuar como convidado" ("1- B"); cor `#5A8450` aprovada; aviso some ao editar ("2- A").

## Estado

- Site em `localhost:3000` (working copy principal, `main`, `next dev`). Preview da branch em uso em `localhost:3001`, no worktree do Front.
- API em `localhost:3333` (worktree `../leguele-api`, `node dist/main.js`, sem watch). Para atualizar: `pnpm --filter @leguele/shared build`, build da API, conferir e só então reiniciar.
- Supabase local no Docker, JWT ES256, confirmação de e-mail ligada e e-mails no Mailpit. `SUPABASE_URL` = `http://127.0.0.1:54321`.
- Portais "Leguelé iPhone 390" (390x844) e "Leguelé Android", sempre na página em alteração. O portal antigo de 767 px foi removido pelo Diego.
- E2E local: o `playwright.config` usa `:3000` com `reuseExistingServer`; para testar uma branch, rodar contra o servidor dela (`:3001`).
- O stash `obsidian` é do Diego: não aplicar nem descartar. Nunca adicionar `docs/.obsidian`.

## Em andamento

- Front: refatoração de `apps/web/src/components/ui` (export único em `index.ts`, vitrine `/dev/tokens`), começando pelo `Campo`; teste frágil do campo; dica do (i) saindo da tela com zoom de 200% (PR `:bug:` próprio). Brief com o Orchestrator.

## Próximo

1. Concluir o item em andamento.
2. PR do Devops: `@leguele/shared` em watch no `pnpm dev`.
3. Fase 2 do [[roteiro-mvp]]: bloco A (base técnica) e depois B (catálogo). O Diego inspeciona cada página (nota "Páginas do projeto").

## Follow-ups

- LB-8 (nuvem): checklist do [[roteiro-mvp]].
- Web: `meta theme-color` e favicon com o LB-16; logo em resolução cheia, se o Diego exportar.
- API: `DATABASE_URL` obrigatória no seed; código fixo no log de falha do `signOutOthers`.
- `next/dist/client/components/redirect-error` é caminho interno: conferir `src/lib/erro-de-redirect.ts` a cada upgrade do Next.
- Folga de 3 px entre a dica e "Criar conta" em 360x600; se precisar de mais margem, só encurtando o texto (decisão do Diego).
- Limpeza dos worktrees e pastas temporárias em `C:\Users\Arthur\Desktop\leguele\` fica com o Diego (inclui `leguele-login0b`, que não saiu por "Filename too long").

## Skills sugeridas

- Orchestrator: `maestri`, `handoff`.
- Spec: `grill-with-docs`, `domain-modeling`, `to-spec`, `to-tickets`.
- Front: `implement`, `tdd`, `web-design-guidelines`, `playwright-cli`.
- Back: `implement`, `tdd`, `diagnosing-bugs`.
- Reviewer: `review-spec`, `web-design-guidelines`, `playwright-cli`.
