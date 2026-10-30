import type { AuthAdmin } from "../domain/auth-admin.js";
import type { ProfileRepository } from "../domain/profile-repository.js";

export interface EnsureAdminAccountInput {
  email: string;
  password: string;
}

export interface EnsureAdminAccountResult {
  userId: string;
  created: boolean;
}

export class EnsureAdminAccount {
  constructor(
    private readonly auth: AuthAdmin,
    private readonly profiles: ProfileRepository,
  ) {}

  async execute(input: EnsureAdminAccountInput): Promise<EnsureAdminAccountResult> {
    const email = input.email.trim().toLowerCase();
    const { password } = input;
    const existing = await this.auth.findByEmail(email);
    const user = existing ?? (await this.auth.createConfirmedUser(email, password));
    await this.profiles.ensureRole({ id: user.id, email: user.email }, "admin");
    return { userId: user.id, created: existing === null };
  }
}
