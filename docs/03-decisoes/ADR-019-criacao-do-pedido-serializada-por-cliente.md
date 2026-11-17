---
status: proposto
data: 2026-11-16
tags:
  - adr
---

# ADR-019 Criação do pedido serializada por cliente

> [!info] Status
> Proposto pelo Back no PR da criação do pedido; o Orchestrator leva ao aceite.

## Contexto

Criar pedido ([[checkout]], LB-56) precisa de três garantias ao mesmo tempo: no máximo um pedido "Aguardando pagamento" por cliente (mesmo com duas abas e chaves de idempotência diferentes), nenhuma venda além do estoque disponível e a mesma chave repetindo a mesma resposta. A API é serverless ([[ADR-002-hospedagem-api]]): sem fila, Redis nem processo longo.

## Decisão

Uma transação do Postgres por criação, que começa com `pg_advisory_xact_lock(hashtextextended(<id do cliente>, 0))`. Dentro dela: conferir a chave, o pedido pendente e a Geladeira; depois `SELECT ... FOR UPDATE` nas cervejas **em ordem de id**, soma das reservas válidas e gravação do pedido, das reservas, das baixas pendentes e da chave (com o hash do corpo e a resposta) na mesma transação.

## Por quê

- A trava consultiva por cliente serializa só as criações do mesmo cliente, e vale desde antes da primeira leitura: a conferência do pendente e a criação nunca se cruzam, e duas requisições com a mesma chave não recebem `PENDING_ORDER` uma da outra.
- A trava das linhas das cervejas em ordem fixa evita deadlock entre clientes que pedem as mesmas cervejas em ordens diferentes, e o disponível é lido já travado, sem corrida.
- Tudo no banco: não depende de memória de instância (que numa API serverless não é compartilhada).

## Alternativas consideradas

- **Restrição única parcial** (um pedido pendente por cliente): não cobre a validade de 30 minutos (pedido vencido ainda ocupa a linha até o cron) e dá erro de banco em vez de a resposta repetida.
- **UPDATE condicional do estoque** (`stock - reserved >= n`): as reservas são linhas à parte, então a condição não cabe num UPDATE só.

## Consequências

- A transação segura conexões por alguns milissegundos e chama, dentro dela, o recálculo de rota (raro, só quando a origem mudou) e a leitura da Geladeira. O recálculo de rota é a única chamada externa possível dentro da transação.
- O número "#LB" sorteado que colida derruba a transação, que é refeita até 3 vezes.
