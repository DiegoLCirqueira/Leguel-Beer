---
status: rascunho
modulo: design
card-notion: https://app.notion.com/p/3fd490a7ac7d818bbd1ef6ebfb609310
prioridade: P0
criado: 2026-10-29
atualizado: 2026-10-31
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
      | primaria          | superficie       |
      | texto-na-primaria | primaria         |
      | texto-badge       | badge-ipa        |
      | texto-badge       | badge-malt       |
      | texto-badge       | badge-lager      |
      | texto-na-primaria | badge-frutas     |
      | texto             | arte-vidro       |
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

  Esquema do Cenário: Nenhuma página tem rolagem horizontal
    Dado uma tela com <largura> px de largura
    Quando abro cada página do site
    Então a largura do conteúdo não passa da largura da tela
    E não consigo rolar a página na horizontal

    Exemplos:
      | largura |
      | 320     |
      | 360     |
      | 390     |
      | 430     |
      | 767     |
      | 768     |
      | 1024    |
      | 1440    |

  Cenário: Componentes base sem violações de acessibilidade
    Dado o botão nas variantes primária, contorno e discreta, o badge e o chip
    Quando a verificação automática de acessibilidade roda sobre eles
    Então não há violações
    E a área de toque de cada botão e chip mede pelo menos 44 × 44 px
```

## Regras de negócio

### Tokens de cor

Só tema escuro. O verde da marca, o texto sobre ele e o texto principal são os valores medidos no Figma pelo Front na tela de [[boas-vindas]] (decisão do Diego, 2026-10-30: valem no site inteiro). Os demais vêm da paleta de `estudio-garrafas.html`, conferidos por amostragem no print do Figma (o print tem gradientes e compressão; a amostra varia alguns tons). A vitrine dos tokens e componentes fica em `/dev/tokens`, disponível só no desenvolvimento, como pede o card LB-11 (saiu da home quando o LB-24, [[boas-vindas]], entrou).

| Token | Valor | Uso no Figma |
| --- | --- | --- |
| `fundo` | `#07120B` | Fundo das telas, por trás da folhagem |
| `superficie` | `#10261A` | Cards, campos de formulário, caixas de aviso |
| `superficie-elevada` | `#163021` | Chips não selecionados, badge neutro |
| `borda` | `#24452F` | Contorno de cards, campos e chips |
| `texto` | `#F7FBF5` | Títulos, rótulos e texto principal |
| `texto-suave` | `#A9BFA0` | Placeholders, legendas, preço riscado |
| `primaria` | `#95DC50` | Verde da marca: botão primário, links, ícones dos campos, chip selecionado |
| `texto-na-primaria` | `#000A00` | Texto e ícone sobre o verde da marca |
| `texto-badge` | `#FFFFFF` | Texto dos badges IPA, MALT e LAGER |
| `badge-ipa` | `#177E26` | Badge "IPA" |
| `badge-frutas` | `#EB9725` | Badge "FRUTAS" |
| `badge-malt` | `#9F6838` | Badge "MALT" |
| `badge-lager` | `#47610E` | Badge "LAGER" |
| `badge-neutro` | igual a `superficie-elevada` | Categoria sem cor própria |
| `sucesso` | `#6FD98A` | Texto e ícone de confirmação (ex.: "Senha alterada") |
| `erro` | `#FF8A80` | Mensagens de erro dos campos e borda do campo inválido |
| `aviso` | `#F5B74A` | Avisos que pedem atenção (ex.: e-mail não confirmado) |
| `arte-vidro` | `#0B1C0D` | Fundo translúcido dos controles sobre a arte (ex.: "Continuar como convidado" na [[boas-vindas]]) |
| `arte-borda` | `#2D3D2F` | Contorno dos controles translúcidos sobre a arte |
| `arte-linha` | `#A3A698` | Linhas do separador "ou" sobre a arte |

- **Tokens `arte-*`:** os medidos na arte da [[boas-vindas]] que coincidem com tokens da marca deixam de existir à parte: `arte-botao` vira `primaria`, `arte-tinta` vira `texto-na-primaria` e `arte-texto` vira `texto`. Ficam só os três acima, próprios dos controles translúcidos sobre a arte.

- O verde da marca nunca é fundo de texto claro nem aparece sobre fundo branco (o card avisa que não passa contraste).
- Badge: a cor sai do token da categoria pelo identificador (slug) da categoria. Categoria cadastrada depois, sem token, usa `badge-neutro`. O Stout aparece no Figma, mas saiu do catálogo ([[catalogo]]) e não ganha token.

- **Contraste refeito (2026-10-30)** para os pares que mudaram, com os valores do Figma: `texto` sobre `fundo` 18,2:1 (antes 17,1), `texto` sobre `superficie` 15,3:1 (antes 14,3), `primaria` sobre `fundo` 11,5:1 (antes 13,4), `primaria` sobre `superficie` 9,6:1, `texto-na-primaria` sobre `primaria` 12,1:1 (antes 12,4), `texto-na-primaria` sobre `badge-frutas` 8,6:1 (antes 7,5) e `texto` sobre `arte-vidro` 16,9:1 (valor do vidro opaco; na tela o vidro tem 80% de opacidade sobre a arte, e o contraste real é conferido no ponto mais claro da arte atrás do controle, ver Seams de teste). Todos passam AA (4,5:1).
- **Estados:** verde, vermelho e âmbar nos tons do tema escuro, usados como texto e ícone sobre `fundo` e `superficie` (decisão do Diego, 2026-10-29). Os valores acima são os implementados e testados pelo Front no LB-11 (passam AA sobre `superficie`, no teste de contraste).
- **Badge "FRUTAS":** texto `texto-na-primaria` (escuro), cerca de 8,6:1 com os valores do Figma (decisão do Diego, 2026-10-29). Texto claro daria cerca de 2,2:1.

### Tipografia

- **Texto:** Figtree (Google Fonts, carregada pelo `next/font`), pesos 400, 500, 600 e 700, no site inteiro: textos, botões, campos e formulários. É a fonte medida no Figma pelo Front na [[boas-vindas]] (decisão do Diego, 2026-10-30). Substitui a Outfit, que sai do site.
- **Títulos de destaque** ("Criar sua conta", "Recuperar senha", "Sabor de verdade em cada gole!"): fonte manuscrita em pincel, com a segunda linha no verde da marca.

- **Fonte dos títulos:** **Kaushan Script** (Google Fonts, pelo `next/font`), escolhida pelo Front como a mais próxima do print; o Diego confere nos portais (decisão do Diego, 2026-10-29: "use a que preferir").

### Telas e layout

- **Mobile (320 a 767 px):** o site é desenhado para celular e se encaixa em qualquer aparelho dessa faixa, com layout fluido (decisão do Diego, 2026-10-31). Nenhuma página tem rolagem horizontal (cenário "Nenhuma página tem rolagem horizontal"). A [[boas-vindas]] e a pergunta de [[maioridade-entrada]] ficam sem rolagem vertical em retrato a partir de ~640 px de altura; na horizontal ou com zoom alto podem rolar, para os controles continuarem alcançáveis (WCAG 1.4.10, como aprovado no #138). Os tokens desta spec valem em qualquer largura.
- **Tablet e desktop (768 px ou mais):** ganham uma versão própria, igual ou parecida com a de desktop, feita só depois de o mobile estar 100% pronto e quando o design de web existir no Figma (decisões do Diego, 2026-10-30 e 2026-10-31). Até lá, em 768 px ou mais o site só não pode quebrar: sem rolagem horizontal, sem conteúdo cortado ou sobreposto e com os controles utilizáveis.

### Espaçamento, raios e sombras

- **Espaçamento:** escala de 4 px (4, 8, 12, 16, 20, 24, 32, 40, 48). Margem lateral das telas: 16 px no celular de 360 px.
- **Raios:** botões e chips de convidado em pílula (raio total); campos de formulário, cards e caixas de aviso 12 px; badge 999 px (pílula); chip de categoria 12 px.
- **Sombras:** nenhuma nos componentes base; profundidade vem de `superficie` e `borda`.
- **Valores fixos:** componentes usam só tokens. O lint barra cor fixa em `apps/web` (cenário "Cor fixa num componente é barrada pelo lint"); a definição dos tokens é o único lugar com valores.

### Componentes

- **Botão:** variantes primária (fundo verde da marca, ex.: "Entrar", "Criar conta" do formulário), contorno (borda verde da marca, fundo transparente, ex.: "Criar conta" da tela inicial) e discreta (fundo `superficie`, borda `borda`; sobre a arte da [[boas-vindas]], "Continuar como convidado" usa `arte-vidro` e `arte-borda`). Ícone opcional à esquerda e/ou à direita (seta). Tamanhos: pequeno (ex.: "Adicionar" no card) e grande (largura total, nos formulários). Estados: carregando e desabilitado. Área de toque mínima de 44 × 44 px.
- **Botão de voltar das telas de acesso** (`/entrar` e `/criar-conta`): fica sobre a folhagem, então tem destaque para não perder visibilidade, com fundo `arte-vidro` quase opaco e borda de 2 px no verde da marca (decisão do Diego, 2026-10-31). Área de toque de 44 × 44 px, como os botões. Exceção: os links do rodapé têm 24 px, de propósito ([[termos-privacidade]]).
- **Badge de estilo:** pílula com o nome da categoria em maiúsculas, cor do token da categoria.
- **Chip de categoria:** ícone em cima, rótulo e contador entre parênteses abaixo ("IPAs (4)"); selecionável, um por vez, com `aria-pressed`. Selecionado: borda e texto no verde da marca. O comportamento na página está em [[catalogo]].

### Decisões do Diego (2026-10-29)

- **Pergunta 1:** fonte manuscrita dos títulos à escolha do Front, do Google Fonts, conferida pelo Diego nos portais. O Front escolheu Kaushan Script.
- **Pergunta 2:** cores de estado em verde, vermelho e âmbar nos tons do tema escuro.
- **Pergunta 3:** badge "FRUTAS" com texto escuro.

### Decisões do Diego (2026-10-30)

- **Cores e fonte do Figma no site inteiro:** "1- A, qnd o design pra web estiver pronto (tamnaho de tela de pc) a gente organiza direito a visualização de desktop". O verde `#95DC50` e a Figtree, medidos na [[boas-vindas]], valem em todas as telas, não só no acesso; o layout de desktop espera o design de web.

### Decisões do Diego (2026-10-31)

- **Telas responsivas:** "Verificar os tamanhos de tela, precisa que encaixe em qualquer dispositivo mobile, deve ser algo responsivo, quando chegar na resolução de tablet faremos igual/semelhante a versão de desktop". Mobile de 320 a 767 px, fluido e sem rolagem horizontal; de 768 px para cima, versão própria parecida com a de desktop, depois do mobile 100%.
- **Rodapé e botão de voltar:** "o footer está MUITO grande, deve ser pequeno, praticamente um detalhe" e "de um destaque no botão de retornar já que a folhagem pode tirar um pouco da sua visibilidade". Rodapé discreto, com links de 24 px de área de toque, e botão de voltar destacado sobre a folhagem.

## Seams de teste

> [!info] Proposta, ainda não combinada com o Diego
> Tirada dos planos de teste dos cards LB-11 e LB-12.

- **Contraste:** função pura que calcula a razão de contraste de cada par de tokens (teste unitário, sem navegador).
- **Vidro sobre a arte:** o contraste de `texto` sobre `arte-vidro` a 80% é medido na cor composta com o ponto mais claro da arte atrás do controle (E2E ou captura de tela), não só com o vidro opaco.
- **Cor fixa:** regra de lint provada com um arquivo de exemplo que deve falhar (red antes da regra).
- **Botão, badge e chip:** testes de componente (Vitest + Testing Library) para variantes, estados e atributos ARIA, mais verificação com axe.
- **Área de toque e tela de 360 px:** E2E com viewport de celular, quando as telas de acesso usarem os componentes.
- **Rolagem horizontal:** E2E que abre as páginas existentes em cada largura do cenário e compara a largura do documento com a da tela.

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

- **Paleta:** fora os valores medidos no Figma (`primaria`, `texto-na-primaria`, `texto`), valores de `estudio-garrafas.html`, conferidos no print do Figma, em vez de amostrar só o print (que tem gradiente e compressão).
- **`superficie` e `borda` mantidos (2026-10-30):** o vidro e a borda medidos na [[boas-vindas]] são de controles translúcidos sobre a arte e ficam como `arte-vidro` e `arte-borda`. Trocar `superficie` por `#0B1C0D` deixaria cards e campos quase da cor do `fundo`.
- **Kaushan Script mantida nos títulos (2026-10-30):** o título da [[boas-vindas]] faz parte da arte (imagem), então o Figma não mostra outra fonte.
- **Badge de categoria nova:** usa `badge-neutro`; a cor não fica no cadastro da categoria.
- **Texto dos badges em branco puro (`texto-badge`):** com `texto` (`#F7FBF5`) o badge MALT fica em cerca de 4,45:1 e não passa AA; com branco puro fica em cerca de 4,7:1.
- **Nomes dos tokens em português:** seguem o [[GLOSSARY]] e o resto do vault.
- **Escala de espaçamento e raios:** medidos no print das telas de acesso e da home.

## Tickets propostos

Reconciliação com as issues migradas, a aplicar depois do merge desta spec (aprovação permanente para reconciliar).

| Issue | Ajuste proposto | Motivo |
| --- | --- | --- |
| #63 LB-11 | Link para esta spec; critérios: os cenários de contraste e de cor fixa; tabela de tokens; Figtree como fonte de texto | A issue só aponta para o Notion |
| #64 LB-12 | Link para esta spec; critérios: os cenários de botão, chip, badge e acessibilidade; badge de categoria nova com `badge-neutro`; Stout sem token | O card cita o Stout e não define a cor de categoria nova |
