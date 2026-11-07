---
tags: [handoff]
atualizado: 2026-11-07
---

# Handoff

Sobrescrito pelo Orchestrator ao fim de cada ordem. A próxima conversa começa lendo este arquivo, a daily note mais recente em `docs/05-diario/` e [[licoes-aprendidas]].

## Última ordem: respostas da ordem de ADR e entrada do Codex (07/11)

Resumo em [[2026-11-07]].

- Respostas do Diego "1: A, 2: A, 3: A": ADR-004 segue `proposto` até o spike LB-54; [[ADR-015-ferramentas-monorepo]] registra o que o LB-1 implementou (o ADR-005 não foi editado); a linha de merge do papel do Orchestrator fica com o Diego.
- Agente Codex (papel "Testes" no Maestri): refina a suíte depois que a ordem é finalizada, em PR próprio, sem mudar código de produção. Etapa registrada no `CLAUDE.md` e em [[maestri-banda]].
- Fichário "ADRs e decisões" no canvas: um cartão por ADR e o cartão "Decisões pendentes do Diego"; o Orchestrator o atualiza a cada ADR novo e a cada pergunta.

## Estado

- Ambiente religado em 07/11 a partir da `main`, em processos separados: API em :3333 (`pnpm --filter @leguele/api dev`, log `%TEMP%/leguele-api-dev.log`) e site em :3000 (`next dev -p 3000` em `apps/web`, log `%TEMP%/leguele-web-dev.log`). Supabase local e Mailpit no Docker. Preview :3001 desligado. Para religar: Docker, `pnpm db:start` e os dois comandos.
- O watch da API não reinicia quando muda o `.env`: reiniciar o processo.
- `apps/api/.env` da working copy principal foi copiado do worktree `leguele-api` (sem as chaves do seed).
- Portais "Leguelé iPhone 390" e "Leguelé Android" apontam para :3000.
- O cadastro de papéis do Maestri (`maestri role show`) está defasado (textos de 27/10); os arquivos de `.maestri/roles/` são a fonte real. Não usar `maestri role edit` (lição de 04/11). O papel "Testes" do Codex foi criado novo com `maestri role create`.
- O papel do Orchestrator ainda diz "Merge é sempre do Diego" na seção 5 até o Diego corrigir. Vale o CLAUDE.md.
- O stash `obsidian` é do Diego: não aplicar nem descartar. Nunca adicionar `docs/.obsidian`.

## Próximo

1. Codex: primeiro refinamento de testes (sugestão: telas de acesso, que têm as lacunas de E2E dos follow-ups).
2. Pendências de 03/11: inspeção de `/entrar` e das telas de acesso sem rodapé; Front `fix/dica-zoom-200` (worktree `leguele-zoom`, só o red 5f189f7); PR do Devops com `@leguele/shared` em watch no `pnpm dev`; fase 2 do [[roteiro-mvp]] (bloco A e depois B). O spike LB-54 abre o checkout.

## Follow-ups

- Sem E2E para 360x600 e zoom de 200% nas telas de acesso (conferido à mão pelo Front e pelo Reviewer).
- Minors do Reviewer no #195/#196: boas-vindas deveria usar o `pinIconRight`; a vitrine `/dev/tokens` não mostra o `pinIconRight`; falta E2E de ausência do rodapé nas 5 telas de acesso; o cenário "Rodapé com avisos e links" da loja ganha teste com o catálogo.
- Selo "issues" do Next em dev aparece em maioridade e recuperar senha: investigar.
- Estados após envio (sucesso/erro) de recuperar senha podem somar altura e rolar.
- Stash `wip-distribuir-nova-senha` no worktree `leguele-espaco` (não usado; pode ser descartado na limpeza).
- LB-8 (nuvem): checklist do [[roteiro-mvp]]. Web: `meta theme-color` e favicon com o LB-16.
- API, segurança (achado do Reviewer no #200): o `ThrottlerModule` em `apps/api/src/app.module.ts` (desde o #129) guarda a contagem em memória (100 por 60 s). Numa API serverless isso conta por instância, e o limite fica fraco. Não há decisão registrada: o Back avalia junto do LB-8 e, se mantiver, registra o ADR.
- API: `DATABASE_URL` obrigatória no seed; código fixo no log de falha do `signOutOthers`.
- `src/lib/erro-de-redirect.ts` usa caminho interno do Next: conferir a cada upgrade.
- Limpeza dos worktrees e pastas em `C:\Users\Arthur\Desktop\leguele\` e `C:\lb-*` fica com o Diego (agora inclui `C:/lb-adrp`, `C:/lb-adrr`, `C:/lb-adr15` e `C:/lb-codex` depois do merge).

## Skills sugeridas

- Orchestrator: `maestri`, `handoff`.
- Spec: `grill-with-docs`, `domain-modeling`, `to-spec`, `to-tickets`.
- Front: `implement`, `tdd`, `web-design-guidelines`, `playwright-cli`.
- Back: `implement`, `tdd`, `diagnosing-bugs`.
- Reviewer: `review-spec`, `web-design-guidelines`, `playwright-cli`.
- Testes (Codex): `playwright-cli`.
