import { InsufficientRoleError } from "../domain/access.js";
import type { ProfileRepository } from "../domain/profile-repository.js";
import type { Role } from "../domain/role.js";
import {
  InvalidTokenError,
  type AuthenticatedUser,
  type TokenVerifier,
} from "../domain/token-verifier.js";

export interface AuthorizeRequestInput {
  /** Valor do cabeçalho Authorization. */
  authorization: string | undefined;
  /** Papel exigido pela rota; sem ele, qualquer conta autenticada passa. */
  requiredRole?: Role;
}

export interface AuthorizedUser extends AuthenticatedUser {
  role: Role;
}

export class AuthorizeRequest {
  constructor(
    private readonly verifier: TokenVerifier,
    private readonly profiles: ProfileRepository,
  ) {}

  async execute(input: AuthorizeRequestInput): Promise<AuthorizedUser> {
    const match = /^Bearer (\S+)$/.exec(input.authorization ?? "");
    if (!match) throw new InvalidTokenError("cabeçalho Authorization ausente ou fora do formato");

    const user = await this.verifier.verify(match[1] as string);
    // Conta sem perfil é cliente; só o admin é gravado (guards-api).
    const role = (await this.profiles.findRole(user.id)) ?? "customer";
    if (input.requiredRole && role !== input.requiredRole) throw new InsufficientRoleError();
    return { ...user, role };
  }
}
