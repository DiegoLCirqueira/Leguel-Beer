---
tags: [handoff]
atualizado: 2026-11-08
---

# Handoff

Sobrescrito pelo Orchestrator ao fim de cada ordem. A próxima conversa começa lendo este arquivo, a daily note mais recente em `docs/05-diario/` e [[licoes-aprendidas]].

## Última ordem: auditoria, telas do design, ciclo contínuo e início do item 1 (08/11)

Resumo em [[2026-11-08]].

- #203 (Codex): refino dos E2E das telas de acesso; achou o BUG-ACESSO-ZOOM.
- #204 (Front): corrige o corte do Entrar e a dica do (i) no zoom de 200% da boas-vindas.
- Levantamento das telas sem design no cartão "Telas sem design" do canvas (fichário "Fichário"). O Diego adicionou as telas 16 a 30 em `Imagens/figma/telas` (a revisar com o Front); a Geladeira segue `Imagens/estudio-garrafas.html`.
- Auditoria final de cada ordem pelo Codex (decisão do Diego), registrada no `CLAUDE.md` e em [[maestri-banda]]. A primeira (297bb03..e393f50) deu "Ordem com achados": dois major de zoom na boas-vindas, corrigidos no #208 (d4263b5), que também falhou uma vez no CI do Linux (fonte mais larga) e passou a não depender da largura da fonte.
- Ordem de implementação 1 a 9 em [[sequencia-telas]] (revisada com o Front); item 1 (catálogo e início) com a spec pronta (#209): Back no contrato em `@leguele/shared`, Front no LB-15 (cabeçalho e barra de baixo da loja).
- Ciclo contínuo: [[ADR-016-ciclo-continuo-da-banda]]. A banda não espera ordem entre tarefas; decisões do Diego ficam no cartão "🗳️ Decisões pendentes do Diego".

## Estado

- Ambiente a partir da `main` (d4263b5), em processos separados: API em :3333 (`pnpm --filter @leguele/api dev`, log `%TEMP%/leguele-api-dev.log`) e site em :3000 (`next dev -p 3000` em `apps/web`, log `%TEMP%/leguele-web-dev.log`). Supabase local e Mailpit no Docker. Preview :3001 no ar com o worktree `leguele-zoom2` (já mergeado); o Front o troca pelo worktree da tarefa atual. Para religar: Docker, `pnpm db:start` e os dois comandos.
- O watch da API não reinicia quando muda o `.env`: reiniciar o processo.
- `apps/api/.env` da working copy principal foi copiado do worktree `leguele-api` (sem as chaves do seed).
- Portais "Leguelé iPhone 390" e "Leguelé Android" apontam para :3000.
- O sandbox do Codex só grava na pasta do papel: cada escrita fora dela pede liberação no terminal dele. O Diego orientou que dúvidas operacionais do Codex vão primeiro ao Orchestrator. Commit, push e `gh pr create` já estão liberados.
- O cadastro de papéis do Maestri (`maestri role show`) está defasado; os arquivos de `.maestri/roles/` são a fonte real. Não usar `maestri role edit` (lição de 04/11).
- O papel do Orchestrator ainda diz "Merge é sempre do Diego" na seção 5 até o Diego corrigir. Vale o CLAUDE.md.
- O stash `obsidian` é do Diego: não aplicar nem descartar. Nunca adicionar `docs/.obsidian`.

## Próximo

1. Auditoria final do Codex sobre e393f50..(main depois deste PR): #207, #208, #209 e este.
2. Item 1 de [[sequencia-telas]]: contrato (Back) → LB-4, LB-36 e LB-34 na API (Back) em paralelo com LB-15, LB-14 e LB-13 (Front) → telas do catálogo e do início. Depois, item 2 (página de produto).
3. Inspeção pendente do Diego: `/entrar`, `/criar-conta`, `/conta`, `/entregas`.
4. PR do Devops com `@leguele/shared` em watch no `pnpm dev`. LB-8 (nuvem) espera o Diego (contas).

## Follow-ups

- Próximo refino do Codex (minors do Reviewer no #203 e no #204):
  - `/nova-senha` e `/auth/confirmar` fora de `acesso-refluxo.spec.ts` (rodapé e alcance em 360x600 e 195x422);
  - `e2e/support/playwright.acesso.config.ts` com `reuseExistingServer` em :3001 pode rodar contra outra branch; melhor parametrizar a porta no `playwright.config.ts` e apagar o segundo config;
  - a posição "abaixo" da dica do (i) só é testada em 180x390; incluir 360x599 e outra altura baixa.
- Front (boas-vindas, minors do #208): tirar os `?.` de `matchMedia`/`scrollIntoView` em `welcome-actions.tsx` e usar stub no setup do Vitest (regra da lição de 08/11); folga à direita do texto do "Criar conta" em 180x390 (hoje 1 px da borda); o teste do gesto deve assertar que o ponto tocado não é um controle.
- Spec da boas-vindas: uma frase sobre onde a dica do (i) abre em telas baixas.
- Spec de checkout: regras de pagamento recusado e erro do gateway, juros acima de 3x; listas vazias (Geladeira, histórico, admin) e skeleton sem regra.
- Minors do Reviewer no #195/#196: boas-vindas deveria usar o `pinIconRight`; a vitrine `/dev/tokens` não mostra o `pinIconRight`; o cenário "Rodapé com avisos e links" da loja ganha teste com o catálogo.
- Selo "issues" do Next em dev aparece em maioridade e recuperar senha: investigar.
- Estados após envio (sucesso/erro) de recuperar senha podem somar altura e rolar.
- Stash `wip-distribuir-nova-senha` no worktree `leguele-espaco` (não usado; pode ser descartado na limpeza).
- LB-8 (nuvem): checklist do [[roteiro-mvp]]. Web: `meta theme-color` e favicon com o LB-16.
- API, segurança (achado do Reviewer no #200): o `ThrottlerModule` em `apps/api/src/app.module.ts` guarda a contagem em memória (100 por 60 s); numa API serverless conta por instância. O Back avalia junto do LB-8 e, se mantiver, registra o ADR.
- API: `DATABASE_URL` obrigatória no seed; código fixo no log de falha do `signOutOthers`.
- `src/lib/erro-de-redirect.ts` usa caminho interno do Next: conferir a cada upgrade.
- Limpeza dos worktrees e pastas em `C:\Users\Arthur\Desktop\leguele\` e `C:\lb-*` fica com o Diego (inclui `C:/lb-adrp`, `C:/lb-adrr`, `C:/lb-adr15`, `C:/lb-codex`, `C:/lb-testes-acesso`, `leguele-zoom` e `C:/lb-doc0811` depois do merge).

## Skills sugeridas

- Orchestrator: `maestri`, `handoff`.
- Spec: `grill-with-docs`, `domain-modeling`, `to-spec`, `to-tickets`.
- Front: `implement`, `tdd`, `web-design-guidelines`, `playwright-cli`.
- Back: `implement`, `tdd`, `diagnosing-bugs`.
- Reviewer: `review-spec`, `web-design-guidelines`, `playwright-cli`.
- Testes (Codex): `playwright-cli`.
