---
tipo: glossario
atualizado: 2026-11-13
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

**Admin**:
Pessoa que opera a loja (cervejas, estoque e pedidos). É uma conta com o papel admin. Ver [[guards-api]].
_Evite_: administrador do sistema, superusuário

**Perfil**:
Dados do cliente guardados pela loja (nome e telefone, no cadastro; data de nascimento, em "Dados pessoais"), criados no primeiro acesso à conta. Ver [[cadastro-login]] e [[dados-pessoais]].
_Evite_: usuário, cadastro (quando se quer dizer os dados)

## Acesso

**Confirmação de maioridade**:
Resposta "tenho 18 anos ou mais" dada na entrada do site, lembrada por 30 dias no navegador. Não valida documento. Ver [[maioridade-entrada]].
_Evite_: age gate, verificação de idade

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
Estoque físico da cerveja menos as unidades reservadas em pedidos "Aguardando pagamento" ainda dentro da validade; a reserva de pedido vencido não conta. Ver [[checkout]].
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

**Prateleira**:
Faixa da Geladeira que guarda as cervejas de uma categoria, na ordem das categorias do catálogo. Ver [[geladeira]].
_Evite_: seção, linha

**Garrafa fantasma**:
Silhueta tracejada com "+" numa posição livre da prateleira; ao tocar, abre o catálogo filtrado pela categoria da prateleira. Ver [[geladeira]].
_Evite_: placeholder, slot vazio

**Revalidação**:
Conferência da Geladeira pela API (preço, cerveja ativa e quantidade disponível) ao abrir a Geladeira e ao iniciar o checkout; o que muda vira um aviso para o cliente. Ver [[geladeira]].
_Evite_: sincronização (quando se quer dizer a conferência de preço e estoque)

## Entrega

**Endereço padrão**:
O endereço do cliente usado primeiro no frete do resumo da Geladeira e no checkout. Cada cliente com endereço tem exatamente um. Ver [[enderecos-entrega]].
_Evite_: endereço principal, endereço favorito

**Área de entrega**:
Os endereços até o raio máximo de distância de rota da cervejaria (25 km de início). Fora dela, o endereço pode ser salvo, mas não serve para comprar. Ver [[enderecos-entrega]].
_Evite_: região atendida, cobertura

**Frete**:
Valor da entrega: taxa base mais o valor por km da distância de rota, arredondado para cima em R$ 0,50; grátis com subtotal a partir de R$ 150,00. Ver [[enderecos-entrega]].
_Evite_: taxa de entrega, envio

## Pedidos

**Pedido**:
A compra criada no checkout, com as cervejas, os preços e o endereço gravados no momento da compra. Ver [[checkout]] e [[pedidos-cliente]].
_Evite_: compra (quando se quer dizer o registro), ordem

**Número do pedido**:
Código mostrado ao cliente e ao admin, "#LB" seguido de 6 dígitos (ex.: "#LB482731"). Não é o id do pedido na URL. Ver [[pedidos-cliente]].
_Evite_: código, protocolo

**Status do pedido**:
Etapa em que o pedido está: Aguardando pagamento, Pago, Em preparo, Saiu para entrega, Entregue ou Cancelado. Ver [[pedidos-cliente]].
_Evite_: situação, estado

## Estoque

**Estoque físico**:
Unidades de uma cerveja que estão na cervejaria, inclusive as reservadas. Muda só por movimento de estoque. Ver [[admin]].
_Evite_: estoque total, saldo

**Reservado**:
Unidades de uma cerveja presas em pedidos "Aguardando pagamento". Viram baixa no estoque físico quando o pagamento é aprovado e voltam a ficar disponíveis quando o pedido é cancelado. Ver [[checkout]].
_Evite_: bloqueado, separado

**Estoque mínimo**:
Quantidade de uma cerveja a partir da qual o admin vê o selo "Baixo" (disponível igual ou abaixo dele); 6 por padrão. Não é o aviso de estoque baixo ao cliente da [[produto]]. Ver [[admin]].
_Evite_: estoque de segurança, alerta

**Movimento de estoque**:
Registro de uma mudança no estoque físico: entrada, perda, correção, venda ou cancelamento, com data, quantidade, motivo e saldo depois. Ver [[admin]].
_Evite_: lançamento, ajuste (quando se quer dizer o registro)
