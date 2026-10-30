---
status: rascunho
modulo: design
card-notion: https://app.notion.com/p/3fd490a7ac7d818bbd1ef6ebfb609310
prioridade: P0
criado: 2026-10-29
atualizado: 2026-10-29
issues:
  - "#63 LB-11"
  - "#64 LB-12"
tags:
  - feature
---

# Identidade visual: tokens e componentes base

> [!info] Origem
> Derivada dos cards do Notion **LB-11** (#63, tokens de cor, tipografia e espaçamento) e **LB-12** (#64, botão, badge de estilo e chip de categoria), das 15 telas mobile do Figma (`Imagens/figma/figma-pagina-completa.png`) e da paleta de `Imagens/estudio-garrafas.html`. É a fundação visual da primeira entrega, o acesso ([[roteiro-mvp]]): [[boas-vindas]], [[cadastro-login]] e [[recuperacao-senha]] usam estes tokens e componentes.

## História de usuário

- **Como** pessoa que desenvolve as telas da Leguelé Beer
- **Quero** cores, fontes, espaçamentos e componentes base definidos uma única vez
- **Para** que toda tela siga o Figma sem valores soltos e com contraste acessível

## Cenários

```gherkin
# language: pt
Funcionalidade: Tokens e componentes base da marca

  Esquema do Cenário: Pares de texto e fundo atingem contraste AA
    Dado o par de tokens <texto> sobre <fundo>
    Quando o teste de contraste calcula a razão entre as duas cores
    Então a razão é de pelo menos 4,5:1

    Exemplos:
      | texto             | fundo            |
      | texto             | fundo            |
      | texto             | superficie       |
      | texto-suave       | superficie       |
      | primaria          | fundo            |
      | texto-na-primaria | primaria         |
      | texto-badge       | badge-ipa        |
      | texto-badge       | badge-malt       |
      | texto-badge       | badge-lager      |
      | texto-na-primaria | badge-frutas     |
      | sucesso           | superficie       |
      | erro              | superficie       |
      | aviso             | superficie       |

  Cenário: Cor fixa num componente é barrada pelo lint
    Dado um componente de apps/web com uma cor hexadecimal ou rgb escrita direto no código
    Quando executo "pnpm lint" na raiz
    Então o comando termina com código diferente de 0
    E a saída aponta o arquivo e pede o uso de um token

  Cenário: Botão em carregamento
    Dado um botão primário com o estado "carregando"
    Quando ele é exibido
    Então mostra um indicador de carregamento no lugar do ícone
    E fica desabilitado e com aria-busy="true"
    E tocar nele não dispara a ação

  Cenário: Só um chip de categoria selecionado por vez
    Dado a faixa de categorias com os chips "Todas (16)", "IPAs (4)" e "Frutas (4)", com "Todas" selecionado
    Quando toco em "IPAs"
    Então "IPAs" fica com aria-pressed="true" e o destaque de selecionado
    E "Todas" e "Frutas" ficam com aria-pressed="false"

  Esquema do Cenário: Badge de estilo usa a cor da categoria
    Dado uma cerveja da categoria <categoria>
    Quando o badge de estilo é exibido
    Então o fundo do badge é o token <token>
    E o texto é o nome da categoria em maiúsculas

    Exemplos:
      | categoria          | token             |
      | IPA                | badge-ipa         |
      | Frutas             | badge-frutas      |
      | Malt               | badge-malt        |
      | Lager              | badge-lager       |
      | categoria nova     | badge-neutro      |

  Cenário: Componentes base sem violações de acessibilidade
    Dado o botão nas variantes primária, contorno e discreta, o badge e o chip
    Quando a verificação automática de acessibilidade roda sobre eles
    Então não há violações
    E a área de toque de cada botão e chip mede pelo menos 44 × 44 px
```

## Regras de negócio

### Tokens de cor

Só tema escuro. Valores tirados da paleta de `estudio-garrafas.html` e conferidos por amostragem no print do Figma (o print tem gradientes e compressão; a amostra varia alguns tons). A vitrine dos tokens e componentes fica na home por enquanto, para conferência visual nos portais (decisão do Orchestrator, 2026-10-29). É provisória: quando o LB-24 ([[boas-vindas]]) entrar, a home volta a ser a da loja e a vitrine vai para `/dev/tokens`, disponível só no desenvolvimento, como pede o card LB-11.

| Token | Valor | Uso no Figma |
| --- | --- | --- |
| `fundo` | `#07120B` | Fundo das telas, por trás da folhagem |
| `superficie` | `#10261A` | Cards, campos de formulário, caixas de aviso |
| `superficie-elevada` | `#163021` | Chips não selecionados, badge neutro |
| `borda` | `#24452F` | Contorno de cards, campos e chips |
| `texto` | `#EEF5E6` | Títulos, rótulos e texto principal |
| `texto-suave` | `#A9BFA0` | Placeholders, legendas, preço riscado |
| `primaria` | `#B7E86A` | Verde-limão: botão primário, links, ícones dos campos, chip selecionado |
| `texto-na-primaria` | `#0C1C11` | Texto e ícone sobre o verde-limão |
| `texto-badge` | `#FFFFFF` | Texto dos badges IPA, MALT e LAGER |
| `badge-ipa` | `#177E26` | Badge "IPA" |
| `badge-frutas` | `#EB9725` | Badge "FRUTAS" |
| `badge-malt` | `#9F6838` | Badge "MALT" |
| `badge-lager` | `#47610E` | Badge "LAGER" |
| `badge-neutro` | igual a `superficie-elevada` | Categoria sem cor própria |
| `sucesso` | `#6FD98A` | Texto e ícone de confirmação (ex.: "Senha alterada") |
| `erro` | `#FF8A80` | Mensagens de erro dos campos e borda do campo inválido |
| `aviso` | `#F5B74A` | Avisos que pedem atenção (ex.: e-mail não confirmado) |

- O verde-limão nunca é fundo de texto claro nem aparece sobre fundo branco (o card avisa que não passa contraste).
- Badge: a cor sai do token da categoria pelo identificador (slug) da categoria. Categoria cadastrada depois, sem token, usa `badge-neutro`. O Stout aparece no Figma, mas saiu do catálogo ([[catalogo]]) e não ganha token.

- **Estados:** verde, vermelho e âmbar nos tons do tema escuro, usados como texto e ícone sobre `fundo` e `superficie` (decisão do Diego, 2026-10-29). Os valores acima são os implementados e testados pelo Front no LB-11 (passam AA sobre `superficie`, no teste de contraste).
- **Badge "FRUTAS":** texto `texto-na-primaria` (escuro), cerca de 7,5:1 (decisão do Diego, 2026-10-29). Texto claro daria cerca de 2,3:1.

### Tipografia

- **Texto:** Outfit (Google Fonts, carregada pelo `next/font`), pesos 400, 500 e 600. É a fonte de `estudio-garrafas.html` e bate com os botões e formulários do Figma.
- **Títulos de destaque** ("Criar sua conta", "Recuperar senha", "Sabor de verdade em cada gole!"): fonte manuscrita em pincel, com a segunda linha em verde-limão.

- **Fonte dos títulos:** **Kaushan Script** (Google Fonts, pelo `next/font`), escolhida pelo Front como a mais próxima do print; o Diego confere nos portais (decisão do Diego, 2026-10-29: "use a que preferir").

### Espaçamento, raios e sombras

- **Espaçamento:** escala de 4 px (4, 8, 12, 16, 20, 24, 32, 40, 48). Margem lateral das telas: 16 px no celular de 360 px.
- **Raios:** botões e chips de convidado em pílula (raio total); campos de formulário, cards e caixas de aviso 12 px; badge 999 px (pílula); chip de categoria 12 px.
- **Sombras:** nenhuma nos componentes base; profundidade vem de `superficie` e `borda`.
- **Valores fixos:** componentes usam só tokens. O lint barra cor fixa em `apps/web` (cenário "Cor fixa num componente é barrada pelo lint"); a definição dos tokens é o único lugar com valores.

### Componentes

- **Botão:** variantes primária (fundo verde-limão, ex.: "Entrar", "Criar conta" do formulário), contorno (borda verde-limão, fundo transparente, ex.: "Criar conta" da tela inicial) e discreta (fundo `superficie`, borda `borda`, ex.: "Continuar como convidado"). Ícone opcional à esquerda e/ou à direita (seta). Tamanhos: pequeno (ex.: "Adicionar" no card) e grande (largura total, nos formulários). Estados: carregando e desabilitado. Área de toque mínima de 44 × 44 px.
- **Badge de estilo:** pílula com o nome da categoria em maiúsculas, cor do token da categoria.
- **Chip de categoria:** ícone em cima, rótulo e contador entre parênteses abaixo ("IPAs (4)"); selecionável, um por vez, com `aria-pressed`. Selecionado: borda e texto em verde-limão. O comportamento na página está em [[catalogo]].

### Decisões do Diego (2026-10-29)

- **Pergunta 1:** fonte manuscrita dos títulos à escolha do Front, do Google Fonts, conferida pelo Diego nos portais. O Front escolheu Kaushan Script.
- **Pergunta 2:** cores de estado em verde, vermelho e âmbar nos tons do tema escuro.
- **Pergunta 3:** badge "FRUTAS" com texto escuro.

## Seams de teste

> [!info] Proposta, ainda não combinada com o Diego
> Tirada dos planos de teste dos cards LB-11 e LB-12.

- **Contraste:** função pura que calcula a razão de contraste de cada par de tokens (teste unitário, sem navegador).
- **Cor fixa:** regra de lint provada com um arquivo de exemplo que deve falhar (red antes da regra).
- **Botão, badge e chip:** testes de componente (Vitest + Testing Library) para variantes, estados e atributos ARIA, mais verificação com axe.
- **Área de toque e tela de 360 px:** E2E com viewport de celular, quando as telas de acesso usarem os componentes.

## Fora de escopo

- Modo claro.
- Biblioteca de componentes no Figma e Storybook.
- Card de produto e stepper (LB-13, #65), bottom sheet, toast e skeleton (LB-14, #66).
- Exportar logo, favicon e ícones do PWA (LB-16, MVP+) e otimizar o fundo de folhagem (LB-17, MVP+). As imagens de folhagem e o logo já existem em `Imagens/` e entram nas telas como estão.

## Decisões relacionadas

- [[ADR-003-pwa-mobile-first]]
- [[catalogo]]: faixa de categorias e badge nos cards.
- [[GLOSSARY]]: Categoria, Faixa de categorias.

## Decisões tomadas sem consulta

Decisões pequenas e fáceis de reverter, pela política de autonomia. Qualquer uma pode ser vetada.

- **Paleta:** valores de `estudio-garrafas.html`, conferidos no print do Figma, em vez de amostrar só o print (que tem gradiente e compressão).
- **Fonte de texto:** Outfit, a fonte declarada em `estudio-garrafas.html`.
- **Badge de categoria nova:** usa `badge-neutro`; a cor não fica no cadastro da categoria.
- **Texto dos badges em branco puro (`texto-badge`):** com `texto` (`#EEF5E6`) o badge MALT fica em cerca de 4,2:1 e não passa AA; com branco puro fica em cerca de 4,7:1.
- **Nomes dos tokens em português:** seguem o [[GLOSSARY]] e o resto do vault.
- **Escala de espaçamento e raios:** medidos no print das telas de acesso e da home.

## Tickets propostos

Reconciliação com as issues migradas, a aplicar depois do merge desta spec (aprovação permanente para reconciliar).

| Issue | Ajuste proposto | Motivo |
| --- | --- | --- |
| #63 LB-11 | Link para esta spec; critérios: os cenários de contraste e de cor fixa; tabela de tokens; Outfit como fonte de texto | A issue só aponta para o Notion |
| #64 LB-12 | Link para esta spec; critérios: os cenários de botão, chip, badge e acessibilidade; badge de categoria nova com `badge-neutro`; Stout sem token | O card cita o Stout e não define a cor de categoria nova |
