-- CreateTable
CREATE TABLE "fridges" (
    "id" UUID NOT NULL,
    "profile_id" UUID NOT NULL,
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "fridges_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "fridge_items" (
    "id" UUID NOT NULL,
    "fridge_id" UUID NOT NULL,
    "beer_id" UUID NOT NULL,
    "quantity" INTEGER NOT NULL,
    "seen_price_cents" INTEGER NOT NULL,
    "position" INTEGER NOT NULL,
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "fridge_items_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "fridges_profile_id_key" ON "fridges"("profile_id");

-- CreateIndex
CREATE INDEX "fridge_items_beer_id_idx" ON "fridge_items"("beer_id");

-- CreateIndex
CREATE UNIQUE INDEX "fridge_items_fridge_id_beer_id_key" ON "fridge_items"("fridge_id", "beer_id");

-- CreateIndex
CREATE UNIQUE INDEX "fridge_items_fridge_id_position_key" ON "fridge_items"("fridge_id", "position");

-- AddForeignKey
ALTER TABLE "fridges" ADD CONSTRAINT "fridges_profile_id_fkey" FOREIGN KEY ("profile_id") REFERENCES "profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "fridge_items" ADD CONSTRAINT "fridge_items_fridge_id_fkey" FOREIGN KEY ("fridge_id") REFERENCES "fridges"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "fridge_items" ADD CONSTRAINT "fridge_items_beer_id_fkey" FOREIGN KEY ("beer_id") REFERENCES "beers"("id") ON DELETE RESTRICT ON UPDATE CASCADE;


-- Regras que o Prisma não modela: quantidade sempre positiva (tirar a cerveja é apagar o item) e
-- preço visto em centavos nunca negativo.
ALTER TABLE "fridge_items" ADD CONSTRAINT "fridge_items_quantity_positive" CHECK ("quantity" > 0);
ALTER TABLE "fridge_items" ADD CONSTRAINT "fridge_items_seen_price_non_negative" CHECK ("seen_price_cents" >= 0);
