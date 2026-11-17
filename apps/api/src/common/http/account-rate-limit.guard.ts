import {
  HttpException,
  Injectable,
  SetMetadata,
  type CanActivate,
  type ExecutionContext,
} from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { AccountRateLimiter, type AccountRateLimitRule } from "./account-rate-limiter.js";

const METADATA = "leguele:account-rate-limit";

export interface AccountRateLimitConfig extends AccountRateLimitRule {
  /** Rotas do mesmo grupo dividem a mesma cota da conta. */
  group: string;
}

/** Limita a rota (ou o controller) por conta autenticada; use com `AccountRateLimitGuard`. */
export const AccountRateLimit = (config: AccountRateLimitConfig) => SetMetadata(METADATA, config);

/**
 * Roda depois do guard global de acesso, então a conta já está na requisição. Acima do limite
 * responde 429 antes de qualquer chamada externa (o filtro de erros dá o corpo padrão).
 */
@Injectable()
export class AccountRateLimitGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly limiter: AccountRateLimiter,
  ) {}

  canActivate(context: ExecutionContext): boolean {
    const config = this.reflector.getAllAndOverride<AccountRateLimitConfig | undefined>(METADATA, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (!config) return true;
    const user = context.switchToHttp().getRequest<{ user?: { id: string } }>().user;
    if (!user) return true;
    if (!this.limiter.allow(config.group, user.id, config)) {
      throw new HttpException("Too Many Requests", 429);
    }
    return true;
  }
}
