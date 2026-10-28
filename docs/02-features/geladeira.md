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

> [!todo] Preencher: o papel antigo fala em "imagem de fundo", mas o LB-49 pede a moldura da geladeira em CSS, sem imagem pesada. Decidir qual vale.

> [!todo] Preencher: número de prateleiras, posições por prateleira, profundidade máxima e volume das garrafas dependem do tamanho e das categorias do catálogo, ainda pendentes em [[visao]].

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

## Decisões relacionadas

- [[ADR-001-stack]]
- [[catalogo]]
