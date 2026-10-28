---
status: rascunho
modulo: checkout
card-notion: https://app.notion.com/p/3fd490a7ac7d8128a0c5c62279998c00
prioridade: P0
criado: 2026-10-28
tags:
  - feature
---

# Checkout

> [!warning] Rascunho para revisão
> Cenários de caminho feliz derivados do card do Notion **LB-55** (Montar checkout em etapas no celular) e das regras gerais de pagamento da página do projeto. Os detalhes de Pix (LB-57) e cartão (LB-58) estão em cards próprios no Notion. Revise antes de escrever os testes.

## História de usuário

- **Como** cliente logado com cervejas na Geladeira
- **Quero** finalizar a compra em poucas etapas curtas no celular
- **Para** receber minhas cervejas em casa sem atrito

> [!todo] Preencher: confirmar a história de usuário.

## Cenários

```gherkin
# language: pt
Funcionalidade: Checkout em etapas

  Cenário: Fluxo completo com endereço padrão
    Dado que estou logado com itens na Geladeira e um endereço padrão
    Quando avanço pelas etapas Entrega, Pagamento e Revisão e confirmo o pedido
    Então o pedido é criado com o endereço e a forma de pagamento escolhidos

  Cenário: Pagar com Pix
    Dado que estou na etapa Pagamento
    Quando escolho Pix e confirmo o pedido
    Então vejo o QR Code do Pix com validade de 30 minutos

  Cenário: Pagar com cartão parcelado sem juros
    Dado que estou na etapa Pagamento
    Quando escolho cartão em 2 parcelas e confirmo o pedido
    Então o pedido é criado em 2 parcelas sem juros
```

## Regras de negócio

- O login é exigido antes do checkout; não há etapa de identificação.
- Três etapas com progresso visível: **Entrega** (escolher/adicionar endereço, ver frete e prazo) → **Pagamento** (Pix ou cartão) → **Revisão** (itens, totais, avisos legais, "Confirmar pedido").
- Endereço padrão pré-selecionado; resumo fixo; estado preservado ao voltar etapas.
- Pix com validade de 30 minutos.
- Expiração do Pix (LB-60): verificada **no momento do uso**.
  - A checagem acontece ao ler o pedido, ao receber o webhook de pagamento e antes de reservar estoque.
  - Um cron diário da plataforma cancela os pedidos expirados que restarem e libera o estoque.
  - Não há fila nem processo em segundo plano (ver [[ADR-002-hospedagem-api]]).
- Cartão em até 12x: sem juros até 2x, com juros a partir da 3ª parcela.
- Entrega apenas em Maceió e região; fora da área, mostrar "Ainda não entregamos neste endereço" e não avançar.
- Frete calculado por distância; frete grátis acima de R$ 150.
- Geladeira vazia em `/checkout` leva de volta à Geladeira.
- A criação do pedido usa `POST /orders` com `Idempotency-Key`.

> [!todo] Preencher: taxa de juros do cartão a partir da 3ª parcela.

## Fora de escopo

- Integração com o gateway (cards de Pix e cartão; gateway em sandbox, a confirmar em spike).
- Boleto.
- Retirada no local.

## Decisões relacionadas

- [[ADR-001-stack]]
- Arquitetura: [[visao-geral]]
- Catálogo: [[catalogo]]
