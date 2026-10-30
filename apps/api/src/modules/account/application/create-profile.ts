import type { LegalVersions } from "../domain/legal-versions.js";
import type { Profile } from "../domain/profile.js";
import type { ProfileRepository } from "../domain/profile-repository.js";
import type { AuthenticatedUser } from "../domain/token-verifier.js";

export interface CreateProfileInput {
  /** Conta autenticada: id e e-mail vêm do token, nunca do corpo. */
  user: AuthenticatedUser;
  nome: string;
  telefone: string;
  aceite: true;
}

export interface CreateProfileOptions {
  now: () => Date;
  legal: LegalVersions;
  /** E-mail da conta admin (ADMIN_EMAIL); sem ele ninguém vira admin por aqui. */
  adminEmail: string | undefined;
}

export class CreateProfile {
  constructor(
    private readonly profiles: ProfileRepository,
    private readonly options: CreateProfileOptions,
  ) {}

  /** Idempotente: se o perfil já existe, devolve o existente sem alterar nada. */
  async execute(input: CreateProfileInput): Promise<{ profile: Profile; created: boolean }> {
    const email = input.user.email.trim().toLowerCase();
    const adminEmail = this.options.adminEmail?.trim().toLowerCase();
    return this.profiles.createProfile({
      id: input.user.id,
      email,
      nome: input.nome,
      telefone: input.telefone,
      role: adminEmail && email === adminEmail ? "admin" : "customer",
      aceite: { ...this.options.legal, aceitoEm: this.options.now() },
    });
  }
}
