---
status: rascunho
modulo: catalogo
card-notion: https://app.notion.com/p/3fd490a7ac7d81c5ba2cf6a3db8448c6
prioridade: P0
criado: 2026-10-28
atualizado: 2026-11-09
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
- **Tamanho do catálogo no MVP:** 16 cervejas em 4 categorias, 4 por categoria, todas da marca (decisão do Diego, 08/11; ver "Catálogo do MVP"), sem Stout. As categorias vêm do cadastro e podem mudar.
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
> O Diego decidiu o formato (faixas fixas, limite inferior incluído e superior excluído) em 2026-10-28; os limites são produto e não estavam definidos. Aplicada a opção mais simples e reversível: 3 faixas por atributo, calibradas pelos números do design e conferidas contra as 16 cervejas de "Catálogo do MVP". Trocar os limites é mudar uma constante em `@leguele/shared`, sem migration.

| Atributo | Faixas (id na URL: intervalo) |
| --- | --- |
| Teor alcoólico (`teor`) | `abaixo-de-4-5`: "Abaixo de 4,5%" · `4-5-a-6`: "4,5% a menos de 6%" · `6-ou-mais`: "6% ou mais" |
| IBU (`ibu`) | `abaixo-de-20`: "Abaixo de 20" · `20-a-40`: "20 a menos de 40" · `40-ou-mais`: "40 ou mais" |
| Preço (`preco`) | `abaixo-de-25`: "Abaixo de R$ 25" · `25-a-30`: "R$ 25 a menos de R$ 30" · `30-ou-mais`: "R$ 30 ou mais" |

O rótulo mostrado e o intervalo (limite inferior incluído, superior excluído) são sempre o mesmo: não há "até" nem "a" ambíguo. Id de faixa desconhecido na URL é ignorado, como qualquer parâmetro inválido.

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

- **Faixas de filtro:** `faixasDeFiltro` nos limites (teste unitário): teor 4,5 cai em "4,5% a menos de 6%" e 6 cai em "6% ou mais"; IBU 20 e 40 e preço R$ 25 e R$ 30 do mesmo jeito.
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

- **Pergunta 1:** catálogo do MVP com 4 categorias (IPA, Frutas, Malt, Lager), sem Stout; categorias vêm do cadastro. Eram 16 cervejas; em 08/11 o Diego trocou por 9 (as dos rótulos) e depois fechou 16, 4 por categoria, todas da marca (ver "Catálogo do MVP").
- **Pergunta 2:** escopo é o épico E3 do milestone MVP inteiro (LB-33, 34, 35, 36, 38), sem a página de produto (E10), a busca (LB-37) e o banner (LB-32).
- **Pergunta 3:** relevância é a ordenação padrão: destaques, depois a ordem das categorias, depois o nome.
- **Pergunta 4:** esgotadas sempre no fim; a ordenação vale dentro de cada grupo; "só disponíveis" esconde esgotadas.
- **Pergunta 5:** filtros de teor alcoólico, IBU e preço com faixas fixas, limite inferior incluído e superior excluído (valores propostos em 08/11, ver "Faixas de filtro").
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
| #25 | [LB-36] Criar página de catálogo com filtros e ordenação | Título mantido. Descrição: link para `docs/02-features/catalogo.md`. Critérios: cenários "Combinar filtros e ordenação", "Abrir um link compartilhado com filtros", "Filtros sem nenhum resultado" e "Ordem padrão por relevância e 'mais novas'"; relevância como ordenação padrão (destaques, ordem das categorias, nome); "mais novas" pela data de cadastro; faixas fixas com limite inferior incluído e superior excluído; parâmetro inválido ignorado; textos de contagem e estado vazio. Valores das faixas: propostos em 08/11 (ver "Faixas de filtro"). | A issue não traz critério nenhum; a spec define relevância, faixas, estado vazio e textos, que o card não tinha. |
| #22 | [LB-33] Filtrar cervejas por categoria com contadores | Título mantido. Descrição: link para a spec; faixa com "Todas" + IPA, Frutas, Malt e Lager (sem Stouts). Critérios: cenário "Filtrar pela faixa de categorias com contador"; uma categoria por vez; chip na home abre `/catalogo` filtrado; contador fixo, incluindo esgotadas. | O card lista Stouts, que saíram do catálogo; seleção e contador não estavam definidos. |
| #27 | [LB-38] Sinalizar cervejas esgotadas | Título mantido. Descrição: link para a spec e definição de quantidade disponível do [[GLOSSARY]]. Critérios: cenário "Cerveja esgotada por reservas vai para o fim"; esgotadas no fim com qualquer ordenação; "só disponíveis" esconde esgotadas. Dependência explícita de #32 (LB-56, reserva de estoque). | A regra de ordem das esgotadas com outras ordenações e a interação com "só disponíveis" não estavam definidas. |
| #23 | [LB-34] Exibir cervejas em destaque na home | Título mantido. Descrição: link para `docs/02-features/destaques-home.md`. Critérios: os cenários da spec (até 6 destaques, ordem de relevância, esgotada no fim com selo, seção some sem destaques). | A issue não traz critério; a ordem dos destaques e o caso sem destaques não estavam definidos. |
| #24 | [LB-35] Adicionar cerveja à geladeira direto do card | Título: "[LB-35] Adicionar cerveja à Geladeira direto do card" (Geladeira com maiúscula, termo oficial). Descrição: link para `docs/02-features/adicionar-do-card.md`. Critérios: os cenários da spec, incluindo convidado sem login, limite pela quantidade disponível e botão desabilitado para esgotada. | O papel do convidado e o limite pela quantidade disponível (com reservas) não estavam explícitos. |
| #13 | [LB-4] Modelar schema inicial do catálogo e seed com cervejas de exemplo | Título mantido. Critério adicional: a cerveja guarda a data de cadastro (para "mais novas"). Seed: as 16 cervejas de "Catálogo do MVP", 4 por categoria (IPA, Frutas, Malt, Lager). | "Mais novas" precisa de uma data que não está na lista de campos do card. |

Dependências que já existem e não mudam: #64 (LB-12, chip de categoria), #65 (LB-13, card de produto), #66 (LB-14, bottom sheet e toast) e #54 (LB-47, Geladeira persistida). O estado vazio do catálogo fica em #25, sem depender de #70 (LB-18, MVP+).

### Issues novas

Nenhuma. Todos os comportamentos das três specs cabem em #25, #22, #27, #23, #24 e #13; criar outra issue duplicaria uma migrada.

## Contrato e fatias

Estado do código em 08/11 (`main` 65d4c35): `apps/api` só tem os módulos `account` e `health`; o `schema.prisma` só tem `Profile`; o `seed.ts` só cria o admin; `@leguele/shared` só tem `conta`, `erros` e `formatPriceBRL`; `apps/web` tem os componentes `Button`, `Campo`, `CategoryChips`, `StyleBadge`, `DivisorOu` e `OlhoDaSenha`, e a home ainda é um espaço reservado. Não existe cerveja, categoria, endpoint nem tela de catálogo.

### Contrato compartilhado (`@leguele/shared`, pasta `catalogo/`)

Front e Back fixam estes schemas Zod, com testes, antes de começar: um **PR próprio e primeiro**, só em `@leguele/shared`, feito pelo Back, antes do LB-4 (modelos, migration e seed). Ver [[ADR-010-validacao-com-zod]]:

- **`cervejaCardSchema`:** `id`, `slug`, `nome`, `estilo` (ex.: "American IPA"), `categoria` (`slug`, `nome` e `ordem`), `teorAlcoolico` (número, em %), `ibu` (inteiro), `volumeMl` (inteiro), `precoCentavos` (inteiro; formatado por `formatPriceBRL`), `destaque` (booleano), `quantidadeDisponivel` (inteiro), `esgotada` (booleano, verdadeiro quando `quantidadeDisponivel` é 0), `imagemUrl` (texto ou nulo; nulo usa a imagem padrão da categoria) e `cadastradaEm` (data ISO).
- **`catalogoQuerySchema`:** `categoria` (slug), `teor`, `ibu`, `preco` (ids das faixas), `disponiveis` (booleano) e `ordem` (`relevancia` padrão, `menor-preco`, `maior-preco`, `mais-novas`). Valor inválido é ignorado, não rejeitado (decisão desta spec).
- **`faixasDeFiltro`:** as 3 faixas de cada atributo da tabela acima (id, rótulo, mínimo, máximo) e a função que diz se um valor pertence à faixa.
- **`catalogoResponseSchema`:** `itens` (lista de `cervejaCard`, já filtrada e ordenada pela API), `total` e `categorias` (lista de `slug`, `nome`, `ordem` (inteiro) e `quantidade`: só as com cerveja ativa, ordenada por `ordem`; o contador não muda com os outros filtros e inclui as esgotadas).
- **`destaquesResponseSchema`:** `itens`, até 6 `cervejaCard`.

Endpoints públicos, porque o convidado navega ([[ADR-009-guard-global-fechado]], com `@Public()`): `GET /catalogo` e `GET /catalogo/destaques`. Filtro, ordenação e corte em 6 moram na API (camadas `domain` e `application`, funções puras); o site só renderiza e escreve a URL.

Fora deste contrato: reserva de estoque (LB-56, #32). Até ela existir, `quantidadeDisponivel` é o estoque; a subtração das reservas de pedidos pendentes entra com o LB-56, sem mudar o contrato.

### Fatias, com dono e ordem

Ordem dos cards do grupo B do [[roteiro-mvp]], em fatias verticais:

| # | Card | Dono | O que entrega |
| --- | --- | --- | --- |
| 1 | Contrato (LB-4, #13) | Back | PR só em `@leguele/shared`, com testes: os schemas de "Contrato compartilhado" e `faixasDeFiltro`; sai antes de qualquer outra fatia |
| 2 | LB-4 (#13) | Back | Modelos de categoria (com `ordem`, inteiro, usada pela relevância) e de cerveja (ativa, destaque, estoque, data de cadastro), migration e seed das 16 cervejas de "Catálogo do MVP", 4 por categoria, com 1 esgotada e 8 em destaque. No mesmo PR, o Back atualiza os testes e o E2E que contam 9 (`seed-catalog-data.test.ts`, `seed-catalog.integration.test.ts`, `catalogo.spec.ts` e `home-destaques.spec.ts`) |
| 3 | LB-36 (#25), API | Back | `GET /catalogo`: filtros, faixas, ordenação por relevância, menor e maior preço e mais novas, esgotadas no fim; contagem por categoria (LB-33, #22) e `esgotada` (LB-38, #27, sem reservas ainda); é o módulo de referência `ListBeers` e o `Money` previstos em [[api-base]] |
| 4 | LB-34 (#23), API | Back | `GET /catalogo/destaques`, com ordem e corte em 6 |
| 5 | LB-15 (#67) | Front | Layout compartilhado da loja: cabeçalho (logo e contador da Geladeira, recebido por prop) e barra inferior de 4 abas (ver abaixo) |
| 6 | LB-14 (#66) | Front | Bottom sheet, toast com "Desfazer" e skeleton (o sheet dos filtros depende dele) |
| 7 | LB-13 (#65) | Front | Card de produto (nome, estilo, teor, volume, preço, `StyleBadge`, Adicionar) com a variante esgotada, e o stepper de quantidade, que o produto e a Geladeira reusam |
| 8 | LB-33 (#22) e LB-36 (#25), telas | Front | Faixa de categorias, `/catalogo` com filtros e ordem na URL, contagem e estado vazio |
| 9 | LB-34 (#23), tela | Front | Home com a seção "Cervejas em destaque" ([[destaques-home]]) |

Depois do contrato (fatia 1), as fatias 2 a 4 (Back) e 5 a 7 (Front) andam em paralelo; o LB-4 (fatia 2) fica pronto antes de o card (fatia 7) usar dado real. As fatias 8 e 9 dependem da API.

> [!info] LB-15 sem spec própria (recomendação aplicada, vetável, 08/11)
> O LB-15 não tem spec. Escopo mínimo: cabeçalho com o logo e o contador da Geladeira, e barra inferior com Início, Catálogo, Geladeira e Perfil, nos alvos de 44 px. Sem lupa (busca é MVP+) e sem "Mix & Match". O contador mostra 0 até a Geladeira persistida (LB-47, item 3 da ordem) existir.

### Ajustes do Front (revisão de 08/11, recomendações aplicadas, vetáveis)

- **Ordem do Front:** LB-15, LB-14, LB-13, LB-33 (chips), LB-36 (filtros e ordem) e LB-34 (destaques), como na tabela.
- **Adicionar desabilitado:** o botão do card fica desabilitado até o LB-47 e o LB-35 (item 3 da [[sequencia-telas]], onde o Adicionar passa a funcionar); o esgotado já nasce desabilitado.
- **Fora:** busca (LB-37) e a ordenação "Mais vendidos".
- **Selo "Esgotado":** feito com os tokens existentes, sem cor nova.
- **Sem rodapé na loja** (decisão do Diego, 2026-11-08, [[termos-privacidade]]): a barra inferior fixa fica sem rodapé acima dela.
- **Bottom sheet:** em tela baixa ou com zoom de 200% rola por dentro e fecha com Esc.
- **Componentes novos** em `apps/web/src/components/ui`, cada um na vitrine `/dev/tokens` ([[identidade-visual]], "Componentes reutilizáveis"): cabeçalho da loja, barra inferior, card de cerveja, stepper, bottom sheet, toast com "Desfazer", skeleton, select, faixa, switch, estado vazio, título de página e selo "Esgotado".

> [!todo] Preencher: imagens das garrafas dos cards. Sem `imagemUrl`, o card usa a imagem padrão da categoria; as imagens recortadas vêm do LB-124 (item 3 da [[sequencia-telas]]).

## Catálogo do MVP (16 cervejas da marca)

Decisão do Diego em 08/11: o catálogo do MVP tem **16 cervejas, 4 por categoria, todas da marca Leguelé Beer** ("trocar, tudo deve ser da nossa marca (leguelé beer)"). As 9 dos rótulos em `Imagens/figma/cervejas/` (fora do repo) ficam como base; as outras 7 são novas. Sobre as novas ("Falta criar o resto das cervejas que vão fechar 4 por categoria; quanto ao rótulo ou design faça o que ficar melhor; esses dados vão ser completamente inventados então tem liberdade pra fazê-los, pegue cervejas existentes como base pras pesquisas"), os dados são **inventados, de exemplo**, e serão trocados pelo cadastro (admin, LB-73). Comendador: "Não tenho certeza"; o Spec inventou estilo e dados (Helles, Lager).

Onde rótulo e design divergem, o Diego delegou e vale (decisão do Spec, vetável): o **rótulo** para nome, estilo, teor e volume (Maré Alta 330 ml, Cupuaçu Ale 5,8%); o **design** para preço, preço anterior, IBU e descrição da Maré Alta (R$ 32,00, anterior R$ 36,90, IBU 65). As imagens dos rótulos atuais trazem marcas de terceiros e **precisam ser refeitas com a marca Leguelé** (follow-up de arte, LB-124); até lá, o site usa a imagem padrão da categoria nas cervejas cujo rótulo tenha marca de terceiros.

| Cerveja (slug) | Estilo | Categoria | Teor | Vol. | Preço | IBU | Destaque | Referência de estilo |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Maré Alta (`mare-alta`) | American IPA | IPA | 6,5% | 330 ml | R$ 32,00 (anterior R$ 36,90) | 65 | sim | American IPA artesanal: 6–7%, 55–70 IBU |
| Leguelé Carnaval (`leguele-carnaval`) | Session IPA | IPA | 4,2% | 330 ml | R$ 30,00 | 30 | sim | Session IPA: 4–4,5%, 25–40 IBU |
| Leguelé Maceió IPA (`leguele-maceio-ipa`) | IPA | IPA | 6,0% | 330 ml | R$ 31,00 | 55 | não | IPA clássica nacional: 6–6,5%, 50–60 IBU |
| Jaraguá Hazy IPA (`jaragua-hazy-ipa`) | New England IPA | IPA | 6,8% | 500 ml | R$ 33,50 | 42 | sim | NEIPA artesanal nacional: 6,5–7%, 30–50 IBU |
| Cupuaçu Ale (`cupuacu-ale`) | Amazonian Fruit Ale | Frutas | 5,8% | 500 ml | R$ 26,50 | 15 | sim | Fruit ale com fruta amazônica: 5–6%, 10–20 IBU |
| Cajupá Sour (`cajupa-sour`) | Sour Ale com cajá | Frutas | 6,5% | 500 ml | R$ 26,00 (anterior R$ 29,90) | 8 | sim | Fruited sour: 4,5–6,5%, 5–10 IBU |
| Umbu Gose (`umbu-gose`) | Gose com umbu | Frutas | 4,0% | 330 ml | R$ 27,50 | 6 | não | Gose frutada: 4–4,5%, 5–10 IBU |
| Graviola Witbier (`graviola-witbier`) | Witbier com graviola | Frutas | 4,8% | 500 ml | R$ 28,00 | 12 | não | Witbier com fruta: 4,5–5%, 10–15 IBU |
| Avermelhou (`avermelhou`) | Red Ale (hibisco e frutas vermelhas) | Malt | 5,8% | 330 ml | R$ 29,00 | 20 | sim | Irish/American Red Ale: 5–6%, 20–28 IBU |
| Rapadura Brown Ale (`rapadura-brown-ale`) | Brown Ale com rapadura | Malt | 5,5% | 330 ml | R$ 28,50 | 24 | não | American Brown Ale: 5–6%, 20–35 IBU |
| Barra Nova Porter (`barra-nova-porter`) | Robust Porter | Malt | 6,4% | 330 ml | R$ 31,50 | 35 | sim | Robust Porter: 5,5–7%, 30–45 IBU |
| Pajuçara Amber Ale (`pajucara-amber-ale`) | American Amber Ale | Malt | 5,0% | 330 ml | R$ 27,00 | 25 | não | American Amber: 4,5–5,5%, 25–35 IBU |
| Leguelé Kölsch (`leguele-kolsch`) | Kölsch | Lager | 4,8% | 330 ml | R$ 24,90 | 22 | sim | Kölsch: 4,5–5%, 18–25 IBU |
| Leguelé Cream Ale (`leguele-cream-ale`) | Cream Ale | Lager | 5,2% | 330 ml | R$ 25,00 | 18 | não | Cream Ale: 4,5–5,5%, 10–20 IBU |
| Leguelé Comendador (`leguele-comendador`) | Helles (inventado) | Lager | 4,9% | 500 ml | R$ 25,90 | 17 | não (esgotada) | Munich Helles: 4,5–5%, 16–22 IBU |
| Ponta Verde Pilsen (`ponta-verde-pilsen`) | German Pilsner | Lager | 4,6% | 500 ml | R$ 23,90 | 28 | não | German Pils: 4,4–5,2%, 22–40 IBU |

Valores inventados para o seed; a coluna "Referência de estilo" mostra só a faixa típica do estilo em cervejas artesanais existentes, sem nome nem marca de terceiros. O preço anterior (Maré Alta, Cajupá Sour) só alimenta o dado; o preço riscado no card não tem spec ainda (na página de produto tem, ver [[produto]]).

**Para todas as cervejas:** descrições abaixo (1 a 2 frases); estoque de exemplo definido pelo Back no seed, com **1 esgotada** (Leguelé Comendador, estoque 0, para exercitar o selo e a ordem) e as outras 15 com estoque; imagem do rótulo da pasta de garrafas quando já for da marca, senão a padrão da categoria.

| Cerveja | Descrição |
| --- | --- |
| Maré Alta | Uma American IPA de respeito! Com um amargor marcante, aroma cítrico e notas tropicais, a Maré Alta é perfeita para quem busca uma experiência intensa e refrescante. |
| Leguelé Carnaval | Leve e aromática, para brindar o dia todo sem pesar. Lúpulo cítrico e final seco, feita para a folia. |
| Leguelé Maceió IPA | O sabor da nossa cidade em uma IPA firme. Amargor equilibrado e notas de maracujá e casca de laranja. |
| Jaraguá Hazy IPA | Turva, suculenta e macia, com aroma de manga e pêssego. Pouco amargor e muito lúpulo no nariz. |
| Cupuaçu Ale | Ale frutada com a cremosidade ácida do cupuaçu. Refrescante, com final levemente adocicado. |
| Cajupá Sour | Sour de acidez viva e perfume de cajá. Pede gelo e um dia de sol. |
| Umbu Gose | Gose salina com o azedinho do umbu, fruta do sertão. Leve, ácida e fácil de beber. |
| Graviola Witbier | Witbier de trigo com coentro, casca de laranja e graviola. Cremosa e refrescante. |
| Avermelhou | Red Ale com hibisco e frutas vermelhas. Malte caramelado, cor rubi e toque floral. |
| Rapadura Brown Ale | Brown Ale com rapadura nordestina. Notas de caramelo, nozes e um doce discreto no final. |
| Barra Nova Porter | Porter encorpada com malte torrado, chocolate amargo e café. Para os dias de chuva e de conversa. |
| Pajuçara Amber Ale | Amber Ale equilibrada, de malte tostado e lúpulo cítrico. A cerveja de todo dia, com personalidade. |
| Leguelé Kölsch | Dourada, limpa e delicada, com frutado suave. Leve como a brisa da orla. |
| Leguelé Cream Ale | Cremosa, macia e fácil de beber. Corpo leve, milho no malte e final suave. |
| Leguelé Comendador | Helles dourada de malte macio e amargor discreto. Uma lager clássica com a assinatura da casa. |
| Ponta Verde Pilsen | Pilsen crocante, de amargor nobre e aroma floral. Gelada na medida. |

**Cobertura das faixas:** teor, "Abaixo de 4,5%" (Carnaval 4,2%, Umbu Gose 4,0%), "4,5% a menos de 6%" (Cupuaçu Ale, Graviola Witbier, Avermelhou, Rapadura, Pajuçara, Kölsch, Cream Ale, Comendador, Ponta Verde) e "6% ou mais" (Maré Alta, Maceió IPA, Jaraguá, Cajupá Sour, Barra Nova); IBU, "Abaixo de 20" (Cupuaçu Ale, Cajupá Sour, Umbu Gose, Graviola, Cream Ale, Comendador), "20 a menos de 40" (Carnaval, Avermelhou, Rapadura, Barra Nova, Pajuçara, Kölsch, Ponta Verde) e "40 ou mais" (Maré Alta, Maceió IPA, Jaraguá); preço, "Abaixo de R$ 25" (Kölsch, Ponta Verde), "R$ 25 a menos de R$ 30" (Cupuaçu Ale, Cajupá Sour, Umbu Gose, Graviola, Avermelhou, Rapadura, Pajuçara, Cream Ale, Comendador) e "R$ 30 ou mais" (Maré Alta, Carnaval, Maceió IPA, Jaraguá, Barra Nova). Todas as 9 faixas têm cerveja.

**Destaques:** 8 cervejas em destaque, para exercitar o corte em 6 da home: Maré Alta, Leguelé Carnaval, Jaraguá Hazy IPA, Cupuaçu Ale, Cajupá Sour, Avermelhou, Barra Nova Porter e Leguelé Kölsch. Pela relevância (ordem das categorias, depois o nome), a home mostra Jaraguá Hazy IPA, Leguelé Carnaval, Maré Alta, Cajupá Sour, Cupuaçu Ale e Avermelhou; Barra Nova Porter e Leguelé Kölsch ficam de fora.

### Categorias

4 por categoria: **IPA** (Maré Alta, Leguelé Carnaval, Leguelé Maceió IPA, Jaraguá Hazy IPA), **Frutas** (Cupuaçu Ale, Cajupá Sour, Umbu Gose, Graviola Witbier), **Malt** (Avermelhou, Rapadura Brown Ale, Barra Nova Porter, Pajuçara Amber Ale) e **Lager** (Leguelé Kölsch, Leguelé Cream Ale, Leguelé Comendador, Ponta Verde Pilsen). Sem Stout. Kölsch e Cream Ale são ales de perfil limpo, postas em Lager por decisão do Diego.

### A confirmar

- **Arte dos rótulos** (LB-124): refazer com a marca Leguelé os rótulos de Cupuaçu Ale, Avermelhou, Cajupá Sour e Maré Alta, que trazem outra cervejaria ou origem, e criar os das 7 cervejas novas (Jaraguá Hazy IPA, Umbu Gose, Graviola Witbier, Rapadura Brown Ale, Barra Nova Porter, Pajuçara Amber Ale e Ponta Verde Pilsen). O design dos rótulos novos é livre (o Diego delegou).
