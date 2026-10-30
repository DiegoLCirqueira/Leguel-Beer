import { Module, type MiddlewareConsumer, type NestModule } from "@nestjs/common";
import { APP_FILTER, APP_PIPE } from "@nestjs/core";
import { CommonModule } from "./common/common.module.js";
import { AllExceptionsFilter } from "./common/http/all-exceptions.filter.js";
import { requestIdMiddleware } from "./common/http/request-id.middleware.js";
import { ZodValidationPipe } from "./common/validation/zod-validation.pipe.js";
import { HealthModule } from "./modules/health/health.module.js";

@Module({
  imports: [CommonModule, HealthModule],
  providers: [
    { provide: APP_FILTER, useClass: AllExceptionsFilter },
    { provide: APP_PIPE, useClass: ZodValidationPipe },
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer): void {
    consumer.apply(requestIdMiddleware).forRoutes("*path");
  }
}
