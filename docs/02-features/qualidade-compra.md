---
status: rascunho
modulo: qualidade
card-notion: https://app.notion.com/p/3fd490a7ac7d81f5bee1ef1b4055b50d
prioridade: P0
criado: 2026-11-14
issues:
  - "#90 LB-111"
  - "#91 LB-112"
tags:
  - feature
---

# Qualidade da compra: E2E de ponta a ponta e revisão de segurança

> [!info] Origem
> Item 9 da [[sequencia-telas]]. Derivada dos cards do Notion **LB-112** (#91, fluxo de compra completo com E2E) e **LB-111** (#90, revisão de autorização, validação e acesso ao banco), com o recorte do [[mvp-corte]]: E2E só do fluxo de compra e checklist de segurança básica (itens aplicáveis do OWASP Top 10, cabeçalhos de segurança e validação de entrada). Pack e Clube são Pós-MVP e saem do E2E. Spec fechada pelo Spec em modo autônomo ([[ADR-016-ciclo-continuo-da-banda]]); o que é do Diego está marcado como pendente. Os termos seguem o [[GLOSSARY]].

## História de usuário

- **Como** dono da loja (e quem avalia o portfólio)
- **Quero** que a compra inteira seja provada por testes automáticos e que a API e o banco resistam aos ataques básicos
- **Para** publicar sem medo de quebrar a compra ou expor dados de clientes

## Cenários

```gherkin
# language: pt
Funcionalidade: Qualidade da compra

  Cenário: Compra feliz de ponta a ponta
    Dado um cliente novo, maior de idade, com endereço em Maceió dentro da área de entrega
    Quando ele confirma a maioridade, põe 2 cervejas na Geladeira, cria a conta, paga com Pix e chega à API um aviso de aprovação assinado pelo gateway falso
    Então ele vê o pedido "Pago" em "Meus pedidos" e o admin vê o mesmo pedido na fila
    E, quando o admin avança o pedido até "Marcar como entregue", o cliente vê "Entregue"

  Cenário: Pix expira e o estoque volta
    Dado um pedido de Pix com a última unidade da "Graviola Witbier"
    Quando o relógio de teste daquele pedido passa dos 30 minutos
    Então o pedido aparece "Cancelado" para o cliente e a "Graviola Witbier" volta a aparecer disponível no catálogo

  Cenário: Rota sem proteção declarada
    Dado uma rota nova da API sem "@Public()" e sem papel declarado
    Quando o teste de inventário de rotas roda no CI
    Então ele falha e aponta o método e o caminho da rota

  Cenário: Acesso direto ao banco
    Dado a tabela de pedidos com pedidos semeados e um cliente logado com o próprio token
    Quando alguém, só com a chave anônima ou com o token desse cliente, tenta ler, gravar, alterar ou apagar pedidos pela Data API
    Então a requisição é recusada ou não devolve nenhuma linha, e os pedidos semeados continuam iguais

  Cenário: Entrada malformada
    Dado uma rota da API que recebe corpo, parâmetro ou query
    Quando ela recebe dados fora do schema
    Então responde 400 no formato de erro da API e o caso de uso não chega a ler nem gravar nada

  Cenário: Recurso de outro cliente
    Dado que o cliente A tem um pedido, um endereço e uma Geladeira com cervejas
    Quando o cliente B pede o pedido ou o endereço de A pelo id, tenta alterá-los, ou lê e altera a própria Geladeira
    Então a API responde 404 ao pedido e ao endereço de A, igual a um id inexistente, a Geladeira de A nunca aparece nem muda para B, e nada de A muda
```

## Regras de negócio

### E2E da compra (LB-112)

- **Fluxo coberto:** maioridade → catálogo → Geladeira → criar conta (com o e-mail de confirmação lido no Mailpit do ambiente de teste) → dados pessoais e endereço → checkout (Entrega, Pagamento, Revisão) → Pix → aviso de aprovação → confirmação → "Meus pedidos" → fila do admin → "Iniciar preparo" → "Saiu para entrega" → "Marcar como entregue" → "Entregue" para o cliente ([[maioridade-entrada]], [[catalogo]], [[geladeira]], [[cadastro-login]], [[dados-pessoais]], [[enderecos-entrega]], [[checkout]], [[pagamento]], [[pedidos-cliente]], [[admin]]).
- **Gateway falso:** no E2E o gateway é o fake da porta de [[pagamento]]; a aprovação chega por um aviso falso assinado com o segredo de teste, pelo mesmo endpoint público de avisos. Nada vai ao modo de testes real do gateway no CI.
- **Expiração:** pelo relógio adiantado do modo de testes, que só age no pedido do dono ([[pagamento]]); nunca esperar 30 minutos nem usar espera de tempo fixo.
- **Cartão no E2E:** os cenários de cartão aprovado e recusado já estão nos seams de [[pagamento]]; esta spec não os repete.
- **Dados isolados:** cada teste cria seu cliente, seu endereço e seus pedidos e não depende da ordem dos outros; o estoque usado é de uma cerveja só daquele teste, ou o teste confere o disponível antes e depois. Esperas sempre por estado na tela (texto, status), nunca por tempo fixo.
- **Viewport:** celular, 360 × 640, como os outros E2E (CLAUDE.md).
- **No CI a cada PR**, contra o build, como os E2E atuais.

### Revisão de segurança (LB-111)

- **Inventário de rotas:** um teste percorre todas as rotas registradas na API e falha se alguma não tiver `@Public()` ou papel declarado; a lista de rotas públicas esperadas fica no próprio teste, e rota pública nova muda essa lista no mesmo PR ([[ADR-009-guard-global-fechado]]).
- **Posse (IDOR):** para cada recurso do cliente com id na rota (endereços, pedidos, tela de pagamento, simular pagamento e relógio de teste), um teste de cliente B contra o recurso de A, na leitura e na escrita: 404 e nada muda. Os recursos da sessão, sem id na rota (perfil e dados pessoais, Geladeira), têm o teste de que B lê e altera só os próprios: os de A nunca aparecem nem mudam ([[ADR-009-guard-global-fechado]]). Rotas de admin com cliente comum: 403 ([[admin]]).
- **Validação:** toda entrada (corpo, parâmetros e query) passa por schema ([[ADR-010-validacao-com-zod]]); um teste por módulo manda entrada inválida e confere 400 sem nenhum acesso aos repositórios do caso de uso. A leitura do papel pelo guard ([[ADR-009-guard-global-fechado]], uma por requisição autenticada) é permitida e não conta.
- **Banco fechado por fora:** a Data API do Supabase não lê nem grava nenhuma tabela da loja, nem com a chave anônima nem com o token de um cliente logado (papéis `anon` e `authenticated`); nenhuma tabela da loja tem política que abra acesso a esses papéis (o armazenamento segue a política do [[ADR-017-fotos-com-sessao-do-admin]]); as tabelas da loja têm RLS ligada sem política (negar tudo), como segunda barreira, sem virar a camada principal de autorização ([[guards-api]], fora de escopo). A API acessa pelo Prisma com a conexão do servidor, como dona das tabelas, sem depender do RLS; por isso não se usa `FORCE ROW LEVEL SECURITY`, que barraria também a dona. A função do papel admin usada pela política do armazenamento ([[ADR-017-fotos-com-sessao-do-admin]]) roda como dona da tabela de perfis (`SECURITY DEFINER`, só leitura, com o `search_path` fixo), e assim continua lendo o papel com a tabela fechada.
- **Limite de requisições:** além do limite global da API, limites próprios na criação de pedido, na cobrança (Pix e cartão), em simular pagamento e no envio de foto do admin; o aviso do gateway não pode perder aviso legítimo por limite (o gateway reenvia, mas o limite dele fica acima do volume esperado). O login é do Supabase Auth, com os limites dele.

> [!todo] Preencher (Back, técnico): os números dos limites por rota, com a justificativa na descrição do PR.

- **Cabeçalhos:** API com Helmet e CORS só para a origem do site (já existem; o inventário confere). No site: `X-Content-Type-Options: nosniff`, `Referrer-Policy: strict-origin-when-cross-origin`, proibição de ser aberto em frame de outro site e HSTS em produção. A política de conteúdo (CSP) entra depois do spike LB-54, que define os domínios do formulário seguro do gateway.
- **Segredos só no servidor:** nenhum segredo em `NEXT_PUBLIC_*` nem no pacote do navegador; um teste do build procura as chaves de serviço, do gateway e do aviso no código entregue ao navegador e falha se achar.
- **Dependências:** `pnpm audit` no CI, falhando em vulnerabilidade alta ou crítica de dependência de produção. Vulnerabilidade nova sem correção disponível não pode travar PR alheio: entra numa lista de exceções versionada no repositório, cada uma com o id do aviso, o motivo, quem registrou e o prazo de revisão (no máximo 30 dias); exceção vencida volta a falhar o CI. A exceção sai no PR que atualiza a dependência.
- **Checklist OWASP:** o Reviewer passa os itens aplicáveis do OWASP Top 10 (controle de acesso, falhas de criptografia, injeção, configuração insegura, componentes vulneráveis, falhas de autenticação, falhas de log) e registra o resultado na descrição do PR da revisão, com o que ficou para o MVP+.
- **Quando rodar:** a revisão final roda antes de fechar o milestone "MVP" (CLAUDE.md, uso previsto do ultracode pelo Reviewer, só com autorização do Diego). Os testes desta spec entram antes, nas fatias abaixo, e valem em todo PR.

> [!warning] **Pendente de confirmação do Diego** (permissões de serviço, item 6): desligar a Data API ou mudar a exposição do schema no projeto Supabase de produção, **e** aplicar em produção a migration de RLS negar tudo (a migration roda pelo mesmo caminho em produção, então também muda permissões do serviço). No local e nos testes, a migration segue sem esperar; em produção, nenhuma das duas antes da resposta (cartão "Decisões pendentes"). O Back deixa a migration pronta e o Devops só a aplica em produção com o ok.

## Fora de escopo

- Pack (Mix & Match) e Clube no E2E: Pós-MVP ([[mvp-corte]]).
- Cupom: sem cupom no MVP ([[mvp-corte]], LB-53).
- Testes contra o modo de testes real do gateway no CI.
- Pentest externo, auditoria de acessibilidade (LB-113, fora do corte) e teste de carga.
- CSP antes do spike LB-54.

## Seams de teste

> [!info] Proposta do Spec, vetável

- **E2E** (Playwright, celular 360 × 640, build no CI): compra feliz de ponta a ponta e Pix expirado, com o gateway falso e o aviso assinado; utilitário de teste que monta e assina o aviso falso; utilitário que lê o e-mail de confirmação no Mailpit.
- **Inventário de rotas** (API, unitário sobre o app Nest montado): lê as rotas registradas e os metadados de acesso; falha apontando método e caminho. Visto falhando com um controller de teste sem declaração.
- **Posse** (HTTP, Supertest e banco real): matriz recurso × ação (ler, alterar, apagar) com dois clientes, com id para endereços e pedidos e pela sessão para perfil e Geladeira; admin com cliente comum, 403.
- **Validação** (HTTP): por módulo, entrada inválida responde 400 e nenhum repositório do caso de uso é chamado (espião nos repositórios); a leitura do papel pelo guard fica fora da contagem.
- **Banco fechado** (integração com o Supabase local): com linhas semeadas em cada tabela da loja, ler, gravar, alterar e apagar pela Data API com a chave anônima e com o token de um cliente logado: recusado ou zero linhas devolvidas, e as linhas semeadas conferidas iguais depois; teste que lista as tabelas da loja e falha se alguma estiver sem RLS ou tiver política para `anon`, `authenticated` ou `public` (o inventário não vale para o armazenamento, cuja política para `authenticated` existe de propósito e chama a função do admin, [[ADR-017-fotos-com-sessao-do-admin]]); a API segue lendo e gravando pelo Prisma e a política do armazenamento segue reconhecendo o admin.
- **Exceções do audit** (CI): exceção vencida faz o passo falhar; exceção no prazo deixa passar.
- **Limites** (HTTP): a requisição acima do limite da rota responde 429; o aviso do gateway no volume esperado nunca recebe 429.
- **Cabeçalhos** (E2E ou HTTP no build do site): os cabeçalhos da lista presentes na resposta da home.
- **Segredos** (build do site): busca das chaves no pacote do navegador.

## Fatias, com dono e ordem

| # | Card | Dono | O que entrega |
| --- | --- | --- | --- |
| 1 | LB-111 (#90) | Back | Inventário de rotas, matriz de posse e validação por módulo nos módulos que já existem |
| 2 | LB-111 (#90) | Back e Devops | RLS negar tudo nas tabelas (migration), teste da Data API no local, limites por rota |
| 3 | LB-111 (#90) | Front e Devops | Cabeçalhos do site, teste de segredos no build, `pnpm audit` no CI |
| 4 | LB-112 (#91) | Front | E2E da compra feliz e do Pix expirado, com os utilitários do aviso falso e do Mailpit |
| 5 | LB-111 (#90) | Reviewer | Checklist OWASP e revisão final antes de fechar o milestone "MVP" |

As fatias 1 a 3 podem andar já, sobre as rotas atuais, e cada módulo novo entra na matriz no próprio PR. A 4 depende dos itens 5 a 8 (checkout, pagamento, pedidos e admin) no site. A 5 vem por último.

Candidatos a ADR: nenhum (RLS como segunda barreira já está fora de escopo do [[guards-api]]; se o Back mudar a forma de acesso ao banco, avalia na fatia 2).

## Decisões relacionadas

- [[mvp-corte]], [[sequencia-telas]], [[guards-api]], [[testes-api]], [[api-base]]
- [[ADR-007-banco-de-teste]], [[ADR-009-guard-global-fechado]], [[ADR-010-validacao-com-zod]], [[ADR-012-sessao-em-cookies-httponly]], [[ADR-004-mercado-pago]]

## Decisões tomadas sem consulta

Recomendações aplicadas pelo Spec em 14/11; qualquer uma pode ser vetada.

- **E2E sem pack nem Clube** e sem cartão (já coberto em [[pagamento]]).
- **Compra até "Entregue"** passando pelas ações do admin.
- **Aviso falso assinado** pelo endpoint real, com o gateway fake.
- **RLS negar tudo como segunda barreira**, sem virar a autorização principal, sem `FORCE` e com a função do admin `SECURITY DEFINER`.
- **Limites próprios** em pedido, cobrança, simular pagamento e foto; números com o Back.
- **CSP só depois do spike LB-54.**
- **`pnpm audit`** falhando em alta ou crítica de produção, com exceção registrada e prazo de até 30 dias.
- **Testes de segurança nas fatias, revisão final antes do milestone.**

## Tickets propostos

Reconciliação das issues #90 e #91, a pedir ao Orchestrator depois do merge desta spec (aprovação permanente para reconciliar issue com spec mergeada): link para esta spec e o recorte (no #91, sem pack nem Clube e com o fluxo até "Entregue"; no #90, sem cupom, com RLS como segunda barreira e a Data API de produção pendente do Diego). Nenhuma issue nova.
