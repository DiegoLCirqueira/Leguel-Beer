---
status: pronto
modulo: pagamento
card-notion: https://app.notion.com/p/3fd490a7ac7d81dd8e55ee63c71ba30d
prioridade: P0
criado: 2026-11-13
atualizado: 2026-11-15
issues:
  - "#33 LB-57"
  - "#34 LB-58"
  - "#35 LB-59"
  - "#36 LB-60"
tags:
  - feature
---

# Pagamento só visual com Pix e cartão

> [!info] Origem
> Item 6 da [[sequencia-telas]], **feito por último**, depois de todo o resto do projeto. Derivada dos cards do Notion **LB-57** (#33, Pix com QR e validade de 30 minutos), **LB-58** (#34, cartão em até 12x), **LB-59** (#35, webhooks, que sai) e **LB-60** (#36, cancelar pedidos expirados, já mergeado), e das telas 17 (Pagamento com cartão), 18 (Pagamento Pix) e 30 (Pix aguardando e expirado). Segue o [[checkout]] e o [[ADR-018-pagamento-simulado]], que substitui o [[ADR-004-mercado-pago]]. A confirmação e "Meus pedidos" estão em [[pedidos-cliente]]; a ação do admin, em [[admin]]. Os termos seguem o [[GLOSSARY]].

> [!important] Pagamento só visual (Diego, 15/11)
> O Leguelé Beer é projeto de portfólio: **nenhum pagamento é real e tudo que envolve pagamento é só visual**. Não há gateway (nem real, nem simulado com lógica), cobrança, webhook, conta, chave, CPF nem dado de cartão, e nenhum valor é cobrado. Reescrita em 15/11 a partir da versão de 13/11 (Mercado Pago em modo de testes).

## História de usuário

- **Como** visitante do portfólio com o pedido confirmado
- **Quero** ver as telas de pagamento com Pix e cartão de teste, a contagem da validade e o resultado do meu pedido
- **Para** ver a compra completa sem gastar dinheiro

## Cenários

```gherkin
# language: pt
Funcionalidade: Pagamento só visual com Pix e cartão

  Cenário: Tela do Pix
    Dado que confirmei na Revisão um pedido de R$ 162,00 com Pix
    Quando a tela de pagamento do pedido abre
    Então vejo a imagem decorativa do QR, o código de demonstração com "Copiar código" e "Expira em 30:00" contando para trás, sem aviso de portfólio
    E nada é cobrado e o pedido continua "Aguardando pagamento"

  Cenário: Pix expirado
    Dado um pedido de Pix "Aguardando pagamento"
    Quando a contagem chega a zero ou abro a tela de pagamento depois da validade
    Então vejo "Pix expirado" e o botão "Refazer pedido"
    E o pedido está "Cancelado", as unidades reservadas voltaram a ficar disponíveis e a Geladeira não mudou

  Esquema do Cenário: Parcelas do cartão
    Dado um pedido de R$ 154,30
    Quando escolho <parcelas> no cartão
    Então vejo <resultado> antes de confirmar

    Exemplos:
      | parcelas | resultado                           |
      | 1x       | "1x de R$ 154,30 sem juros"         |
      | 2x       | "2x de R$ 77,15 sem juros"          |
      | 3x       | "3x de R$ 54,54 (total R$ 163,62)"  |
      | 12x      | "12x de R$ 15,49 (total R$ 185,88)" |

  Esquema do Cenário: Cartão de teste
    Dado que estou na etapa Pagamento com cartão
    Quando digito o número "<numero>" e sigo até "Confirmar pedido"
    Então <resultado>

    Exemplos:
      | numero              | resultado                                                                                                                       |
      | 4111 1111 1111 1111 | o pedido é criado "Aguardando pagamento", só com a forma "cartão" e as parcelas, e vejo "Pagamento em análise" na tela do pedido |
      | 5555 4444 3333 1111 | vejo "Use um dos cartões de teste." no campo do número e não passo da etapa Pagamento                                          |

  Cenário: O admin confirma o pagamento (recomendação vetável)
    Dado um pedido "Aguardando pagamento" dentro da validade, com a tela de pagamento aberta no celular do cliente
    Quando o admin toca em "Confirmar pagamento" no detalhe do pedido
    Então o pedido fica "Pago", a reserva vira baixa no estoque físico e sai a baixa da Geladeira
    E em até 5 segundos a tela do cliente leva a "/pedido/<id>/confirmado"

  Cenário: Pagamento de outro cliente
    Dado um pedido "Aguardando pagamento" de outro cliente
    Quando abro "/pedido/<id>/pagamento"
    Então vejo a página "não encontrada", sem dados do pedido
```

## Regras de negócio

### Só visual

- **Nenhuma lógica de pagamento:** sem gateway (nem real, nem simulado), sem cobrança, sem webhook nem aviso de pagamento, sem aprovação automática ou tardia, sem idempotência por pagamento ([[ADR-018-pagamento-simulado]]). A API não tem rota de pagamento.
- **O pedido continua o mesmo:** criado "Aguardando pagamento" com reserva e validade de 30 minutos ([[checkout]]), expiração no uso e pelo cron (LB-60, já mergeado), status e estoque como em [[pedidos-cliente]] e [[admin]].
- **Sem aviso de portfólio:** vale a decisão do Diego de 30/10 ([[termos-privacidade]]): nenhuma tela de pagamento diz que o site é projeto de portfólio ou que o pagamento é simulado.
- Nenhum dado pessoal ou de cartão vai à API ou a terceiros por causa do pagamento. A Política de Privacidade não muda por esta spec.

### De "Aguardando pagamento" a "Pago"

> [!question] Recomendação do Spec, vetável
> Sem lógica de pagamento, o pedido passa a "Pago" por uma **ação do admin**: "Confirmar pagamento" no detalhe do pedido ([[admin]]). Alternativas: (B) o pedido nunca fica "Pago" e só expira ou é cancelado; (C) um botão do próprio cliente, que seria lógica de pagamento e o Diego excluiu.

- **"Confirmar pagamento"** aparece só para pedido "Aguardando pagamento" dentro da validade. Na mesma transação e com a conferência de status do [[admin]] ("Concorrência"): o pedido fica "Pago", a reserva vira baixa no estoque físico (com o histórico do estoque), sai a baixa pendente da Geladeira ([[pedidos-cliente]]) e o status anterior vai ao histórico do pedido, com quem e quando.
- **Vencido:** se a validade já passou, a API expira o pedido (mesmo caso de uso do LB-60) e responde 409; o admin vê o pedido "Cancelado".
- **Uma vez só:** a segunda tentativa, ou a corrida com a expiração ou o cancelamento, responde 409 e não muda nada (regra de concorrência do [[admin]]).
- Entra com o LB-76 (#76), item 8, antes das telas de pagamento: o resto do projeto não depende delas.

### Fluxo das telas

- **Escolha na etapa Pagamento** do checkout ([[checkout]]): Pix ou cartão de crédito. Boleto fora.
- **Pix:** a etapa Pagamento só registra a escolha. Depois de "Confirmar pedido" na Revisão, o site abre a tela de pagamento do pedido. O QR nunca aparece antes de confirmar ([[sequencia-telas]], divergência 18 e 30).
- **Cartão:** os campos do cartão de teste ficam na etapa Pagamento e são conferidos só no site. A criação do pedido recebe só a forma "cartão" e as parcelas; depois, o site abre a tela de pagamento do pedido em "Pagamento em análise".
- **Tela de pagamento do pedido** `/pedido/[id]/pagamento`: exige conta; posse antes de qualquer desvio (pedido de outro cliente ou inexistente dá "não encontrada", como em [[pedidos-cliente]]). Pedido "Pago" ou depois leva à confirmação; "Cancelado" mostra "Pix expirado" (expirado) ou "Pedido cancelado" (pelo admin), com "Refazer pedido". Sem troca de forma de pagamento.
- **Consulta do status:** sem WebSocket ([[ADR-002-hospedagem-api]]), a tela lê o status do pedido a cada 5 s enquanto está aberta e visível, e no botão "Já paguei" (que só lê de novo). Pago: vai à confirmação. Ler o pedido já aplica a expiração no uso (LB-60).
- **Validade:** 30 minutos desde a criação; vencido a partir de 30:00 ([[checkout]]). A contagem usa o horário de vencimento dado pela API, não o relógio do aparelho.
- **Retomar** (pergunta 3 de 13/11): em "Meus pedidos", o pedido "Aguardando pagamento" fica tocável e leva a esta tela, quando ela existir ([[pedidos-cliente]]).

### Pix (LB-57, telas 18 e 30)

- **Tela:** imagem decorativa do QR, código de demonstração com "Copiar código", contagem "Expira em mm:ss", "Aguardando pagamento", os passos "Como pagar", o resumo (quantidade de itens, subtotal, frete e total) e "Já paguei".
- **QR inválido:** a imagem é uma ilustração fixa do site, igual para todos os pedidos, que não é um QR legível e não paga nada. O código de demonstração também é um texto fixo do site, fora do formato do Pix, que nenhum app de banco aceita.
- **Copiar código:** leva o texto à área de transferência e mostra o toast "Código copiado". Se o navegador recusar, o texto fica selecionado para copiar à mão.
- **Expirado** (pergunta 2 de 13/11): ao zerar a contagem (ou ao abrir depois), a tela relê o pedido e mostra "Pix expirado", "O tempo para pagamento se esgotou." e "Refazer pedido", que leva ao checkout com a Geladeira como estava (novo pedido, nova reserva).

### Cartão de teste (LB-58, tela 17)

- **Campos:** número, nome, validade e CVV, só na tela. Abaixo do número, a ajuda "Cartões de teste: 4111 1111 1111 1111 ou 4000 0000 0000 0002."
- **Só cartões de teste:** o site aceita só esses dois números; qualquer outro mostra "Use um dos cartões de teste." e não deixa seguir. Validade no futuro e CVV de 3 dígitos, conferidos no site. Assim ninguém digita um cartão real.
- **Nada do cartão sai do aparelho:** número, nome, validade e CVV nunca vão à API, nunca ficam em armazenamento local, URL ou log, e só ficam na memória da página. Voltar etapas ou recarregar pede o cartão de novo.
- **Parcelas** (pergunta 1 de 13/11, opção B, sem gateway): de 1x a 12x para qualquer total. 1x e 2x sem juros; de 3x a 12x com a taxa fixa de 2,99% a.m., tabela Price: parcela = total × 0,0299 / (1 − 1,0299^−n), arredondada ao centavo (meio centavo para cima), e total com juros = parcela × n. Cálculo puro no `@leguele/shared`, em centavos, só para mostrar. O total do pedido na loja não muda.
- **Depois de confirmar:** a tela de pagamento do pedido mostra "Pagamento em análise", "A loja confirma o pagamento em instantes.", a contagem da validade e o resumo com as parcelas. Os dois cartões de teste dão o mesmo resultado (não há recusa).
- Salvar cartão fica fora.

## Ajustes no código já mergeado

Para o Back, no item 6 ou antes, se atrapalhar: a porta `PaymentGateway` da expiração (a expiração passa a só cancelar), as tabelas de cobrança e de avisos do gateway no schema e o corpo de criar pedido com token deixam de ter uso. Os schemas de parcelas do `@leguele/shared` passam a usar o cálculo da loja.

## Fora de escopo

- Gateway real ou simulado, cobrança, webhook, aprovação automática, troca de forma de pagamento, recusa, conta, chaves, spike LB-54, CPF e formulário seguro de terceiros ([[ADR-018-pagamento-simulado]]).
- Boleto, Pix automático, salvar cartão, assinaturas do Clube.
- Reembolso, estorno e chargeback (não há dinheiro).
- Atualização em tempo real por WebSocket e e-mails de pagamento (LB-81 em aberto, [[pedidos-cliente]]).

## Referência visual

- **Tela 17:** o passo Pagamento do checkout com os campos do cartão, a ajuda dos cartões de teste e as parcelas; parcelas e "sem juros" conforme esta spec (não 3x sem juros do design); "Continuar para revisão".
- **Tela 18:** a tela de pagamento do pedido, depois de confirmar, sem o indicador de etapas; QR decorativo, contagem, código com "Copiar código", "Como pagar", resumo e "Já paguei".
- **Tela 30:** "Aguardando pagamento" e "Pix expirado" são estados da mesma tela; "Gerar novo Pix" vira "Refazer pedido"; sem "Voltar para o pedido" (o detalhe do pedido é MVP+).
- Normalizado ao padrão aprovado (regra da revisão em [[sequencia-telas]]).

## Seams de teste

> [!info] Proposta do Spec, vetável

- **Parcelas** (`@leguele/shared`, unitário): 1x e 2x sem juros, 3x e 12x pela Price de 2,99% com o arredondamento da spec (R$ 154,30: 3x de R$ 54,54, total R$ 163,62; 12x de R$ 15,49, total R$ 185,88).
- **Cartão de teste** (site, componente): só os dois números passam; número, nome, validade e CVV fora do armazenamento local, da URL e do corpo enviado à API.
- **Confirmar pagamento** (API, no LB-76): caso de uso com repositório em memória e relógio fake (na validade fica "Pago" com baixa; vencido expira e 409; repetido 409); integração com banco real (confirmar × expirar × cancelar ao mesmo tempo deixa um só resultado: se confirmar vencer, uma baixa de estoque físico e uma da Geladeira; se expirar ou cancelar vencer, nenhuma baixa de estoque físico nem da Geladeira e a reserva liberada uma vez).
- **Telas** (componente, relógio controlado): contagem a partir do vencimento da API, "Código copiado", leitura a cada 5 s e no "Já paguei", estado expirado, "Pagamento em análise", posse.
- **E2E** (celular, 360 × 640): Pix até a tela de pagamento e, com o admin confirmando, a confirmação; Pix expirado pelo relógio da API de teste ([[qualidade-compra]]); cartão de teste até "Pagamento em análise".

## Fatias, com dono e ordem

| # | Card | Dono | O que entrega |
| --- | --- | --- | --- |
| 1 | LB-76 (#76) | Back e Front | "Confirmar pagamento" do admin, dentro da fatia do LB-76 do [[admin]] (antes das telas) |
| 2 | LB-57 (#33) | Front | `/pedido/[id]/pagamento` com QR decorativo, código, contagem, leitura do status e expirado |
| 3 | LB-58 (#34) | Front | Campos do cartão de teste, parcelas e "Pagamento em análise" |

As fatias 2 e 3 são as **últimas do projeto**, depois de todo o resto pronto; até lá o checkout leva a "Meus pedidos" ([[checkout]]). O LB-60 (#36) já está mergeado; o LB-59 (#35) e o spike LB-54 (#30) saem ([[ADR-018-pagamento-simulado]]).

Candidatos a ADR: nenhum (a decisão já está no [[ADR-018-pagamento-simulado]]).

## Decisões relacionadas

- [[checkout]], [[pedidos-cliente]], [[admin]], [[geladeira]], [[termos-privacidade]], [[qualidade-compra]]
- [[mvp-corte]], [[sequencia-telas]], [[ADR-002-hospedagem-api]], [[ADR-018-pagamento-simulado]], [[ADR-009-guard-global-fechado]]

## Decisões do Diego

### 15/11

- **Pagamento não é real e é só visual:** sem Mercado Pago, conta, chave, gateway (real ou simulado), cobrança, webhook, CPF ou cartão reais; QR inválido; cartão de teste só na tela; sem aviso de portfólio (mantida a decisão de 30/10); as telas de pagamento são feitas por último. Ver [[ADR-018-pagamento-simulado]].

### 13/11

Perguntas levadas pelo Orchestrator. Resposta do Diego: "todas as recomendadas". Com a decisão de 15/11, mudaram as respostas 1, 4, 5 e 6.

1. **Juros do cartão: A**, com a B se não desse para configurar o gateway. **Desde 15/11 vale a B:** taxa fixa de 2,99% a.m. (tabela Price), só para mostrar.
2. **Pix expirado: A.** "Refazer pedido" volta ao checkout com a Geladeira intacta e gera um novo pedido.
3. **Retomar o pagamento: A.** O pedido "Aguardando pagamento" fica tocável em "Meus pedidos" e leva à tela do pagamento.
4. **CPF no pagamento: A.** **Sem efeito desde 15/11:** não há CPF.
5. **Aprovação depois da expiração: A.** **Sem efeito desde 15/11:** não há aprovação; o admin não confirma pedido vencido.
6. **Conta de teste no Mercado Pago: A.** **Sem efeito desde 15/11:** não há conta nem chave.

## Decisões tomadas sem consulta

Recomendações aplicadas pelo Spec (13/11, revistas em 15/11); qualquer uma pode ser vetada.

- **"Pago" pela ação "Confirmar pagamento" do admin**, só na validade (ver a recomendação acima). Muda o "Pago só pelo pagamento, nunca pelo admin" do [[admin]].
- **Cartões de teste fixos** e qualquer outro número recusado no site, para ninguém digitar um cartão real; os dois dão o mesmo resultado.
- **QR e código fixos do site**, iguais para todos os pedidos e ilegíveis como Pix.
- **Parcelas de 1x a 12x para qualquer total**, com arredondamento da parcela ao centavo e total = parcela × n.
- **"Já paguei" só relê o status**; sem troca de forma de pagamento.
- **Até as telas de pagamento existirem, o checkout leva a "Meus pedidos"** ([[checkout]]).
- **Textos novos:** "Copiar código", "Código copiado", "Já paguei", "Pix expirado", "O tempo para pagamento se esgotou.", "Refazer pedido", "Pedido cancelado", "Pagamento em análise", "A loja confirma o pagamento em instantes.", "Use um dos cartões de teste.", "Cartões de teste: 4111 1111 1111 1111 ou 4000 0000 0000 0002." e "Confirmar pagamento".

## Tickets propostos

Reconciliação das issues #30, #33, #34, #35, #36 e #76, a pedir ao Orchestrator depois do merge desta spec (aprovação permanente para reconciliar issue com spec mergeada), listada na descrição do PR. Nenhuma issue nova.
