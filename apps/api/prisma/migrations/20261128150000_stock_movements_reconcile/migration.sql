-- Reconcilia o histórico do estoque: a abertura de cada cerveja é o estoque atual menos o que os
-- movimentos já somam, para a soma dos movimentos bater com o físico (cobre quem já tinha movimentos
-- parciais). Só entra quando a diferença é positiva; rodar de novo não faz nada (a diferença passa a zero).
INSERT INTO "stock_movements" ("id", "beer_id", "type", "quantity", "reason", "balance_after", "created_at")
SELECT gen_random_uuid(), b."id", 'ENTRY', b."stock" - COALESCE(s."total", 0), 'Saldo inicial', b."stock" - COALESCE(s."total", 0),
  COALESCE(s."first_at", CURRENT_TIMESTAMP) - INTERVAL '1 millisecond'
FROM "beers" b
LEFT JOIN (
  SELECT "beer_id", SUM("quantity") AS "total", MIN("created_at") AS "first_at"
  FROM "stock_movements" GROUP BY "beer_id"
) s ON s."beer_id" = b."id"
WHERE b."stock" - COALESCE(s."total", 0) > 0;
