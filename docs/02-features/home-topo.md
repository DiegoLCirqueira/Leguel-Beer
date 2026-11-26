---
status: rascunho
modulo: catalogo
card-notion:
prioridade: P1
criado: 2026-11-21
tags:
  - feature
---

# Topo da home

> [!info] Origem
> Ordem do Diego em 21/11: a parte de cima da home está simples demais (só o título "Leguelé Beer" e a lista de destaques) e deve seguir o design dele, `Imagens/figma/telas/02-inicio.png`. Spec própria, separada de [[destaques-home]], pelo limite de 6 cenários por spec. Substitui, para o herói, o "Não entra" de [[destaques-home]] de 30/10 (o herói aqui é um bloco fixo; o banner rotativo continua fora, LB-32, MVP+).

## História de usuário

- **Como** cliente ou convidado no celular
- **Quero** ver na home um topo com a marca, uma chamada e as categorias
- **Para** entender a loja de relance e chegar ao catálogo em um toque

## Cenários

```gherkin
# language: pt
Funcionalidade: Topo da home

  Cenário: Herói com a chamada e o botão do catálogo
    Dado que abro a home
    Então vejo no topo o selo "Cervejas artesanais"
    E vejo o título "Sabor de verdade em cada gole!"
    E vejo o texto "Cervejas artesanais feitas com os melhores ingredientes e muito mais sabor."
    E vejo o botão "Ver catálogo"

  Cenário: "Ver catálogo" abre o catálogo
    Dado que estou na home
    Quando toco em "Ver catálogo" no herói
    Então abro o catálogo sem filtros

  Cenário: Faixa de categorias na home
    Dado 4 categorias com cervejas ativas, somando 16 cervejas
    Quando abro a home
    Então vejo a faixa "Todas (16)", "IPAs (4)", "Frutas (4)", "Malt (4)" e "Lager (4)"
    E ao tocar em "IPAs (4)" abro o catálogo filtrado em IPAs

  Cenário: Cabeçalho com a marca e a Geladeira
    Dado que abro a home com 3 unidades na Geladeira
    Então vejo no cabeçalho o logo da Leguelé Beer e o ícone da Geladeira com o contador "3"
    E ao tocar no logo continuo na home
    E ao tocar na Geladeira abro a Geladeira

  Cenário: Sem destaques o topo continua
    Dado que nenhuma cerveja ativa está marcada como destaque
    Quando abro a home
    Então vejo o herói, o cabeçalho e a faixa de categorias
    E a seção "Cervejas em destaque" não aparece
```

## Regras de negócio

- **Herói:** um bloco fixo (sem rotação, sem carrossel) logo abaixo do cabeçalho, com o selo "Cervejas artesanais" (no design aparece em maiúsculas: é estilo, o texto continua em caixa normal e a maiúscula vem do CSS), o título "Sabor de verdade em cada gole!" (a última linha, "cada gole!", em verde da marca, como no design), o texto de apoio e o botão primário "Ver catálogo" com seta, que leva a `/catalogo`. À direita do texto, a arte de uma garrafa com um copo, como no design.
- **Logo (decisão vetável do Diego, item 2 da política: marca e uso do logo são dele):** o cabeçalho da home usa a versão **com o nome** do logo, com fundo transparente, que já está no repo em `apps/web/public/acesso/logo-nome.webp` (a das telas de acesso); se o Front vir que não é a arte do design, a fonte é `Imagens/figma/logos/logo-com-nome-leguele-agudo-removebg-preview.png` (fora do repo), otimizada para WebP. O símbolo sozinho (`logo-simbolo`) não entra no topo da home. Se o Diego quiser outro arquivo ou outro uso do logo, é troca de um caminho.
- **Texto do herói (decisão vetável do Diego):** o título, o selo, o texto de apoio e o botão vêm do design dele (`02-inicio.png`); a spec os aceita como estão. Qualquer ajuste de texto é do Diego ([[identidade-visual]], texto de marca).
- **Arte:** as imagens vêm de `Imagens/` (fora do repo); o Front escolhe a que combina com o design, otimiza e a copia para o repo. Fundo escuro com as folhas de lúpulo do design, sem imagem de terceiros.
- **Faixa de categorias:** a mesma do [[catalogo]] (chips com contador, "Todas" primeiro), agora também na home; tocar leva a `/catalogo` com a categoria escolhida; "Todas" leva ao catálogo sem filtro. Os números vêm da API, nunca fixos; categoria sem cerveja ativa não aparece. O design mostra "Stouts" e "23": não valem (são 4 categorias e 16 cervejas, [[destaques-home]]).
- **Cabeçalho:** o logo da marca (versão com o nome, como no design) à esquerda e o ícone da Geladeira com o contador à direita, nos alvos de 44 px. É o cabeçalho da loja do LB-15 ([[catalogo]]), só com o logo maior na home; as outras telas da loja mantêm o cabeçalho atual.
- **Lupa:** o design mostra uma lupa de busca ao lado da Geladeira. Recomendação do Spec, vetável: **não entra** até a busca existir (LB-37, MVP+), para não ter um botão que não faz nada; a regra de [[catalogo]] ("sem lupa") continua. Quando a busca entrar, a lupa volta ao cabeçalho da home.
- **Ordem na tela:** cabeçalho, herói, faixa de categorias, seção "Cervejas em destaque" ([[destaques-home]]).
- **Sem destaques:** a seção some e o topo continua ([[destaques-home]]); a tela 27 do design (mensagem "Nenhum destaque no momento") não vale.
- **Barra inferior:** a mesma da loja (Início, Catálogo, Geladeira, Perfil); "Mix & Match" e "Carrinho" do design não entram (o termo é Geladeira).

## Referência visual

| Tela | Vale para |
| --- | --- |
| `02-inicio.png` | Cabeçalho, herói e faixa de categorias |
| `27-inicio-sem-destaques.png` | Não vale como está (ver acima) |

## Fora de escopo

- Banner rotativo (LB-32, MVP+), banner do Clube, busca e lupa (LB-37, MVP+), coração de favoritar.
- Seção de destaques e seus cards: [[destaques-home]].

## Seams de teste

> [!info] Proposta do Spec, vetável

- **Componente** (Vitest): herói com os textos e o botão que leva a `/catalogo`; faixa com os contadores vindos da API e o link com a categoria; cabeçalho com o logo e o contador.
- **E2E** (celular, 360 × 640): home mostra o herói e a faixa; tocar em "IPAs" abre o catálogo filtrado; sem destaques o topo segue e a seção some; o herói não cobre nem empurra o botão "Ver catálogo" para fora da primeira tela.

## Fatias

| # | Dono | O que entrega |
| --- | --- | --- |
| 1 | Front | Herói com a arte e o botão, no padrão de `components/ui` (vitrine `/dev/tokens` se criar componente) |
| 2 | Front | Faixa de categorias e cabeçalho com o logo na home |

Candidatos a ADR: nenhum.

## Decisões relacionadas

- [[destaques-home]], [[catalogo]], [[identidade-visual]], [[mvp-corte]], [[geladeira]]

## Decisões tomadas sem consulta

Recomendações aplicadas em 21/11; qualquer uma pode ser vetada.

- **Textos do herói** como estão no design do Diego (decisão vetável dele).
- **Lupa fora** até a busca (LB-37), por não haver o que buscar.
- **Herói fixo**, sem rotação.
- **Faixa de categorias** reaproveitada do catálogo, com números da API.
- **Spec separada** de [[destaques-home]], pelo limite de 6 cenários.
