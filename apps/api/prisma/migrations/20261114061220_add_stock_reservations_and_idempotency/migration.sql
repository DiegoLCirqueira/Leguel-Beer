-- CreateTable
CREATE TABLE "stock_reservations" (
    "id" UUID NOT NULL,
    "order_id" UUID NOT NULL,
    "beer_id" UUID NOT NULL,
    "quantity" INTEGER NOT NULL,
    "expires_at" TIMESTAMPTZ(3) NOT NULL,
    "released_at" TIMESTAMPTZ(3),
    "consumed_at" TIMESTAMPTZ(3),
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "stock_reservations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "fridge_pending_deductions" (
    "id" UUID NOT NULL,
    "order_id" UUID NOT NULL,
    "beer_id" UUID NOT NULL,
    "quantity" INTEGER NOT NULL,

    CONSTRAINT "fridge_pending_deductions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "idempotency_keys" (
    "id" UUID NOT NULL,
    "profile_id" UUID NOT NULL,
    "key" TEXT NOT NULL,
    "request_hash" TEXT NOT NULL,
    "response_status" INTEGER NOT NULL,
    "response_body" JSONB NOT NULL,
    "order_id" UUID NOT NULL,
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expires_at" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "idempotency_keys_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "stock_reservations_beer_id_expires_at_idx" ON "stock_reservations"("beer_id", "expires_at");

-- CreateIndex
CREATE UNIQUE INDEX "stock_reservations_order_id_beer_id_key" ON "stock_reservations"("order_id", "beer_id");

-- CreateIndex
CREATE INDEX "fridge_pending_deductions_beer_id_idx" ON "fridge_pending_deductions"("beer_id");

-- CreateIndex
CREATE UNIQUE INDEX "fridge_pending_deductions_order_id_beer_id_key" ON "fridge_pending_deductions"("order_id", "beer_id");

-- CreateIndex
CREATE UNIQUE INDEX "idempotency_keys_order_id_key" ON "idempotency_keys"("order_id");

-- CreateIndex
CREATE INDEX "idempotency_keys_expires_at_idx" ON "idempotency_keys"("expires_at");

-- CreateIndex
CREATE UNIQUE INDEX "idempotency_keys_profile_id_key_key" ON "idempotency_keys"("profile_id", "key");

-- AddForeignKey
ALTER TABLE "stock_reservations" ADD CONSTRAINT "stock_reservations_order_id_fkey" FOREIGN KEY ("order_id") REFERENCES "orders"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "stock_reservations" ADD CONSTRAINT "stock_reservations_beer_id_fkey" FOREIGN KEY ("beer_id") REFERENCES "beers"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "fridge_pending_deductions" ADD CONSTRAINT "fridge_pending_deductions_order_id_fkey" FOREIGN KEY ("order_id") REFERENCES "orders"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "fridge_pending_deductions" ADD CONSTRAINT "fridge_pending_deductions_beer_id_fkey" FOREIGN KEY ("beer_id") REFERENCES "beers"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "idempotency_keys" ADD CONSTRAINT "idempotency_keys_profile_id_fkey" FOREIGN KEY ("profile_id") REFERENCES "profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "idempotency_keys" ADD CONSTRAINT "idempotency_keys_order_id_fkey" FOREIGN KEY ("order_id") REFERENCES "orders"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Regras que o Prisma não declara: quantidades maiores que zero e reserva ou liberada ou consumida, nunca as duas.
ALTER TABLE "stock_reservations" ADD CONSTRAINT "stock_reservations_values_check" CHECK (
    "quantity" > 0 AND NOT ("released_at" IS NOT NULL AND "consumed_at" IS NOT NULL)
);

ALTER TABLE "fridge_pending_deductions" ADD CONSTRAINT "fridge_pending_deductions_quantity_check" CHECK ("quantity" > 0);
