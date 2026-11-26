import { Module, type MiddlewareConsumer, type NestModule } from "@nestjs/common";
import { APP_FILTER, APP_GUARD, APP_PIPE } from "@nestjs/core";
import { ThrottlerGuard, ThrottlerModule } from "@nestjs/throttler";
import { CommonModule } from "./common/common.module.js";
import { PrismaModule } from "./common/prisma/prisma.module.js";
import { AllExceptionsFilter } from "./common/http/all-exceptions.filter.js";
import { throttleLimitFromEnv } from "./common/http/throttle-limit.js";
import { requestIdMiddleware } from "./common/http/request-id.middleware.js";
import { ZodValidationPipe } from "./common/validation/zod-validation.pipe.js";
import { AccountModule } from "./modules/account/account.module.js";
import { CatalogModule } from "./modules/catalog/catalog.module.js";
import { DeliveryModule } from "./modules/delivery/delivery.module.js";
import { FridgeModule } from "./modules/fridge/fridge.module.js";
import { HealthModule } from "./modules/health/health.module.js";
import { OrderModule } from "./modules/order/order.module.js";

@Module({
  imports: [
    CommonModule,
    PrismaModule,
    AccountModule,
    CatalogModule,
    FridgeModule,
    DeliveryModule,
    OrderModule,
    HealthModule,
    // Assíncrono para ler o ambiente depois do .env ser carregado no main.ts.
    ThrottlerModule.forRootAsync({
      useFactory: () => [{ ttl: 60_000, limit: throttleLimitFromEnv(process.env) }],
    }),
  ],
  providers: [
    { provide: APP_FILTER, useClass: AllExceptionsFilter },
    { provide: APP_PIPE, useClass: ZodValidationPipe },
    { provide: APP_GUARD, useClass: ThrottlerGuard },
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer): void {
    consumer.apply(requestIdMiddleware).forRoutes("*path");
  }
}
