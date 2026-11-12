---
tags: [handoff]
atualizado: 2026-11-12
---

# Handoff

Sobrescrito pelo Orchestrator ao fim de cada ordem. A próxima conversa começa lendo este arquivo, a daily mais recente ([[2026-11-12]]) e [[licoes-aprendidas]].

## Última ordem: Geladeira no site e fotos das garrafas (11/11 a 12/11)

- Mergeados: #243 a #246 (contrato, API e Política), #247 (Geladeira no site com contador e sincronização), #249 (9 fotos), #250 (specs). Aberto: #248 (data da Política; rebase após #247, revisão do Reviewer depois).
- Item 2 (página de produto) fechado; item 3 (Geladeira): falta a tela (fatias 6 e 7 da [[geladeira]]; E2E de entrar na conta é obrigatório na fatia 7).
- Fotos: 9 cervejas com foto; **faltam 7** (jaragua-hazy-ipa, umbu-gose, graviola-witbier, rapadura-brown-ale, barra-nova-porter, pajucara-amber-ale, ponta-verde-pilsen). Quando o Diego enviar: `apps/web/public/cervejas/<slug>.webp` e incluir o slug na lista do seed (`seed-catalog-data.ts`). Fontes de ~470 px: pedir maiores.
- Regras novas do Diego (12/11): Codex revisa tudo (decisões do Orchestrator, testes, commits); decisões dele vão direto ao chat quando ele está acordado; portais sempre na tela em trabalho; Vercel opção A (prefixo `leguele-web`/`leguele-api`, Hobby, no LB-8).
- Auditoria final do Codex dos itens 1 e 2: em andamento no fim desta ordem (veredito pendente ao gravar este handoff); depois, refino de testes dele em PR próprio com os achados da [[2026-11-12]].

## Estado

- Ambiente na `main` (confira `git log -1`) com um único `pnpm dev` na raiz (site :3000, API :3333; log `%TEMP%/leguele-dev.log`). Supabase local e Mailpit no Docker. Se o Prisma Client ficar velho: `prisma generate` em `apps/api`. Seed sem conta admin: faltam `ADMIN_SEED_PASSWORD` e `SUPABASE_SERVICE_ROLE_KEY` no `.env` da main.
- Portais "Leguelé iPhone 390" e "Leguelé Android" apontam para :3000; o :3001 serve o worktree da tarefa do Front. Portal "vercel.com" vinculado pelo Diego (conta Hobby; só ler, não alterar sem pedir).
- O sandbox do Codex grava em `C:/Users/Arthur/Desktop/leguele`; dúvidas operacionais do Codex vão ao Orchestrator (pedidos de leitura: opção 1). No Git Bash use `MSYS_NO_PATHCONV=1` ao mandar `--raw "/clear\n"`, senão o caminho é mal interpretado.
- O stash `obsidian` é do Diego; nunca adicionar `docs/.obsidian`.

## Próximo

1. Rebase e revisão do #248.
2. Item 3: tela da Geladeira (fatias 6 e 7), depois o item 5 (checkout, spike LB-54).
3. Diego: enviar as 7 fotos; em 16/11 voltar o Reviewer ao Opus 5.5; contas para o LB-8.
4. Follow-ups: ver a seção "Achados para refino" da [[2026-11-12]] e os follow-ups do handoff anterior (ainda válidos: #212, #214, #215, #218, #221/#226, #225, #222, #219, refino do Codex dos #203/#204, minors do #208, specs de checkout, ThrottlerModule, limpeza de worktrees antigos exceto `leguele-g2`).

## Skills sugeridas

- Orchestrator: `maestri`, `handoff`. Spec: `grill-with-docs`, `domain-modeling`, `to-spec`, `to-tickets`. Front: `implement`, `tdd`, `web-design-guidelines`, `playwright-cli`. Back: `implement`, `tdd`, `diagnosing-bugs`. Reviewer: `review-spec`, `web-design-guidelines`, `playwright-cli`. Testes (Codex): `playwright-cli`.
