import { Module, type MiddlewareConsumer, type NestModule } from "@nestjs/common";
import { APP_FILTER, APP_GUARD, APP_PIPE } from "@nestjs/core";
import { ThrottlerGuard, ThrottlerModule } from "@nestjs/throttler";
import { CommonModule } from "./common/common.module.js";
import { PrismaModule } from "./common/prisma/prisma.module.js";
import { AllExceptionsFilter } from "./common/http/all-exceptions.filter.js";
import { requestIdMiddleware } from "./common/http/request-id.middleware.js";
import { ZodValidationPipe } from "./common/validation/zod-validation.pipe.js";
import { HealthModule } from "./modules/health/health.module.js";

@Module({
  imports: [
    CommonModule,
    PrismaModule,
    HealthModule,
    ThrottlerModule.forRoot([{ ttl: 60_000, limit: 100 }]),
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
