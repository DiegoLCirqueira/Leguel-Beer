import {
  ForbiddenException,
  Injectable,
  UnauthorizedException,
  type CanActivate,
  type ExecutionContext,
} from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import type { Request } from "express";
import { AuthorizeRequest, type AuthorizedUser } from "../application/authorize-request.js";
import { InsufficientRoleError } from "../domain/access.js";
import type { Role } from "../domain/role.js";
import { InvalidTokenError } from "../domain/token-verifier.js";
import { IS_PUBLIC, REQUIRED_ROLE } from "./access.decorators.js";

/** Guard global: toda rota exige token válido, exceto as marcadas com @Public(). */
@Injectable()
export class AccessGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly authorize: AuthorizeRequest,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const targets = [context.getHandler(), context.getClass()];
    if (this.reflector.getAllAndOverride<boolean | undefined>(IS_PUBLIC, targets)) return true;

    const request = context.switchToHttp().getRequest<Request & { user?: AuthorizedUser }>();
    const requiredRole = this.reflector.getAllAndOverride<Role | undefined>(REQUIRED_ROLE, targets);
    try {
      request.user = await this.authorize.execute({
        authorization: request.headers.authorization,
        requiredRole,
      });
    } catch (error) {
      if (error instanceof InvalidTokenError) throw new UnauthorizedException();
      if (error instanceof InsufficientRoleError) throw new ForbiddenException();
      throw error;
    }
    return true;
  }
}
