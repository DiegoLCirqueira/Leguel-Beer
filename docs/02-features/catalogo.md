---
status: rascunho
modulo: catalogo
card-notion: https://app.notion.com/p/3fd490a7ac7d81c5ba2cf6a3db8448c6
prioridade: P0
criado: 2026-10-28
atualizado: 2026-11-08
issues:
  - "#25 LB-36"
  - "#22 LB-33"
  - "#27 LB-38"
tags:
  - feature
---

# Catálogo

> [!info] Origem
> Derivada dos cards do Notion **LB-36** (#25), **LB-33** (#22) e **LB-38** (#27) e do schema do **LB-4** (#13), com as decisões do Diego na entrevista de 2026-10-28. Os valores das faixas de filtro foram propostos em 08/11 (recomendação aplicada, vetável). Os termos seguem o [[GLOSSARY]]. Outras partes do épico E3: [[destaques-home]] (LB-34) e [[adicionar-do-card]] (LB-35).

## História de usuário

- **Como** cliente ou convidado no celular
- **Quero** explorar as cervejas filtrando por categoria e atributos e ordenando a lista
- **Para** encontrar rápido a cerveja que combina com o meu gosto

## Cenários

```gherkin
# language: pt
Funcionalidade: Catálogo de cervejas

  Esquema do Cenário: Combinar filtros e ordenação
    Dado que <quantidade> IPAs ativas têm IBU dentro de uma faixa de IBU
    E as outras cervejas são de outras categorias ou têm IBU fora dessa faixa
    Quando filtro pela categoria IPA e por essa faixa de IBU e ordeno por menor preço
    Então vejo só essas IPAs, da mais barata para a mais cara
    E vejo a contagem "<contagem>" e a ação "Limpar filtros"

    Exemplos:
      | quantidade | contagem   |
      | 3          | 3 cervejas |
      | 1          | 1 cerveja  |

  Cenário: Abrir um link compartilhado com filtros
    Dado uma URL do catálogo com filtros e ordenação aplicados
    Quando abro essa URL em outro aparelho
    Então os mesmos filtros e a mesma ordenação já vêm aplicados

  Cenário: Filtros sem nenhum resultado
    Dado que nenhuma cerveja ativa atende aos filtros escolhidos
    Quando aplico os filtros
    Então vejo "Nenhuma cerveja encontrada com esses filtros." e a ação "Limpar filtros"
    E ao tocar em "Limpar filtros" vejo todas as cervejas ativas

  Cenário: Filtrar pela faixa de categorias com contador
    Dado 6 IPAs ativas e 1 IPA inativa
    E uma categoria sem nenhuma cerveja ativa
    Quando toco no chip "IPAs" da faixa de categorias na home
    Então vejo o catálogo só com as 6 IPAs ativas
    E o chip "IPAs" fica destacado e mostra 6
    E a categoria sem cervejas ativas não aparece na faixa

  Esquema do Cenário: Ordem padrão por relevância e "mais novas"
    Dado que existem estas cervejas ativas, todas com quantidade disponível:
      | cerveja      | categoria | destaque | cadastrada em |
      | Lager Praia  | Lager     | sim      | 2026-10-01    |
      | IPA Zabumba  | IPA       | não      | 2026-10-03    |
      | IPA Aratu    | IPA       | não      | 2026-10-02    |
      | Frutas Caju  | Frutas    | não      | 2026-10-04    |
    E a ordem das categorias é IPA, Frutas, Malt, Lager
    Quando abro o catálogo com a ordenação <ordenação>
    Então vejo as cervejas na ordem <ordem>

    Exemplos:
      | ordenação             | ordem                                            |
      | padrão (sem escolher) | Lager Praia, IPA Aratu, IPA Zabumba, Frutas Caju |
      | "mais novas"          | Frutas Caju, IPA Zabumba, IPA Aratu, Lager Praia |

  Cenário: Cerveja esgotada por reservas vai para o fim
    Dado uma cerveja com estoque 3 e 3 unidades reservadas em pedidos pendentes
    E outras cervejas com quantidade disponível
    Quando ordeno o catálogo por menor preço
    Então a cerveja esgotada mostra o selo "Esgotado" e o botão "Adicionar" desabilitado
    E ela aparece depois de todas as cervejas com quantidade disponível, mesmo sendo a mais barata
```

## Regras de negócio

- **Página:** `/catalogo` com todas as cervejas ativas. Cervejas inativas nunca aparecem, nem pelo link direto.
- **Tamanho do catálogo no MVP:** 16 cervejas em 4 categorias (IPA, Frutas, Malt, Lager), 4 por categoria, sem Stout. As categorias vêm do cadastro e podem mudar.
- **Filtros:** categoria, teor alcoólico, IBU, faixa de preço e "só disponíveis", num bottom sheet.
  - Categoria: uma por vez; o chip "Todas" remove o filtro.
  - Teor alcoólico, IBU e preço usam **faixas fixas** (valores em "Faixas de filtro"). Cada faixa inclui o limite inferior e exclui o superior (ex.: uma faixa de 30 a 60 inclui IBU 30 e não inclui IBU 60). Uma faixa por atributo; "Qualquer" remove o filtro.
  - "Só disponíveis" esconde as cervejas esgotadas.
- **Ordenação:** relevância (padrão), menor preço, maior preço, mais novas.
  - **Relevância:** cervejas em destaque primeiro, depois a ordem das categorias e, por fim, o nome.
  - **Mais novas:** pela data de cadastro, da mais recente para a mais antiga.
  - **Esgotadas sempre no fim:** a lista tem dois grupos, primeiro as cervejas com quantidade disponível e depois as esgotadas; a ordenação escolhida vale dentro de cada grupo.
- **URL:** filtros e ordenação ficam na URL (ex.: `?categoria=ipa`), e o mesmo link reproduz a mesma lista.
- **Contagem de resultados:** "N cervejas" (singular: "1 cerveja"), com a ação "Limpar filtros".
- **Estado vazio:** "Nenhuma cerveja encontrada com esses filtros." com a ação "Limpar filtros".
- **Faixa de categorias:** começa com "Todas"; cada chip mostra a quantidade de cervejas ativas da categoria; categoria sem cervejas ativas não aparece.
- **Esgotada:** cerveja ativa com quantidade disponível (estoque menos reservas de pedidos pendentes) igual a zero. Mostra o selo "Esgotado" e o botão "Adicionar" desabilitado.
- **Convidado:** navega pelo catálogo e monta a Geladeira sem conta; só precisa entrar na conta para finalizar a compra (ver [[adicionar-do-card]] e [[visao]]).

## Faixas de filtro

> [!info] Recomendação aplicada, vetável (08/11)
> O Diego decidiu o formato (faixas fixas, limite inferior incluído e superior excluído) em 2026-10-28; os limites são produto e não estavam definidos. Aplicada a opção mais simples e reversível: 3 faixas por atributo, calibradas pelos números do design (teor de 4,5% a 6,5%; preço de R$ 24,90 a R$ 32,00). Trocar os limites é mudar uma constante em `@leguele/shared`, sem migration.

| Atributo | Faixas (id na URL: intervalo) |
| --- | --- |
| Teor alcoólico (`teor`) | `ate-4-5`: abaixo de 4,5% · `4-5-a-6`: de 4,5% a menos de 6% · `6-ou-mais`: 6% ou mais |
| IBU (`ibu`) | `ate-20`: abaixo de 20 · `20-a-40`: de 20 a menos de 40 · `40-ou-mais`: 40 ou mais |
| Preço (`preco`) | `ate-25`: abaixo de R$ 25,00 · `25-a-30`: de R$ 25,00 a menos de R$ 30,00 · `30-ou-mais`: R$ 30,00 ou mais |

Os rótulos mostrados são "Até 4,5%", "4,5% a 6%", "6% ou mais" (e os equivalentes de IBU e preço). Id de faixa desconhecido na URL é ignorado, como qualquer parâmetro inválido.

## Referência visual

Telas do design (fora do repo, em `Imagens/figma/telas/`), só como referência visual: regras e textos vêm desta spec, normalizados ao padrão aprovado (Figtree e Kaushan Script, tokens do `globals.css`, `Button`, `Campo`, `StyleBadge`, `CategoryChips`, alvos de 44 px; ver [[identidade-visual]]).

| Tela | Data do arquivo | Vale para |
| --- | --- | --- |
| `16-catalogo.png` | 08/11/2026 | Catálogo: cabeçalho, faixa de categorias, grade de cards e bottom sheet "Filtros e ordenação" |
| `25-catalogo-sem-resultado.png` | 08/11/2026 | Estado vazio dos filtros |
| `26-card-esgotado.png` | 08/11/2026 | Card esgotado |
| `02-inicio.png` | 30/10/2026 | Home: faixa de categorias e seção de destaques (ver [[destaques-home]]) |

**Entra:** lista em grade de 2 colunas; faixa de categorias com contador; bottom sheet com categoria, três faixas, "Só disponíveis", "Ordenar por", "Limpar filtros" e "Aplicar"; card esgotado com selo e "Adicionar" desabilitado; estado vazio com "Limpar filtros".

**Não entra (o design diverge da spec; vale a spec):**
- "Stouts" e o total "23": o catálogo tem 4 categorias e 16 cervejas, sem Stout.
- Sliders de teor, IBU e preço: viram faixas fixas.
- "Mais vendidos": a ordenação padrão é "Relevância" (não há dado de venda no MVP).
- "Só disponíveis" ligado: começa desligado.
- Busca e a lupa (LB-37, MVP+), coração de favoritar (Pós-MVP), "Mix & Match", abas extras e o banner do Clube.
- "Carrinho": o termo é Geladeira.
- Preço riscado: promoção ainda não tem spec (vem com o admin).
- Barra de status do iPhone.
- Estado vazio: vale o texto da spec ("Nenhuma cerveja encontrada com esses filtros."), com a contagem e os filtros ativos visíveis, que faltam na tela 25.
- Cabeçalho e barra inferior da loja: são o LB-15 (ver "Contrato e fatias").

## Seams de teste

> [!info] Proposta, ainda não combinada com o Diego
> Tirada dos planos de teste dos cards.

- **Leitura dos parâmetros da URL:** transforma a URL em filtros e ordenação válidos (teste unitário).
- **Ordenação do catálogo:** relevância e esgotadas no fim como regra pura (teste unitário).
- **Consulta do catálogo na API:** filtra, ordena e devolve só cervejas ativas (integração com banco real e teste da rota).
- **Quantidade disponível:** estoque menos reservas de pedidos pendentes (integração com banco real).
- **Contagem por categoria:** ignora inativas e omite categorias vazias (integração com banco real).
- **Faixa de categorias e variante esgotada do card:** testes de componente.
- **Cenários desta spec:** E2E.

## Fora de escopo

- Paginação (desnecessária para 16 cervejas).
- Busca textual (LB-37, #26, milestone MVP+).
- Banner rotativo de destaques (LB-32, #21, milestone MVP+).
- Página de produto (épico E10: LB-40, LB-41, LB-42), que terá spec própria.
- "Avise-me quando chegar" para cervejas esgotadas.
- Escrita no catálogo (cadastro de cervejas no admin, LB-73).

## Decisões relacionadas

- [[ADR-001-stack]]
- [[ADR-005-monorepo-camadas]]
- [[mvp-corte]]
- Arquitetura: [[visao-geral]]
- [[destaques-home]] e [[adicionar-do-card]]: as outras partes do épico E3.
- [[geladeira]]: a garrafa fantasma abre o catálogo filtrado pela categoria.

### Decisões do Diego (entrevista de 2026-10-28)

Os números são os da entrevista; a pergunta 6 foi decidida pelo Orchestrator (ver "Decisões tomadas sem consulta").

- **Pergunta 1:** catálogo do MVP com 16 cervejas, 4 categorias (IPA, Frutas, Malt, Lager), sem Stout; categorias vêm do cadastro.
- **Pergunta 2:** escopo é o épico E3 do milestone MVP inteiro (LB-33, 34, 35, 36, 38), sem a página de produto (E10), a busca (LB-37) e o banner (LB-32).
- **Pergunta 3:** relevância é a ordenação padrão: destaques, depois a ordem das categorias, depois o nome.
- **Pergunta 4:** esgotadas sempre no fim; a ordenação vale dentro de cada grupo; "só disponíveis" esconde esgotadas.
- **Pergunta 5:** filtros de teor alcoólico, IBU e preço com faixas fixas, limite inferior incluído e superior excluído (valores em aberto).
- **Pergunta 7:** textos dos cards aprovados; estado vazio "Nenhuma cerveja encontrada com esses filtros."; contagem "N cervejas" / "1 cerveja".
- **Pergunta 8:** o convidado adiciona à Geladeira e só entra na conta no checkout; o [[visao]] foi ajustado.
- **Uma categoria por vez:** proposta do Spec, confirmada pelo Diego.

## Decisões tomadas sem consulta

Decisões pequenas e fáceis de reverter, tomadas pela política de autonomia do Diego. Qualquer uma pode ser vetada.

- **História de usuário:** aceita como proposta (decisão do Orchestrator sobre a pergunta 6, 2026-10-28).
- **Parâmetro inválido na URL:** é ignorado e o catálogo abre sem aquele filtro, sem mensagem de erro.
- **Chip na home:** tocar num chip da faixa de categorias na home abre `/catalogo` filtrado por aquela categoria.
- **Contadores fixos:** o contador de cada chip conta as cervejas ativas da categoria, incluindo as esgotadas, e não muda com os outros filtros aplicados.
- **"Mais novas":** pela data de cadastro da cerveja.
- **"Só disponíveis":** começa desligado.
- **Nomes nos exemplos:** os nomes de cerveja dos cenários (Lager Praia, IPA Aratu etc.) são dados de teste, não rótulos da Leguelé.
- **Specs separadas:** destaques da home ([[destaques-home]]) e Adicionar direto do card ([[adicionar-do-card]]) ficam em specs próprias, por causa do limite de 6 cenários por spec (proposta do Spec, adotada pelo Orchestrator; o Diego decidiu só o escopo, na pergunta 2).

## Tickets propostos

Reconciliação com as issues migradas do milestone MVP, para as três specs do épico E3. **Aplicada em 2026-10-29** nas issues #13, #20, #22, #23, #24, #25 e #27, sem issue nova. Antes, o corpo das issues só apontava para o card do Notion; a reconciliação trouxe os critérios para a issue e passou a apontar para a spec.

### Issues existentes afetadas

| Issue | Título atual | Ajuste proposto | Motivo |
| --- | --- | --- | --- |
| #20 | [Épico] Catálogo fácil de explorar | Título mantido. Descrição: links para [[catalogo]], [[destaques-home]] e [[adicionar-do-card]]. | O épico não aponta para as specs. |
| #25 | [LB-36] Criar página de catálogo com filtros e ordenação | Título mantido. Descrição: link para `docs/02-features/catalogo.md`. Critérios: cenários "Combinar filtros e ordenação", "Abrir um link compartilhado com filtros", "Filtros sem nenhum resultado" e "Ordem padrão por relevância e 'mais novas'"; relevância como ordenação padrão (destaques, ordem das categorias, nome); "mais novas" pela data de cadastro; faixas fixas com limite inferior incluído e superior excluído; parâmetro inválido ignorado; textos de contagem e estado vazio. Valores das faixas: pendentes. | A issue não traz critério nenhum; a spec define relevância, faixas, estado vazio e textos, que o card não tinha. |
| #22 | [LB-33] Filtrar cervejas por categoria com contadores | Título mantido. Descrição: link para a spec; faixa com "Todas" + IPA, Frutas, Malt e Lager (sem Stouts). Critérios: cenário "Filtrar pela faixa de categorias com contador"; uma categoria por vez; chip na home abre `/catalogo` filtrado; contador fixo, incluindo esgotadas. | O card lista Stouts, que saíram do catálogo; seleção e contador não estavam definidos. |
| #27 | [LB-38] Sinalizar cervejas esgotadas | Título mantido. Descrição: link para a spec e definição de quantidade disponível do [[GLOSSARY]]. Critérios: cenário "Cerveja esgotada por reservas vai para o fim"; esgotadas no fim com qualquer ordenação; "só disponíveis" esconde esgotadas. Dependência explícita de #32 (LB-56, reserva de estoque). | A regra de ordem das esgotadas com outras ordenações e a interação com "só disponíveis" não estavam definidas. |
| #23 | [LB-34] Exibir cervejas em destaque na home | Título mantido. Descrição: link para `docs/02-features/destaques-home.md`. Critérios: os cenários da spec (até 6 destaques, ordem de relevância, esgotada no fim com selo, seção some sem destaques). | A issue não traz critério; a ordem dos destaques e o caso sem destaques não estavam definidos. |
| #24 | [LB-35] Adicionar cerveja à geladeira direto do card | Título: "[LB-35] Adicionar cerveja à Geladeira direto do card" (Geladeira com maiúscula, termo oficial). Descrição: link para `docs/02-features/adicionar-do-card.md`. Critérios: os cenários da spec, incluindo convidado sem login, limite pela quantidade disponível e botão desabilitado para esgotada. | O papel do convidado e o limite pela quantidade disponível (com reservas) não estavam explícitos. |
| #13 | [LB-4] Modelar schema inicial do catálogo e seed com cervejas de exemplo | Título mantido. Critério adicional: a cerveja guarda a data de cadastro (para "mais novas"). Seed confirmado: 16 cervejas, 4 categorias (IPA, Frutas, Malt, Lager). | "Mais novas" precisa de uma data que não está na lista de campos do card. |

Dependências que já existem e não mudam: #64 (LB-12, chip de categoria), #65 (LB-13, card de produto), #66 (LB-14, bottom sheet e toast) e #54 (LB-47, Geladeira persistida). O estado vazio do catálogo fica em #25, sem depender de #70 (LB-18, MVP+).

### Issues novas

Nenhuma. Todos os comportamentos das três specs cabem em #25, #22, #27, #23, #24 e #13; criar outra issue duplicaria uma migrada.

## Contrato e fatias

Estado do código em 08/11 (`main` 65d4c35): `apps/api` só tem os módulos `account` e `health`; o `schema.prisma` só tem `Profile`; o `seed.ts` só cria o admin; `@leguele/shared` só tem `conta`, `erros` e `formatPriceBRL`; `apps/web` tem os componentes `Button`, `Campo`, `CategoryChips`, `StyleBadge`, `DivisorOu` e `OlhoDaSenha`, e a home ainda é um espaço reservado. Não existe cerveja, categoria, endpoint nem tela de catálogo.

### Contrato compartilhado (`@leguele/shared`, pasta `catalogo/`)

Front e Back fixam estes schemas Zod, com testes, antes de começar (um PR do Back; ver [[ADR-010-validacao-com-zod]]):

- **`cervejaCardSchema`:** `id`, `slug`, `nome`, `estilo` (ex.: "American IPA"), `categoria` (`slug` e `nome`), `teorAlcoolico` (número, em %), `ibu` (inteiro), `volumeMl` (inteiro), `precoCentavos` (inteiro; formatado por `formatPriceBRL`), `destaque` (booleano), `quantidadeDisponivel` (inteiro), `esgotada` (booleano, verdadeiro quando `quantidadeDisponivel` é 0), `imagemUrl` (texto ou nulo; nulo usa a imagem padrão da categoria) e `cadastradaEm` (data ISO).
- **`catalogoQuerySchema`:** `categoria` (slug), `teor`, `ibu`, `preco` (ids das faixas), `disponiveis` (booleano) e `ordem` (`relevancia` padrão, `menor-preco`, `maior-preco`, `mais-novas`). Valor inválido é ignorado, não rejeitado (decisão desta spec).
- **`faixasDeFiltro`:** as 3 faixas de cada atributo da tabela acima (id, rótulo, mínimo, máximo) e a função que diz se um valor pertence à faixa.
- **`catalogoResponseSchema`:** `itens` (lista de `cervejaCard`, já filtrada e ordenada pela API), `total` e `categorias` (lista de `slug`, `nome` e `quantidade`: só as com cerveja ativa, na ordem das categorias; o contador não muda com os outros filtros e inclui as esgotadas).
- **`destaquesResponseSchema`:** `itens`, até 6 `cervejaCard`.

Endpoints públicos, porque o convidado navega ([[ADR-009-guard-global-fechado]], com `@Public()`): `GET /catalogo` e `GET /catalogo/destaques`. Filtro, ordenação e corte em 6 moram na API (camadas `domain` e `application`, funções puras); o site só renderiza e escreve a URL.

Fora deste contrato: reserva de estoque (LB-56, #32). Até ela existir, `quantidadeDisponivel` é o estoque; a subtração das reservas de pedidos pendentes entra com o LB-56, sem mudar o contrato.

### Fatias, com dono e ordem

Ordem dos cards do grupo B do [[roteiro-mvp]], em fatias verticais:

| # | Card | Dono | O que entrega |
| --- | --- | --- | --- |
| 1 | LB-4 (#13) | Back | Modelos de categoria e cerveja (ativa, destaque, estoque, data de cadastro), migration, seed de 16 cervejas em 4 categorias e o contrato em `@leguele/shared` |
| 2 | LB-36 (#25), API | Back | `GET /catalogo`: filtros, faixas, ordenação por relevância, menor e maior preço e mais novas, esgotadas no fim; contagem por categoria (LB-33, #22) e `esgotada` (LB-38, #27, sem reservas ainda); é o módulo de referência `ListBeers` e o `Money` previstos em [[api-base]] |
| 3 | LB-34 (#23), API | Back | `GET /catalogo/destaques`, com ordem e corte em 6 |
| 4 | LB-13 (#65) | Front | Card de produto (nome, estilo, teor, volume, preço, `StyleBadge`, Adicionar) com a variante esgotada; o stepper de quantidade fica para quando o Adicionar funcionar ([[adicionar-do-card]], item 3 da [[sequencia-telas]]) |
| 5 | LB-14 (#66) | Front | Bottom sheet, toast e skeleton (o sheet dos filtros depende dele) |
| 6 | LB-15 (#67) | Front | Cabeçalho e barra inferior da loja (ver abaixo) |
| 7 | LB-33 (#22) e LB-36 (#25), telas | Front | Faixa de categorias, `/catalogo` com filtros na URL, contagem e estado vazio |
| 8 | LB-34 (#23), tela | Front | Home com a seção "Cervejas em destaque" ([[destaques-home]]) |

As fatias 1 a 3 (Back) e 4 a 6 (Front) andam em paralelo depois do contrato; 7 e 8 dependem da API.

> [!info] LB-15 sem spec própria (recomendação aplicada, vetável, 08/11)
> O LB-15 não tem spec. Escopo mínimo: cabeçalho com o logo e o contador da Geladeira, e barra inferior com Início, Catálogo, Geladeira e Perfil, nos alvos de 44 px. Sem lupa (busca é MVP+) e sem "Mix & Match". O contador mostra 0 até a Geladeira persistida (LB-47, item 3 da ordem) existir.

> [!todo] Preencher: imagens das garrafas dos cards. Sem `imagemUrl`, o card usa a imagem padrão da categoria; as imagens recortadas vêm do LB-124 (item 3 da [[sequencia-telas]]).
