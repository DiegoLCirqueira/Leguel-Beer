-- Dinheiro e distância não podem ser negativos; as coordenadas ficam nas faixas válidas.
ALTER TABLE "delivery_settings" ADD CONSTRAINT "delivery_settings_amounts_check" CHECK (
    "base_fee_cents" >= 0
    AND "per_km_fee_cents" >= 0
    AND "max_radius_meters" >= 0
    AND "free_shipping_minimum_cents" >= 0
);

ALTER TABLE "delivery_settings" ADD CONSTRAINT "delivery_settings_origin_check" CHECK (
    "origin_latitude" BETWEEN -90 AND 90
    AND "origin_longitude" BETWEEN -180 AND 180
);
