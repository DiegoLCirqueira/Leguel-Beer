import { Module } from "@nestjs/common";
import { APP_GUARD } from "@nestjs/core";
import { PrismaService } from "../../common/prisma/prisma.service.js";
import { CreateProfile } from "./application/create-profile.js";
import { GetProfile } from "./application/get-profile.js";
import { LEGAL_VERSIONS } from "./domain/legal-versions.js";
import { ProfileController } from "./presentation/profile.controller.js";
import { RoleController } from "./presentation/role.controller.js";
import { AuthorizeRequest } from "./application/authorize-request.js";
import type { EmailConfirmation } from "./domain/email-confirmation.js";
import type { ProfileRepository } from "./domain/profile-repository.js";
import type { TokenVerifier } from "./domain/token-verifier.js";
import { EMAIL_CONFIRMATION, PROFILE_REPOSITORY, TOKEN_VERIFIER } from "./account.tokens.js";
import { JwksTokenVerifier } from "./infrastructure/jwks-token-verifier.js";
import { PrismaEmailConfirmation } from "./infrastructure/prisma-email-confirmation.js";
import { PrismaProfileRepository } from "./infrastructure/prisma-profile-repository.js";
import { AccessGuard } from "./presentation/access.guard.js";

function authUrl(): string {
  const base = process.env["SUPABASE_URL"];
  if (!base) throw new Error("Variável de ambiente SUPABASE_URL não definida");
  return `${base.replace(/\/$/, "")}/auth/v1`;
}

@Module({
  controllers: [ProfileController, RoleController],
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
      provide: EMAIL_CONFIRMATION,
      useFactory: (prisma: PrismaService) => new PrismaEmailConfirmation(prisma),
      inject: [PrismaService],
    },
    {
      provide: AuthorizeRequest,
      useFactory: (verifier: TokenVerifier, profiles: ProfileRepository) =>
        new AuthorizeRequest(verifier, profiles),
      inject: [TOKEN_VERIFIER, PROFILE_REPOSITORY],
    },
    {
      provide: CreateProfile,
      useFactory: (profiles: ProfileRepository, confirmation: EmailConfirmation) =>
        new CreateProfile(profiles, confirmation, {
          now: () => new Date(),
          legal: LEGAL_VERSIONS,
          adminEmail: process.env["ADMIN_EMAIL"],
        }),
      inject: [PROFILE_REPOSITORY, EMAIL_CONFIRMATION],
    },
    {
      provide: GetProfile,
      useFactory: (profiles: ProfileRepository) => new GetProfile(profiles),
      inject: [PROFILE_REPOSITORY],
    },
    { provide: APP_GUARD, useClass: AccessGuard },
  ],
})
export class AccountModule {}
