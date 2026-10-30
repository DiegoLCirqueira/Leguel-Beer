import { Module } from "@nestjs/common";
import { APP_GUARD } from "@nestjs/core";
import { PrismaService } from "../../common/prisma/prisma.service.js";
import { AuthorizeRequest } from "./application/authorize-request.js";
import type { ProfileRepository } from "./domain/profile-repository.js";
import type { TokenVerifier } from "./domain/token-verifier.js";
import { PROFILE_REPOSITORY, TOKEN_VERIFIER } from "./account.tokens.js";
import { JwksTokenVerifier } from "./infrastructure/jwks-token-verifier.js";
import { PrismaProfileRepository } from "./infrastructure/prisma-profile-repository.js";
import { AccessGuard } from "./presentation/access.guard.js";

function authUrl(): string {
  const base = process.env["SUPABASE_URL"];
  if (!base) throw new Error("Variável de ambiente SUPABASE_URL não definida");
  return `${base.replace(/\/$/, "")}/auth/v1`;
}

@Module({
  providers: [
    {
      provide: TOKEN_VERIFIER,
      useFactory: () => new JwksTokenVerifier(`${authUrl()}/.well-known/jwks.json`, authUrl()),
    },
    {
      provide: PROFILE_REPOSITORY,
      useFactory: (prisma: PrismaService) => new PrismaProfileRepository(prisma),
      inject: [PrismaService],
    },
    {
      provide: AuthorizeRequest,
      useFactory: (verifier: TokenVerifier, profiles: ProfileRepository) =>
        new AuthorizeRequest(verifier, profiles),
      inject: [TOKEN_VERIFIER, PROFILE_REPOSITORY],
    },
    { provide: APP_GUARD, useClass: AccessGuard },
  ],
})
export class AccountModule {}
