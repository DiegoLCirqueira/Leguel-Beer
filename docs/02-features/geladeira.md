---
status: pronto
modulo: geladeira
card-notion: https://app.notion.com/p/3fd490a7ac7d812eaddfc4fed1ed0477
prioridade: P0
criado: 2026-10-28
atualizado: 2026-11-10
issues:
  - "#61 LB-124"
  - "#54 LB-47"
  - "#56 LB-49"
  - "#57 LB-50"
  - "#58 LB-51"
  - "#59 LB-52"
tags:
  - feature
---

# Geladeira

> [!info] Origem
> Item 3 da [[sequencia-telas]] (grupo C). Derivada dos cards do Notion **LB-124** (#61, garrafas recortadas), **LB-47** (#54, persistir localmente e na conta), **LB-49** (#56, prateleiras por estilo), **LB-50** (#57, alterar e remover), **LB-51** (#58, resumo em bottom sheet) e **LB-52** (#59, revalidar no servidor), do estúdio de garrafas e da tela 24 (decisão do Diego, 08/11). Adicionar direto do card (LB-35, #24) fica em [[adicionar-do-card]]; o seletor da página de produto (LB-42, #84) em [[produto]]. Spec fechada pelo Spec em 10/11, em modo autônomo ([[ADR-016-ciclo-continuo-da-banda]]): o que o card não definia virou recomendação aplicada, listada em "Decisões tomadas sem consulta". Os termos seguem o [[GLOSSARY]].

## História de usuário

- **Como** cliente ou convidado no celular
- **Quero** ver as cervejas que escolhi arrumadas numa geladeira com uma prateleira por categoria, ajustar as quantidades e conferir o total
- **Para** acompanhar a compra de um jeito visual, reconhecer a identidade da Leguelé e seguir para o checkout com preços e estoque certos

## Cenários

```gherkin
# language: pt
Funcionalidade: Geladeira em prateleiras por categoria

  Esquema do Cenário: Arrumação da prateleira
    Dado que a Geladeira tem <itens>
    Quando abro a Geladeira
    Então a prateleira <prateleira> mostra <resultado>

    Exemplos:
      | itens                                      | prateleira | resultado                                                                                   |
      | 4 Maré Alta                                | IPA        | 4 garrafas lado a lado e nenhuma garrafa fantasma                                           |
      | 2 Maré Alta                                | IPA        | 2 garrafas lado a lado e 2 garrafas fantasma                                                |
      | 6 Maré Alta                                | IPA        | 4 garrafas na frente e 2 na fileira de trás, atrás da 1ª e da 2ª                            |
      | 3 Maré Alta e depois 1 Leguelé Carnaval    | IPA        | a fila da Maré Alta na 1ª posição, a Leguelé Carnaval na 2ª e 2 garrafas fantasma           |
      | 5 Maré Alta e depois 1 Leguelé Carnaval    | IPA        | a fila da Maré Alta com 3 garrafas desenhadas e a etiqueta "×5"                             |
      | nenhuma Lager                              | Lager      | 4 garrafas fantasma, cada uma lida como "Adicionar Lager"                                   |

  Cenário: Garrafa fantasma leva ao catálogo
    Dado uma garrafa fantasma na prateleira Frutas
    Quando toco nela
    Então abro o catálogo filtrado pela categoria Frutas

  Esquema do Cenário: Alterar a quantidade e remover
    Dado que a Geladeira tem 2 Maré Alta e 1 Ponta Verde Pilsen
    Quando <acao> no resumo
    Então <resultado>

    Exemplos:
      | acao                                       | resultado                                                                                                  |
      | toco em "+" da Maré Alta                   | a Maré Alta passa a 3 unidades, as garrafas dela balançam e o subtotal vai a R$ 119,90                     |
      | toco em "−" da Ponta Verde Pilsen          | a Ponta Verde Pilsen sai da Geladeira e vejo o toast "Ponta Verde Pilsen saiu da geladeira" com "Desfazer" |
      | toco em "Remover" da Maré Alta             | a Maré Alta sai da Geladeira e vejo o toast "Maré Alta saiu da geladeira" com "Desfazer"                   |
      | toco em "Remover" da Maré Alta e depois em "Desfazer" | a Maré Alta volta com 2 unidades, na mesma posição                                              |

  Cenário: Resumo com subtotal
    Dado que a Geladeira tem 2 Maré Alta de R$ 32,00 e 1 Cupuaçu Ale de R$ 26,50
    Quando abro o resumo da Geladeira
    Então vejo "Subtotal (3 itens)" com R$ 90,50
    E vejo no frete "Informe seu endereço para calcular o frete"

  Esquema do Cenário: Revalidação no servidor ao abrir a Geladeira
    Dado que coloquei 2 Maré Alta na Geladeira a R$ 32,00
    E depois <mudanca>
    Quando abro a Geladeira
    Então <resultado>

    Exemplos:
      | mudanca                                       | resultado                                                                                          |
      | o preço dela passou a R$ 30,00                | vejo R$ 30,00 e o aviso "O preço de Maré Alta mudou"                                               |
      | ela foi desativada                            | ela sai da Geladeira e vejo o aviso "Maré Alta não está mais disponível"                           |
      | ela esgotou                                   | ela sai da Geladeira e vejo o aviso "Maré Alta não está mais disponível"                           |
      | a quantidade disponível dela passou a 1       | ela fica com 1 unidade e vejo o aviso "A quantidade de Maré Alta foi ajustada para 1"              |

  Esquema do Cenário: A Geladeira continua onde eu estiver
    Dado que <quem> com 2 Maré Alta na Geladeira
    Quando <acao>
    Então a Geladeira continua com 2 Maré Alta

    Exemplos:
      | quem                                    | acao                                                       |
      | sou convidado                           | recarrego o site                                           |
      | entrei na minha conta no celular        | entro na mesma conta no computador                         |
      | sou convidado e minha conta está vazia  | entro na minha conta                                       |
```

## Regras de negócio

### Persistência (LB-47)

- **Convidado:** a Geladeira fica só no navegador (armazenamento local), num formato com número de versão. Formato desconhecido ou inválido é descartado e a Geladeira começa vazia, sem erro na tela.
- **Cliente (logado):** a Geladeira fica na conta e vale em qualquer aparelho. O navegador mantém uma cópia local para a mudança aparecer na hora; o servidor do site manda a Geladeira inteira para a API a cada mudança. Sem rede, a cópia local continua valendo e é enviada de novo quando a rede volta (ou na próxima mudança). Entre dois aparelhos vale a última gravação.
- **Ao entrar na conta:** se a Geladeira da conta estiver vazia e a do convidado não, a do convidado passa para a conta. Se a da conta tiver itens, vale a da conta e a do convidado é descartada. Somar as duas é o LB-48 (#55, MVP+).
- **Ao sair da conta:** a cópia local é apagada; a Geladeira continua salva na conta.
- **Só cervejas avulsas.** Packs do Mix & Match são Pós-MVP ([[mvp-corte]]).
- A Geladeira guarda, por cerveja, só a quantidade e o preço que o cliente viu; nome, imagem e preço atual vêm sempre da API.
- **Contador do header** ([[catalogo]], LB-15): soma das unidades na Geladeira. Só aparece depois de ler a cópia local, para o HTML do servidor e o do navegador não divergirem.

### Prateleiras (LB-49)

- `/geladeira`, a aba Geladeira da barra inferior da loja. Uma prateleira por categoria, de cima para baixo na ordem das categorias do catálogo (IPA, Frutas, Malt, Lager). A moldura tem 4 prateleiras; o catálogo do MVP tem 4 categorias de 4 cervejas ([[catalogo]], "Catálogo do MVP").
- Cada prateleira tem 4 posições na frente. Arrumação:
  - 1 rótulo: garrafas lado a lado; da 5ª unidade em diante formam fileiras atrás (a 5ª atrás da 1ª, a 6ª atrás da 2ª e assim por diante);
  - 2 a 4 rótulos: cada rótulo vira uma fila (uma garrafa atrás da outra) e os rótulos ficam lado a lado, na ordem em que entraram na Geladeira.
- Profundidade desenhada: no máximo 3 fileiras. Acima disso, as garrafas extras não são desenhadas e a etiqueta mostra o total ("×5").
- Garrafas de trás menores, mais escuras e deslocadas para a esquerda (medidas do estúdio: escala −10% e brilho −30% por fileira, recuo de 30 px na moldura de 710 px).
- **Garrafa fantasma** em cada posição livre: silhueta tracejada com "+", lida como "Adicionar <categoria>"; ao tocar, abre `/catalogo?categoria=<slug>`. Com 1 rótulo, as posições livres são 4 menos as unidades (mínimo 0); com 2 ou mais, 4 menos o número de rótulos.
- **Faixa da prateleira** (sobre o parapeito): vazia, "Toque no + para escolher uma <categoria>"; 1 rótulo, nome e "×N"; vários rótulos, cada nome (cortado com reticências) e "×N" sobre a sua fila.
- **Geladeira vazia:** as 4 prateleiras só com garrafas fantasma e sem a barra do resumo.
- **Animações** só com `transform` e `opacity`: a garrafa nova cai com quique e balanço; ao aumentar a quantidade, as garrafas do rótulo balançam apoiadas na base, escalonadas; a garrafa que sai some em 300 ms. Com `prefers-reduced-motion: reduce`, nada se move: as garrafas aparecem e somem sem animação.
- **Leitor de tela:** cada prateleira é uma região com o nome da categoria; cada rótulo é lido como "<nome>, <N> unidades, <total>" (ex.: "Maré Alta, 2 unidades, R$ 64,00"; singular "1 unidade").
- **Tamanho:** no celular a Geladeira cabe na altura livre entre o header, a barra do resumo e a barra inferior, sem rolagem dentro das prateleiras nem da página, de 360 × 640 a 430 × 932. A moldura mantém a proporção 710 × 1573 e encolhe pela altura. A partir de 1024 px, duas colunas: Geladeira à esquerda e resumo fixo à direita.

### Imagens das garrafas (LB-124)

- Uma imagem por cerveja: garrafa de frente, fundo transparente, mesmo enquadramento em todas, com a base na borda inferior da imagem (eixo do balanço). Fonte: PNG de 360 × 1000 do estúdio; no site, WebP de 180 × 500 com no máximo 40 KB.
- A mesma imagem serve ao card, à página de produto e à Geladeira (o `imagemUrl` da cerveja). Arquivos em `apps/web/public/garrafas/<slug>.webp`; o seed preenche o `imageUrl` das cervejas que têm imagem. O cadastro de imagem pelo admin é o LB-73 (item 8).
- **Imagem padrão da categoria**, para cerveja sem imagem: garrafa sem rótulo, com o contorno da garrafa fantasma preenchido na cor do selo da categoria (tokens do `StyleBadge`), uma por categoria, com o mesmo enquadramento.
- **Nenhuma imagem com marca de terceiros** ([[catalogo]], "Catálogo do MVP"). Entram agora só as garrafas cujo rótulo já é da Leguelé e existe no estúdio: Leguelé Maceió IPA, Leguelé Carnaval, Leguelé Kölsch e Leguelé Cream Ale, cada uma conferida a olho antes do commit. As outras 12 usam a imagem padrão da categoria até a arte nova (follow-up de arte, ver "Fora de escopo").
- **Moldura:** a imagem da geladeira do estúdio (710 × 1573), extraída para `apps/web/public/geladeira/`, com o parapeito de cada prateleira redesenhado por cima das garrafas, como no estúdio.

### Alterar e remover (LB-50)

- No resumo, cada cerveja tem o `Stepper` (de 1 até a quantidade disponível) e o botão "Remover" (ícone de lixeira, alvo de 44 px). "+" no limite mostra "Só temos N unidades" e nada muda, como em [[adicionar-do-card]].
- "−" com 1 unidade e "Remover" tiram a cerveja e mostram o toast "<nome> saiu da geladeira" com "Desfazer" por 5 segundos; "Desfazer" devolve a cerveja com a quantidade e a posição de antes.
- Só o toque mais recente pode ser desfeito: um toast novo substitui o anterior.

### Resumo (LB-51)

- No celular, barra fixa acima da barra inferior com o subtotal e "Ver resumo"; o toque abre o `BottomSheet` "Resumo da Geladeira" (tela 24). A partir de 1024 px, o resumo é a coluna da direita, sem sheet.
- Para cada cerveja: imagem, selo da categoria, nome, "estilo • teor • volume", `Stepper`, "Remover", preço unitário ("R$ 32,00 un.") e total da linha.
- Totais: "Subtotal (N itens)", em que N é a soma das unidades ("1 item" no singular); frete; e "Total", igual ao subtotal enquanto não houver frete.
- **Frete:** até existir endereço e cálculo de frete (item 4 da [[sequencia-telas]]), a linha mostra "Informe seu endereço para calcular o frete" e o Total não inclui frete. Com o item 4, passa a mostrar o frete estimado pelo endereço padrão e "Grátis" a partir de R$ 150,00 ([[checkout]]). O valor final é sempre recalculado no servidor ao criar o pedido.
- Botões: "Finalizar compra" (primário), que leva a `/checkout`, e "Continuar comprando", que leva a `/catalogo`. "Finalizar compra" fica desabilitado até o checkout existir (item 5); exigir login ao finalizar é o LB-31 (#46).

### Revalidação no servidor (LB-52)

- O servidor é a fonte de preço, estoque e situação da cerveja. Ao abrir a Geladeira (e, no item 5, ao iniciar o checkout), o site manda os itens para a API e aplica o que ela devolve.
- Ajustes, cada um com um aviso na lista de avisos no topo da Geladeira (região `role="status"`), que some ao sair da página:
  - preço atual diferente do preço que o cliente viu: atualiza o preço e avisa "O preço de <nome> mudou";
  - cerveja inativa, inexistente ou esgotada: tira da Geladeira e avisa "<nome> não está mais disponível";
  - quantidade maior que a disponível: reduz e avisa "A quantidade de <nome> foi ajustada para <N>".
- Depois do aviso, o preço visto passa a ser o atual: o mesmo aviso não se repete na próxima abertura.

### Fora de escopo

- Arrastar garrafas entre prateleiras, rolagem dentro das prateleiras e animações extras (luz piscando, balanço do ícone no header).
- Packs do Mix & Match na Geladeira (Pós-MVP).
- Somar a Geladeira do convidado com a da conta ao entrar (LB-48, #55, MVP+).
- Cupom de desconto (LB-53, MVP+), favoritar (Pós-MVP) e "Limpar geladeira" (botão da tela 24 sem card no backlog).
- Cálculo de frete e endereço padrão (item 4), checkout e exigência de login ao finalizar (item 5, LB-55 e LB-31).
- Reserva de estoque (LB-56, #32): até ela existir, a quantidade disponível é o estoque.
- **Arte nova dos rótulos** (follow-up de arte do LB-124): refazer com a marca Leguelé os rótulos de Maré Alta, Cupuaçu Ale, Cajupá Sour e Avermelhou e criar os das outras 8 (as 7 novas e a Leguelé Comendador, que não está no estúdio). Cada garrafa nova entra depois, só com a imagem e o seed, sem mudar esta spec.

## Referência visual

Fora do repo, só como referência visual; regras e textos vêm desta spec, normalizados ao padrão aprovado (Figtree e Kaushan Script, tokens do `globals.css`, `Button`, `Stepper`, `StyleBadge`, `BottomSheet`, `Toast`, alvos de 44 px; ver [[identidade-visual]]).

| Arquivo | Data | Vale para |
| --- | --- | --- |
| `Imagens/estudio-garrafas.html` | 29/10/2026 | Moldura, posições, profundidade, faixa das prateleiras, garrafa fantasma e animações. Medidas da moldura de 710 × 1573: linhas das prateleiras, início das posições (x = 134), largura da posição (121), altura da garrafa (200) e parapeitos nas constantes `LINES`, `RAIL`, `IX`, `CW`, `BH` e `RISE` do script |
| `Imagens/figma/telas/24-resumo-da-geladeira.png` | 08/11/2026 | Resumo em bottom sheet no celular |

**Do estúdio não entram:** o painel 3D, os controles de ajuste e de salvar, a lista de cervejas com "+" e "−" ao lado da geladeira (no site, o ajuste fica no resumo) e o toque no fantasma adicionando direto (no site, ele abre o catálogo filtrado). As 16 garrafas do estúdio são de uma lista antiga; vale o catálogo de [[catalogo]].

**Da tela 24 não entram (vale a spec):** cupom, coração de favoritar, lupa no header, "Limpar geladeira", "Ir para pagamento" (vale "Finalizar compra", porque a primeira etapa do checkout é a Entrega), "Frete (estimado) R$ 12,90" antes do item 4, a barra de status do iPhone e o contador "2" do header (o contador soma as unidades: 3).

## Contrato compartilhado (`@leguele/shared`, pasta `geladeira/`)

Estado do código em 10/11 (`main` 2b48d60): existem `cervejaCardSchema` (com `quantidadeDisponivel`, `esgotada` e `imagemUrl`), `formatPriceBRL`, o modelo `Beer` com `imageUrl` e `stock`, e no site `Stepper`, `Toast`, `BottomSheet`, `CardCerveja` (Adicionar desabilitado), `LojaHeader` (contador por prop) e `LojaTabBar` (aba `/geladeira`). Não existe nada da Geladeira.

Num **PR próprio e primeiro**, só em `@leguele/shared`, com testes (feito pelo Back):

- **`QUANTIDADE_MAXIMA_POR_ITEM`** (99) e **`ITENS_MAXIMOS_NA_GELADEIRA`** (50): limites de sanidade da entrada, abaixo dos quais vale a quantidade disponível.
- **`itemDaGeladeiraSchema`:** `cervejaId` (texto), `quantidade` (inteiro de 1 a 99) e `precoVistoCentavos` (inteiro não negativo).
- **`geladeiraRequestSchema`:** `{ itens }`, lista de até 50 `itemDaGeladeira`, sem `cervejaId` repetido (refine), na ordem em que as cervejas entraram.
- **`ajusteDaGeladeiraSchema`:** união discriminada por `tipo`:
  - `"preco-mudou"`: `cervejaId`, `nome`, `precoVistoCentavos`, `precoAtualCentavos`;
  - `"indisponivel"`: `cervejaId`, `nome` (nulo quando a cerveja não existe; nesse caso não há aviso na tela);
  - `"quantidade-reduzida"`: `cervejaId`, `nome`, `quantidadeAnterior`, `quantidadeAtual` (de 1 até a anterior − 1).
- **`itemValidadoSchema`:** `cerveja` (`cervejaCardSchema`), `quantidade` (de 1 até `cerveja.quantidadeDisponivel`) e `totalCentavos` (= `quantidade × cerveja.precoCentavos`, refine).
- **`geladeiraResponseSchema`:** `itens` (validados, na ordem de entrada, sem as cervejas removidas), `ajustes`, `quantidadeTotal` (soma das unidades) e `subtotalCentavos` (soma dos totais), ambos conferidos por refine.
- **`resumirGeladeira(itens)`:** função pura que devolve `{ quantidadeTotal, subtotalCentavos }`, usada pela API e pelo site.

Endpoints ([[ADR-009-guard-global-fechado]], [[ADR-010-validacao-com-zod]]); erro de entrada no contrato de erros da API (400):

| Rota | Acesso | Corpo | Resposta |
| --- | --- | --- | --- |
| `POST /geladeira/validar` | `@Public()` (convidado) | `geladeiraRequest` | `geladeiraResponse`; não grava nada |
| `GET /me/geladeira` | autenticado | — | `geladeiraResponse` da Geladeira salva, já revalidada; os ajustes também são gravados |
| `PUT /me/geladeira` | autenticado | `geladeiraRequest` | substitui a Geladeira inteira (idempotente) e devolve `geladeiraResponse` |

A Geladeira da conta é sempre a do dono do token: as rotas `/me` não recebem id de cliente nem de Geladeira. Pela [[ADR-012-sessao-em-cookies-httponly]], o site chama `GET` e `PUT /me/geladeira` só pelo servidor do site (Server Actions ou rotas do Next), nunca do navegador; `POST /geladeira/validar` também passa pelo servidor do site, por uniformidade.

**Banco (Back):** Geladeira com um registro por perfil (único) e itens com cerveja, quantidade (CHECK > 0), preço visto em centavos (CHECK ≥ 0), posição de entrada e par Geladeira–cerveja único. Migration só aditiva. Cerveja desativada continua na Geladeira salva até a próxima revalidação, que a tira.

**Armazenamento local (Front):** `{ versao: 1, itens: [{ cerveja: CervejaCard, quantidade }] }`, validado com os schemas de `@leguele/shared` ao ler; o preço visto é `cerveja.precoCentavos`. A cópia local é atualizada com cada `geladeiraResponse`.

## Componentes novos

Em `apps/web/src/components/ui`, cada um na vitrine `/dev/tokens` ([[identidade-visual]], "Componentes reutilizáveis"), nunca dentro da tela:

- moldura da Geladeira, prateleira, garrafa (com profundidade e animações) e garrafa fantasma;
- faixa da prateleira;
- linha de item do resumo (imagem, selo, dados, `Stepper`, "Remover", preços);
- bloco de totais do resumo e barra fixa do resumo;
- lista de avisos da revalidação;
- imagem de garrafa com a imagem padrão da categoria quando não houver `imagemUrl`.

Os demais já existem: `StyleBadge`, `Stepper`, `Toast`, `BottomSheet` e `Button`.

## Seams de teste

> [!info] Proposta do Spec, aplicada como recomendação (10/11), vetável pelo Diego

- **Arrumação:** função pura de arrumação (coluna e profundidade de cada garrafa) e de posições livres: 1 rótulo com 1, 4, 5 e 13 unidades; 2 a 4 rótulos; ordem de entrada; corte na 3ª fileira (unitário, no site).
- **Operações da Geladeira:** adicionar com limite, alterar, remover, desfazer, aplicar uma `geladeiraResponse`, ler armazenamento inválido como vazio, e a regra de "ao entrar na conta" (unitário, no site).
- **Contrato:** schemas e `resumirGeladeira`, incluindo `cervejaId` repetido, quantidade 0 e 100, total que não bate (unitário, no shared).
- **Revalidação na API:** caso de uso com repositório fake para preço mudou, inativa, inexistente, esgotada e quantidade reduzida, e os quatro juntos na ordem de entrada (unitário); `POST /geladeira/validar` sem token (HTTP).
- **Geladeira da conta:** `GET`/`PUT /me/geladeira` com banco real; sem token dá 401; o `PUT` de um cliente não muda a Geladeira de outro; `PUT` repetido dá o mesmo resultado (integração e HTTP).
- **Sincronização no site:** falha da Server Action mantém a cópia local e reenvia depois (teste de componente com a action simulada, inclusive rejeitando).
- **Telas:** prateleira (profundidade, "×N", fantasma, rótulo acessível, imagem padrão), resumo e avisos (componente); cenários desta spec em 360 × 640 e 1280 × 800, com movimento reduzido no cenário de balanço (E2E). Medidas de layout rodam também no container Playwright Linux ([[licoes-aprendidas]], 2026-11-08).

## Fatias, com dono e ordem

| # | Card | Dono | O que entrega |
| --- | --- | --- | --- |
| 1 | Contrato (LB-47 e LB-52) | Back | PR só em `@leguele/shared`, com testes: schemas, limites e `resumirGeladeira` |
| 2 | LB-52 (#59), API | Back | Caso de uso de revalidação (domínio puro) e `POST /geladeira/validar` |
| 3 | LB-47 (#54), API | Back | Modelos e migration da Geladeira da conta; `GET` e `PUT /me/geladeira`, reusando a revalidação da fatia 2 |
| 4 | LB-47 (#54), site | Front | Estado da Geladeira (operações puras, armazenamento local versionado, sincronização com a conta pelo servidor do site, regra ao entrar e ao sair) e contador real no header; destrava [[adicionar-do-card]] e a fatia 4 de [[produto]] |
| 5 | LB-124 (#61) | Front | Moldura, garrafa fantasma em SVG, imagem padrão por categoria, as 4 garrafas da Leguelé em WebP e o `imageUrl` delas no seed (o seed é ajuste pequeno do Front com revisão do Back) |
| 6 | LB-49 (#56) | Front | `/geladeira` com as prateleiras, arrumação, faixas, fantasmas, animações, acessibilidade e tamanho sem rolagem |
| 7 | LB-51 (#58), LB-50 (#57) e LB-52 no site | Front | Resumo (barra e sheet no celular, coluna no desktop), alterar e remover com "Desfazer", e a lista de avisos da revalidação |

Depois do contrato (fatia 1), o Back faz as fatias 2 e 3 e o Front a 4 em paralelo (a 4 usa a API a partir das fatias 2 e 3). A 5 pode andar junto com a 4. A 6 depende da 4 e da 5; a 7, da 6. O LB-35 ([[adicionar-do-card]]) e o LB-42 ([[produto]], fatia 4) entram logo depois da fatia 4.

Candidatos a ADR: nenhum (as escolhas seguem [[ADR-009-guard-global-fechado]], [[ADR-010-validacao-com-zod]] e [[ADR-012-sessao-em-cookies-httponly]]).

## Decisões relacionadas

- [[catalogo]]: categorias, quantidade disponível, esgotada e imagem da cerveja.
- [[adicionar-do-card]] e [[produto]]: os dois jeitos de pôr cerveja na Geladeira.
- [[checkout]]: frete, frete grátis e login ao finalizar.
- [[identidade-visual]], [[mvp-corte]], [[sequencia-telas]]
- [[ADR-001-stack]], [[ADR-009-guard-global-fechado]], [[ADR-012-sessao-em-cookies-httponly]]

## Decisões tomadas sem consulta

Recomendações aplicadas pelo Spec em 10/11, em modo autônomo; qualquer uma pode ser vetada.

- **História de usuário:** reescrita a partir dos cards LB-49, LB-50, LB-51 e LB-52 (fechava o "Preencher" do rascunho).
- **Ao entrar na conta:** a Geladeira do convidado passa para a conta só quando a da conta está vazia; senão vale a da conta. Sem isso o convidado perderia tudo ao entrar para finalizar; somar as duas fica no LB-48 (MVP+).
- **Sair da conta apaga a cópia local** (aparelho compartilhado); a Geladeira segue na conta.
- **Sem packs no modelo** (o card LB-47 pedia itens e packs; Mix & Match é Pós-MVP).
- **Entre aparelhos vale a última gravação**, sem fusão.
- **Contador do header soma as unidades** (a tela 24 mostra "2" com 3 unidades; o subtotal da própria tela diz "3 itens").
- **Ajuste e remoção ficam no resumo**, não na prateleira (o card LB-50 citava stepper na prateleira; o estúdio e a tela 24 põem o ajuste fora dela).
- **Textos novos:** "<nome> saiu da geladeira" (toast de remoção), "A quantidade de <nome> foi ajustada para <N>" (ajuste), "Toque no + para escolher uma <categoria>" (do estúdio) e "Ver resumo" (barra).
- **Esgotada na revalidação** é tratada como indisponível: sai da Geladeira com o mesmo aviso.
- **Frete até o item 4:** só "Informe seu endereço para calcular o frete", com o Total sem frete.
- **"Finalizar compra"** no lugar de "Ir para pagamento" (design), desabilitado até o checkout existir.
- **Fora por ora:** "Limpar geladeira", cupom e favoritar da tela 24.
- **Imagens:** uma imagem por cerveja para card, produto e Geladeira, em `apps/web/public/garrafas/`, WebP 180 × 500 até 40 KB (o card do LB-124 previa um tipo de imagem separado em `BeerImage`, que fica para o cadastro do admin).
- **Imagem padrão da categoria:** garrafa sem rótulo na cor do selo da categoria.
- **Garrafas que entram agora:** só as 4 com rótulo da Leguelé que existem no estúdio; as outras 12 com a imagem padrão até a arte nova.
- **Tamanho no celular:** sem rolagem da página de 360 × 640 a 430 × 932, com a moldura encolhendo pela altura e a barra inferior da loja mantida.
- **Avisos da revalidação** numa lista no topo da Geladeira, que some ao sair da página.

## Pendências para o Diego

1. **Decidida: A (Diego, 2026-11-11).** A frase entrou em "Quais dados coletamos" de [[termos-privacidade]], cobrindo também a Geladeira do convidado e a cópia no navegador. O merge da fatia 3 não espera mais por ela. Texto original da pendência: **Política de Privacidade e a Geladeira salva na conta (LGPD).** A [[termos-privacidade]] lista como dados coletados só os da conta e o endereço; a Geladeira do cliente logado passa a guardar na conta as cervejas e as quantidades. Opções: (A) acrescentar à seção "Quais dados coletamos" a frase "as cervejas que você coloca na Geladeira, para ela valer em outros aparelhos", antes do merge da fatia 3; (B) não salvar na conta e manter a Geladeira só no navegador, contrariando o LB-47 e a [[visao]]; (C) seguir sem mudar o texto. Impacto: A é uma linha de texto e mantém a política fiel; B tira a Geladeira entre aparelhos; C deixa a política incompleta. **Recomendação: A.** A fatia 3 pode ser implementada e revisada antes; só o merge espera a resposta.

## Tickets propostos

Reconciliação das issues #61, #54, #56, #57, #58 e #59, a pedir ao Orchestrator depois do merge desta spec (aprovação permanente para reconciliar issue com spec mergeada): título mantido; descrição com link para esta spec, os cenários e regras de cada card e as decisões vetáveis que tocam nele (#54: persistência e regra ao entrar; #56: prateleiras, com a moldura em imagem já registrada; #57: alterar e remover no resumo; #58: resumo e frete até o item 4; #59: revalidação e textos; #61: imagens, padrão por categoria e as 4 garrafas iniciais). Nenhuma issue nova; a arte nova dos rótulos segue no #61.
