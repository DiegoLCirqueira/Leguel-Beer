---
status: rascunho
modulo: catalogo
card-notion: https://app.notion.com/p/3fd490a7ac7d81a7b531f26160f4ed1c
prioridade: P0
criado: 2026-10-28
issues:
  - "#23 LB-34"
tags:
  - feature
---

# Destaques da home

> [!info] Origem
> Derivada do card do Notion **LB-34** (#23), parte do épico E3 junto com [[catalogo]] e [[adicionar-do-card]]. O Diego pôs o LB-34 no escopo (pergunta 2 da entrevista do [[catalogo]]); a separação em spec própria, pelo limite de 6 cenários por spec, foi proposta do Spec adotada pelo Orchestrator. Os termos seguem o [[GLOSSARY]].

## História de usuário

- **Como** cliente ou convidado no celular
- **Quero** ver logo na home as cervejas em destaque
- **Para** descobrir rápido o que a Leguelé recomenda sem abrir o catálogo

## Cenários

```gherkin
# language: pt
Funcionalidade: Cervejas em destaque na home

  Cenário: Mostrar no máximo 6 destaques
    Dado 8 cervejas ativas marcadas como destaque, todas com quantidade disponível
    Quando abro a home
    Então vejo a seção "Cervejas em destaque" com 6 cards
    E vejo o link "Ver todas"

  Cenário: Destaques na ordem de relevância
    Dado cervejas em destaque de categorias diferentes
    Quando abro a home
    Então os destaques aparecem pela ordem das categorias e, dentro da categoria, pelo nome

  Cenário: Destaque esgotado vai para o fim
    Dado uma cerveja em destaque esgotada e outras em destaque com quantidade disponível
    Quando abro a home
    Então a esgotada aparece por último, com o selo "Esgotado"

  Cenário: "Ver todas" abre o catálogo
    Dado que estou na home
    Quando toco em "Ver todas"
    Então abro o catálogo sem filtros, ordenado por relevância

  Cenário: Sem destaques
    Dado que nenhuma cerveja ativa está marcada como destaque
    Quando abro a home
    Então a seção "Cervejas em destaque" não aparece
```

## Regras de negócio

- Entram só cervejas ativas marcadas como destaque, no máximo 6.
- Ordem: a mesma da relevância do [[catalogo]] entre destaques (ordem das categorias e depois o nome), com as esgotadas sempre no fim.
- Com mais de 6 destaques, aparecem os 6 primeiros dessa ordem.
- Grade de cards com 2 colunas no celular e 3 ou mais no desktop.
- "Ver todas" leva a `/catalogo`.
- Os cards são os mesmos do catálogo, com o Adicionar de [[adicionar-do-card]].

## Seams de teste

> [!info] Proposta, ainda não combinada com o Diego
> Tirada do plano de testes do card.

- **Seleção dos destaques:** ordem e limite de 6 (integração com banco real).
- **Seção de destaques:** E2E dos cenários desta spec.

## Fora de escopo

- Personalização por cliente.
- Banner rotativo de destaques (LB-32, #21, milestone MVP+).
- Marcar cervejas como destaque no admin (cadastro de cervejas, LB-73).

## Decisões relacionadas

- [[catalogo]]: relevância e regra das esgotadas.
- [[adicionar-do-card]]
- [[mvp-corte]]

## Decisões tomadas sem consulta

Decisões pequenas e fáceis de reverter, tomadas pela política de autonomia do Diego. Qualquer uma pode ser vetada.

- **História de usuário:** escrita a partir do card, que só descreve a tela.
- **Ordem dos destaques:** a relevância do [[catalogo]] aplicada aos destaques; o card pedia uma ordem sem defini-la.
- **Corte em 6:** com mais de 6, entram os 6 primeiros da ordem, então uma esgotada pode ficar de fora.
- **Sem destaques:** a seção não aparece (o card não tratava o caso).
- **"Ver todas":** abre o catálogo sem filtros.

## Tickets propostos

Coberto pela issue #23 (ver a reconciliação em [[catalogo]]). Nenhuma issue nova.
