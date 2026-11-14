-- Um endereço padrão por cliente: o índice único vale só para as linhas padrão.
CREATE UNIQUE INDEX "addresses_one_default_per_profile" ON "addresses" ("profile_id") WHERE "is_default";

-- Só Alagoas, distância sem negativos e coordenadas nas faixas válidas.
ALTER TABLE "addresses" ADD CONSTRAINT "addresses_state_check" CHECK ("state" = 'AL');

ALTER TABLE "addresses" ADD CONSTRAINT "addresses_distance_check" CHECK (
    "distance_meters" IS NULL OR "distance_meters" >= 0
);

ALTER TABLE "addresses" ADD CONSTRAINT "addresses_coordinates_check" CHECK (
    "latitude" BETWEEN -90 AND 90 AND "longitude" BETWEEN -180 AND 180
    AND "route_origin_latitude" BETWEEN -90 AND 90 AND "route_origin_longitude" BETWEEN -180 AND 180
);
