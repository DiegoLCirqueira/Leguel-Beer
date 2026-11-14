-- CreateTable
CREATE TABLE "delivery_settings" (
    "id" INTEGER NOT NULL DEFAULT 1,
    "origin_latitude" DOUBLE PRECISION NOT NULL,
    "origin_longitude" DOUBLE PRECISION NOT NULL,
    "base_fee_cents" INTEGER NOT NULL,
    "per_km_fee_cents" INTEGER NOT NULL,
    "max_radius_meters" INTEGER NOT NULL,
    "free_shipping_minimum_cents" INTEGER NOT NULL,
    "updated_at" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "delivery_settings_pkey" PRIMARY KEY ("id")
);

-- Uma linha só: a chave é sempre 1.
ALTER TABLE "delivery_settings" ADD CONSTRAINT "delivery_settings_single_row_check" CHECK ("id" = 1);
