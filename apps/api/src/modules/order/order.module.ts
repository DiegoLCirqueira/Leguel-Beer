import { randomInt, randomUUID } from "node:crypto";
import { Module } from "@nestjs/common";
import { AppLogger } from "../../common/logging/app-logger.js";
import { PrismaService } from "../../common/prisma/prisma.service.js";
import { AccountModule } from "../account/account.module.js";
import { PROFILE_REPOSITORY } from "../account/account.tokens.js";
import type { ProfileRepository } from "../account/domain/profile-repository.js";
import { QuoteShipping } from "../delivery/application/quote-shipping.js";
import { DeliveryModule } from "../delivery/delivery.module.js";
import { GetAccountFridge } from "../fridge/application/get-account-fridge.js";
import { FridgeModule } from "../fridge/fridge.module.js";
import { CRON_SECRET } from "./order.tokens.js";
import { ExpireDueOrders } from "./application/expire-due-orders.js";
import { ExpireOrder } from "./application/expire-order.js";
import { ConfirmPayment } from "./application/confirm-payment.js";
import { SendConfirmationEmail } from "./application/send-confirmation-email.js";
import { CreateOrder } from "./application/create-order.js";
import { AccountFridgeSource } from "./infrastructure/account-fridge-source.js";
import { DeliveryShippingQuoter } from "./infrastructure/delivery-shipping-quoter.js";
import { DevOrderEmailSender } from "./infrastructure/dev-order-email-sender.js";
import { PrismaConfirmationEmailSource } from "./infrastructure/prisma-confirmation-email-source.js";
import { PrismaOrderCreation } from "./infrastructure/prisma-order-creation.js";
import { PrismaOrderRepository } from "./infrastructure/prisma-order-repository.js";
import { ProfileCustomerSource } from "./infrastructure/profile-customer-source.js";
import { AdminOrderController } from "./presentation/admin-order.controller.js";
import { CronController } from "./presentation/cron.controller.js";
import { OrderController } from "./presentation/order.controller.js";

/** Só o id do pedido e o tipo do erro: a mensagem pode carregar e-mail ou endereço do cliente. */
function logEmailFailure(
  logger: AppLogger,
  { orderId, error }: { orderId: string; error: unknown },
): void {
  logger.error("Falha ao enviar o e-mail de confirmação", {
    orderId,
    erro: error instanceof Error ? error.name : typeof error,
    codigo: (error as { code?: unknown } | null)?.code,
  });
}

/** "#LB" e 6 dígitos sorteados; a unicidade é do banco (a criação refaz o sorteio se colidir). */
function newOrderNumber(): string {
  return `#LB${String(randomInt(0, 1_000_000)).padStart(6, "0")}`;
}

@Module({
  imports: [AccountModule, DeliveryModule, FridgeModule],
  controllers: [OrderController, AdminOrderController, CronController],
  providers: [
    { provide: CRON_SECRET, useFactory: () => process.env.CRON_SECRET ?? "" },
    {
      provide: PrismaOrderCreation,
      useFactory: (prisma: PrismaService) => new PrismaOrderCreation(prisma),
      inject: [PrismaService],
    },
    {
      provide: ExpireDueOrders,
      useFactory: (prisma: PrismaService) => {
        const orders = new PrismaOrderRepository(prisma);
        const now = () => new Date();
        return new ExpireDueOrders(orders, new ExpireOrder(orders, now), now);
      },
      inject: [PrismaService],
    },
    {
      provide: ConfirmPayment,
      useFactory: (prisma: PrismaService, logger: AppLogger) => {
        const orders = new PrismaOrderRepository(prisma);
        const now = () => new Date();
        const confirmationEmail = new SendConfirmationEmail({
          source: new PrismaConfirmationEmailSource(prisma),
          // O provedor real é pós-MVP: até lá, o adaptador de desenvolvimento não envia nada.
          sender: new DevOrderEmailSender(logger),
          siteUrl: process.env.SITE_URL ?? "http://localhost:3000",
          now,
          onFailure: (failure) => logEmailFailure(logger, failure),
        });
        return new ConfirmPayment(orders, new ExpireOrder(orders, now), now, confirmationEmail);
      },
      inject: [PrismaService, AppLogger],
    },
    {
      provide: CreateOrder,
      useFactory: (
        profiles: ProfileRepository,
        quoting: QuoteShipping,
        fridge: GetAccountFridge,
        creation: PrismaOrderCreation,
      ) =>
        new CreateOrder({
          customers: new ProfileCustomerSource(profiles),
          shipping: new DeliveryShippingQuoter(quoting),
          fridge: new AccountFridgeSource(fridge),
          creation,
          now: () => new Date(),
          newId: randomUUID,
          newNumber: newOrderNumber,
        }),
      inject: [PROFILE_REPOSITORY, QuoteShipping, GetAccountFridge, PrismaOrderCreation],
    },
  ],
})
export class OrderModule {}
