-- CreateEnum
CREATE TYPE "PaymentStatus" AS ENUM ('PENDING', 'APPROVED', 'REFUSED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "PaymentMarkKind" AS ENUM ('AFTER_CANCELLATION', 'DUPLICATE', 'DIVERGENT');

-- CreateTable
CREATE TABLE "payments" (
    "id" UUID NOT NULL,
    "order_id" UUID NOT NULL,
    "gateway_payment_id" TEXT NOT NULL,
    "method" "PaymentMethod" NOT NULL,
    "status" "PaymentStatus" NOT NULL DEFAULT 'PENDING',
    "approved_at" TIMESTAMPTZ(3),
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "payments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "payment_events" (
    "id" UUID NOT NULL,
    "gateway_event_id" TEXT NOT NULL,
    "gateway_payment_id" TEXT NOT NULL,
    "order_id" UUID,
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "payment_events_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "payment_marks" (
    "id" UUID NOT NULL,
    "order_id" UUID NOT NULL,
    "gateway_payment_id" TEXT NOT NULL,
    "kind" "PaymentMarkKind" NOT NULL,
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "payment_marks_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "payments_gateway_payment_id_key" ON "payments"("gateway_payment_id");

-- CreateIndex
CREATE INDEX "payments_order_id_idx" ON "payments"("order_id");

-- CreateIndex
CREATE UNIQUE INDEX "payment_events_gateway_event_id_key" ON "payment_events"("gateway_event_id");

-- CreateIndex
CREATE INDEX "payment_events_order_id_idx" ON "payment_events"("order_id");

-- CreateIndex
CREATE INDEX "payment_events_gateway_payment_id_idx" ON "payment_events"("gateway_payment_id");

-- CreateIndex
CREATE INDEX "payment_marks_order_id_idx" ON "payment_marks"("order_id");

-- CreateIndex
CREATE UNIQUE INDEX "payment_marks_gateway_payment_id_kind_key" ON "payment_marks"("gateway_payment_id", "kind");

-- AddForeignKey
ALTER TABLE "payments" ADD CONSTRAINT "payments_order_id_fkey" FOREIGN KEY ("order_id") REFERENCES "orders"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payment_events" ADD CONSTRAINT "payment_events_order_id_fkey" FOREIGN KEY ("order_id") REFERENCES "orders"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payment_marks" ADD CONSTRAINT "payment_marks_order_id_fkey" FOREIGN KEY ("order_id") REFERENCES "orders"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Regra que o Prisma não declara: só o pagamento aprovado tem a hora da aprovação.
ALTER TABLE "payments" ADD CONSTRAINT "payments_approved_at_check" CHECK (
    ("status" = 'APPROVED') = ("approved_at" IS NOT NULL)
);
