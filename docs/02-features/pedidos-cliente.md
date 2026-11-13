---
status: pronto
modulo: pedidos
card-notion: https://app.notion.com/p/3fd490a7ac7d81fb8dbbd75adec3634e
prioridade: P0
criado: 2026-11-13
issues:
  - "#37 LB-61"
  - "#108 LB-67"
tags:
  - feature
---

# Pedido confirmado e Meus pedidos

> [!info] Origem
> Item 7 da [[sequencia-telas]]. Derivada dos cards do Notion **LB-61** (#37, tela de pedido confirmado) e **LB-67** (#108, histórico de pedidos do cliente, no escopo reduzido do [[mvp-corte]]: lista com status, sem tempo real), e das telas 08 (Pedido confirmado) e 13 (Histórico de pedidos). A tela 09 (Acompanhar pedido) fica fora: o detalhe com linha do tempo (LB-68) é MVP+ e o tempo real (LB-69) é Pós-MVP. O e-mail de confirmação (LB-81, #103) depende da escolha de um provedor e fica como ponto em aberto. O pedido nasce no checkout (item 5, [[checkout]], LB-56) e é pago no item 6 (Pix e cartão); esta spec só lê pedidos. Os termos seguem o [[GLOSSARY]].

As perguntas de produto foram ao Diego em 13/11 pelo Orchestrator; as respostas estão em "Decisões do Diego (13/11)".

## História de usuário

- **Como** cliente
- **Quero** ver a confirmação logo depois de pagar e, depois, a lista dos meus pedidos com o status de cada um
- **Para** ter certeza de que a compra deu certo e saber em que pé está cada pedido

## Cenários

```gherkin
# language: pt
Funcionalidade: Pedido confirmado e Meus pedidos

  Cenário: Confirmação de um pedido pago
    Dado que entrei na conta com 3 Maré Alta e 2 Cupuaçu Ale na Geladeira
    E criei o pedido "#LB482731" com subtotal de R$ 141,40 e frete de R$ 13,00
    Quando o pagamento do pedido é aprovado e chego a "/pedido/<id>/confirmado"
    Então vejo "Pedido confirmado!", o número "#LB482731", a data e a hora do pedido, "5 itens", o subtotal R$ 141,40, o frete R$ 13,00 e o total R$ 154,40
    E a Geladeira da conta não tem mais as cervejas do pedido, e o contador da barra inferior mostra 0

  Cenário: Pedido ainda aguardando pagamento
    Dado que tenho um pedido "Aguardando pagamento" de Pix ainda válido
    Quando abro "/pedido/<id>/confirmado"
    Então sou levado à tela de pagamento desse pedido (item 6)
    E as cervejas do pedido continuam na Geladeira

  Cenário: Confirmação de pedido de outro cliente
    Dado que o cliente B tem um pedido pago
    Quando eu, cliente A, abro "/pedido/<id do pedido de B>/confirmado"
    Então vejo a página "não encontrada"
    E nada do pedido de B aparece

  Cenário: Meus pedidos do mais recente ao mais antigo
    Dado que fiz 3 pedidos: "#LB111111" em 01/11/2026 (Entregue), "#LB222222" em 05/11/2026 (Cancelado) e "#LB333333" em 10/11/2026 (Em preparo)
    Quando abro "Meus pedidos" em "/conta"
    Então vejo os 3 pedidos na ordem "#LB333333", "#LB222222", "#LB111111"
    E cada um mostra a data e a hora, o selo do status, a quantidade de itens, as cervejas e o total

  Cenário: Meus pedidos sem nenhum pedido
    Dado que nunca fiz um pedido
    Quando abro "Meus pedidos"
    Então vejo "Você ainda não fez nenhum pedido."
    E o botão "Ver catálogo" me leva a "/catalogo"

  Cenário: A API só devolve os meus pedidos
    Dado que o cliente B tem 2 pedidos e eu, cliente A, tenho 1
    Quando peço à API a minha lista de pedidos e o pedido de B pelo id
    Então a lista traz só o meu pedido
    E o pedido de B responde "não encontrado"
```

## Regras de negócio

### Pedido e status

- **Número do pedido:** "#LB" seguido de 6 dígitos (ex.: "#LB482731"), sorteado e único, mostrado ao cliente e ao admin. É diferente do id do pedido, que vai na URL e não pode ser adivinhado. Decisão vetável (ver "Decisões tomadas sem consulta").
- **Status do pedido**, os mesmos para o cliente e o admin (LB-76, item 8):

  | Status | Quando | Selo |
  | --- | --- | --- |
  | Aguardando pagamento | pedido criado, pagamento ainda não aprovado ([[checkout]], LB-56) | neutro |
  | Pago | pagamento aprovado (item 6, LB-59) | sucesso |
  | Em preparo | o admin iniciou o preparo (LB-76) | atenção |
  | Saiu para entrega | o admin despachou (LB-76) | informação |
  | Entregue | o admin marcou a entrega (LB-76) | sucesso |
  | Cancelado | Pix expirado (LB-60) ou cancelado pelo admin (LB-76) | neutro, apagado |

  As cores saem dos tokens existentes do `globals.css`; se faltar uma, o Front cria o token e o mostra em `/dev/tokens`. O Pix expirado vira "Cancelado" (pergunta 5).
- **Itens do pedido:** nome, preço e quantidade gravados no pedido no momento da compra (snapshot do LB-56). Uma cerveja renomeada, com preço novo ou desativada depois continua com o nome e o preço da compra nas telas desta spec.
- **Quantidade de itens:** soma das unidades ("1 item", "5 itens").
- **Datas:** dia e hora em que o pedido foi criado, no fuso de Maceió (America/Maceio), no formato "12/11/2026 • 21:42".
- **Valores:** subtotal, frete ("Grátis" quando zero) e total, como gravados no pedido. Cupom é MVP+: sem linha de desconto.

### Pedido confirmado (LB-61, tela 08)

- **Rota** `/pedido/[id]/confirmado`. Exige conta (sem sessão, vai a `/entrar` e volta depois, como em [[cadastro-login]]).
- **Só para pedido pago:** a tela aparece quando o pedido está "Pago" ou em qualquer status depois dele (Em preparo, Saiu para entrega, Entregue). Pedido "Aguardando pagamento" leva à tela de pagamento desse pedido (item 6); pedido "Cancelado" leva a "Meus pedidos" (pergunta 2).
- **Posse:** pedido de outro cliente ou id inexistente mostra a página "não encontrada" (404), sem dizer se o pedido existe.
- **Conteúdo, de cima para baixo:**
  - título "Pedido confirmado!" e o texto "Pagamento aprovado! Seu pedido já está com a gente. Acompanhe o status em Meus pedidos." (pergunta 3);
  - número do pedido e data e hora;
  - sem previsão de entrega (pergunta 1: o prazo, LB-65, está fora do MVP);
  - resumo: quantidade de itens, cervejas com quantidade (ex.: "3× Maré Alta IPA"), subtotal, frete e total;
  - botões "Meus pedidos" (primário, leva a `/conta/pedidos`) e "Voltar ao catálogo" (secundário, leva a `/catalogo`).
- **Recarregar** a página mostra a mesma confirmação enquanto o pedido existir; ela não depende de um estado guardado no navegador.
- **Geladeira depois do pagamento:** quando o pagamento é aprovado (item 6), a API tira da Geladeira da conta as cervejas do pedido, nas quantidades do pedido; o que o cliente pôs na Geladeira depois de criar o pedido continua lá. Na confirmação, o site lê a Geladeira de novo, e o contador da barra inferior mostra o que sobrou. Enquanto o pedido aguarda pagamento, a Geladeira não muda, para o cliente tentar de novo se o Pix expirar.

### Meus pedidos (LB-67, tela 13)

- **Rota** `/conta/pedidos` ("Meus pedidos"), aberta pelo link "Meus pedidos" em `/conta` e pelo botão da confirmação. Exige conta.
- **Lista** dos pedidos do cliente da sessão, do mais recente ao mais antigo (data de criação), inclusive os "Aguardando pagamento" e os "Cancelado".
- **Cada pedido mostra:** número, data e hora, selo do status, quantidade de itens, os nomes das duas primeiras cervejas (com "e mais N" quando houver mais) e o total. O pedido não é tocável: o detalhe com linha do tempo é o LB-68 (MVP+).
- **Paginação:** 20 pedidos por vez; com mais, o botão "Carregar mais" traz os 20 seguintes no fim da lista, sem repetir nem pular pedido.
- **Vazio:** "Você ainda não fez nenhum pedido." e o botão "Ver catálogo" (`/catalogo`).
- **Erro ao carregar:** "Não foi possível carregar seus pedidos." e o botão "Tentar de novo".
- **Carregando:** skeleton de 3 cards.
- Sem filtros por status, sem "Comprar novamente", sem "Acompanhar pedido" e sem o banner do Clube (pergunta 4).

### API

- **Lista:** rota do cliente que devolve só os pedidos do cliente da sessão, 20 por página, do mais recente ao mais antigo, com número, data, status, quantidade de itens, nomes das cervejas e total. O formato da paginação (cursor ou página) é do Back, desde que a ordem seja estável com pedidos criados no mesmo segundo.
- **Um pedido:** rota do cliente que devolve um pedido do cliente da sessão, com itens e valores; pedido de outro cliente ou inexistente responde 404.
- Sem token, 401 ([[guards-api]]). Os dados do pedido de outro cliente nunca aparecem na resposta nem no log.

### E-mail de confirmação (LB-81, ponto em aberto)

> [!todo] Preencher: provedor de e-mail
> O [[mvp-corte]] deixa no MVP só o e-mail de confirmação do pedido, enviado de forma síncrona pela API de um provedor com plano gratuito ([[ADR-002-hospedagem-api]]: sem fila). Criar conta num provedor é decisão do Diego (custos e contas). Quando ele escolher, o LB-81 ganha spec própria: envio ao aprovar o pagamento, falha do provedor sem afetar o pedido nem a confirmação, um e-mail só por pedido mesmo com aprovação repetida, e o texto da tela 08 pode passar a citar o e-mail.

## Fora de escopo

- Tela 09 (Acompanhar pedido), detalhe com linha do tempo (LB-68, MVP+) e status em tempo real (LB-69, Pós-MVP).
- E-mail de confirmação (LB-81) até a escolha do provedor; WhatsApp.
- Filtros por status ou período, "Comprar novamente", pedidos do Clube e banner do Clube.
- Cupom e desconto de assinante.
- Cancelar pedido pelo cliente.

## Referência visual

- **Tela 08:** ícone de confirmação, título em Kaushan Script, cards de número e data, resumo com subtotal, frete e total, e o card "Agora é só esperar!". Sem "Acompanhar pedido" (vira o botão "Meus pedidos"), sem "Ver detalhes dos produtos" (as cervejas aparecem no próprio resumo), sem linha de cupom e sem a promessa de e-mail e WhatsApp. A barra inferior da loja aparece com Início, Catálogo, Geladeira e Conta, como no resto da loja.
- **Tela 13:** título "Meus pedidos" com voltar para `/conta`, cards com número, data, selo de status, quantidade e total. Sem chips de filtro, sem fotos das garrafas, sem "Comprar novamente", "Acompanhar pedido" e "Ver detalhes", e sem o banner do Clube.
- Normalizado ao padrão aprovado (regra da revisão em [[sequencia-telas]]).

## Seams de teste

> [!info] Proposta do Spec, vetável

- **Contrato** (shared, unitário): a lista de status com os rótulos, o texto da quantidade ("1 item", "5 itens"), o "e mais N" das cervejas e a data no fuso de Maceió (inclusive um pedido às 23:30 de Maceió, que em UTC já é o dia seguinte).
- **Leitura de pedidos** (API): casos de uso com repositório em memória (ordem do mais recente, paginação de 20 com 21 e 41 pedidos, pedidos no mesmo segundo); rotas com Supertest e banco real (sem token 401, pedido de outro cliente 404, lista só com os do cliente da sessão). Pedidos criados direto no banco de teste, sem depender do checkout.
- **Geladeira ao aprovar** (API, entra com o item 6): caso de uso com repositório em memória: tira as cervejas do pedido nas quantidades do pedido e mantém o que entrou depois.
- **Telas** (componente): confirmação com frete e com "Grátis"; lista com os 6 status, vazia, com erro e com "Carregar mais".
- **E2E** (celular, 360 × 640): confirmação de um pedido pago criado pela API de teste; pedido aguardando pagamento redireciona; pedido de outro cliente dá 404; "Meus pedidos" com 3 pedidos e vazio.

## Fatias, com dono e ordem

| # | Card | Dono | O que entrega |
| --- | --- | --- | --- |
| 1 | Contrato (LB-61, LB-67) | Back | PR só em `@leguele/shared`: status e rótulos, schema da lista e do pedido, quantidade de itens, data no fuso de Maceió |
| 2 | LB-67 (#108), API | Back | Lista paginada e leitura de um pedido do cliente da sessão, sobre o modelo de pedido do LB-56 (item 5) |
| 3 | LB-67 (#108), site | Front | `/conta/pedidos` e o link "Meus pedidos" em `/conta` |
| 4 | LB-61 (#37), site | Front | `/pedido/[id]/confirmado`, com os desvios para pagamento, "Meus pedidos" e 404 |
| 5 | LB-61 (#37), API | Back | Tirar da Geladeira as cervejas do pedido ao aprovar o pagamento; entra com o webhook do item 6 (LB-59) |

A fatia 2 depende do modelo de pedido do item 5 (LB-56). A 3 depende da 2; a 4, da 2 e da tela de pagamento do item 6. A 5 entra no PR do webhook (item 6).

Candidatos a ADR: nenhum.

## Decisões relacionadas

- [[checkout]], [[geladeira]], [[enderecos-entrega]], [[dados-pessoais]], [[cadastro-login]], [[guards-api]]
- [[mvp-corte]], [[sequencia-telas]], [[ADR-002-hospedagem-api]], [[ADR-009-guard-global-fechado]], [[ADR-010-validacao-com-zod]]

## Decisões do Diego (13/11)

Perguntas levadas pelo Orchestrator. Resposta do Diego: "todas as recomendadas".

1. **Previsão de entrega na confirmação: A.** Sem previsão: o prazo de entrega (LB-65) está fora do MVP, e o texto fixo (B) só valeria com um prazo dado pelo Diego.
2. **Quando a confirmação aparece: A.** Só com o pagamento aprovado; pedido aguardando volta à tela do pagamento; a Geladeira muda só quando o pagamento é aprovado.
3. **Texto do topo da tela 08: A.** "Pagamento aprovado! Seu pedido já está com a gente. Acompanhe o status em Meus pedidos." Sem promessa de e-mail nem WhatsApp.
4. **Escopo de "Meus pedidos": A.** Só o do card, com os nomes das duas primeiras cervejas e o pedido não tocável; sem chips de status, sem "Comprar novamente", sem "Acompanhar pedido" e sem o banner do Clube.
5. **Pix expirado: A.** Vira "Cancelado"; são 6 status (Aguardando pagamento, Pago, Em preparo, Saiu para entrega, Entregue, Cancelado).

As decisões vetáveis abaixo ficam valendo (confirmado pelo Diego em 13/11).

## Decisões tomadas sem consulta

Recomendações aplicadas pelo Spec em 13/11.

- **Número do pedido** "#LB" + 6 dígitos sorteados e únicos, separado do id não adivinhável da URL.
- **"Acompanhar pedido" da tela 08 vira "Meus pedidos"**, porque a tela 09 está fora.
- **Geladeira ao aprovar:** a API tira só as cervejas do pedido, nas quantidades do pedido; o que entrou depois fica.
- **Pedido cancelado** na URL da confirmação leva a "Meus pedidos".
- **Lista inclui pedidos aguardando pagamento e cancelados.**
- **Datas no fuso de Maceió**, no formato "12/11/2026 • 21:42".
- **Textos novos:** "Pedido confirmado!", "Meus pedidos", "Voltar ao catálogo", "Você ainda não fez nenhum pedido.", "Ver catálogo", "Não foi possível carregar seus pedidos.", "Tentar de novo", "Carregar mais", "1 item"/"N itens" e "e mais N".

## Tickets propostos

Reconciliação das issues #37 e #108, a pedir ao Orchestrator depois do merge desta spec (aprovação permanente para reconciliar issue com spec mergeada): link para esta spec, os cenários e as regras de cada card; no #37, "Acompanhar pedido" vira "Meus pedidos" e a fatia 5 entra com o webhook (LB-59); no #108, sem filtros e sem pedidos do Clube. O #103 (LB-81) recebe uma nota de que espera a escolha do provedor. Nenhuma issue nova.
