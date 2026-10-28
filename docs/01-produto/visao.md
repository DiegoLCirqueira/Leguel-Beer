---
tipo: produto
atualizado: 2026-10-28
fonte-notion: https://app.notion.com/p/3fd490a7ac7d81d2bc58c7ff9e7091b8
tags:
  - produto
  - visao
---

# Visão do produto: Leguelé Beer

## O que é

E-commerce mobile-first (PWA) da cervejaria artesanal **Leguelé Beer**: catálogo de cervejas, carrinho (chamado oficialmente de **Geladeira**), checkout completo e, depois, packs Mix & Match e assinatura do Clube do Leguelé.

É um **projeto de portfólio** com um único desenvolvedor (Diego). Não é lançamento comercial: dados da empresa são fictícios e os pagamentos rodam em sandbox.

## Público

> [!todo] Preencher: público-alvo (perfil do consumidor, faixa etária, região). O backlog só define a área de entrega: Maceió e região.

## Escopo do MVP

> [!info] Corte por épico
> Os épicos do backlog que entram no MVP estão em [[mvp-corte]] (aprovado em 2026-10-28).

- **Catálogo:** listagem, página de produto, filtros por categoria e atributos, ordenação. Ver [[catalogo]].
- **Geladeira (carrinho):** prateleiras por categoria, persistida localmente e na conta.
- **Checkout completo:** Entrega → Pagamento → Revisão; Pix (validade 30 min) e cartão até 12x. Ver [[checkout]].
- **Entrega:** apenas Maceió e região, frete por distância, frete grátis acima de R$ 150.
- **Conta:** e-mail/senha, Google e Facebook. Convidado só navega; a compra exige conta.

> [!todo] Preencher: tamanho do catálogo. A página do projeto no Notion fala em 16 cervejas em 4 categorias (IPA, Frutas, Malt, Lager), mas o card LB-33 cita também Stouts e o LB-36 fala em "~30 cervejas".

## Depois do MVP

- **Mix & Match (monte seu kit):** packs de 3, 6 ou 12 com preço especial, mistura livre de estilos, combinações sugeridas e embalagem de presente.
- **Clube do Leguelé:** assinatura com planos Mensal, Trimestral e Semestral, frete grátis e kit do assinante.

> [!todo] Preencher: vantagens e % de desconto de cada plano do Clube, e desconto de cada tamanho de pack (pendências abertas no Notion).

## Restrições

- Tudo em **planos gratuitos**.
- Front publicado na **Vercel** (subdomínio gratuito `vercel.app`).
- Projeto de **portfólio**: prioriza qualidade técnica e visibilidade da arquitetura (ver [[ADR-001-stack]]).
- Desenvolvimento guiado por **BDD/TDD** (testes primeiro) e clean code.
- Backlog em Kanban no Notion; este vault guarda visão, specs, ADRs e diário.

## Features e status

```dataview
TABLE status, prioridade, modulo, card-notion
FROM "02-features"
SORT prioridade ASC, file.name ASC
```

## Ver também

- [[visao-geral]]: arquitetura
- [[ADR-001-stack]]
