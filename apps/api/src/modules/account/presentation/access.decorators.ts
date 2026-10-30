import {
  applyDecorators,
  createParamDecorator,
  SetMetadata,
  type ExecutionContext,
} from "@nestjs/common";
import { ApiBearerAuth, ApiForbiddenResponse, ApiUnauthorizedResponse } from "@nestjs/swagger";
import type { AuthorizedUser } from "../application/authorize-request.js";
import type { Role } from "../domain/role.js";

export const IS_PUBLIC = "leguele:public";
export const REQUIRED_ROLE = "leguele:required-role";

/** Rota aberta, sem token. Toda rota sem esta marca exige uma conta autenticada. */
export const Public = () => SetMetadata(IS_PUBLIC, true);

/** Rota de cliente: documenta o Bearer no Swagger (a proteção já é o padrão da API). */
export const Authenticated = () =>
  applyDecorators(
    ApiBearerAuth(),
    ApiUnauthorizedResponse({ description: "Token ausente, inválido ou expirado." }),
  );

/** Rota que exige o papel dado (hoje, admin). */
export const Roles = (role: Role) =>
  applyDecorators(
    SetMetadata(REQUIRED_ROLE, role),
    Authenticated(),
    ApiForbiddenResponse({ description: "A conta não tem o papel exigido." }),
  );

/** A conta autenticada da requisição (id e e-mail do token, papel do banco). */
export const CurrentUser = createParamDecorator(
  (_data: unknown, context: ExecutionContext): AuthorizedUser =>
    context.switchToHttp().getRequest<{ user: AuthorizedUser }>().user,
);
