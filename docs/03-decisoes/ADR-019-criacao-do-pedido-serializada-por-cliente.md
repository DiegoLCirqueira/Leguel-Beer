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

- A transação segura uma conexão por alguns milissegundos, e o que roda dentro dela abre outras: a Geladeira revalidada grava os ajustes em transação própria (de propósito, para sobreviver ao rollback de `TOTAL_CHANGED` e `OUT_OF_STOCK`) e a cotação do frete pode recalcular a rota (chamada externa, rara: só quando a origem mudou) e gravar a distância em outra transação. Duas conexões por criação, com o pool padrão do `pg` (10), esgotariam o pool com 10 criações juntas, cada uma esperando a segunda conexão. Por isso `PrismaOrderCreation` deixa no máximo 4 criações simultâneas por instância (8 conexões no pior caso); as demais esperam a vaga em fila.
- A chave de idempotência vencida (24 h) é apagada na mesma transação que grava o pedido novo, porque a restrição única (cliente, chave) continua valendo depois do vencimento.
- O número "#LB" sorteado que colida derruba a transação, que é refeita até 3 vezes.
- O `ORDER BY id` da trava das cervejas é defesa em profundidade: o caso de uso já passa os ids ordenados e a trava é um único comando, então remover o `ORDER BY` não muda o resultado nos testes (mutante equivalente).
