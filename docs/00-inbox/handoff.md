---
tags: [handoff]
atualizado: 2026-11-08
---

# Handoff

Sobrescrito pelo Orchestrator ao fim de cada ordem. A próxima conversa começa lendo este arquivo, a daily note mais recente em `docs/05-diario/` e [[licoes-aprendidas]].

## Última ordem: item 1 concluído (catálogo e início) e início do item 2 (08/11)

Resumo em [[2026-11-08]]. O Diego pediu para terminar o que estava aberto e parar até novas ordens.

- Item 1 de [[sequencia-telas]] concluído: contrato, modelos/seed, GET /catalogo e /catalogo/destaques, layout da loja, bottom sheet/toast/skeleton, card com stepper, tela /catalogo e destaques na home (#210 a #226).
- Item 2 (página de produto) começou: spec [[produto]] (#220, #225), contrato (#223). A fatia 2 da API (campos descrição e preço anterior, migration, seed, GET /catalogo/:slug) está pronta em `feat/produto-api`, sem PR: falta trazer a main e abrir o PR.
- Processo: auditoria final do Codex a cada ordem; ciclo contínuo ([[ADR-016-ciclo-continuo-da-banda]]); PR de código não edita a daily.

## Estado

- Ambiente a partir da `main` (e69f484) com um único `pnpm dev` na raiz (shared em watch, site :3000, API :3333; log `%TEMP%/leguele-dev.log`). Supabase local e Mailpit no Docker. Preview :3001 no ar com o worktree `leguele-zoom2` (já mergeado); o Front o troca pelo worktree da tarefa atual. Para religar: Docker, `pnpm db:start` e os dois comandos.
- O watch da API não reinicia quando muda o `.env`: reiniciar o processo.
- `apps/api/.env` da working copy principal foi copiado do worktree `leguele-api` (sem as chaves do seed).
- Portais "Leguelé iPhone 390" e "Leguelé Android" apontam para :3000.
- O sandbox do Codex só grava na pasta do papel: cada escrita fora dela pede liberação no terminal dele. O Diego orientou que dúvidas operacionais do Codex vão primeiro ao Orchestrator. Commit, push e `gh pr create` já estão liberados.
- O cadastro de papéis do Maestri (`maestri role show`) está defasado; os arquivos de `.maestri/roles/` são a fonte real. Não usar `maestri role edit` (lição de 04/11).
- O papel do Orchestrator ainda diz "Merge é sempre do Diego" na seção 5 até o Diego corrigir. Vale o CLAUDE.md.
- O stash `obsidian` é do Diego: não aplicar nem descartar. Nunca adicionar `docs/.obsidian`.

## Próximo

1. Aguardar novas ordens do Diego (pedido de 08/11).
2. Quando retomar: auditoria do Codex sobre 3482c9a..(main depois do PR de fechamento), se ainda não tiver rodado; abrir o PR da fatia 2 do item 2 (`feat/produto-api`); depois a tela de produto (fatias 3 e 4, Front).
3. Inspeção pendente do Diego: `/entrar`, `/criar-conta`, `/conta`, `/entregas`, e agora `/catalogo` e a home com destaques.
4. LB-8 (nuvem) espera o Diego (contas). O spike LB-54 abre o checkout (item 5).

## Follow-ups

- Do #212: registrar a mutação dos testes de loja-layout que nasceram verdes; a exceção da barra fixa no `responsivo.spec.ts` vale para qualquer rolagem (rever quando /catalogo e /geladeira usarem o layout); rótulo da barra até 12 px; fragmentos `<>` sobrando; a barra e a variável `--altura-barra-loja` têm o 57 px em dois lugares.
- Do #214: guarda de banco local também no `seed-admin` (falhar fechado sem `DATABASE_URL`); `categories.order` único quando o admin escrever categorias (LB-73).
- Do #215: tornar o resto da página inerte e usar portal quando o sheet entrar na loja; a vitrine /dev/tokens abre em produção com VITRINE_E2E=1: recusar também com VERCEL_ENV=production ou documentar que a variável nunca vai ao deploy.
- Do #218: `images.remotePatterns` no next.config.ts quando `imagemUrl` vier absoluta (LB-124); alt da imagem repete o nome.
- Do #221/#226: faixa de categorias na home (cenário do [[catalogo]] sem tela); E2E opcional do estado de erro do catálogo com API_URL inválida; motivo da falha no aviso dos destaques; esqueleto de 4 blocos para até 6 cards.
- Do #222: os warns do Nest agora saem com nível warn (quem filtra logs por nível vê mais linhas).
- Do #219: o teto de 200 cervejas na leitura do catálogo registra aviso; perto do teto, filtrar no banco e paginar.

- Próximo refino do Codex (minors do Reviewer no #203 e no #204):
  - `/nova-senha` e `/auth/confirmar` fora de `acesso-refluxo.spec.ts` (rodapé e alcance em 360x600 e 195x422);
  - `e2e/support/playwright.acesso.config.ts` com `reuseExistingServer` em :3001 pode rodar contra outra branch; melhor parametrizar a porta no `playwright.config.ts` e apagar o segundo config;
  - "a dica não cobre Entrar, Criar conta, checkbox nem (i)" (boas-vindas-arte.spec.ts) só roda em 180x390; incluir 195x422 e 360x599.
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
- Limpeza dos worktrees e pastas em `C:\Users\Arthur\Desktop\leguele\` e `C:\lb-*` fica com o Diego (inclui `C:/lb-adrp`, `C:/lb-adrr`, `C:/lb-adr15`, `C:/lb-codex`, `C:/lb-testes-acesso`, `leguele-zoom`, `C:/lb-doc0811` e os worktrees desta rodada: `leguele-zoom2`, `leguele-loja-layout`, `leguele-sheet`, `leguele-card`, `leguele-catalogo`, `leguele-home`, `leguele-catalogo-*`, `leguele-produto-contrato`, `leguele-seed-admin`, `C:/lb-doc0811b`, `C:/lb-auditoria`, `C:/lb-ciclo`, `C:/lb-spec-*`, `C:/lb-seq-09`, `C:/lb-docs-daily`, `C:/lb-sharedwatch`, `C:/lb-produto-desc`, `C:/lb-fecho-0811` e a pasta vazia `C:/lb-auditoria-0811`; o `feat/produto-api` NÃO, tem trabalho sem PR).

## Skills sugeridas

- Orchestrator: `maestri`, `handoff`.
- Spec: `grill-with-docs`, `domain-modeling`, `to-spec`, `to-tickets`.
- Front: `implement`, `tdd`, `web-design-guidelines`, `playwright-cli`.
- Back: `implement`, `tdd`, `diagnosing-bugs`.
- Reviewer: `review-spec`, `web-design-guidelines`, `playwright-cli`.
- Testes (Codex): `playwright-cli`.
