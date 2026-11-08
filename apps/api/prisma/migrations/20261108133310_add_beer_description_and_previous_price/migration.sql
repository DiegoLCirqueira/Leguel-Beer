-- AlterTable
ALTER TABLE "beers" ADD COLUMN     "description" TEXT,
ADD COLUMN     "previous_price_cents" INTEGER;

-- Regras do contrato do detalhe que o Prisma não modela: preço anterior não negativo, descrição nunca
-- vazia (sem descrição é NULL) e o slug "destaques" reservado para a rota GET /catalogo/destaques.
ALTER TABLE "beers" ADD CONSTRAINT "beers_previous_price_cents_non_negative" CHECK ("previous_price_cents" >= 0);
ALTER TABLE "beers" ADD CONSTRAINT "beers_description_not_empty" CHECK ("description" IS NULL OR length("description") > 0);
ALTER TABLE "beers" ADD CONSTRAINT "beers_slug_not_reserved" CHECK ("slug" <> 'destaques');
