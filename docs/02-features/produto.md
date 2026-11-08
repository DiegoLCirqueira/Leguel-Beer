---
status: rascunho
modulo: catalogo
card-notion: https://app.notion.com/p/3fd490a7ac7d8112b745ef42b7882d97
prioridade: P0
criado: 2026-11-08
issues:
  - "#82 LB-40"
  - "#83 LB-41"
  - "#84 LB-42"
tags:
  - feature
---

# Página de produto

> [!info] Origem
> Derivada dos cards do Notion **LB-40** (#82, dados e ficha técnica), **LB-41** (#83, desconto a partir do preço anterior) e **LB-42** (#84, adicionar com quantidade e botão fixo), do épico E10, com a pré-revisão das telas 03 e 28 do design (08/11). As decisões que o card não tinha foram tomadas pelo Spec como recomendação aplicada, vetável pelo Diego (seção "Decisões tomadas sem consulta"). Os termos seguem o [[GLOSSARY]]. Parte do épico E10 que fica fora do MVP: ver "Fora de escopo".

## História de usuário

- **Como** cliente ou convidado no celular
- **Quero** ver os dados de uma cerveja e escolher quantas unidades levar
- **Para** decidir a compra e colocar na Geladeira sem voltar ao catálogo

## Cenários

```gherkin
# language: pt
Funcionalidade: Página de produto

  Cenário: Ver a ficha da cerveja
    Dado a cerveja "Maré Alta" da categoria IPA, estilo "American IPA", teor 6,5%, IBU 65, 500 ml e preço R$ 32,00
    Quando abro a página dela a partir do card
    Então vejo o nome, o estilo, o selo da categoria e a imagem
    E vejo a ficha com teor alcoólico 6,5%, IBU 65 e volume 500 ml
    E vejo o preço R$ 32,00 e a descrição da cerveja

  Esquema do Cenário: Desconto calculado a partir do preço anterior
    Dado uma cerveja com preço atual R$ 32,00 e preço anterior <anterior>
    Quando abro a página dela
    Então <resultado>

    Exemplos:
      | anterior  | resultado                                               |
      | R$ 36,90  | vejo R$ 36,90 riscado e o selo "-13%"                   |
      | R$ 32,00  | não vejo preço anterior nem desconto                    |
      | sem valor | não vejo preço anterior nem desconto                    |

  Esquema do Cenário: Aviso de estoque baixo
    Dado uma cerveja com quantidade disponível <disponivel>
    Quando abro a página dela
    Então <aviso>

    Exemplos:
      | disponivel | aviso                                       |
      | 3          | vejo "Últimas 3 unidades em estoque!"       |
      | 1          | vejo "Última unidade em estoque!"           |
      | 5          | vejo "Últimas 5 unidades em estoque!"       |
      | 6          | não vejo aviso de estoque                   |

  Cenário: Cerveja esgotada
    Dado uma cerveja esgotada
    Quando abro a página dela
    Então vejo o selo "Esgotado"
    E o botão "Adicionar à geladeira" está desabilitado e não há seletor de quantidade

  Cenário: Cerveja que não existe ou está inativa
    Dado um endereço de cerveja inexistente ou de cerveja inativa
    Quando abro essa página
    Então vejo "Cerveja não encontrada" com a ação "Ver catálogo"

  Cenário: Adicionar com a quantidade escolhida (testável depois do LB-47)
    Dado a Maré Alta com quantidade disponível 5 e nenhuma unidade na Geladeira
    Quando escolho a quantidade 3 e toco em "Adicionar à geladeira"
    Então a Geladeira passa a ter 3 unidades da Maré Alta
    E vejo o toast "Maré Alta foi para a geladeira" com a ação "Desfazer"
```

## Regras de negócio

- **Página:** `/catalogo/<slug>`, aberta pelo card do catálogo e dos destaques. Só cerveja ativa; inativa ou inexistente mostra o estado do cenário "não existe" (a API responde 404).
- **Ficha (LB-40):** nome, estilo, categoria (`StyleBadge`), imagem (a padrão da categoria, se não houver), descrição, teor alcoólico, IBU, volume e preço. A descrição é um texto curto de cadastro; sem descrição, a seção não aparece.
- **Desconto (LB-41):** o preço anterior é opcional. Com preço anterior maior que o atual, mostra o anterior riscado e o selo "-N%", em que N é `(anterior - atual) / anterior` arredondado ao inteiro mais próximo (32 de 36,90 dá 13%). Com preço anterior igual ou menor que o atual, ou sem valor, não mostra nada (o design da tela 28 mostra -11%, que não bate com os números). Quando o desconto arredondado dá menos de 1% (ex.: 32,01 e 32,00), também não há selo nem preço riscado: a tela decide pelo `descontoPercentual` do contrato (nulo ou zero esconde tudo), nunca pela comparação de preços. O desconto só vale para a página de produto; o card e a Geladeira seguem com o preço atual.
- **Estoque baixo:** com quantidade disponível de 1 a 5, mostra "Últimas N unidades em estoque!" ("Última unidade em estoque!" para 1). O limiar de 5 é uma constante em `@leguele/shared`.
- **Quantidade (LB-42):** seletor de 1 até a quantidade disponível, começando em 1. O total na Geladeira de uma cerveja não passa da quantidade disponível; ao passar, mostra "Só temos N unidades" (singular: "Só temos 1 unidade") e nada muda, igual a [[adicionar-do-card]].
- **Botão fixo:** "Adicionar à geladeira" fica fixo no rodapé da tela, sempre visível. A página não tem a barra inferior da loja, para o botão ocupar o lugar dela. O cabeçalho tem o botão de voltar e o contador da Geladeira. A barra fixa publica a própria altura numa variável CSS, para o toast ficar acima dela, e o rodapé da loja ([[termos-privacidade]]) fica no fim da rolagem, acima do botão.
- **Toast:** o mesmo do card: "<nome> foi para a geladeira" com "Desfazer", por 5 segundos, e o contador do header atualiza. "Desfazer" devolve a Geladeira ao estado de antes daquele toque, inclusive quando foram várias unidades.
- **Convidado:** adiciona sem conta, como no card.
- **Frete grátis:** uma linha informativa fixa "Frete grátis em compras acima de R$ 150,00" ([[visao]], [[checkout]]), sem seta e sem cálculo de quanto falta.
- **Enquanto a Geladeira não existe (até o LB-47):** o seletor aparece, mas o botão "Adicionar à geladeira" fica desabilitado; ele passa a funcionar no item 3 da [[sequencia-telas]], como no card.

## Referência visual

Telas do design (fora do repo, em `Imagens/figma/telas/`), só como referência visual: regras e textos vêm desta spec, normalizados ao padrão aprovado (Figtree e Kaushan Script, tokens do `globals.css`, `Button`, `StyleBadge`, `Stepper`, `Toast`, alvos de 44 px; ver [[identidade-visual]]).

| Tela | Data do arquivo | Vale para |
| --- | --- | --- |
| `03-produto-especificacoes.png` | 30/10/2026 | Estrutura da página: título, selo, ficha, preço com seletor e botão fixo |
| `28-produto-estoque-baixo-e-adicionado.png` | 08/11/2026 | Aviso de estoque baixo e toast com "Desfazer" |

**Entra:** título com selo da categoria, imagem da garrafa, descrição, ficha (teor, IBU, volume), bloco de preço com seletor de quantidade, aviso de estoque baixo, linha de frete grátis, toast com "Desfazer" e botão fixo.

**Não entra (o design diverge da spec; vale a spec):**
- Favoritar (coração): Pós-MVP.
- Estrelas e avaliações ("4,8, 1,2 mil avaliações"): fora do MVP.
- Abas Descrição, Ingredientes, Harmonização e Avaliações, e os blocos de lúpulos, malte, cor e "Combina muito com" (LB-43, MVP+): a página mostra só a descrição.
- "Amargor Moderado": não há regra de amargor; fica só o IBU.
- Linha "Leguelé Beer" sob o título.
- "-11%": o desconto é calculado (13% com 32 de 36,90).
- Seta na linha de frete grátis e o "quanto falta" (LB-44, MVP+).
- Texto "Adicionado à geladeira!" do toast: vale "<nome> foi para a geladeira".
- Barra de status do iPhone e a barra inferior da loja nesta página.

## Contrato compartilhado (`@leguele/shared`, pasta `catalogo/`)

Estado do código em 08/11 (`main` 9efcca9): já existem `cervejaCardSchema`, a query e as respostas do catálogo; `GET /catalogo`, `GET /catalogo/destaques` e os modelos `Category` e `Beer` (sem descrição nem preço anterior); no site, `Stepper`, `Toast`, `BottomSheet`, `CardCerveja` e o layout da loja. Falta o detalhe.

Front e Back fixam, num **PR próprio e primeiro**, só em `@leguele/shared`, com testes (feito pelo Back):

- **`cervejaDetalheSchema`:** tudo do `cervejaCardSchema` mais `descricao` (texto ou nulo), `precoAnteriorCentavos` (inteiro ou nulo) e `descontoPercentual` (inteiro ou nulo, calculado pela API; nulo quando não há desconto). O schema estende o do card (no Zod 4, `.safeExtend` quando o schema do card tem `.refine`) e acrescenta um `.refine` que exige `descontoPercentual` igual a `calcularDesconto(precoAnteriorCentavos, precoCentavos)`.
- **`calcularDesconto(anteriorCentavos, atualCentavos)`:** função pura que devolve o percentual inteiro ou nulo, como na regra acima.
- **`LIMIAR_ESTOQUE_BAIXO`** (5) e **`estoqueBaixo(quantidadeDisponivel)`:** verdadeiro de 1 até o limiar.

Endpoint público ([[ADR-009-guard-global-fechado]], `@Public()`): `GET /catalogo/:slug`, declarado depois da rota fixa `GET /catalogo/destaques` (a fixa vem antes da parametrizada), que responde `cervejaDetalhe`, ou 404 no contrato de erros da API para slug inexistente ou cerveja inativa. A regra de desconto mora na função de `@leguele/shared`, chamada pela API. `destaques` é slug reservado: o cadastro de cervejas (LB-73) tem de recusá-lo.

## Componentes novos

Em `apps/web/src/components/ui`, cada um na vitrine `/dev/tokens` ([[identidade-visual]], "Componentes reutilizáveis"), nunca dentro da tela:

- cabeçalho da página de produto, com voltar e contador da Geladeira;
- bloco de preço, com o preço anterior riscado e o selo "-N%";
- barra fixa com o botão (publica a altura numa variável CSS);
- estado "Cerveja não encontrada".

Os demais já existem: `StyleBadge`, `Stepper`, `Toast` e `Button`.

## Seams de teste

> [!info] Proposta, ainda não combinada com o Diego

- **Desconto:** `calcularDesconto` nos casos 36,90 → 13, igual, menor, nulo e abaixo de 1% (32,01 → nulo) (teste unitário).
- **Estoque baixo:** `estoqueBaixo` nos limites 0, 1, 5 e 6 (teste unitário).
- **Consulta por slug na API:** devolve a cerveja ativa e 404 para inativa e inexistente (integração com banco real e teste da rota).
- **Tela:** ficha, desconto, aviso, esgotada e não encontrada (testes de componente); cenários desta spec (E2E).

## Fatias, com dono e ordem

| # | Card | Dono | O que entrega |
| --- | --- | --- | --- |
| 1 | Contrato (LB-40, #82) | Back | PR só em `@leguele/shared`, com testes: `cervejaDetalheSchema`, `calcularDesconto` e `estoqueBaixo` |
| 2 | LB-40 e LB-41 (#82, #83), API | Back | Campos `descricao` e `precoAnterior` no modelo da cerveja, migration, seed com descrição de exemplo e um preço anterior; `GET /catalogo/:slug` |
| 3 | LB-40 e LB-41, tela | Front | `/catalogo/[slug]`, já com o layout sem a barra inferior (grupo de rotas próprio ou variante do layout da loja): título, ficha, preço com desconto, aviso de estoque, frete grátis e estado "não encontrada"; o card passa a abrir esta página |
| 4 | LB-42 (#84) | Front | Seletor de quantidade e botão fixo; o botão só funciona depois do LB-47 (item 3 da [[sequencia-telas]]) |

Depois do contrato (fatia 1), as fatias 2 e 3 andam em paralelo, e o Front usa dado real só depois da fatia 2. A fatia 4 usa o `Stepper` e o `Toast` que já existem.

## Fora de escopo

- Abas de descrição, ingredientes, harmonização e avaliações (LB-43, MVP+).
- Quanto falta para o frete grátis (LB-44, MVP+).
- Sugerir cervejas do mesmo estilo (LB-45) e compartilhar com Web Share (LB-46).
- Favoritar (Pós-MVP) e avaliações.
- Cadastro de descrição e preço anterior no admin (LB-73, item 8 da [[sequencia-telas]]).
- Mostrar o desconto no card e na Geladeira.

## Decisões relacionadas

- [[catalogo]] e [[adicionar-do-card]]: card, quantidade disponível e toast.
- [[geladeira]]: onde o botão leva as unidades (item 3).
- [[identidade-visual]]
- [[mvp-corte]]

## Decisões tomadas sem consulta

Recomendações aplicadas pelo Spec em 08/11, fáceis de reverter; qualquer uma pode ser vetada.

- **Limiar de estoque baixo:** 5 unidades (de 1 a 5), uma constante.
- **Desconto:** arredondado ao inteiro mais próximo; só aparece quando o preço anterior é maior que o atual e o desconto arredondado é de pelo menos 1% (decisão vetável do Back, 08/11); só na página de produto.
- **Descrição e preço anterior:** campos opcionais novos na cerveja; o texto do seed é de exemplo, e o conteúdo final vem do cadastro (admin).
- **Rota:** `/catalogo/<slug>`.
- **Sem barra inferior da loja** na página, para o botão fixo ocupar o lugar dela.
- **Barra fixa, toast e rodapé:** a barra publica a altura numa variável CSS (o toast fica acima dela) e o rodapé da loja fica no fim da rolagem, acima do botão.
- **Toast:** o mesmo do card, com o nome da cerveja e 5 segundos, mesmo com várias unidades.
- **Linha de frete grátis:** informativa, sem "quanto falta".
- **Sem "Amargor":** só o IBU.
- **Estado "não encontrada":** texto "Cerveja não encontrada" com a ação "Ver catálogo" (o card não definia).

## Tickets propostos

Reconciliação das issues #82, #83 e #84, a pedir ao Orchestrator depois do merge desta spec (aprovação permanente para reconciliar issue com spec mergeada): título mantido; descrição com link para esta spec e os cenários correspondentes (#82: ficha, não encontrada e esgotada; #83: desconto; #84: quantidade, estoque baixo e botão fixo, com dependência do #54, LB-47). Nenhuma issue nova.
