-- O histórico do estoque começa com o saldo atual: cada cerveja que tem estoque e ainda não tem
-- movimento ganha um "Saldo inicial", para o saldo bater com a soma dos movimentos.
INSERT INTO "stock_movements" ("id", "beer_id", "type", "quantity", "reason", "balance_after")
SELECT gen_random_uuid(), b."id", 'ENTRY', b."stock", 'Saldo inicial', b."stock"
FROM "beers" b
WHERE b."stock" > 0
  AND NOT EXISTS (SELECT 1 FROM "stock_movements" m WHERE m."beer_id" = b."id");
