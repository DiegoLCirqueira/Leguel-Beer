---
status: pronto
modulo: checkout
card-notion: https://app.notion.com/p/3fd490a7ac7d8128a0c5c62279998c00
prioridade: P0
criado: 2026-10-28
atualizado: 2026-11-13
issues:
  - "#31 LB-55"
  - "#32 LB-56"
  - "#27 LB-38"
tags:
  - feature
---

# Checkout

> [!info] Origem
> Item 5 da [[sequencia-telas]]. Derivada dos cards do Notion **LB-55** (#31, checkout em etapas no celular), **LB-56** (#32, criar o pedido com reserva atômica de estoque) e **LB-38** (#27, esgotada pelas reservas), e das telas 05 (Entrega), 06 (Pagamento), 07 (Revisão) e 29 (Endereço fora da área). Reescrita em 13/11 a partir do rascunho de 28/10. O pagamento em si (Pix, cartão, avisos do gateway e expiração) está em [[pagamento]]; a confirmação e "Meus pedidos", em [[pedidos-cliente]]; endereços, área e frete, em [[enderecos-entrega]]; maioridade e login ao finalizar, em [[dados-pessoais]]. Spec fechada pelo Spec em modo autônomo ([[ADR-016-ciclo-continuo-da-banda]]; Diego, 13/11: "sempre vá pelas recomendadas"): o que os cards não definiam virou recomendação aplicada, listada em "Decisões tomadas sem consulta". Os termos seguem o [[GLOSSARY]].

## História de usuário

- **Como** cliente com cervejas na Geladeira
- **Quero** escolher o endereço e a forma de pagamento, revisar tudo e confirmar o pedido em poucas etapas curtas no celular
- **Para** receber as cervejas em casa sem atrito e sem surpresa no valor

## Cenários

```gherkin
# language: pt
Funcionalidade: Checkout

  Cenário: Fluxo completo com o endereço padrão
    Dado que entrei na conta com 3 Maré Alta e 2 Cupuaçu Ale na Geladeira e o endereço padrão "Casa" a 5,2 km
    Quando abro "/checkout", sigo com "Casa" na Entrega, escolho Pix no Pagamento e toco em "Confirmar pedido" na Revisão
    Então é criado um pedido "Aguardando pagamento" com subtotal de R$ 149,00, frete de R$ 13,00, total de R$ 162,00, o endereço "Casa" e Pix
    E as 5 unidades ficam reservadas por 30 minutos
    E sou levado à tela de pagamento do pedido

  Cenário: Endereço fora da área de entrega
    Dado que meu endereço padrão está a 26 km de rota da cervejaria
    Quando abro a etapa Entrega com esse endereço selecionado
    Então vejo "Ainda não entregamos neste endereço", com "Alterar endereço" e "Voltar ao catálogo"
    E "Continuar para pagamento" fica desabilitado

  Esquema do Cenário: Entrar no checkout
    Dado <situacao>
    Quando abro "/checkout"
    Então <resultado>

    Exemplos:
      | situacao                                            | resultado                                                                         |
      | que entrei na conta com a Geladeira vazia           | sou levado à Geladeira                                                            |
      | que estou sem sessão, com 2 Maré Alta na Geladeira  | sou levado a "/entrar" e, depois de entrar, volto ao checkout com as 2 Maré Alta  |
      | que a revalidação tira a única cerveja da Geladeira | sou levado à Geladeira com o aviso da revalidação                                 |
      | que tenho um pedido de Pix aguardando, na validade  | sou levado à tela de pagamento desse pedido                                       |

  Cenário: Disputa pela última unidade
    Dado que a "Graviola Witbier" tem 1 unidade disponível
    Quando os clientes A e B confirmam pedidos com ela ao mesmo tempo
    Então só um pedido é criado e a unidade fica reservada para ele
    E o outro cliente volta à Revisão com o aviso "Graviola Witbier não está mais disponível" e nenhum pedido criado

  Cenário: Toque duplo em "Confirmar pedido"
    Dado que estou na Revisão
    Quando "Confirmar pedido" chega duas vezes à API com a mesma chave de idempotência
    Então só um pedido é criado e só uma reserva é feita
    E a segunda resposta repete a primeira

  Cenário: O total mudou antes de confirmar
    Dado que revisei um pedido com 3 Maré Alta a R$ 32,00 e 1 Cupuaçu Ale a R$ 26,50, frete de R$ 13,00 e total de R$ 135,50
    E o preço da Maré Alta mudou para R$ 34,00 depois que abri a Revisão
    Quando toco em "Confirmar pedido"
    Então nenhum pedido é criado
    E a Revisão mostra o novo total de R$ 141,50 com o aviso "O preço de Maré Alta mudou"
    E posso tocar em "Confirmar pedido" de novo com o total novo
```

## Regras de negócio

### Entrada e etapas (LB-55)

- **Rotas:** `/checkout` leva à primeira etapa pendente; as etapas são `/checkout/entrega`, `/checkout/pagamento` e `/checkout/revisao`, com o indicador "1 Entrega — 2 Pagamento — 3 Revisão" e voltar no cabeçalho. Sem a barra inferior da loja.
- **Conta:** exigida; sem sessão, vai a `/entrar` e volta ao checkout com a Geladeira ([[dados-pessoais]], LB-31). Não há etapa de identificação.
- **Pedido pendente ao entrar:** se o cliente já tem um pedido "Aguardando pagamento" dentro da validade, abrir o checkout leva direto à tela de pagamento dele ([[pagamento]]); a criação do pedido confere de novo (`PENDING_ORDER`).
- **Revalidação ao entrar:** ao abrir o checkout, o site revalida a Geladeira na API ([[geladeira]], LB-52). Os ajustes viram avisos no topo da etapa; se a Geladeira ficar vazia (ou já estiver), o cliente vai à Geladeira.
- **Ordem:** não dá para pular etapas pela URL: abrir `/checkout/revisao` sem endereço e forma de pagamento escolhidos leva à primeira etapa que falta.
- **Estado preservado:** endereço, forma de pagamento e parcelas ficam guardados na aba enquanto o cliente anda pelas etapas e ao recarregar. Os dados e o token do cartão não: voltar ao Pagamento ou recarregar pede o cartão de novo ([[pagamento]]).
- **Resumo fixo** no fim de cada etapa: quantidade de itens, subtotal, frete e total, com o botão da etapa ("Continuar para pagamento", "Continuar para revisão", "Confirmar pedido").

### Etapa Entrega (telas 05 e 29)

- Lista os endereços do cliente ([[enderecos-entrega]]) com o padrão pré-selecionado; tocar noutro o seleciona só para este pedido (o padrão não muda).
- Para o endereço selecionado, a API cota o frete ("Grátis" a partir de R$ 150,00) e diz se está na área; o resumo já mostra o frete.
- **Fora da área** (tela 29): "Ainda não entregamos neste endereço", com "Alterar endereço" (primário verde, leva a "Meus endereços") e "Voltar ao catálogo"; "Continuar para pagamento" desabilitado.
- **Mapas fora do ar:** "Não conseguimos calcular o frete agora. Tente de novo em instantes." e "Continuar para pagamento" desabilitado até a cotação dar certo ([[enderecos-entrega]]).
- **Sem endereço salvo:** "Cadastre um endereço para continuar." e o botão "Adicionar endereço".
- **"Adicionar novo endereço"** leva a "Meus endereços" e volta à Entrega depois de salvar, com o novo endereço selecionado.
- Sem prazo de entrega (LB-65 fora do MVP) e sem "Preferências de entrega" (quem recebe e instruções ao entregador).

### Etapa Pagamento (tela 06)

- Só **Pix** e **Cartão de crédito**; Pix vem selecionado. Sem cartão de débito, boleto e cupom.
- Cartão: formulário seguro do gateway e parcelas como em [[pagamento]]. Pix: só a escolha; o QR aparece depois de confirmar.

### Etapa Revisão (tela 07)

- **Itens:** cada cerveja com foto, nome, quantidade, preço atual e total da linha, sem alterar quantidades aqui; "Editar" leva à Geladeira.
- **Endereço** e **forma de pagamento** (com as parcelas) escolhidos, cada um com "Alterar", que volta à etapa.
- **Resumo:** subtotal, frete e total (no cartão de 3x ou mais, também o total com os juros do gateway, [[pagamento]]).
- **Avisos legais:** "Aprecie com moderação." e o link dos Termos de Uso ([[termos-privacidade]]).
- **Maioridade:** sem data de nascimento no perfil, a Revisão mostra "Informe sua data de nascimento para finalizar a compra." com o link para "Dados pessoais" e "Confirmar pedido" desabilitado; a API confere de novo ao criar o pedido ([[dados-pessoais]]).
- **"Confirmar pedido"** fica desabilitado e com indicador de carregamento enquanto a API responde.

### Criar o pedido (LB-56)

- **Rota** de criar pedido do cliente, com o cabeçalho `Idempotency-Key`. O corpo traz só o id do endereço, a forma de pagamento (com as parcelas e o token, no cartão) e o **total que o cliente viu** (sem juros). Itens e preços vêm da Geladeira da conta, revalidada pela API; preço, frete ou itens mandados pelo site são ignorados.
- **Numa transação**, nesta ordem (a reserva de pedido vencido já não conta no disponível, então a criação não expira pedidos nem consulta o gateway: isso fica com a leitura e o cron, [[pagamento]]):
  1. confere a maioridade (422 `UNDERAGE` ou `BIRTH_DATE_REQUIRED`, [[dados-pessoais]]);
  2. já dentro da mesma serialização por cliente do passo 3 (a trava ou a restrição vale desde este passo, para que dois toques com a mesma chave recebam a resposta repetida e não 409 `PENDING_ORDER`), busca a chave de idempotência do cliente: se a mesma chave já criou um pedido com o mesmo corpo, repete a resposta guardada (status e corpo) e para aqui, sem conferir o pendente (o pedido dessa chave não vira `PENDING_ORDER` para ela mesma); com outro corpo, responde 422 `IDEMPOTENCY_KEY_REUSED` ("Idempotência");
  3. confere que o cliente não tem outro pedido "Aguardando pagamento" dentro da validade; se tiver, responde 409 `PENDING_ORDER` com o id dele, e o site leva à tela de pagamento desse pedido. Esta conferência e a criação são serializadas por cliente (trava por cliente ou restrição única no banco, a escolha é do Back): duas criações simultâneas do mesmo cliente, mesmo com chaves de idempotência diferentes (duas abas), criam exatamente um pedido; a outra recebe 409 `PENDING_ORDER` com o id desse pedido, sem segunda reserva nem segunda cobrança;
  4. confere que o endereço é do cliente (404) e está na área (422 `OUT_OF_DELIVERY_AREA`, [[enderecos-entrega]]);
  5. revalida a Geladeira; vazia, responde 422 `EMPTY_FRIDGE`;
  6. calcula subtotal, frete e total com a regra compartilhada; total diferente do total visto responde 409 `TOTAL_CHANGED` com os avisos da revalidação e o total novo, e nada é criado;
  7. trava as cervejas do pedido em ordem fixa (pelo id da cerveja) e confere a quantidade disponível de cada uma; faltando alguma, responde 409 `OUT_OF_STOCK` com as cervejas que faltam, e nada é criado;
  8. cria o pedido "Aguardando pagamento" com o número "#LB" ([[pedidos-cliente]]), a validade de 30 minutos ([[pagamento]]), a forma de pagamento, a cópia dos itens (nome, preço e quantidade), a cópia do endereço (os campos naquele momento; editar ou excluir o endereço depois não muda o pedido), a cópia do nome e do telefone do perfil (para a entrega e o histórico; a cópia de dados pessoais está pendente, ver "Dados pessoais no pedido"), subtotal, frete e total;
  9. cria as reservas (uma por cerveja) e as baixas pendentes da Geladeira ([[pedidos-cliente]]).
- **Depois de criado,** a API gera a cobrança ([[pagamento]]); a falha do gateway não desfaz o pedido: ele fica "Aguardando pagamento" e o cliente tenta de novo na tela de pagamento.
- **Ajuste gravado mesmo sem pedido:** em `TOTAL_CHANGED` e `OUT_OF_STOCK`, os ajustes da revalidação (preço novo, cerveja que saiu, quantidade reduzida) são gravados na Geladeira da conta, como a revalidação já faz ([[geladeira]]), mesmo com o pedido não criado.
- **Respostas no site:** `TOTAL_CHANGED` e `OUT_OF_STOCK` voltam à Revisão com os avisos da revalidação, com os mesmos textos da [[geladeira]] ("O preço de Maré Alta mudou", "Graviola Witbier não está mais disponível", "A quantidade de Maré Alta foi ajustada para 1"), e a Geladeira já ajustada; `PENDING_ORDER` leva à tela de pagamento do pedido pendente; `OUT_OF_DELIVERY_AREA` volta à Entrega; `UNDERAGE` mostra "Venda proibida para menores de 18 anos."; `BIRTH_DATE_REQUIRED` leva a "Dados pessoais".
- Os logs da criação registram o id do pedido e o código do erro; nunca o endereço, a data de nascimento nem o token do cartão.

### Idempotência (LB-56)

- O site gera uma chave nova ao abrir a Revisão e a mantém enquanto nada mudar (endereço, forma de pagamento, parcelas, Geladeira ou total visto). Depois de qualquer resposta que **não criou** pedido (409, 422, erro ou tempo esgotado com resposta de erro), o site gera outra chave antes de tentar de novo; só repete a mesma chave quando a resposta não chegou (rede).
- A API guarda a chave só quando o pedido **é criado**: por cliente, por 24 horas, com um hash do corpo (sem o token do cartão) e a resposta. Erros não ficam guardados. O token do cartão nunca é guardado.
- A mesma chave do mesmo cliente com o mesmo corpo repete a resposta da criação (status e corpo), sem criar outro pedido nem outra reserva; duas requisições simultâneas com a mesma chave criam no máximo um pedido.
- A mesma chave com outro corpo responde 422 `IDEMPOTENCY_KEY_REUSED`. A chave de um cliente não tem efeito para outro.

### Quantidade disponível e esgotada (LB-38)

- **Quantidade disponível** = estoque físico menos as unidades reservadas em pedidos "Aguardando pagamento" ainda dentro da validade ([[GLOSSARY]]). A reserva de um pedido vencido não conta, mesmo antes de o pedido ser cancelado.
- O catálogo, a página de produto, a Geladeira e a criação do pedido usam a mesma regra: uma cerveja com tudo reservado aparece como esgotada ([[catalogo]]: selo "Esgotado", "Adicionar" desabilitado, no fim das listas).
- Ao aprovar o pagamento, a reserva vira baixa no estoque físico; ao cancelar ou expirar, a reserva é liberada ([[pagamento]], [[admin]]).

### Dados pessoais no pedido (LGPD)

> [!warning] **Pendente de confirmação do Diego** (dado pessoal, LGPD): não vale como aplicada e não vai ao site antes da resposta (cartão "Decisões pendentes").

- O pedido guarda a cópia do endereço, do nome e do telefone do cliente no momento da compra, e ela continua no pedido mesmo se o cliente editar ou excluir o endereço ou mudar o perfil depois (histórico e entrega).
- A Política de Privacidade ([[termos-privacidade]]) ganha, em "Quais dados coletamos": "os pedidos que você faz, com as cervejas, os valores e uma cópia do nome, do telefone e do endereço de entrega usados na compra, que continuam no pedido mesmo se você mudar o perfil ou excluir o endereço". Sem novo aceite, como em 12/11: muda a data de "última atualização" de `/privacidade` e a versão no `LEGAL_VERSIONS` no dia em que o checkout entrar no site. Recomendação do Spec, pendente de confirmação do Diego.

### Juros do cartão

- A partir da 3ª parcela, os juros são os da tabela de parcelas do gateway; se o spike LB-54 mostrar que não dá para configurar 1x e 2x sem juros, vale a taxa fixa da loja de 2,99% a.m. (decisão do Diego, 13/11). Ver [[pagamento]].

## Fora de escopo

- Pagamento em si (Pix, cartão, avisos do gateway, expiração): [[pagamento]]. Confirmação e "Meus pedidos": [[pedidos-cliente]].
- Cupom e desconto de assinante (MVP+ e Pós-MVP), cartão de débito, boleto, retirada no local.
- Prazo de entrega (LB-65), "Preferências de entrega" e agendamento.
- Alterar quantidades na Revisão (vale a Geladeira) e "Avise-me quando chegar".

## Referência visual

- **Tela 05 (Entrega):** título "Finalizar pedido", indicador de etapas, "N itens na sua geladeira" com "Ver resumo", cards de endereço com seleção e editar, "Adicionar novo endereço" e o resumo com "Continuar para pagamento". Sem "Preferências de entrega"; o frete aparece já na Entrega (não "calculado no próximo passo").
- **Tela 06 (Pagamento):** só Pix e cartão de crédito, sem o selo "Recomendado", sem débito, boleto e cupom; botão "Continuar para revisão" (não "Finalizar pedido").
- **Tela 07 (Revisão):** itens sem os botões de quantidade, endereço e pagamento com "Alterar", resumo sem cupom e desconto, avisos legais e "Confirmar pedido".
- **Tela 29:** ver [[enderecos-entrega]].
- Normalizado ao padrão aprovado (regra da revisão em [[sequencia-telas]]); exemplos do design com cervejas fora do catálogo trocados pelas do seed.

## Seams de teste

> [!info] Proposta do Spec, vetável

- **Etapas** (site, unitário): máquina de estados do checkout (ordem das etapas, pular pela URL leva à primeira pendente, estado guardado na aba sem dados nem token do cartão, chave de idempotência nova a cada mudança).
- **Pedido** (domínio da API, unitário): totais, validade (vence a partir de 30:00), cópia dos itens e do endereço, número "#LB", baixas pendentes.
- **Criar o pedido** (API, caso de uso com repositórios em memória e relógio fake): maioridade, pedido pendente válido do mesmo cliente (409 `PENDING_ORDER`; pendente vencido não bloqueia), endereço de outro cliente, fora da área, Geladeira vazia, total diferente (409 sem criar, com o ajuste da revalidação gravado na Geladeira), cópia do nome e do telefone, preço e itens mandados pelo site ignorados, reserva vencida não conta, gateway fora do ar não desfaz o pedido, logs sem endereço, data de nascimento nem token.
- **Concorrência** (integração com banco real): N pedidos simultâneos para M unidades criam no máximo M pedidos; duas requisições simultâneas com a mesma chave criam um pedido; duas criações simultâneas do mesmo cliente com chaves diferentes (duas abas), soltas juntas por uma barreira no teste e com estoque suficiente, criam exatamente um pedido "Aguardando pagamento"; a outra responde 409 `PENDING_ORDER` com o mesmo id, sem segunda reserva nem cobrança no gateway fake. Pedidos de clientes diferentes com as mesmas duas cervejas em ordens inversas, com estoque suficiente, concluem os dois: os dois ficam "Aguardando pagamento", com uma reserva por cerveja cada, e o disponível final de cada cerveja é o estoque menos as duas reservas.
- **Idempotência** (HTTP, Supertest e banco real): mesma chave e mesmo corpo repetem status e corpo da criação; outro corpo com a mesma chave 422; a chave de A não vale para B; sem token 401; um `TOTAL_CHANGED` não guarda a chave, e a nova tentativa com chave nova e o total novo cria o pedido; o registro guardado tem o hash do corpo e nunca o token do cartão. No site: chave nova depois de 409 ou 422 e quando o total visto muda; mesma chave só na falha de rede.
- **Disponível** (integração): reservas válidas descontam, vencidas não; o catálogo mostra esgotada com tudo reservado.
- **Telas** (componente): fora da área com "Continuar" desabilitado, sem endereço, avisos da revalidação, Revisão sem data de nascimento, "Confirmar pedido" desabilitado enquanto envia, respostas 409 voltando à Revisão.
- **E2E** (celular, 360 × 640): fluxo completo com Pix até a tela de pagamento; fora da área; Geladeira vazia; convidado vai a `/entrar` e volta; total mudado (o teste muda o preço pela API de teste entre abrir a Revisão e confirmar).

## Fatias, com dono e ordem

| # | Card | Dono | O que entrega |
| --- | --- | --- | --- |
| 1 | Contrato (LB-55, LB-56) | Back | PR só em `@leguele/shared`: schemas do pedido, do corpo de criar pedido e das respostas de erro; totais com a regra de frete |
| 2 | LB-56 (#32), domínio e banco | Back | Pedido, itens, reservas, histórico de status, chaves de idempotência e baixas pendentes (migration aditiva) |
| 3 | LB-56 (#32), criar pedido | Back | Caso de uso transacional com trava em ordem fixa, idempotência e a rota |
| 4 | LB-38 (#27) | Back | Quantidade disponível pelas reservas válidas no catálogo, no produto e na Geladeira |
| 5 | LB-55 (#31), site | Front | `/checkout` com Entrega, Pagamento (só a escolha de Pix; o cartão entra com o item 6) e Revisão, tela 29 e "Finalizar compra" da Geladeira ativado |

A 1 vem antes de tudo. A 3 depende da 2; a 4 pode andar junto com a 3. A 5 depende da 3 e do item 4 (endereços e frete).

Candidatos a ADR: a trava de linha em ordem fixa e a idempotência guardada no banco (fatia 3), se o Back escolher entre alternativas reais (ex.: trava de linha × atualização condicional do estoque).

## Decisões relacionadas

- [[pagamento]], [[pedidos-cliente]], [[enderecos-entrega]], [[dados-pessoais]], [[geladeira]], [[catalogo]], [[termos-privacidade]], [[admin]]
- [[mvp-corte]], [[sequencia-telas]], [[ADR-002-hospedagem-api]], [[ADR-004-mercado-pago]], [[ADR-009-guard-global-fechado]], [[ADR-010-validacao-com-zod]]

## Decisões tomadas sem consulta

Recomendações aplicadas pelo Spec em 13/11, pela regra do Diego ("sempre vá pelas recomendadas"); qualquer uma pode ser vetada.

- **Sem "Preferências de entrega"** (quem recebe e instruções ao entregador): o pedido não guarda texto livre do cliente.
- **Frete já na Entrega**, pelo endereço selecionado.
- **Outro endereço só para este pedido:** selecionar na Entrega não troca o padrão.
- **"Adicionar novo endereço"** passa por "Meus endereços" e volta à Entrega.
- **Pix pré-selecionado, sem o selo "Recomendado".**
- **Revisão sem alterar quantidades;** "Editar" leva à Geladeira.
- **Total visto no corpo:** total diferente na hora de criar o pedido responde 409 e volta à Revisão, sem criar o pedido.
- **Itens vindos da Geladeira da conta**, não do corpo.
- **Cópia do endereço no pedido.**
- **Chave de idempotência** gerada ao abrir a Revisão, trocada a cada mudança e depois de toda resposta que não criou pedido; a API guarda só a do pedido criado, por 24 horas, com o hash do corpo e sem o token; outro corpo com a mesma chave, 422.
- **Um pedido "Aguardando pagamento" por cliente:** abrir o checkout ou confirmar com um pendente válido leva à tela de pagamento dele; duas abas não criam dois.
- **Nome e telefone copiados no pedido**, junto com o endereço; texto novo da Política sobre os dados dos pedidos, sem novo aceite. **Pendente de confirmação do Diego** (LGPD, item 7): não está aplicada.
- **Criação do pedido sem expirar pedidos nem consultar o gateway** (a reserva vencida já não conta).
- **Avisos com os textos da revalidação da Geladeira**, sem textos novos para preço e esgotada.
- **Reserva vencida não conta** na quantidade disponível, mesmo antes do cancelamento.
- **Falha do gateway não desfaz o pedido.**
- **Textos novos:** "Finalizar pedido", "Continuar para pagamento", "Continuar para revisão", "Confirmar pedido", "Cadastre um endereço para continuar." e "Adicionar endereço".

## Tickets propostos

Reconciliação das issues #31, #32 e #27, a pedir ao Orchestrator depois do merge desta spec (aprovação permanente para reconciliar issue com spec mergeada): link para esta spec e o recorte de cada card (no #31, sem prazo de entrega nem cupom, com o cartão entrando com o item 6; no #32, sem cupom nem desconto de assinante, com o total visto, um pendente por cliente e a cópia do endereço, do nome e do telefone; no #27, reserva vencida não conta). Nenhuma issue nova.
