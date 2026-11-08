---
status: rascunho
modulo: geladeira
card-notion: https://app.notion.com/p/3fd490a7ac7d812eaddfc4fed1ed0477
prioridade: P0
criado: 2026-10-28
tags:
  - feature
---

# Geladeira

> [!warning] Rascunho para revisão
> Spec derivada do card do Notion **LB-49** (Exibir geladeira em prateleiras por estilo) e do **LB-124** (Gerar imagens recortadas das garrafas). Inclui a descrição visual que antes ficava no papel do agente Front no Maestri (ver [[maestri-banda]]). Revise antes de escrever os testes.

## História de usuário

- **Como** cliente no celular
- **Quero** ver o que escolhi arrumado numa geladeira com prateleiras por estilo
- **Para** acompanhar a compra de um jeito visual e reconhecer a identidade da Leguelé

> [!todo] Preencher: confirmar a história de usuário (o card descreve a tela, não a motivação).

## Descrição visual

Texto que estava no papel do Front no Maestri:

- Garrafas em imagens PNG pré-renderizadas, uma por rótulo, sobre um fundo de geladeira.
- Barra com nome e preço na frente da base da garrafa.
- Fileiras de trás deslocadas à esquerda.
- Queda das garrafas ao entrar, com quique e balanço.

Do card LB-49 e do LB-124:

- Prateleiras fixas, uma por categoria, na mesma ordem do catálogo.
- Garrafas de trás menores, mais altas e mais escuras. Profundidade desenhada limitada; acima do limite, a etiqueta mostra "×N".
- Posição livre mostra uma garrafa fantasma com "+", que abre o catálogo filtrado pela categoria.
- Imagens de garrafa: de frente, fundo transparente, mesmo enquadramento e base alinhada à borda inferior (eixo do balanço). Sem imagem, usa a imagem padrão da categoria.
- Animações só com `transform`/`opacity`, respeitando `prefers-reduced-motion`. No celular a Geladeira ocupa a tela toda, sem scroll dentro das prateleiras; duas colunas (Geladeira + resumo) só em telas largas.

## Referência visual (decisão de 08/11)

- O design correto da Geladeira (o carrinho) é o arquivo `estudio-garrafas.html`, em `Imagens/` (fora do repo; arquivo de 29/10/2026). Ele vale acima da descrição textual acima quando divergirem, inclusive sobre o "fundo de geladeira" em PNG da Descrição visual.
- No celular, o resumo da Geladeira é um bottom sheet: tela `Imagens/figma/telas/24-resumo-da-geladeira.png` (fora do repo; tela de 08/11/2026).
- Moldura: o estúdio usa a **imagem** da geladeira (710 × 1573) como fundo, com o parapeito de cada prateleira redesenhado por cima e a faixa de nome e quantidade (`×N`) sobre ele. Isso resolve a dúvida entre imagem e CSS: vale a imagem. Diverge do LB-49 (issue #56: "moldura em CSS, sem imagem pesada"); vale a decisão do Diego de 08/11 de que o estudo é o design certo, e a issue #56 será reconciliada depois do merge.
- Medidas do estúdio, como referência: 4 prateleiras (IPA, Frutas, Malt, Lager), 4 posições por prateleira e até 3 fileiras desenhadas.
- Cupom de desconto (MVP+) e favoritar (Pós-MVP) ficam fora da tela 24 por ora (decisão de 08/11, recomendação aplicada pelo Orchestrator, vetável).

As 4 categorias do estúdio (IPA, Frutas, Malt, Lager) são as do catálogo, conforme [[visao]].

## Cenários

```gherkin
# language: pt
Funcionalidade: Geladeira em prateleiras por estilo

  Cenário: Um rótulo aparece lado a lado na prateleira da sua categoria
    Dado que tenho algumas unidades de uma mesma IPA na Geladeira
    Quando abro a Geladeira
    Então a prateleira IPA mostra as garrafas lado a lado com o total do rótulo

  Cenário: Dois rótulos da mesma categoria viram filas lado a lado
    Dado que tenho uma IPA na Geladeira
    Quando adiciono outra IPA
    Então cada rótulo forma uma fila, uma garrafa atrás da outra, na ordem em que entraram

  Cenário: Garrafa fantasma leva ao catálogo
    Dado uma posição livre na prateleira Frutas
    Quando toco na garrafa fantasma
    Então abro o catálogo filtrado pela categoria Frutas
```

## Regras de negócio

- Arrumação da prateleira (LB-49):
  - um rótulo ocupa as posições da frente lado a lado e o excedente forma fileiras atrás;
  - com dois ou mais rótulos, cada rótulo vira uma fila e os rótulos ficam lado a lado, na ordem de entrada.
- A arrumação é calculada por uma função pura (no card, `arrangeShelf` e `freeColumns`), testada isoladamente.
- Acessibilidade: cada prateleira é lida pela categoria e cada rótulo com nome, quantidade e total.
- Preço e total vêm da API (a Geladeira não calcula preço).

## Fora de escopo

- Arrastar garrafas entre prateleiras.
- Scroll dentro das prateleiras.
- Animações extras (luz piscando, balanço do ícone no header).
- Packs do Mix & Match aparecendo como caixa (Pós-MVP; ver [[mvp-corte]]).
- Cupom de desconto (MVP+) e favoritar (Pós-MVP) no resumo, por ora.

## Decisões relacionadas

- [[ADR-001-stack]]
- [[catalogo]]
