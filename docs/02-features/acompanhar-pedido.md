---
status: pronto
modulo: pedidos
card-notion:
prioridade: P1
criado: 2026-11-27
issues:
  - "#108 LB-67"
tags:
  - feature
---

# Acompanhar pedido

> [!info] Origem
> Ordem do Diego em 27/11: completar todas as telas, inclusive a tela 09 do design (`Imagens/figma/telas/09-acompanhar-pedido.png`), que [[pedidos-cliente]] deixara fora (linha do tempo, LB-68, MVP+). Esta spec a traz para o MVP, **sem tempo real** (LB-69 segue Pós-MVP): a tela lê o pedido ao abrir. Ela muda duas decisões de [[pedidos-cliente]]: em "Meus pedidos" os pedidos que não estão "Aguardando pagamento" passam a ser tocáveis e levam a esta tela; e a tela 09 sai do "Fora de escopo". O resto de [[pedidos-cliente]] vale como está.

## História de usuário

- **Como** cliente
- **Quero** abrir um pedido e ver em que etapa ele está
- **Para** saber se já foi preparado, saiu para entrega ou chegou

## Cenários

```gherkin
# language: pt
Funcionalidade: Acompanhar pedido

  Cenário: Pedido em preparo
    Dado um pedido meu "Em preparo", pago às 21:42 e iniciado o preparo às 22:10
    Quando abro o pedido em "Meus pedidos"
    Então vejo o número, o selo "Em preparo" e a linha do tempo com "Pedido recebido" e "Preparação" concluídos, com data e hora
    E "Em envio" e "Entregue" aparecem como próximas etapas, sem data

  Cenário: Pedido entregue
    Dado um pedido meu "Entregue"
    Quando abro o pedido
    Então as 4 etapas aparecem concluídas, cada uma com a data e a hora em que aconteceu

  Cenário: Pedido cancelado
    Dado um pedido meu "Cancelado"
    Quando abro o pedido
    Então vejo o selo "Cancelado" e uma linha do tempo que termina em "Pedido cancelado", sem o motivo do cancelamento

  Cenário: Pedido aguardando pagamento
    Dado um pedido meu "Aguardando pagamento" dentro da validade
    Quando toco nele em "Meus pedidos"
    Então abro a tela de pagamento do pedido, como antes, e não esta tela

  Cenário: Endereço e resumo do pedido
    Dado um pedido meu com 5 itens, subtotal de R$ 141,40, frete de R$ 12,90 e total de R$ 154,30
    Quando abro o pedido
    Então vejo o endereço de entrega guardado no pedido, os itens com quantidade e preço da compra e o resumo com subtotal, frete e total

  Cenário: Pedido de outro cliente
    Dado um pedido de outro cliente
    Quando abro o endereço dele
    Então vejo "Página não encontrada" e nenhum dado do pedido aparece
```

## Regras de negócio

- **Rota** `/conta/pedidos/[id]`, aberta tocando num pedido de "Meus pedidos" (qualquer status, exceto "Aguardando pagamento", que continua levando à tela de pagamento, [[pagamento]]). Exige conta. Título "Acompanhar pedido", voltar para "Meus pedidos".
- **Cabeçalho do pedido:** número ("Pedido #LB…"), data e hora de criação e o selo do status, os mesmos de [[pedidos-cliente]].
- **Linha do tempo** com as 4 etapas do pedido normal, nesta ordem: "Pedido recebido" (o pedido ficou "Pago"), "Preparação" ("Em preparo"), "Em envio" ("Saiu para entrega") e "Entregue". Cada etapa concluída mostra a data e a hora do **histórico de status** do pedido (a data em que o pedido entrou naquele status, no fuso de Maceió); as que ainda não aconteceram aparecem apagadas, com "Aguardando atualização" ou "Aguardando entrega" (textos do design). A etapa atual é a última concluída.
- **Textos de cada etapa** (do design, vetáveis): "Pedido recebido: Seu pedido foi confirmado e já está na nossa fila."; "Preparação: Estamos separando seus produtos com todo cuidado."; "Em envio: Seu pedido saiu para entrega."; "Entregue: Seu pedido chegou ao seu endereço." Os textos do design que citam "transportadora" e "chegará em breve" saem: a entrega é da própria cervejaria e não há previsão.
- **Cancelado:** a linha do tempo mostra o que aconteceu até ali e termina em "Pedido cancelado", com a data. O motivo do cancelamento é interno e **nunca** aparece ao cliente ([[admin]]).
- **Sem previsão de entrega** e sem cupom (pergunta 1 de [[pedidos-cliente]]): o bloco "Previsão de entrega" do design não entra; o endereço de entrega entra sozinho, com apelido (se houver), rua, número, bairro, cidade, UF e CEP, a **cópia guardada no pedido**.
- **Resumo do pedido:** itens (nome, quantidade e preço da compra), subtotal, frete e total, como na tela 08; sem a linha de desconto de cupom.
- **Bloco "Tá chegando!"** do design vira um convite simples: "Que tal dar uma olhada no nosso catálogo?" com o botão "Ver catálogo". Texto novo, vetável (marca, item 2 da política).
- **Sem tempo real:** a tela lê o pedido ao abrir e tem o botão "Atualizar"; sem WebSocket nem som ([[ADR-002-hospedagem-api]]).
- **Posse:** a rota usa a leitura de um pedido do cliente da sessão de [[pedidos-cliente]]; pedido de outro cliente ou inexistente responde 404 e a tela mostra a página "não encontrada" ([[erros-e-vazios]]). Nada de outro cliente aparece na resposta nem no log.
- **Carregando e erro:** skeleton do cabeçalho e da linha do tempo; erro: "Não foi possível carregar este pedido." e "Tentar de novo".

## Fora de escopo

- Previsão de entrega, transportadora, rastreio, "Comprar novamente", cupom, chat e WhatsApp.
- Status em tempo real (LB-69, Pós-MVP).
- Cancelar o pedido pelo cliente.

## Referência visual

- **Tela 09:** título em Kaushan Script, cartão do pedido com o selo, linha do tempo com 4 etapas, endereço e resumo. Sem "Previsão de entrega", sem a linha de cupom e sem "Mix & Match" e "Carrinho" na barra inferior (a barra da loja de [[catalogo]]). Normalizada ao padrão aprovado ([[identidade-visual]]).

## Seams de teste

> [!info] Proposta do Spec, vetável

- **Leitura do pedido com o histórico** (API, unitário e integração com banco real): a resposta traz, por pedido, a lista de mudanças de status com data; o pedido de outro cliente responde 404 e o log não traz dado pessoal.
- **Linha do tempo** (componente): etapas concluídas com data, próximas apagadas, o caso "Cancelado" e o texto sem motivo.
- **E2E** (celular, 360 × 640): um pedido "Em preparo" criado pela API de teste aparece com as etapas certas; tocar nele em "Meus pedidos" abre esta tela; o "Aguardando pagamento" abre o pagamento.

## Fatias, com dono e ordem

| # | Card | Dono | O que entrega |
| --- | --- | --- | --- |
| 1 | LB-67 (#108) | Back | A leitura de um pedido de [[pedidos-cliente]] (fatia 2 dela) devolve também o histórico de status com data, sem o motivo |
| 2 | LB-67 (#108) | Front | `/conta/pedidos/[id]` com a linha do tempo, o endereço e o resumo, e o toque em "Meus pedidos" que leva a ela |

A fatia 1 vem depois da fatia 2 de [[pedidos-cliente]] (a leitura do pedido).

Candidatos a ADR: nenhum.

## Decisões relacionadas

- [[pedidos-cliente]], [[pagamento]], [[admin]], [[erros-e-vazios]], [[identidade-visual]]

## Decisões tomadas sem consulta

Recomendações do Spec em 27/11, por ordem do Diego de completar todas as telas; qualquer uma pode ser vetada.

- **Sem previsão de entrega, sem cupom e sem rastreio**, como em [[pedidos-cliente]].
- **Textos das etapas** do design, com "transportadora" e "chegará em breve" trocados.
- **Motivo do cancelamento nunca aparece ao cliente.**
- **O "Aguardando pagamento" continua levando ao pagamento.**
