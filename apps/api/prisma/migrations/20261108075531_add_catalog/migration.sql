-- CreateTable
CREATE TABLE "categories" (
    "id" UUID NOT NULL,
    "slug" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "order" INTEGER NOT NULL,

    CONSTRAINT "categories_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "beers" (
    "id" UUID NOT NULL,
    "slug" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "style" TEXT NOT NULL,
    "category_id" UUID NOT NULL,
    "abv" DECIMAL(3,1) NOT NULL,
    "ibu" INTEGER NOT NULL,
    "volume_ml" INTEGER NOT NULL,
    "price_cents" INTEGER NOT NULL,
    "featured" BOOLEAN NOT NULL DEFAULT false,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "stock" INTEGER NOT NULL DEFAULT 0,
    "image_url" TEXT,
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "beers_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "categories_slug_key" ON "categories"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "beers_slug_key" ON "beers"("slug");

-- CreateIndex
CREATE INDEX "beers_category_id_idx" ON "beers"("category_id");

-- CreateIndex
CREATE INDEX "beers_active_featured_idx" ON "beers"("active", "featured");

-- AddForeignKey
ALTER TABLE "beers" ADD CONSTRAINT "beers_category_id_fkey" FOREIGN KEY ("category_id") REFERENCES "categories"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- Regras do contrato do catálogo que o Prisma não modela: valores nunca negativos (preço e estoque
-- em inteiros; a baixa atômica de estoque conta com o CHECK como rede de segurança).
ALTER TABLE "beers" ADD CONSTRAINT "beers_price_cents_non_negative" CHECK ("price_cents" >= 0);
ALTER TABLE "beers" ADD CONSTRAINT "beers_stock_non_negative" CHECK ("stock" >= 0);
ALTER TABLE "beers" ADD CONSTRAINT "beers_abv_non_negative" CHECK ("abv" >= 0);
ALTER TABLE "beers" ADD CONSTRAINT "beers_ibu_non_negative" CHECK ("ibu" >= 0);
ALTER TABLE "beers" ADD CONSTRAINT "beers_volume_ml_positive" CHECK ("volume_ml" > 0);
