---
status: aceito
data: 2026-11-16
tags:
  - adr
---

# ADR-020: Pagamento só visual, com aviso de projeto sem fins lucrativos

> [!info] Status
> **Aceito** (decisão do Diego, 16/11). Substitui o [[ADR-018-pagamento-simulado]], que dizia "sem aviso de portfólio" nas telas de pagamento.

## Contexto

O [[ADR-018-pagamento-simulado]] tornou o pagamento só visual e, na decisão do Diego de 30/10 (sem aviso de portfólio em nenhuma página), manteve as telas de pagamento sem aviso. Em 16/11 o Diego mudou isso: como as telas de Pix e de cartão parecem de uma loja real, quem as vê precisa saber que nada ali é cobrado.

## Decisão

- Tudo do [[ADR-018-pagamento-simulado]] continua valendo: sem gateway de nenhum tipo (nem real, nem simulado com lógica), sem cobrança, webhook, aviso de pagamento, conta, chave, CPF nem dado de cartão; Pix com QR inválido; cartão de teste só na tela; pedido independente do pagamento; telas por último.
- **Muda:** toda tela de pagamento (a etapa Pagamento do checkout com Pix ou cartão, a tela do Pix, "Pagamento em análise" e "Pix expirado" ou "Pedido cancelado") mostra um aviso de que este é um projeto sem fins lucrativos, feito para portfólio, e tem um botão "Voltar". O texto e o destino do botão estão em [[pagamento]].
- **Alcance:** só as telas de pagamento. O resto do site segue sem aviso de portfólio (decisão de 30/10, [[termos-privacidade]]).

## Por quê

- O aviso fica onde o visitante poderia achar que vai pagar de verdade, e só ali.
- O botão "Voltar" dá uma saída explícita de uma tela que não leva a pagamento nenhum.

## Consequências

- O aviso é parte da tela de pagamento: a ausência dele em qualquer uma dessas telas é bug (teste em [[pagamento]]).
- Ligar um pagamento real no futuro exige um ADR novo e a revisão da Política de Privacidade.
