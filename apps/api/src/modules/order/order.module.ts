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
import { ConfirmPayment } from "./application/confirm-payment.js";
import { CreateOrder } from "./application/create-order.js";
import { AccountFridgeSource } from "./infrastructure/account-fridge-source.js";
import { DeliveryShippingQuoter } from "./infrastructure/delivery-shipping-quoter.js";
import { PrismaOrderCreation } from "./infrastructure/prisma-order-creation.js";
import { PrismaOrderRepository } from "./infrastructure/prisma-order-repository.js";
import { ProfileCustomerSource } from "./infrastructure/profile-customer-source.js";
import { AdminOrderController } from "./presentation/admin-order.controller.js";
import { OrderController } from "./presentation/order.controller.js";

/** "#LB" e 6 dígitos sorteados; a unicidade é do banco (a criação refaz o sorteio se colidir). */
function newOrderNumber(): string {
  return `#LB${String(randomInt(0, 1_000_000)).padStart(6, "0")}`;
}

@Module({
  imports: [AccountModule, DeliveryModule, FridgeModule],
  controllers: [OrderController, AdminOrderController],
  providers: [
    {
      provide: PrismaOrderCreation,
      useFactory: (prisma: PrismaService) => new PrismaOrderCreation(prisma),
      inject: [PrismaService],
    },
    {
      provide: ConfirmPayment,
      useFactory: (prisma: PrismaService) =>
        new ConfirmPayment(new PrismaOrderRepository(prisma), () => new Date()),
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
