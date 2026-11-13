---
status: pronto
modulo: pagamento
card-notion: https://app.notion.com/p/3fd490a7ac7d81dd8e55ee63c71ba30d
prioridade: P0
criado: 2026-11-13
issues:
  - "#33 LB-57"
  - "#34 LB-58"
  - "#35 LB-59"
  - "#36 LB-60"
tags:
  - feature
---

# Pagamento com Pix e cartão

> [!info] Origem
> Item 6 da [[sequencia-telas]]. Derivada dos cards do Notion **LB-57** (#33, Pix com QR e validade de 30 minutos), **LB-58** (#34, cartão em até 12x), **LB-59** (#35, webhooks idempotentes) e **LB-60** (#36, cancelar pedidos expirados), e das telas 17 (Pagamento com cartão), 18 (Pagamento Pix) e 30 (Pix aguardando e expirado). Segue o [[checkout]] (já na `main`) e o [[ADR-004-mercado-pago]]: Mercado Pago em modo de testes, **proposto até o spike LB-54** (#30), atrás de uma porta de gateway na API. O pedido nasce no checkout (item 5, LB-56); a confirmação e "Meus pedidos" estão em [[pedidos-cliente]]. Os termos seguem o [[GLOSSARY]].

As perguntas de pagamento, contas e LGPD foram ao Diego em 13/11 pelo Orchestrator; as respostas estão em "Decisões do Diego (13/11)".

## História de usuário

- **Como** cliente com o pedido revisado
- **Quero** pagar com Pix ou cartão, ver na hora se o pagamento passou e saber o que fazer se não passou
- **Para** concluir a compra sem dúvida sobre o pagamento

## Cenários

```gherkin
# language: pt
Funcionalidade: Pagamento com Pix e cartão

  Cenário: Pagar com Pix
    Dado que confirmei na Revisão um pedido de R$ 162,00 com Pix
    Quando a tela de pagamento abre
    Então vejo o QR Code, o código "copia e cola" com "Copiar código" e "Expira em 30:00" contando para trás
    E, quando o gateway aprova o pagamento, em até 5 segundos sou levado a "/pedido/<id>/confirmado"

  Cenário: Pix expirado
    Dado um pedido de Pix criado há 30 minutos sem pagamento
    Quando a contagem chega a zero ou abro a tela de pagamento depois disso
    Então vejo "Pix expirado" e o botão "Refazer pedido"
    E o pedido fica "Cancelado", as unidades reservadas voltam a ficar disponíveis e a Geladeira não muda

  Esquema do Cenário: Parcelas do cartão
    Dado um pedido de R$ 154,30
    Quando escolho <parcelas> no cartão
    Então vejo <resultado> antes de confirmar

    Exemplos:
      | parcelas | resultado                                                                       |
      | 1x       | "1x de R$ 154,30 sem juros"                                                     |
      | 2x       | "2x de R$ 77,15 sem juros"                                                      |
      | 3x       | o valor da parcela com juros e o total final, como devolvidos pelo gateway      |

  Cenário: Cartão recusado
    Dado que estou pagando um pedido com o cartão de teste de recusa
    Quando confirmo o pagamento
    Então vejo "Pagamento recusado. Tente outro cartão ou Pix."
    E o pedido continua "Aguardando pagamento", com a reserva, e posso tentar outro cartão ou Pix até a validade

  Esquema do Cenário: Aviso de pagamento do gateway
    Dado um pedido "<status>"
    Quando chega à API um aviso de pagamento <aviso>
    Então <resultado>

    Exemplos:
      | status               | aviso                                | resultado                                                                                                           |
      | Aguardando pagamento | de aprovação, com assinatura válida  | o pedido fica "Pago", a reserva vira baixa no estoque físico e sai a baixa da Geladeira                              |
      | Pago                 | igual ao anterior, repetido           | a API responde 200 e nada se repete: nem estoque, nem Geladeira, nem histórico                                      |
      | Aguardando pagamento | com assinatura falsa                 | a API responde 401 e nada muda                                                                                      |
      | Cancelado (expirado) | de aprovação feita depois da validade | o pedido continua "Cancelado" e o admin vê "Pagamento recebido após o cancelamento: faça o reembolso no painel do Mercado Pago." |

  Cenário: Pix vencido antes do cron
    Dado um pedido de Pix vencido há 1 minuto e o cron diário ainda não rodou
    Quando o pedido é lido, um aviso de pagamento dele chega ou outro pedido tenta reservar a mesma cerveja
    E o gateway confirma que a cobrança não foi paga
    Então o pedido passa a "Cancelado" e a reserva é liberada nessa mesma requisição
```

## Regras de negócio

### Fluxo

- **Escolha na etapa Pagamento** do checkout ([[checkout]]): Pix ou cartão de crédito. Boleto fora.
- **Pix:** a etapa Pagamento só registra a escolha. Ao tocar "Confirmar pedido" na Revisão, a API cria o pedido (LB-56) e a cobrança Pix, e o site abre a tela de pagamento do pedido, com o QR. O QR nunca aparece antes de confirmar ([[sequencia-telas]], divergência 18 e 30).
- **Cartão:** os dados são digitados na etapa Pagamento, no formulário seguro do gateway, que devolve um token; ao tocar "Confirmar pedido", a API cria o pedido e cobra o token com as parcelas escolhidas. Aprovado: vai à confirmação ([[pedidos-cliente]]). Recusado: vai à tela de pagamento do pedido com a mensagem.
- **Tela de pagamento do pedido** `/pedido/[id]/pagamento`: exige conta; posse antes de qualquer desvio (pedido de outro cliente ou inexistente dá "não encontrada", como em [[pedidos-cliente]]). Pedido pago leva à confirmação; cancelado mostra o estado "Pix expirado" ou "Pedido cancelado" com "Refazer pedido". Enquanto o pedido aguarda e está na validade, o cliente pode trocar a forma de pagamento (gerar o Pix ou tentar outro cartão) sem criar outro pedido.
- **Troca de forma de pagamento:** antes de gerar a nova cobrança, a API cancela no gateway a cobrança anterior ainda aberta do mesmo pedido (o Pix gerado ou o pagamento de cartão pendente). Se, mesmo assim, chegar a aprovação de outro pagamento para um pedido já "Pago", o pedido não muda, e o pagamento a mais ganha a marca "Pagamento em duplicidade", que o admin vê no detalhe com "Faça o reembolso no painel do Mercado Pago." (reembolso manual).
- **Validade do pedido:** 30 minutos desde a criação, para Pix e cartão ([[checkout]]). A partir de 30:00 o pedido está vencido (criado às 10:00:00, às 10:29:59 ainda vale e às 10:30:00 já venceu). A cobrança Pix vence no mesmo instante.
- **Retomar o pagamento** (pergunta 3): em "Meus pedidos", o pedido "Aguardando pagamento" fica tocável e leva a esta tela; os outros status seguem não tocáveis ([[pedidos-cliente]]).

### Pix (LB-57, telas 18 e 30)

- **Tela:** QR Code, código "copia e cola" com "Copiar código", contagem "Expira em mm:ss" a partir do horário de vencimento dado pela API (não do relógio do aparelho), "Aguardando pagamento", os passos "Como pagar" e o resumo (quantidade de itens, subtotal, frete e total).
- **Copiar código:** leva o código à área de transferência e mostra o toast "Código copiado". Se o navegador recusar, o código fica selecionado para o cliente copiar à mão.
- **Aprovação sem recarregar:** sem WebSocket ([[ADR-002-hospedagem-api]]), a tela consulta o status do pedido a cada 5 s enquanto está aberta e visível, e também no botão "Já paguei". Pago: vai à confirmação.
- **Expirado** (pergunta 2): ao zerar a contagem (ou ao abrir depois), a tela mostra "Pix expirado", "O tempo para pagamento se esgotou." e o botão "Refazer pedido", que leva ao checkout com a Geladeira como estava (novo pedido, nova reserva, novo Pix).
- **Simular pagamento:** só com o gateway em modo de testes, a tela mostra "Simular pagamento", que pede ao gateway de testes a aprovação, para a demonstração do portfólio. A rota da API que faz isso exige a posse do pedido e é recusada pelo próprio servidor fora do modo de testes (não basta esconder o botão). O mesmo vale para o relógio adiantado usado nos testes: só existe no modo de testes.

### Cartão (LB-58, tela 17)

- **Formulário seguro do gateway:** número, nome, validade e CVV são digitados em campos do SDK do gateway; os dados do cartão nunca passam pela API nem ficam em log. A API recebe só o token, as parcelas e o meio (bandeira). O token fica só na memória da página: nunca em armazenamento local, URL ou log. Voltar etapas ou recarregar pede o cartão de novo.
- **Dados enviados ao gateway** (mínimo, Pix e cartão): valor, descrição "Pedido #LB…", e-mail e nome do cliente e, só se o gateway exigir, o CPF. Nunca telefone, endereço, data de nascimento nem itens. Um teste captura a requisição enviada e falha se aparecer outro campo.
- **CPF do titular** (pergunta 4): só se o spike LB-54 mostrar que o gateway exige; pedido na etapa Pagamento, enviado ao gateway e não gravado na loja (perfil, pedido ou log). Se entrar, a Política ganha "o CPF vai ao processador de pagamento" ([[termos-privacidade]]).
- **Parcelas** (pergunta 1; se o spike LB-54 mostrar que o modo de testes não deixa configurar 1x e 2x sem juros, vale a taxa fixa da loja de 2,99% a.m., tabela Price, calculada no `@leguele/shared` e usada pelo site e pela API): de 1x a 12x, conforme a tabela que o gateway devolve para o total do pedido. 1x e 2x sem juros ("sem juros"); de 3x a 12x com os juros do gateway, mostrando o valor da parcela e o total final antes de confirmar. Se o gateway oferecer menos parcelas para um total baixo, o site mostra só as oferecidas. Valores em centavos, sem arredondamento do site.
- **Recusa:** "Pagamento recusado. Tente outro cartão ou Pix." (texto do card). Erro ou tempo esgotado no gateway: "Não foi possível processar o pagamento agora. Tente de novo em instantes." e nada é cobrado em dobro (a nova tentativa usa a mesma chave de idempotência da tentativa anterior).
- Salvar cartão fica fora.

### Avisos de pagamento (LB-59)

- **Endpoint público** de avisos do gateway na API, processado de forma síncrona na própria requisição ([[ADR-002-hospedagem-api]], [[mvp-corte]]: sem fila).
- **Assinatura:** confere a assinatura do aviso com o segredo do gateway; inválida ou ausente, 401 e nada muda.
- **Status real:** não confia no corpo do aviso: consulta o pagamento no gateway antes de mudar o pedido, e só aplica se o pagamento for um dos registrados para aquele pedido e o valor bater com o total do pedido. Pagamento de outro pedido ou com valor diferente não muda nada, responde 200 e ganha a marca "Pagamento divergente" para o admin.
- **Vale a hora da aprovação:** o que decide é a hora em que o gateway aprovou, não a hora em que o aviso chega. Aprovado dentro da validade, o pedido fica "Pago" mesmo que o aviso chegue depois dos 30 minutos.
- **Um registro por evento:** o id do evento do gateway é único; evento repetido responde 200 sem repetir nada. Fora de ordem: um pedido "Pago" nunca volta a "Aguardando pagamento".
- **Ao aprovar** (uma vez por pedido): o pedido fica "Pago"; a reserva vira baixa no estoque físico (e entra no histórico do estoque, [[admin]]); sai a baixa da Geladeira ([[pedidos-cliente]], "baixa pendente"); o status anterior fica no histórico do pedido.
- **Aprovação depois da validade** (pergunta 5): pedido já "Cancelado" continua cancelado, sem baixa de estoque nem da Geladeira, e ganha a marca "Pagamento recebido após o cancelamento", que o admin vê no detalhe com "Faça o reembolso no painel do Mercado Pago." ([[admin]]).
- **Recusa** do cartão por aviso: o pedido continua "Aguardando pagamento".
- Os logs registram o id do evento, o id do pedido e o status; nunca dados do cartão, CPF nem dados pessoais.

### Expiração (LB-60)

- Já definida no [[checkout]]: checagem **no momento do uso** (ao ler o pedido, ao receber o aviso de pagamento e antes de reservar estoque) e um **cron diário** da plataforma que cancela os expirados que restarem. Sem processo em segundo plano.
- Expirar = status "Cancelado" com motivo "pagamento não concluído", reserva liberada, baixas pendentes da Geladeira descartadas e o status anterior no histórico. O cron e a checagem usam o mesmo caso de uso, com relógio injetado, e são seguros se rodarem juntos (um pedido só é cancelado uma vez).
- **Antes de cancelar, consulta o gateway:** a expiração (no uso ou no cron) pergunta ao gateway se a cobrança do pedido foi aprovada dentro da validade; se foi, aplica a aprovação em vez de cancelar. Se o gateway não responder, o pedido não é cancelado nessa vez (segue aguardando, com a reserva) e a próxima checagem tenta de novo. Uma aprovação dentro da validade que chegue a um pedido já cancelado (atraso do gateway) é tratada como aprovação depois da validade: segue "Cancelado" com reembolso manual.

### Gateway e spike (LB-54)

- A API fala com o gateway só por uma porta (cobrar Pix, cobrar cartão, consultar pagamento, tabela de parcelas, conferir assinatura) ([[ADR-004-mercado-pago]], [[ADR-005-monorepo-camadas]]).
- O spike LB-54 (timebox de 3 h) confirma no modo de testes: Pix com vencimento de 30 minutos, cartão com 1x e 2x sem juros e a tabela de parcelas, cartões de teste de aprovação e recusa, assinatura do aviso, se o CPF é exigido, e os termos de uso (retenção e transferência de dados). O resultado vai na descrição do PR do spike; o Back muda o [[ADR-004-mercado-pago]] para aceito por um ADR novo, ou propõe outro provedor.
- **Conta e segredos** (pergunta 6): conta de desenvolvedor gratuita, só credenciais de teste; chaves e segredo do aviso só no `.env` da API, fora do git, com as chaves sem valor no `.env.example`. No local, o aviso chega por um túnel sem conta ou é substituído pela consulta ao gateway.

### Política de Privacidade

- "Com quem compartilhamos" ganha: "o processador de pagamento (Mercado Pago), que recebe seu nome, seu e-mail e, quando exigido, seu CPF, para processar o pagamento". Sem novo aceite, como em 12/11 ([[termos-privacidade]]): muda a data de "última atualização" de `/privacidade` e a versão no `LEGAL_VERSIONS` no dia em que o pagamento entrar no site. Recomendação aplicada, vetável.

### Ajuste previsto no admin

- O detalhe do pedido no admin ([[admin]]) passa a mostrar as marcas "Pagamento recebido após o cancelamento", "Pagamento em duplicidade" e "Pagamento divergente", cada uma com "Faça o reembolso no painel do Mercado Pago." quando couber. Entra num PR seguinte da spec do Admin.

## Fora de escopo

- Boleto, Pix automático, salvar cartão, assinaturas do Clube.
- Reembolso, estorno e chargeback automáticos (reembolso manual pelo admin).
- Atualização em tempo real por WebSocket e e-mails de pagamento (LB-81 em aberto, [[pedidos-cliente]]).
- Cobrança real: tudo em modo de testes no MVP.

## Referência visual

- **Tela 17:** o passo Pagamento do checkout com o formulário do cartão e as parcelas; parcelas e "sem juros" conforme esta spec (não 3x sem juros do design); bandeiras aceitas como as do gateway; "Continuar para revisão".
- **Tela 18:** o QR fica na tela de pagamento do pedido, depois de confirmar, sem o indicador de etapas; contagem, "copia e cola", "Como pagar", resumo e "Já paguei".
- **Tela 30:** "Aguardando pagamento" e "Pix expirado" são estados da mesma tela; "Gerar novo Pix" vira "Refazer pedido"; sem "Voltar para o pedido" (o detalhe do pedido é MVP+).
- Normalizado ao padrão aprovado (regra da revisão em [[sequencia-telas]]).

## Seams de teste

> [!info] Proposta do Spec, vetável

- **Porta do gateway** (API): adaptador testado com respostas gravadas do modo de testes (Pix criado, aprovado, vencido; cartão aprovado e recusado; tabela de parcelas; erro e tempo esgotado), sem rede no CI; fake da porta para os casos de uso.
- **Casos de uso** (API, repositório em memória e relógio fake): cobrar Pix e cartão (posse, pedido vencido recusado, troca de forma de pagamento); confirmar pagamento (aprovação, repetida 3 vezes, fora de ordem, aprovada dentro da validade com aviso depois dos 30 min, depois da validade, recusa, pagamento de outro pedido ou com valor diferente, segundo pagamento aprovado para pedido já pago marcado como duplicidade); troca de forma de pagamento cancela a cobrança anterior no gateway fake; expiração consulta o gateway antes de cancelar (aprovado aplica, gateway fora do ar não cancela); borda da validade (29:59 vale, 30:00 venceu); expirar (31 min cancela, 10 min não muda, cron e leitura juntos cancelam uma vez).
- **Aviso de pagamento** (HTTP, Supertest e banco real): assinatura válida, falsa e ausente; o mesmo evento 3 vezes; logs sem dados de cartão nem pessoais.
- **Modo de testes** (HTTP): a rota de simular pagamento e o relógio adiantado respondem recusa fora do modo de testes; dentro dele, exigem a posse do pedido (outro cliente, 404).
- **Dados ao gateway** (API): a requisição capturada no gateway fake só tem valor, descrição, e-mail, nome e, quando exigido, CPF; o CPF não aparece no banco nem nos logs.
- **Estoque e Geladeira** (integração com banco real): aprovação converte a reserva em baixa uma vez; expiração libera a reserva; baixa pendente da Geladeira ([[pedidos-cliente]]).
- **Telas** (componente, relógio controlado): contagem a partir do vencimento da API, token do cartão fora do armazenamento local e da URL, "Código copiado", consulta a cada 5 s e no "Já paguei", estado expirado, parcelas (1x, 2x, 3x) e recusa.
- **E2E** (celular, 360 × 640): Pix aprovado pelo "Simular pagamento" com o gateway fake; Pix expirado com o relógio da API de teste adiantado; cartão aprovado e recusado com os cartões de teste do gateway fake.

## Fatias, com dono e ordem

| # | Card | Dono | O que entrega |
| --- | --- | --- | --- |
| 0 | LB-54 (#30), spike | Back | Confirmações do modo de testes, decisão do CPF e ADR que aceita ou troca o ADR-004 |
| 1 | Contrato | Back | PR só em `@leguele/shared`: formas de pagamento, schemas da cobrança e da tabela de parcelas, textos de recusa |
| 2 | LB-60 (#36) | Back | Caso de uso de expiração com relógio, checagem no uso e cron diário |
| 3 | LB-59 (#35) | Back | Aviso de pagamento: assinatura, consulta, evento único, aprovação (estoque e Geladeira) e aprovação tardia |
| 4 | LB-57 (#33) | Back e Front | Cobrança Pix e `/pedido/[id]/pagamento` com QR, contagem, cópia, consulta e expirado |
| 5 | LB-58 (#34) | Back e Front | Formulário seguro, parcelas, cobrança do cartão e recusa |

A 0 vem antes de tudo; a 1 pode andar junto. As 2 a 5 dependem do pedido do item 5 (LB-56). A 3 vem antes das 4 e 5.

Candidatos a ADR: o resultado do spike LB-54 (fatia 0), que substitui o [[ADR-004-mercado-pago]] proposto.

## Decisões relacionadas

- [[checkout]], [[pedidos-cliente]], [[admin]], [[geladeira]], [[dados-pessoais]], [[termos-privacidade]]
- [[mvp-corte]], [[sequencia-telas]], [[ADR-002-hospedagem-api]], [[ADR-004-mercado-pago]], [[ADR-005-monorepo-camadas]], [[ADR-009-guard-global-fechado]]

## Decisões do Diego (13/11)

Perguntas levadas pelo Orchestrator. Resposta do Diego: "todas as recomendadas".

1. **Juros do cartão: A.** Tabela de parcelas do Mercado Pago: 1x e 2x sem juros configurados na conta de testes; 3x a 12x com os juros dele. Se o spike LB-54 mostrar que não dá para configurar, vira B: taxa fixa da loja de 2,99% a.m. (tabela Price).
2. **Pix expirado: A.** "Refazer pedido" volta ao checkout com a Geladeira intacta e gera um novo pedido.
3. **Retomar o pagamento: A.** O pedido "Aguardando pagamento" fica tocável em "Meus pedidos" e leva à tela do pagamento. Muda a resposta 4 do item 7 só para esse status; o ajuste em [[pedidos-cliente]] vai num PR seguinte.
4. **CPF no pagamento (LGPD): A.** Se o gateway exigir, o CPF é pedido só na etapa Pagamento, vai ao gateway e não é gravado na loja nem em log. A Política ganha "o CPF vai ao processador de pagamento" no dia em que o campo entrar no site.
5. **Aprovação depois da expiração: A.** O pedido continua "Cancelado" e o admin vê o aviso de reembolso manual.
6. **Conta de teste no Mercado Pago: A.** O Back cria a conta de desenvolvedor gratuita e as credenciais de teste; chaves só no `.env` da API, com os nomes sem valor no `.env.example`.

As 6 respostas acima são do Diego. As escolhas abaixo, tomadas sem consulta, ficam valendo e continuam vetáveis por ele.

## Decisões tomadas sem consulta

Recomendações aplicadas pelo Spec em 13/11; qualquer uma pode ser vetada.

- **Vale a hora da aprovação no gateway** e a expiração consulta o gateway antes de cancelar. Refina a resposta 5: só o pagamento aprovado depois da validade segue "Cancelado" com reembolso manual.
- **Troca de forma de pagamento cancela a cobrança anterior;** pagamento a mais para pedido pago vira "Pagamento em duplicidade" com reembolso manual; pagamento de outro pedido ou com valor diferente vira "Pagamento divergente".
- **Vencido a partir de 30:00.**
- **Mínimo ao gateway** (valor, descrição, e-mail, nome e CPF só se exigido) e o texto novo da Política, sem novo aceite.
- **Token do cartão só em memória.**
- **Consulta a cada 5 s e no "Já paguei"** no lugar do tempo real.
- **"Simular pagamento" e relógio adiantado só no modo de testes**, recusados pelo servidor fora dele.
- **Recusa mantém o pedido aguardando**, com troca de forma de pagamento dentro da validade.
- **Validade de 30 minutos também para o cartão** (a do pedido, LB-56).
- **Contagem pelo vencimento dado pela API.**
- **Textos novos:** "Copiar código", "Código copiado", "Já paguei", "Pix expirado", "O tempo para pagamento se esgotou.", "Refazer pedido", "Pedido cancelado", "Simular pagamento", "Não foi possível processar o pagamento agora. Tente de novo em instantes." e "Pagamento recebido após o cancelamento".

## Tickets propostos

Reconciliação das issues #30, #33, #34, #35 e #36, a pedir ao Orchestrator depois do merge desta spec (aprovação permanente para reconciliar issue com spec mergeada): link para esta spec e o recorte de cada card (no #33, consulta em vez de WebSocket e "Refazer pedido"; no #35, sem fila nem WhatsApp; no #36, cron diário em vez de a cada minuto). Nenhuma issue nova.
