---
status: rascunho
modulo: catalogo
card-notion: https://app.notion.com/p/3fd490a7ac7d81c5ba2cf6a3db8448c6
prioridade: P0
criado: 2026-10-28
tags:
  - feature
---

# Catálogo

> [!warning] Rascunho para revisão
> Cenários de caminho feliz derivados dos cards do Notion **LB-36** (Criar página de catálogo com filtros e ordenação) e **LB-33** (Filtrar cervejas por categoria com contadores). Revise antes de escrever os testes.

## História de usuário

- **Como** cliente no celular
- **Quero** explorar as cervejas filtrando por categoria e atributos e ordenando a lista
- **Para** encontrar rápido a cerveja que combina com o meu gosto

> [!todo] Preencher: confirmar a história de usuário (o card descreve a funcionalidade, não a motivação do cliente).

## Cenários

```gherkin
# language: pt
Funcionalidade: Catálogo de cervejas

  Cenário: Combinar filtros e ordenação
    Dado que estou no catálogo
    Quando filtro por IPA e IBU acima de 50 e ordeno por menor preço
    Então vejo só IPAs com IBU acima de 50, da mais barata para a mais cara

  Cenário: Abrir um link compartilhado com filtros
    Dado uma URL do catálogo com filtros aplicados
    Quando abro essa URL em outro aparelho
    Então os mesmos filtros já vêm aplicados

  Cenário: Filtrar por categoria pela faixa de categorias
    Dado que estou na home
    Quando toco em "IPAs"
    Então vejo apenas cervejas da categoria IPA
    E o chip "IPAs" fica destacado
```

## Regras de negócio

- Página `/catalogo` com todas as cervejas.
- Filtros: categoria, teor alcoólico, IBU, faixa de preço e "só disponíveis", num bottom sheet.
- Ordenação: relevância, menor preço, maior preço, mais novas.
- Filtros e ordenação ficam na URL (ex.: `?categoria=ipa`).
- Mostrar a contagem de resultados e a ação "Limpar filtros"; sem resultados, mostrar estado vazio com "Limpar filtros".
- O contador de cada categoria considera apenas cervejas ativas; categoria sem cervejas ativas não aparece na faixa.
- As categorias vêm do banco e podem mudar.

> [!todo] Preencher: quais são as categorias oficiais (ver divergência registrada em [[visao]]).

## Fora de escopo

- Paginação (desnecessária para o tamanho do catálogo).
- Busca textual (card próprio: LB-37).

## Decisões relacionadas

- [[ADR-001-stack]]
- Arquitetura: [[visao-geral]]
