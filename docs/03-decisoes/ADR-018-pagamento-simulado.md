---
status: aceito
data: 2026-11-15
tags:
  - adr
---

# ADR-018: Pagamento simulado, só visual

> [!info] Status
> **Aceito** (decisão do Diego, 15/11). Substitui o [[ADR-004-mercado-pago]].

## Contexto

O Leguelé Beer é projeto de portfólio, sem venda real. O [[ADR-004-mercado-pago]] (proposto até o spike LB-54) previa o Mercado Pago em modo de testes, com conta, chaves, formulário seguro do gateway, avisos assinados (webhook) e, talvez, CPF. Em 15/11 o Diego decidiu que o pagamento não é real e que **tudo que envolve pagamento é só visual**.

## Decisão

- **Sem gateway de nenhum tipo:** nem real, nem simulado com lógica. Não há cobrança, webhook, aviso de pagamento, conta, chave, CPF nem dado de cartão.
- **Telas de pagamento só visuais:** Pix com um QR **inválido** (imagem decorativa, que não paga nada) e cartão de teste só na tela (os dados não saem do aparelho). Sem aviso de portfólio: segue a decisão do Diego de 30/10 ([[termos-privacidade]]).
- **O pedido não depende do pagamento:** criação "Aguardando pagamento", reserva, expiração em 30 minutos, status e estoque seguem como no [[checkout]]. A passagem para "Pago" é feita por uma ação do admin (recomendação vetável, ver [[pagamento]]).
- **Por último:** as telas de pagamento são o último item da implementação, fora do caminho do checkout, do pedido e de "Meus pedidos".

## Por quê

- Sem dinheiro e sem conta externa: custo zero, nenhum segredo de pagamento, nenhum dado de cartão ou CPF (LGPD mais simples).
- Sem lógica de pagamento, nada de idempotência de aviso nem aprovação tardia para manter.
- O resto da compra (pedido, reserva, expiração, status, estoque) continua demonstrável de ponta a ponta.

## Alternativas consideradas

| Opção | Por que não |
| --- | --- |
| Mercado Pago em modo de testes ([[ADR-004-mercado-pago]]) | Exige conta, chaves e webhook público; o Diego não quer pagamento real nem conta. |
| Gateway simulado com lógica dentro da API ("Simular pagamento") | O Diego quer o pagamento só visual, sem lógica de gateway nem fake. |

## Consequências

- Saem do MVP: o spike LB-54, a conta e as chaves de gateway, o endpoint de avisos com assinatura, a cobrança, o CPF e o formulário seguro de terceiros.
- A porta de gateway já criada na expiração (`PaymentGateway`) deixa de ter motivo; a remoção fica com o Back ([[pagamento]], "Ajustes no código já mergeado").
- Ligar um pagamento real no futuro exige um ADR novo e a revisão da Política de Privacidade.
