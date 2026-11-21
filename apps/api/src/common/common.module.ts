import { Global, Module } from "@nestjs/common";
import { AccountRateLimiter } from "./http/account-rate-limiter.js";
import { AppLogger } from "./logging/app-logger.js";

@Global()
@Module({ providers: [AppLogger, AccountRateLimiter], exports: [AppLogger, AccountRateLimiter] })
export class CommonModule {}
