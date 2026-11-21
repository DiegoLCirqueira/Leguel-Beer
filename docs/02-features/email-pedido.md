---
status: rascunho
modulo: pedidos
card-notion: https://app.notion.com/p/3fd490a7ac7d810c89bce27827e3afa7
prioridade: P0
criado: 2026-11-17
issues:
  - "#103 LB-81"
tags:
  - feature
---

# E-mail de confirmação do pedido

> [!info] Origem
> Card do Notion **LB-81** (#103, e-mails transacionais do pedido), no escopo reduzido do [[mvp-corte]]: só o e-mail de confirmação do pedido, enviado de forma síncrona pela API de um provedor com plano gratuito ([[ADR-002-hospedagem-api]]: sem fila). Complementa [[pedidos-cliente]] (ponto em aberto "E-mail de confirmação") e o "Confirmar pagamento" do [[admin]] e de [[pagamento]]. Termos como no [[GLOSSARY]].

> [!warning] **Pendente de confirmação do Diego** (custos e contas, item 4): o **provedor de e-mail** e a criação da conta nele. Até a resposta, esta spec fica em rascunho e a API só tem a porta de envio, com um envio falso nos testes e no desenvolvimento. Nenhuma conta, chave ou domínio é criado antes do ok (cartão "Decisões pendentes").

## História de usuário

- **Como** cliente que fez um pedido
- **Quero** receber um e-mail quando o pedido for confirmado
- **Para** ter o comprovante com o número e os valores, mesmo fora do site

## Cenários

```gherkin
# language: pt
Funcionalidade: E-mail de confirmação do pedido

  Cenário: E-mail ao confirmar o pagamento
    Dado o pedido "#LB482731" "Aguardando pagamento" da cliente "ana@exemplo.com", com 3 Maré Alta e 2 Cupuaçu Ale, frete de R$ 13,00 e total de R$ 162,00
    Quando o admin confirma o pagamento e o pedido fica "Pago"
    Então a API envia um e-mail a "ana@exemplo.com" com o assunto "Pedido #LB482731 confirmado"
    E o corpo traz o número, a data, os itens com quantidade e preço, o subtotal R$ 149,00, o frete R$ 13,00, o total R$ 162,00 e o endereço de entrega
    E o corpo tem um link para "Meus pedidos"

  Cenário: O provedor falha
    Dado um pedido "Aguardando pagamento"
    E o provedor de e-mail fora do ar ou lento
    Quando o admin confirma o pagamento
    Então o pedido fica "Pago" e a baixa do estoque vale
    E o admin vê "Pedido confirmado. Não foi possível enviar o e-mail ao cliente."
    E o cliente vê a tela de pedido confirmado normalmente

  Cenário: Um e-mail por pedido
    Dado um pedido que já ficou "Pago" e já teve o e-mail enviado
    Quando o admin toca de novo em "Confirmar pagamento" ou a mesma requisição é repetida
    Então a API responde 409 como na regra de concorrência do admin e nenhum segundo e-mail sai

  Cenário: Pedido que não vira "Pago"
    Dado um pedido "Aguardando pagamento"
    Quando o pedido expira ou o admin o cancela
    Então nenhum e-mail de confirmação é enviado

  Cenário: O e-mail não vaza dados
    Dado um pedido pago
    Quando o e-mail é montado
    Então o corpo não traz telefone, data de nascimento, id do cliente nem link com sessão, e o destinatário é só o e-mail da conta do pedido
```

## Regras de negócio

- **Quando sai:** uma vez, quando o pedido passa a "Pago" pela ação "Confirmar pagamento" do admin ([[pagamento]], [[admin]]) (recomendação do Spec, vetável: o e-mail acompanha a tela "Pedido confirmado!"). Não sai na criação do pedido, nem na expiração, nem no cancelamento. Mudanças de status seguintes (Em preparo, Saiu para entrega, Entregue) não enviam e-mail no MVP.
- **Síncrono e fora da transação:** a API chama o provedor depois de gravar o pedido como "Pago" e **fora** da transação do banco ([[ADR-002-hospedagem-api]]). Tempo máximo de 5 s para o provedor responder; passado isso, conta como falha.
- **Falha não desfaz nada:** erro ou tempo esgotado do provedor não muda o pedido nem a baixa de estoque. A API registra no log o id do pedido e o código do erro (nunca o e-mail do cliente, o endereço nem o corpo) e responde o sucesso do "Confirmar pagamento" com o aviso de que o e-mail não saiu. Sem fila e sem nova tentativa automática no MVP (recomendação vetável); o admin pode avisar o cliente por fora.
- **Um por pedido:** o pedido guarda se o e-mail foi enviado. O "Pago" acontece uma vez só (409 nas repetições, [[admin]], "Concorrência"), então não há segundo envio; se o primeiro falhou, não há reenvio automático.
- **Conteúdo:** assunto "Pedido #LB… confirmado"; saudação com o primeiro nome da conta (ou "Olá,", sem nome); número, data e hora, itens (nome, quantidade, preço da cópia guardada no pedido), subtotal, frete, total, forma de pagamento e parcelas, endereço de entrega (a cópia guardada no pedido); link para "Meus pedidos" (`SITE_URL`); rodapé com o aviso de que o Leguelé Beer é um projeto sem fins lucrativos, feito para portfólio, e que nada é cobrado nem entregue. Texto simples e HTML mínimo, sem imagem rastreadora nem link de rastreio.
- **Destinatário:** só o e-mail da conta dona do pedido (confirmado no cadastro). Nada de cópia oculta nem de outro endereço.
- **Privacidade:** os dados que saem para o provedor são só os do corpo acima. A Política de Privacidade ([[termos-privacidade]]) ganha, em "Com quem compartilhamos", o provedor de e-mail, com o texto que o Diego aprovar junto com a escolha do provedor (LGPD, item 7).
- **Segredos:** a chave do provedor só na API, em `apps/api/.env` (nome em `.env.example`, sem valor), nunca no site nem em `NEXT_PUBLIC_*`. Criar a chave é do Diego (item 6).
- **Tela 08:** o texto do topo ("Pagamento aprovado! Seu pedido já está com a gente. Acompanhe o status em Meus pedidos.") não promete e-mail, porque o envio pode falhar ([[pedidos-cliente]], pergunta 3).

## Fora de escopo

- E-mails de status (Em preparo, Saiu para entrega, Entregue), de expiração, de carrinho abandonado e de marketing.
- Relatório mensal, WhatsApp e notificação ao admin (LB-82 a LB-84, fora do corte).
- Fila, nova tentativa automática, reenvio pelo admin e painel de e-mails enviados.
- Os e-mails de cadastro e de senha, que são do Supabase Auth ([[cadastro-login]], [[recuperacao-senha]]).

## Seams de teste

> [!info] Proposta do Spec, vetável

- **Porta de envio** (API, unitário): o caso de uso de confirmar pagamento recebe uma porta `OrderEmailSender` com uma implementação falsa em memória; a implementação do provedor entra só depois da escolha do Diego.
- **Cenários 1 a 4** (caso de uso com repositório em memória e envio falso): e-mail com os dados certos; provedor que lança erro ou passa de 5 s deixa o pedido "Pago" e devolve o aviso; "Confirmar pagamento" repetido não envia segundo e-mail; expirar e cancelar não enviam.
- **Corpo do e-mail** (unitário): contém só os campos da regra; um teste procura telefone, data de nascimento e id do cliente e falha se aparecerem.
- **Logs** (unitário): o log da falha não traz e-mail, endereço nem corpo.
- **Integração** (banco real): a marca "e-mail enviado" é gravada na mesma operação que o "Pago" e não duplica na corrida entre dois "Confirmar pagamento".
- **E2E:** fora de escopo até existir o provedor; em desenvolvimento, o envio falso ou um Mailpit local se o Back preferir ([[qualidade-compra]] usa o Mailpit do Supabase local para os e-mails do cadastro).

## Fatias, com dono e ordem

| # | Card | Dono | O que entrega |
| --- | --- | --- | --- |
| 1 | LB-81 (#103) | Back | Porta `OrderEmailSender`, montagem do e-mail, marca de envio no pedido, aviso na resposta de "Confirmar pagamento" (junto do LB-76) |
| 2 | LB-81 (#103) | Front | Aviso "Não foi possível enviar o e-mail ao cliente." no detalhe do pedido do admin |
| 3 | LB-81 (#103) | Back e Devops | Implementação do provedor e a chave no `.env`, **só depois do ok do Diego** (itens 4 e 6) |

Candidatos a ADR: nenhum até a escolha do provedor (se ele surpreender quem lê o código, o Back escreve o ADR no PR da fatia 3).

## Decisões relacionadas

- [[pedidos-cliente]], [[pagamento]], [[admin]], [[termos-privacidade]], [[mvp-corte]], [[ADR-002-hospedagem-api]], [[ADR-020-aviso-de-portfolio-no-pagamento]]

## Decisões tomadas sem consulta

Recomendações aplicadas pelo Spec em 17/11; qualquer uma pode ser vetada.

- **E-mail ao confirmar o pagamento** (pedido "Pago"), não na criação do pedido.
- **Sem nova tentativa nem reenvio** no MVP; falha só vira aviso ao admin e log.
- **Tempo máximo de 5 s** para o provedor.
- **Rodapé com o aviso de projeto sem fins lucrativos**, no mesmo espírito das telas de pagamento (16/11).
- **Texto novo:** "Pedido #LB… confirmado", "Pedido confirmado. Não foi possível enviar o e-mail ao cliente."

## Tickets propostos

Reconciliação da issue #103 depois do merge desta spec (aprovação permanente): link para esta spec, os 5 cenários e o recorte (só o e-mail de confirmação ao ficar "Pago"; provedor pendente do Diego). Nenhuma issue nova.
