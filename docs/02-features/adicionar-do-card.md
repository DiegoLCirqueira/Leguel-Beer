---
status: rascunho
modulo: catalogo
card-notion: https://app.notion.com/p/3fd490a7ac7d818f8902cacfd96e2c0b
prioridade: P0
criado: 2026-10-28
issues:
  - "#24 LB-35"
tags:
  - feature
---

# Adicionar direto do card

> [!info] Origem
> Derivada do card do Notion **LB-35** (#24), parte do épico E3 junto com [[catalogo]] e [[destaques-home]]. Separada do [[catalogo]] pelo limite de 6 cenários por spec (decisão do Diego, 2026-10-28). Os termos seguem o [[GLOSSARY]].

## História de usuário

- **Como** cliente ou convidado no celular
- **Quero** colocar uma cerveja na Geladeira direto do card, sem abrir a página do produto
- **Para** montar a compra rápido enquanto exploro o catálogo

## Cenários

```gherkin
# language: pt
Funcionalidade: Adicionar cerveja à Geladeira direto do card

  Cenário: Adicionar uma unidade
    Dado que a Geladeira tem 2 itens
    Quando toco em "Adicionar" no card da Munich Lager
    Então vejo o toast "Munich Lager foi para a geladeira" com a ação "Desfazer"
    E o contador da Geladeira no header mostra 3

  Cenário: Limite da quantidade disponível
    Dado que a Munich Lager tem quantidade disponível 2 e já tenho 2 na Geladeira
    Quando toco em "Adicionar" no card da Munich Lager
    Então vejo "Só temos 2 unidades"
    E a quantidade na Geladeira continua 2

  Cenário: Desfazer
    Dado que acabei de adicionar uma cerveja pelo card
    Quando toco em "Desfazer" no toast
    Então a Geladeira volta ao estado anterior

  Cenário: Convidado adiciona sem entrar na conta
    Dado que sou convidado
    Quando toco em "Adicionar" no card de uma cerveja com quantidade disponível
    Então a cerveja vai para a Geladeira sem pedir login

  Cenário: Cerveja esgotada não pode ser adicionada
    Dado uma cerveja esgotada
    Quando vejo o card dela
    Então o botão "Adicionar" está desabilitado
```

## Regras de negócio

- "Adicionar" coloca 1 unidade na Geladeira; a escolha de quantidade fica na página do produto.
- O total na Geladeira de uma cerveja não passa da quantidade disponível (estoque menos reservas de pedidos pendentes). Ao tentar passar, mostra "Só temos N unidades" (singular: "Só temos 1 unidade") e nada muda.
- Ao adicionar, mostra o toast "<nome da cerveja> foi para a geladeira" com "Desfazer" e atualiza o contador do header.
- "Desfazer" devolve a Geladeira ao estado de antes daquele toque, enquanto o toast estiver visível (5 segundos).
- O convidado pode adicionar à Geladeira; só precisa entrar na conta para finalizar a compra (decisão do Diego, 2026-10-28; ver [[visao]]).
- Cerveja esgotada tem o botão "Adicionar" desabilitado (ver [[catalogo]]).
- Vale em todos os cards de cerveja: catálogo e [[destaques-home]].

## Seams de teste

> [!info] Proposta, ainda não combinada com o Diego
> Tirada do plano de testes do card.

- **Regras da Geladeira:** adicionar, limite pela quantidade disponível e desfazer (teste unitário).
- **Botão no card:** E2E dos cenários desta spec.

## Fora de escopo

- Escolher a quantidade (página do produto, LB-42).
- Mesclar a Geladeira do convidado ao entrar na conta (LB-48, #55, milestone MVP+).
- Exigir login ao finalizar a compra (LB-31, #46).

## Decisões relacionadas

- [[geladeira]]
- [[catalogo]]
- [[destaques-home]]
- [[mvp-corte]]

## Decisões tomadas sem consulta

Decisões pequenas e fáceis de reverter, tomadas pela política de autonomia do Diego. Qualquer uma pode ser vetada.

- **História de usuário:** escrita a partir do card, incluindo o convidado (pergunta 8).
- **Duração do toast:** 5 segundos; "Desfazer" só vale enquanto o toast estiver visível. O card não definia a duração.
- **Singular da mensagem de limite:** "Só temos 1 unidade", seguindo o padrão de "1 cerveja" aprovado pelo Diego.
- **Limite com reservas:** o limite usa a quantidade disponível (com reservas), e não o estoque bruto, para bater com a regra de esgotada do [[catalogo]].

## Tickets propostos

Coberto pela issue #24 (ver a reconciliação em [[catalogo]]). Nenhuma issue nova.
