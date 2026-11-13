---
tags: [handoff]
atualizado: 2026-11-12
---

# Handoff

Sobrescrito pelo Orchestrator ao fim de cada ordem. A próxima conversa começa lendo este arquivo, a daily mais recente ([[2026-11-12]]) e [[licoes-aprendidas]].

## Última ordem: Geladeira no site e fotos das garrafas (11/11 a 12/11)

- Mergeados: #243 a #246 (contrato, API e Política), #247 (Geladeira no site com contador e sincronização), #248 (data da Política 2026-11-11, sem novo aceite), #249 (9 fotos), #250 e #252 e #253 (specs), #251 (fechamento), #254 (refino de testes) e #255 (corrida do provider da Geladeira). Nada aberto ao fim da ordem.
- Item 2 (página de produto) fechado; item 3 (Geladeira): falta a tela (fatias 6 e 7 da [[geladeira]]; E2E de entrar na conta é obrigatório na fatia 7).
- Fotos: 9 cervejas com foto; **faltam 7** (jaragua-hazy-ipa, umbu-gose, graviola-witbier, rapadura-brown-ale, barra-nova-porter, pajucara-amber-ale, ponta-verde-pilsen). Quando o Diego enviar: `apps/web/public/cervejas/<slug>.webp` e incluir o slug na lista do seed (`seed-catalog-data.ts`). Fontes de ~470 px: pedir maiores.
- Regras novas do Diego (12/11): Codex revisa tudo (decisões do Orchestrator, testes, commits); decisões dele vão direto ao chat quando ele está acordado; portais sempre na tela em trabalho; Vercel opção A (prefixo `leguele-web`/`leguele-api`, Hobby, no LB-8).
- Auditoria final do Codex dos itens 1 e 2: **Ordem aprovada** (main c249f9c: lint, typecheck, build e 878 testes verdes; E2E 57/57 em build de produção).

## Estado

- Ambiente na `main` (confira `git log -1`) com um único `pnpm dev` na raiz (site :3000, API :3333; log `%TEMP%/leguele-dev.log`). Supabase local e Mailpit no Docker. Se o Prisma Client ficar velho: `prisma generate` em `apps/api`. Seed sem conta admin: faltam `ADMIN_SEED_PASSWORD` e `SUPABASE_SERVICE_ROLE_KEY` no `.env` da main.
- Portais "Leguelé iPhone 390" e "Leguelé Android" apontam para :3000; o :3001 serve o worktree da tarefa do Front. Portal "vercel.com" vinculado pelo Diego (conta Hobby; só ler, não alterar sem pedir).
- O sandbox do Codex grava em `C:/Users/Arthur/Desktop/leguele`; dúvidas operacionais do Codex vão ao Orchestrator (pedidos de leitura: opção 1). No Git Bash use `MSYS_NO_PATHCONV=1` ao mandar `--raw "/clear\n"`, senão o caminho é mal interpretado.
- O stash `obsidian` é do Diego; nunca adicionar `docs/.obsidian`.
- O watch da API não reinicia quando muda o `.env`: reiniciar o processo.
- O cadastro de papéis do Maestri (`maestri role show`) está defasado; os arquivos de `.maestri/roles/` são a fonte real. Não usar `maestri role edit` (lição de 04/11).
- O papel do Orchestrator ainda diz "Merge é sempre do Diego" na seção 5 até o Diego corrigir. Vale o CLAUDE.md.
- Não limpar o worktree `leguele-g2` (refactor/components-ui-g2, 5 arquivos não commitados) nem o `leguele-fecho2` sem conferir antes.

## Próximo

1. Item 3: começar pela fatia 6 da Geladeira (arrumação das prateleiras); a fatia 7 inclui acumular os ajustes do contexto até a tela dispensá-los.
2. Item 3: tela da Geladeira (fatias 6 e 7), depois o item 4 (Conta e entrega, ver [[sequencia-telas]]) e o item 5 (checkout, spike LB-54).
3. Diego: enviar as 7 fotos; em 16/11 o Reviewer volta ao Opus 5.5 (decisão dele de 11/11, cartão de pendências); contas para o LB-8.
4. Follow-ups: ver a seção "Achados para refino" da [[2026-11-12]] e a seção "Follow-ups" abaixo.

## Follow-ups

- Do #212: registrar a mutação dos testes de loja-layout que nasceram verdes; a exceção da barra fixa no `responsivo.spec.ts` vale para qualquer rolagem (rever quando /catalogo e /geladeira usarem o layout); rótulo da barra até 12 px; fragmentos `<>` sobrando; a barra e a variável `--altura-barra-loja` têm o 57 px em dois lugares.
- Do #214: `categories.order` único quando o admin escrever categorias (LB-73).
- Do #215: tornar o resto da página inerte e usar portal quando o sheet entrar na loja; a vitrine /dev/tokens abre em produção com VITRINE_E2E=1: recusar também com VERCEL_ENV=production ou documentar que a variável nunca vai ao deploy.
- Do #218: `images.remotePatterns` no next.config.ts quando `imagemUrl` vier absoluta (LB-124); alt da imagem repete o nome.
- Do #221/#226: faixa de categorias na home (cenário do [[catalogo]] sem tela); E2E opcional do estado de erro do catálogo com API_URL inválida; motivo da falha no aviso dos destaques; esqueleto de 4 blocos para até 6 cards.
- Do #225: exemplo "R$ 32,01 | não vejo preço anterior nem desconto" no Esquema do Cenário de desconto de [[produto]].
- Do #222: os warns do Nest agora saem com nível warn (quem filtra logs por nível vê mais linhas).
- Do #219: o teto de 200 cervejas na leitura do catálogo registra aviso; perto do teto, filtrar no banco e paginar.

- Próximo refino do Codex (minors do Reviewer no #203 e no #204):
  - `/nova-senha` e `/auth/confirmar` fora de `acesso-refluxo.spec.ts` (rodapé e alcance em 360x600 e 195x422);
  - `e2e/support/playwright.acesso.config.ts` com `reuseExistingServer` em :3001 pode rodar contra outra branch; melhor parametrizar a porta no `playwright.config.ts` e apagar o segundo config;
  - "a dica não cobre Entrar, Criar conta, checkbox nem (i)" (boas-vindas-arte.spec.ts) só roda em 180x390; incluir 195x422 e 360x599.
- Front (boas-vindas, minors do #208): tirar os `?.` de `matchMedia`/`scrollIntoView` em `welcome-actions.tsx` e usar stub no setup do Vitest (regra da lição de 08/11); folga à direita do texto do "Criar conta" em 180x390 (hoje 1 px da borda); o teste do gesto deve assertar que o ponto tocado não é um controle.
- Spec da boas-vindas: uma frase sobre onde a dica do (i) abre em telas baixas.
- Spec de checkout: regras de pagamento recusado e erro do gateway, juros acima de 3x; listas vazias (Geladeira, histórico, admin) e skeleton sem regra.
- Minors do Reviewer no #195/#196: boas-vindas deveria usar o `pinIconRight`; a vitrine `/dev/tokens` não mostra o `pinIconRight`.
- Selo "issues" do Next em dev aparece em maioridade e recuperar senha: investigar.
- Estados após envio (sucesso/erro) de recuperar senha podem somar altura e rolar.
- Stash `wip-distribuir-nova-senha` (`stash@{0}` da working copy principal; não usado; pode ser descartado na limpeza).
- LB-8 (nuvem): checklist do [[roteiro-mvp]]. Web: `meta theme-color` e favicon com o LB-16.
- API, segurança (achado do Reviewer no #200): o `ThrottlerModule` em `apps/api/src/app.module.ts` guarda a contagem em memória (100 por 60 s); numa API serverless conta por instância. O Back avalia junto do LB-8 e, se mantiver, registra o ADR.
- API: código fixo no log de falha do `signOutOthers`.
- `src/lib/erro-de-redirect.ts` usa caminho interno do Next: conferir a cada upgrade.
- Limpeza (Devops): ao fim de 12/11 ainda existem worktrees destacados de PRs mergeados: `leguele-ajustes`, `leguele-api`, `leguele-audit-249`, `leguele-audit-255`, `leguele-catalogo`, `leguele-catalogo-achados`, `leguele-contraste`, `leguele-geladeira`, `leguele-produto`, `leguele-produto-api`, `leguele-seed16`, `leguele-sem-rodape`, `C:/lb-auditoria`, `C:/lb-notion` e, em `%TEMP%`, `wt-catalogo-16-cervejas` e `wt-rodape-fora-da-loja`. Conferir cada um (git status e branch) antes de remover; pastas com caminho longo caem com `rd /s /q` com o prefixo de caminho longo do Windows antes do caminho. Com trabalho fora da main: `leguele-seed9` (`feat/seed-9-cervejas`, superado pelo #237), `leguele-t119` (PR #141 mergeado), `C:/lb-licoes` (ver se as lições já estão em [[licoes-aprendidas]]). NÃO limpar `leguele-g2` (refactor/components-ui-g2, 5 arquivos não commitados) nem `leguele-fecho2` sem conferir. O Codex usa `leguele-audit-*` para auditar; a working copy principal é compartilhada: cada agente deve trabalhar em worktree próprio.

## Skills sugeridas

- Orchestrator: `maestri`, `handoff`. Spec: `grill-with-docs`, `domain-modeling`, `to-spec`, `to-tickets`. Front: `implement`, `tdd`, `web-design-guidelines`, `playwright-cli`. Back: `implement`, `tdd`, `diagnosing-bugs`. Reviewer: `review-spec`, `web-design-guidelines`, `playwright-cli`. Testes (Codex): `playwright-cli`.
