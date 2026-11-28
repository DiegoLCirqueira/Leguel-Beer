-- Movimentos do estoque físico (histórico do admin): entrada, perda, correção, venda e cancelamento.
CREATE TYPE "StockMovementType" AS ENUM ('ENTRY', 'LOSS', 'CORRECTION', 'SALE', 'CANCELLATION');

CREATE TABLE "stock_movements" (
    "id" UUID NOT NULL,
    "beer_id" UUID NOT NULL,
    "type" "StockMovementType" NOT NULL,
    "quantity" INTEGER NOT NULL,
    "reason" TEXT,
    "balance_after" INTEGER NOT NULL,
    "order_id" UUID,
    "actor_id" UUID,
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "stock_movements_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "stock_movements_quantity_not_zero" CHECK ("quantity" <> 0),
    CONSTRAINT "stock_movements_balance_not_negative" CHECK ("balance_after" >= 0)
);

CREATE INDEX "stock_movements_beer_id_created_at_idx" ON "stock_movements"("beer_id", "created_at" DESC);
CREATE INDEX "stock_movements_order_id_idx" ON "stock_movements"("order_id");
CREATE INDEX "stock_movements_actor_id_idx" ON "stock_movements"("actor_id");

ALTER TABLE "stock_movements" ADD CONSTRAINT "stock_movements_beer_id_fkey" FOREIGN KEY ("beer_id") REFERENCES "beers"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "stock_movements" ADD CONSTRAINT "stock_movements_order_id_fkey" FOREIGN KEY ("order_id") REFERENCES "orders"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "stock_movements" ADD CONSTRAINT "stock_movements_actor_id_fkey" FOREIGN KEY ("actor_id") REFERENCES "profiles"("id") ON DELETE SET NULL ON UPDATE CASCADE;
