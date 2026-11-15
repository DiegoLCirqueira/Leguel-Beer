-- CreateEnum
CREATE TYPE "OrderStatus" AS ENUM ('AWAITING_PAYMENT', 'PAID', 'PREPARING', 'OUT_FOR_DELIVERY', 'DELIVERED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "PaymentMethod" AS ENUM ('PIX', 'CARD');

-- CreateTable
CREATE TABLE "orders" (
    "id" UUID NOT NULL,
    "number" TEXT NOT NULL,
    "profile_id" UUID NOT NULL,
    "status" "OrderStatus" NOT NULL DEFAULT 'AWAITING_PAYMENT',
    "payment_method" "PaymentMethod" NOT NULL,
    "installments" INTEGER,
    "card_brand" TEXT,
    "subtotal_cents" INTEGER NOT NULL,
    "shipping_cents" INTEGER NOT NULL,
    "total_cents" INTEGER NOT NULL,
    "expires_at" TIMESTAMPTZ(3) NOT NULL,
    "cancel_reason" TEXT,
    "customer_name" TEXT NOT NULL,
    "customer_phone" TEXT NOT NULL,
    "ship_zip" TEXT NOT NULL,
    "ship_street" TEXT NOT NULL,
    "ship_number" TEXT NOT NULL,
    "ship_complement" TEXT,
    "ship_district" TEXT NOT NULL,
    "ship_city" TEXT NOT NULL,
    "ship_state" TEXT NOT NULL,
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "orders_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "order_items" (
    "id" UUID NOT NULL,
    "order_id" UUID NOT NULL,
    "beer_id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "unit_price_cents" INTEGER NOT NULL,
    "quantity" INTEGER NOT NULL,

    CONSTRAINT "order_items_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "order_status_history" (
    "id" UUID NOT NULL,
    "order_id" UUID NOT NULL,
    "from_status" "OrderStatus",
    "to_status" "OrderStatus" NOT NULL,
    "reason" TEXT,
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "order_status_history_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "orders_number_key" ON "orders"("number");

-- CreateIndex
CREATE INDEX "orders_profile_id_created_at_idx" ON "orders"("profile_id", "created_at" DESC);

-- CreateIndex
CREATE INDEX "orders_status_expires_at_idx" ON "orders"("status", "expires_at");

-- CreateIndex
CREATE INDEX "order_items_beer_id_idx" ON "order_items"("beer_id");

-- CreateIndex
CREATE UNIQUE INDEX "order_items_order_id_beer_id_key" ON "order_items"("order_id", "beer_id");

-- CreateIndex
CREATE INDEX "order_status_history_order_id_created_at_idx" ON "order_status_history"("order_id", "created_at");

-- AddForeignKey
ALTER TABLE "orders" ADD CONSTRAINT "orders_profile_id_fkey" FOREIGN KEY ("profile_id") REFERENCES "profiles"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "order_items" ADD CONSTRAINT "order_items_order_id_fkey" FOREIGN KEY ("order_id") REFERENCES "orders"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "order_items" ADD CONSTRAINT "order_items_beer_id_fkey" FOREIGN KEY ("beer_id") REFERENCES "beers"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "order_status_history" ADD CONSTRAINT "order_status_history_order_id_fkey" FOREIGN KEY ("order_id") REFERENCES "orders"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Regras que o Prisma não declara: dinheiro em centavos sem negativos, total = subtotal + frete,
-- parcelas e bandeira só no cartão, quantidade de item maior que zero.
ALTER TABLE "orders" ADD CONSTRAINT "orders_amounts_check" CHECK (
    "subtotal_cents" >= 0 AND "shipping_cents" >= 0
    AND "total_cents" = "subtotal_cents" + "shipping_cents"
);

ALTER TABLE "orders" ADD CONSTRAINT "orders_payment_method_check" CHECK (
    ("payment_method" = 'PIX' AND "installments" IS NULL AND "card_brand" IS NULL)
    OR ("payment_method" = 'CARD' AND "installments" BETWEEN 1 AND 12 AND "card_brand" IS NOT NULL)
);

ALTER TABLE "order_items" ADD CONSTRAINT "order_items_values_check" CHECK (
    "quantity" > 0 AND "unit_price_cents" >= 0
);
