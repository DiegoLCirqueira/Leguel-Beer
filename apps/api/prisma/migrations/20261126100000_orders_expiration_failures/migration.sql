-- Falhas do cron ao expirar o pedido: quem falha repetido vai para o fim da varredura e não ocupa o lote.
ALTER TABLE "orders" ADD COLUMN "expiration_failures" INTEGER NOT NULL DEFAULT 0;
