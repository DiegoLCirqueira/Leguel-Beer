-- AlterTable
ALTER TABLE "order_status_history" ADD COLUMN     "actor_id" UUID;

-- CreateIndex
CREATE INDEX "order_status_history_actor_id_idx" ON "order_status_history"("actor_id");

-- AddForeignKey
ALTER TABLE "order_status_history" ADD CONSTRAINT "order_status_history_actor_id_fkey" FOREIGN KEY ("actor_id") REFERENCES "profiles"("id") ON DELETE SET NULL ON UPDATE CASCADE;
