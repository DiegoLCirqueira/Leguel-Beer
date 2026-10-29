---
tipo: glossario
atualizado: 2026-10-28
tags:
  - glossario
---

# Glossário: Leguelé Beer

Linguagem do e-commerce da cervejaria Leguelé Beer. Use estes termos em specs, issues, testes e código. Ver [[visao]].

## Pessoas

**Cliente**:
Pessoa com conta na loja, que pode finalizar uma compra.
_Evite_: usuário, comprador

**Convidado**:
Pessoa que usa a loja sem ter entrado numa conta. Pode montar a Geladeira, mas precisa entrar numa conta para finalizar a compra.
_Evite_: visitante, anônimo

## Catálogo

**Catálogo**:
O conjunto das cervejas ativas à venda e a página que as lista com filtros e ordenação. Ver [[catalogo]].
_Evite_: vitrine, loja, produtos

**Cerveja**:
Um rótulo vendido pela Leguelé Beer, com estilo, teor alcoólico, IBU e preço próprios.
_Evite_: produto, item, SKU

**Categoria**:
Agrupamento de cervejas por estilo que organiza o catálogo e as prateleiras da Geladeira. É cadastrada e pode mudar.
_Evite_: tipo, família

**Cerveja ativa**:
Cerveja que aparece para os clientes. Uma cerveja inativa continua cadastrada, mas fica fora do catálogo e dos contadores.
_Evite_: publicada, visível

**Quantidade disponível**:
Estoque da cerveja menos as unidades reservadas em pedidos pendentes.
_Evite_: estoque (quando se quer dizer o que ainda pode ser vendido)

**Esgotada**:
Cerveja ativa com quantidade disponível igual a zero. Continua no catálogo, mas não pode ser adicionada à Geladeira.
_Evite_: indisponível, sem estoque, inativa

**Destaque**:
Cerveja marcada para aparecer na seção "Cervejas em destaque" da home.
_Evite_: featured, vitrine

**Relevância**:
Ordem padrão do catálogo: destaques primeiro, depois a ordem das categorias e, por fim, o nome da cerveja. As esgotadas ficam sempre no fim, como em qualquer ordenação.
_Evite_: recomendados, padrão

**Faixa de categorias**:
Fileira rolável de chips, um por categoria com cervejas ativas, com a quantidade de cervejas ativas de cada uma.
_Evite_: menu de categorias, abas

## Compra

**Geladeira**:
O carrinho da loja, exibido como uma geladeira com uma prateleira por categoria. Ver [[geladeira]].
_Evite_: carrinho, sacola, cesta
