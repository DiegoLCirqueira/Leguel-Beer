-- O pagamento é simulado (ADR-018): o pedido guarda só o tipo e as parcelas, sem bandeira.
-- O CHECK deixa de exigir `card_brand` no cartão; a coluna continua (nula) e o Pix segue sem ela.
ALTER TABLE "orders" DROP CONSTRAINT "orders_payment_method_check";

ALTER TABLE "orders" ADD CONSTRAINT "orders_payment_method_check" CHECK (
    ("payment_method" = 'PIX' AND "installments" IS NULL AND "card_brand" IS NULL)
    OR (
        "payment_method" = 'CARD'
        AND "installments" IS NOT NULL AND "installments" BETWEEN 1 AND 12
    )
);
