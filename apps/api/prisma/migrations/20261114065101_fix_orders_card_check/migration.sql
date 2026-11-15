-- O CHECK anterior aceitava cartão sem parcelas: `NULL BETWEEN 1 AND 12` dá NULL, e o CHECK deixa passar NULL.
-- Aqui as parcelas passam a ser exigidas de forma explícita no cartão.
ALTER TABLE "orders" DROP CONSTRAINT "orders_payment_method_check";

ALTER TABLE "orders" ADD CONSTRAINT "orders_payment_method_check" CHECK (
    ("payment_method" = 'PIX' AND "installments" IS NULL AND "card_brand" IS NULL)
    OR (
        "payment_method" = 'CARD'
        AND "installments" IS NOT NULL AND "installments" BETWEEN 1 AND 12
        AND "card_brand" IS NOT NULL
    )
);
