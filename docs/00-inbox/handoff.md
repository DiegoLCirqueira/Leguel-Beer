---
tags: [handoff]
atualizado: 2026-11-03
---

# Handoff

Sobrescrito pelo Orchestrator ao fim de cada ordem. A próxima conversa começa lendo este arquivo, a daily note mais recente em `docs/05-diario/` e [[licoes-aprendidas]].

## Última ordem: ajustes de `/entrar` e do rodapé (03/11)

Encerrada. Resumo em [[2026-11-03]].

- PR #195: em `/entrar`, seta do "Entrar" igual à da boas-vindas (`pinIconRight` no Button), divisor "ou" (`DivisorOu` em `components/ui`), "Ainda não tem conta? Criar conta" na mesma linha e sem o subtítulo "Que bom te ver de novo!".
- PR #196: rodapé do site fora de `/entrar`, `/criar-conta`, `/recuperar-senha`, `/nova-senha` e `/auth/confirmar`; segue em `/`, `/conta` e nas páginas legais. Decisão do Diego "1- A" (não retirar de todas as páginas por causa dos avisos legais e dos links de Termos/Privacidade).
- Ordem anterior (inspeção das telas de acesso, #186 a #194): ver [[2026-11-02]].

## Estado

- Site em `localhost:3000` (working copy principal, `main` c8cda54, `next dev`). Preview em :3001 ainda no ar, servindo o worktree `leguele-rodape` (destacado no mesmo commit da `main`).
- API em `localhost:3333` (worktree `../leguele-api`, `node dist/main.js`, sem watch). Para atualizar: `pnpm --filter @leguele/shared build`, build da API, conferir e só então reiniciar.
- Supabase local no Docker, e-mails no Mailpit (`127.0.0.1:54324`). Conta admin: credenciais só na nota "Acesso local (admin)" do canvas.
- Portais "Leguelé iPhone 390" e "Leguelé Android". O Diego remove os portais "Inspeção: ..." depois de ver.
- Para abrir `/nova-senha` na inspeção: pedir link em `/recuperar-senha` com a conta admin e abrir no portal o link `token_hash=...&type=recovery` do Mailpit.
- O stash `obsidian` é do Diego: não aplicar nem descartar. Nunca adicionar `docs/.obsidian`.
- Merge com worktree na branch: `git switch --detach` no worktree antes do `gh pr merge --squash --delete-branch` (lição de 02/11).

## Próximo

1. Diego inspeciona `/entrar` (seta, divisor, sem subtítulo) e as telas de acesso sem rodapé; `/criar-conta` final (link no fim, aceite verde, rolagem sem barra).
2. Front: `fix/dica-zoom-200` (worktree `leguele-zoom`, só o red 5f189f7) e o Voltar que cobre o logo no zoom de 200%.
3. PR do Devops: `@leguele/shared` em watch no `pnpm dev`.
4. Fase 2 do [[roteiro-mvp]]: bloco A (base técnica) e depois B (catálogo).

## Follow-ups

- Sem E2E para 360x600 e zoom de 200% nas telas de acesso (conferido à mão pelo Front e pelo Reviewer).
- Minors do Reviewer no #195/#196: boas-vindas deveria usar o `pinIconRight` (hoje posiciona a seta com `absolute` próprio) e a vitrine `/dev/tokens` não mostra o `pinIconRight`; falta E2E de ausência do rodapé nas 5 telas de acesso; o cenário "Rodapé com avisos e links" da loja ganha teste com o catálogo.
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
