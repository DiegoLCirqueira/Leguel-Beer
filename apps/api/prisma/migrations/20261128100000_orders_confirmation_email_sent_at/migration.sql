-- Marca do e-mail de confirmação do pedido: gravada só depois do sucesso do provedor, numa escrita separada do "Pago".
ALTER TABLE "orders" ADD COLUMN "confirmation_email_sent_at" TIMESTAMPTZ(3);
