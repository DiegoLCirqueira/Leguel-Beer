---
tags: [handoff]
atualizado: 2026-10-29
---

# Handoff

Sobrescrito pelo Orchestrator ao fim de cada ordem. A próxima conversa começa lendo este arquivo, a daily note mais recente em `docs/05-diario/` e [[licoes-aprendidas]].

## Última ordem: fundação da entrega de acesso (29/10)

Encerrada. Resumo em [[2026-10-29]]. Roteiro em [[roteiro-mvp]] (fase 1: acesso, decisão do Diego; depois a ordem do Notion).

- Mergeados: #128 (10 specs, [[ADR-007-banco-de-teste]], roteiro), #130 ([[identidade-visual]], LB-11 e LB-12) e #129 ([[api-base]], LB-3, LB-117 e LB-118).

## Estado

- Site em `localhost:3000` (working copy principal, `main`) e API em `localhost:3333` (subida do worktree `../leguele-back`, cuja branch já foi mergeada: religar a API a partir da `main` na próxima ordem e remover o worktree).
- Supabase local no Docker com `project_id = "leguele-beer"`. Os containers do InvestPro não são do projeto.
- Portais "Leguelé Desktop", "Leguelé iPhone" e "Leguelé Android" no canvas; nota "Status da banda" atualizada pelo Orchestrator.
- O stash `obsidian` é do Diego: não aplicar nem descartar.

## Antes da próxima ordem

- O Diego pediu a análise de 14 plugins/skills (CLAUDE-MEM, HEADROOM, CLAUDE CODE SETUP, TASK OBSERVER, GRAPHIFY, TASTE SKILL, WEB DESIGN GUIDELINES, AWESOME DESIGN, IMAGE TO CODE, PLAYWRIGHT CLI, PONYTAIL, CODE REVIEW, OBSIDIAN SKILL, SUPERPOWERS) antes de iniciar qualquer outra coisa.

## Próximo no roteiro (fase 1)

LB-119 e LB-120 ([[testes-api]], [[contratos-compartilhados]]), depois LB-19, LB-24, LB-28, LB-22, LB-25 e LB-27, conforme [[roteiro-mvp]].

## Follow-ups técnicos

- API: pendências conhecidas no `apps/api/README.md` (trust proxy no LB-8, timeout do pool, log sem query string, x-request-id, CSP só fora de /docs, contexto do logger, `z.config` no setup).
- Web: testes extras de contraste, regex do lint de cor fixa, `role="group"` nos chips e status do botão sempre montado.
- Favicon, ícones e manifest (originais em `Imagens/favicon-leguele`) ficam para o LB-16.

## Skills sugeridas

- Orchestrator: `maestri`, `handoff`.
- Spec: `grill-with-docs`, `domain-modeling`, `to-spec`, `to-tickets`.
- Front e Back: `implement`, `tdd`, `diagnosing-bugs`.
- Reviewer: `review-spec`.
