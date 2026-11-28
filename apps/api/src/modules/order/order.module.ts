import { randomInt, randomUUID } from "node:crypto";
import { Module } from "@nestjs/common";
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
import { CreateOrder } from "./application/create-order.js";
import { GetMyOrder } from "./application/get-my-order.js";
import { ListMyOrders } from "./application/list-my-orders.js";
import { AccountFridgeSource } from "./infrastructure/account-fridge-source.js";
import { DeliveryShippingQuoter } from "./infrastructure/delivery-shipping-quoter.js";
import { PrismaOrderReader } from "./infrastructure/prisma-order-reader.js";
import { PrismaOrderCreation } from "./infrastructure/prisma-order-creation.js";
import { PrismaOrderRepository } from "./infrastructure/prisma-order-repository.js";
import { ProfileCustomerSource } from "./infrastructure/profile-customer-source.js";
import { AdminOrderController } from "./presentation/admin-order.controller.js";
import { CronController } from "./presentation/cron.controller.js";
import { OrderController } from "./presentation/order.controller.js";
import { OrderReadController } from "./presentation/order-read.controller.js";

/** "#LB" e 6 dígitos sorteados; a unicidade é do banco (a criação refaz o sorteio se colidir). */
function newOrderNumber(): string {
  return `#LB${String(randomInt(0, 1_000_000)).padStart(6, "0")}`;
}

@Module({
  imports: [AccountModule, DeliveryModule, FridgeModule],
  controllers: [OrderController, OrderReadController, AdminOrderController, CronController],
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
      provide: ListMyOrders,
      useFactory: (prisma: PrismaService) => {
        const now = () => new Date();
        return new ListMyOrders(
          new PrismaOrderReader(prisma),
          new ExpireOrder(new PrismaOrderRepository(prisma), now),
          now,
        );
      },
      inject: [PrismaService],
    },
    {
      provide: GetMyOrder,
      useFactory: (prisma: PrismaService) => {
        const now = () => new Date();
        return new GetMyOrder(
          new PrismaOrderReader(prisma),
          new ExpireOrder(new PrismaOrderRepository(prisma), now),
          now,
        );
      },
      inject: [PrismaService],
    },
    {
      provide: ConfirmPayment,
      useFactory: (prisma: PrismaService) => {
        const orders = new PrismaOrderRepository(prisma);
        const now = () => new Date();
        return new ConfirmPayment(orders, new ExpireOrder(orders, now), now);
      },
      inject: [PrismaService],
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
