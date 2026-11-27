---
tags: [inbox, planejamento]
criado: 2026-11-27
---

# Plano de execução do fim do MVP (27/11)

Ordem do Diego em 27/11: completar **todas as telas** que faltam e terminar o projeto o quanto antes; ele só olha quando decidir e dá apontamentos. As contas Pro de todos bateram o limite de uso e retomam às 23:10, então o plano vale a partir daí. Este plano foi montado pelo Spec a partir do código da `main` em 27/11 e das specs; o Orchestrator distribui e ajusta.

## Estado em 27/11 (o que já existe)

- **API:** catálogo (lista, destaques, detalhe), perfil com data de nascimento (`/me/profile`), endereços (CRUD, padrão, frete), Geladeira (conta e validação), criar pedido (`POST /me/pedidos` com `Idempotency-Key`), "Confirmar pagamento" do admin, cron de expirar pedidos, `/health`. Mapas só no modo "não configurado" (503).
- **Site:** boas-vindas, maioridade, criar conta, entrar, recuperar senha, catálogo, produto, Geladeira (prateleiras, resumo, frete), Meus endereços (lista, novo com CEP, padrão, excluir), checkout Entrega e Pagamento (escolha do Pix), `/conta` mínima, `/admin` mínimo, Termos e Privacidade, home com herói, faixa de categorias e destaques.
- **Specs prontas:** [[checkout]], [[pagamento]], [[geladeira]], [[dados-pessoais]], [[pedidos-cliente]], [[acompanhar-pedido]], [[admin]], [[email-pedido]], [[enderecos-entrega]], [[erros-e-vazios]], [[qualidade-compra]], [[home-topo]]. Em PR: [[api-vercel]] (#366). Nenhuma spec nova falta para as telas; o "admin por fatia" e o "perfil" estão em [[admin]] (fatias 1 a 7) e [[dados-pessoais]] (fatias 1 a 4), ambos prontos.

## Regras para o paralelismo seguro

1. **Dono por área, sem tocar na do outro.** Back: `apps/api`, `packages/shared` e `apps/api/prisma`. Front: `apps/web` (inclui `apps/web/e2e`). Devops: `.github`, `vercel.json`, `docs/04-arquitetura` e deploy. Spec e Orchestrator: `docs/`.
2. **API antes da tela.** O Front só começa uma tela que lê dado depois de o Back mergear o contrato (`@leguele/shared`) e a rota. Enquanto espera, o Front pega uma tarefa de "só site" (marcadas "livre" abaixo).
3. **Contrato em PR próprio e primeiro**, só do Back, em `packages/shared`. O Front nunca edita `packages/shared`; se precisar de campo, pede ao Back.
4. **Uma migration por vez.** Só o Back mexe em `prisma/migrations`, e uma branch de migration de cada vez (evita conflito de ordem). Migration aditiva.
5. **Um PR por assunto, sem empilhar** (lição de 21/11): PR filho só depois do merge do pai, a partir da `main`.
6. **Dados de E2E isolados** por teste; o Back mantém os endpoints de apoio do E2E (criar pedido em um status) e o Front os usa.
7. **Reviewer** revisa cada PR antes do merge (ADR-006); **Codex** faz a auditoria final da ordem.

## A ordem de entrega

Legenda: **livre** = só site ou só API, sem esperar o outro; **A→F** = o Front espera a API.

### Onda 0: destrava tudo (Back e Devops, em paralelo)

| # | Entrega | Dono | Depende de | Spec | Área |
| --- | --- | --- | --- | --- | --- |
| 0.1 | **Adaptador local de mapas** (coordenadas aproximadas e distância em linha reta; "Fora da área" para Alagoas fora do raio) no lugar do `UnconfiguredMaps` | Back | nada | [[enderecos-entrega]] (fatia 4b) | `apps/api` |
| 0.2 | **Entrada serverless** da API (`/live`, Swagger desligado em produção, `trust proxy`, `WEB_ORIGIN`) | Back e Devops | nada | [[api-vercel]] (fatias 1 e 2) | `apps/api`, `vercel.json` |
| 0.3 | **Adaptador de e-mail de desenvolvimento** (Mailpit local ou envio falso), atrás da porta | Back | nada (o "Confirmar pagamento" já está na `main`) | [[email-pedido]] (fatia 1) | `apps/api` |

Sem a 0.1, salvar endereço não funciona fora dos testes: ela vem primeiro.

### Onda 1: contratos e leituras do pedido (Back) e telas que não dependem de API nova (Front)

| # | Entrega | Dono | Depende de | Spec | Tipo |
| --- | --- | --- | --- | --- | --- |
| 1.1 | **Contrato** do pedido do cliente (lista, leitura, status e rótulos, histórico com data) | Back | nada | [[pedidos-cliente]] (1), [[acompanhar-pedido]] (1) | só `packages/shared` |
| 1.2 | **API de leitura:** lista paginada e um pedido do cliente (com histórico), expiração sob demanda | Back | 1.1 | [[pedidos-cliente]] (2), [[acompanhar-pedido]] (1) | `apps/api` |
| 1.3 | **Baixa pendente da Geladeira** ao criar o pedido e baixa única ao confirmar o pagamento | Back | nada | [[pedidos-cliente]] (5) | `apps/api` |
| 1.4 | **Perfil:** `/conta/dados-pessoais` com data de nascimento, telefone e e-mail só leitura, links em `/conta` e texto novo de `/privacidade` | Front | nada (API e contrato já na `main`) | [[dados-pessoais]] (3) | livre |
| 1.5 | **Geladeira: adicionar na página** (lista da categoria pela garrafa fantasma, "Leguelé Beer" na base da moldura) | Front | nada | [[geladeira]] | livre |
| 1.6 | **Cabeçalho da home com o logo** e fatia 2 do topo | Front | nada | [[home-topo]] | livre |
| 1.7 | **404, erro e estados de falha** (`not-found`, `error`, `global-error`, padrão de falha) | Front | nada | [[erros-e-vazios]] | livre |

### Onda 2: o checkout e o pedido (Front depende da API da onda 1)

| # | Entrega | Dono | Depende de | Spec | Tipo |
| --- | --- | --- | --- | --- | --- |
| 2.1 | **Checkout Revisão** e **criar pedido** pelo site (com `Idempotency-Key`, maioridade e o desvio do convidado) | Front | 0.1, 1.4 (data de nascimento), `POST /me/pedidos` na `main` | [[checkout]] (5), [[dados-pessoais]] (4) | A→F |
| 2.2 | **Tela do Pix** `/pedido/[id]/pagamento`: QR decorativo, contagem de 30 min, expirado e cancelado, aviso e "Voltar" | Front | 1.2 | [[pagamento]] (2) | A→F |
| 2.3 | **Cartão de teste**, parcelas e "Pagamento em análise" | Front | 2.1 | [[pagamento]] (3) | livre (sobre 2.1) |
| 2.4 | **Pedido confirmado** `/pedido/[id]/confirmado` | Front | 1.2, 1.3 | [[pedidos-cliente]] (4) | A→F |
| 2.5 | **Meus pedidos** `/conta/pedidos` (lista paginada, vazio, erro) e o link em `/conta` | Front | 1.2 | [[pedidos-cliente]] (3) | A→F |
| 2.6 | **Acompanhar pedido** `/conta/pedidos/[id]` (linha do tempo, endereço, resumo) e o toque em "Meus pedidos" | Front | 1.2 (com histórico), 2.5 | [[acompanhar-pedido]] (2) | A→F |

### Onda 3: admin (as fatias de [[admin]]; Back e Front por fatia, a API antes)

| # | Entrega | Dono | Depende de | Fatia de [[admin]] |
| --- | --- | --- | --- | --- |
| 3.1 | **Contrato do admin** (cerveja, ajuste de estoque, configurações de entrega, slug) | Back | nada | 1 |
| 3.2 | **Layout do admin** (LB-72): menu, início com alertas, "não encontrada" em `/admin/*` | Front | 3.1 (alertas vêm da API: pode começar sem os contadores) | 2 |
| 3.3 | **Produtos (LB-73):** API de cadastro e edição com limite de 4 por categoria, bucket e política das fotos | Back | 3.1 | 3 |
| 3.4 | **Produtos, tela:** lista, formulário, foto em WebP e prévia | Front | 3.3, 3.2 | 4 |
| 3.5 | **Estoque (LB-75):** movimentos (migration), ajuste com trava, histórico e **retrofit** dos movimentos de venda e cancelamento; depois a tela | Back, depois Front | 3.1 | 5 |
| 3.6 | **Regras de entrega (LB-77):** rotas, simulador e a tela | Back, depois Front | 3.1, 0.1 | 6 |
| 3.7 | **Pedidos do admin (LB-76):** fila, detalhe, transições, cancelar e o botão "Confirmar pagamento" | Back, depois Front | 3.2, 3.5 (movimentos), 1.2 | 7 |

### Onda 4: deploy e qualidade (Devops, Reviewer, Codex)

| # | Entrega | Dono | Depende de | Spec |
| --- | --- | --- | --- | --- |
| 4.1 | **Fumaça do primeiro deploy** e variáveis na plataforma | Devops | 0.2 e as ações do Diego (ligar a Vercel ao GitHub, Supabase de produção) | [[api-vercel]] (3), [[ADR-021-merge-vira-deploy-na-vercel]] |
| 4.2 | **Revisão de segurança e checklist OWASP** | Reviewer | ondas 1 a 3 | [[qualidade-compra]] |
| 4.3 | **E2E da compra de ponta a ponta** (até "Entregue") | Front, com o Back nos endpoints de apoio | 2.1 a 2.6, 3.7 | [[qualidade-compra]] |
| 4.4 | **Auditoria final** e fechamento do milestone | Codex e Orchestrator | tudo | CLAUDE.md |

## Quem faz o quê ao mesmo tempo

Depois das 23:10, três trilhas rodam em paralelo sem pisar uma na outra:

- **Back:** 0.1, 0.2 (parte API), 1.1, 1.2, 1.3, 0.3 e depois 3.1, 3.3, 3.5, 3.6, 3.7 (API).
- **Front:** 1.4, 1.5, 1.6, 1.7 (livres), depois 2.1 a 2.6 conforme a API da onda 1 for mergeando, depois as telas do admin.
- **Devops:** 0.2 (`vercel.json`), 4.1 e o que o Diego liberar; sobra para apoiar o CI.

Gargalo: **1.2** (leitura do pedido) destrava 2.2, 2.4, 2.5 e 2.6; o Back o faz logo depois da 0.1 e antes do admin.

## O que depende do Diego (não bloqueia as ondas 0 a 3)

- Ligar a Vercel ao GitHub, o primeiro deploy e o banco Supabase de produção (4.1), conforme o [[ADR-021-merge-vira-deploy-na-vercel]].
- Provedor real de e-mail e adaptador real de mapas: **pós-MVP**, fora deste plano.
- Arte do herói: segue provisória.

## Estados vazios e telas já cobertas

Geladeira vazia, catálogo sem resultado, "Meus endereços" sem endereço e home sem destaques já existem. Os de "Meus pedidos" (2.5), do admin (3.x) e a regra comum de falha entram com as telas e com a 1.7. Nenhum estado vazio fica sem tarefa.

## Riscos

- **Limite de uso** das contas: mandar PRs pequenos e um por assunto; o Orchestrator reparte as trilhas por janela.
- **Conflito de `packages/shared`**: só o Back mexe nele; contratos antes das telas.
- **Fila de migrations**: 1.3, 3.5 e outras que mexem no schema entram uma por vez.
- **E2E instáveis**: dados isolados e espera por estado (lição de 14/11).
