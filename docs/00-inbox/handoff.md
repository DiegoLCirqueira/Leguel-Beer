---
tags: [handoff]
atualizado: 2026-11-21
---

# Handoff

Sobrescrito pelo Orchestrator ao fim de cada ordem. A próxima conversa começa lendo este arquivo, a daily mais recente ([[2026-11-21]]) e [[licoes-aprendidas]].

## Última ordem: retomada e checkout Entrega (16/11 a 21/11)

- Mergeados #293 a #335 (lista por dia em [[2026-11-17]] e [[2026-11-21]]): endereços completos no site, frete na Geladeira, dados pessoais e maioridade, criar pedido na API ([[ADR-019-criacao-do-pedido-serializada-por-cliente]]), pagamento só visual com aviso e "Voltar" ([[ADR-020-aviso-de-portfolio-no-pagamento]]), etapa Entrega do checkout, limites por conta e por visitante, spec do e-mail do pedido, tokens e Next 16.4.6.
- Specs fechadas: [[qualidade-compra]] (pronta), [[admin]] (conferida com a API: ainda sem rota de admin), [[email-pedido]] (rascunho até o provedor).
- Regra nova do Diego (21/11): trabalhar em ciclo, sem reportar cada evento; falar só para decisão, bloqueio ou entrega grande.

## Estado

- Todos os papéis do Maestri rodam em `claude --continue`; o roteador 9Router/claudex foi removido. Ao reiniciar o Maestri, ler este arquivo, a daily, as lições, os ADRs e o cartão de pendências.
- Reiniciar um terminal derruba tarefas em background; conferir o que estava rodando.
- O checkout tem só a etapa Entrega; faltam Pagamento, Revisão, o criar pedido no site, a revalidação da Geladeira ao abrir o checkout e o desvio para o pedido pendente ([[checkout]]). A Geladeira vazia voltar à Geladeira é regra da spec, ainda fora do código.
- Cópia de trabalho principal compartilhada: outro terminal pode trocar a branch dela. Use worktree próprio e `git push origin <branch>`, nunca `git push HEAD`.
- Medição de tokens e fases: `docs/tokens/`; regras de contexto no CLAUDE.md.
- O stash `obsidian` é do Diego; nunca adicionar `docs/.obsidian`.
- O watch da API não reinicia quando muda o `.env`: reiniciar o processo.
- O cadastro de papéis do Maestri (`maestri role show`) está defasado; os arquivos de `.maestri/roles/` são a fonte real. Não usar `maestri role edit` (lição de 04/11).

## Próximo

1. Checkout: etapas Pagamento e Revisão, criar pedido no site e revalidação da Geladeira ([[checkout]], [[pagamento]]).
2. Admin: fatias 1 a 7 de [[admin]] (nenhuma rota existe ainda). O Back decide na fatia 7 o destino das tabelas de gateway que sobraram.
3. E-mail do pedido: fatias 1 e 2 de [[email-pedido]] com envio falso; o provedor espera o Diego.
4. Testes instáveis: acompanhar o E2E depois do #331.

## Pendências do Diego

Ver o cartão "Decisões pendentes" do canvas: provedor de e-mail (itens 4, 6 e 7), Geoapify (número do limite de endereço e cota), LB-8 (nuvem), item 20 (caminho local no histórico do repositório) e item 21 (hooks do context-mode).

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
