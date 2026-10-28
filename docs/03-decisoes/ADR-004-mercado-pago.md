---
status: proposto
data: 2026-10-28
notion-adr: ADR-003
fonte-notion: https://app.notion.com/p/3fd490a7ac7d81d4a752df142740c3a5
card-notion: https://app.notion.com/p/3fd490a7ac7d810ebc04ebe7b354b1ce
tags:
  - adr
---

# ADR-004: Mercado Pago em sandbox para pagamentos

> [!info] Status
> **Proposto, provisório até o spike LB-54** (comparar gateways gratuitos). Migrado do ADR-003 do Notion. Ver "Ajustes na migração".

## Contexto

O checkout do MVP precisa de:

- **Pix** com validade de 30 minutos;
- **cartão** em até 12x, sem juros até 2x e com juros a partir da 3ª parcela.

Por ser portfólio, tudo roda em **sandbox**, sem custo e sem cobrança real (ver [[checkout]] e [[mvp-corte]]).

## Decisão

- Usar o **Mercado Pago em modo de testes** para **Pix e cartão** no MVP, até o spike LB-54 confirmar ou trocar o provedor.
- A integração fica atrás de uma porta `PaymentGateway` na camada de domínio da API, com o adaptador do provedor na infraestrutura (ver [[ADR-005-monorepo-camadas]]). Assim, trocar de provedor não exige reescrever o checkout.
- Os webhooks de pagamento chegam a um endpoint público da API, publicada como função serverless ([[ADR-002-hospedagem-api]]), e são processados de forma síncrona e idempotente (LB-59).

## Alternativas consideradas

| Opção | Prós | Contras |
| --- | --- | --- |
| **Mercado Pago** (provisória) | Pix e cartão parcelado no mesmo produto, sandbox gratuito, muito usado no Brasil | — |
| Asaas | Sandbox gratuito | Checkout transparente de cartão menos flexível |
| Stripe | Melhor DX e documentação | Suporte a Pix e parcelamento no Brasil precisa ser validado |

## Consequências

- **Positivas:** um provedor só para Pix e cartão; testes com credenciais de sandbox; troca isolada pela porta `PaymentGateway`.
- **Negativas:**
  - os webhooks precisam de URL pública;
  - os juros do parcelamento seguem a regra do gateway (a taxa ainda está em `[!todo]` na spec de [[checkout]]).

## Pós-MVP

- **Assinaturas do Clube do Leguelé** (cobrança recorrente dos planos; épico E14) ficam para o Pós-MVP.
- Ao retomar o Clube, reavaliar o provedor para cobrança recorrente:
  - o Notion registrava que a documentação de assinaturas com Pix do Mercado Pago é limitada;
  - o Notion também registrava que o Asaas é forte em cobrança recorrente.

## Ajustes na migração

| No Notion | Aqui | Por quê |
| --- | --- | --- |
| Escopo: Pix, cartão parcelado e **assinaturas do Clube** | Escopo do MVP: Pix e cartão; assinaturas em "Pós-MVP" | O Clube (E14) é Pós-MVP no [[mvp-corte]] |
| Contra do Mercado Pago: "documentação de assinaturas com Pix é limitada"; pró do Asaas: "cobrança recorrente forte" | Movidos para "Pós-MVP" | Só pesam quando houver assinaturas |
| Webhooks no "controller da API NestJS" | Endpoint público da API serverless, processamento síncrono e idempotente | Alinhado ao [[ADR-002-hospedagem-api]] (sem filas no MVP) |
| Numerado como ADR-003 | ADR-004 | O ADR-002 do repositório é o de hospedagem |
