-- Estoque mínimo por cerveja (selo "Baixo" do admin); padrão 6.
ALTER TABLE "beers" ADD COLUMN "min_stock" INTEGER NOT NULL DEFAULT 6;
