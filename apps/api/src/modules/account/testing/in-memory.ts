import type { AuthAdmin, AuthUser } from "../domain/auth-admin.js";
import type { ProfileRepository, ProfileRecord } from "../domain/profile-repository.js";
import type { Role } from "../domain/role.js";

/** Fakes de teste: contas do Auth e perfis em memória. */
export class InMemoryAuthAdmin implements AuthAdmin {
  readonly users: (AuthUser & { password: string })[] = [];

  constructor(private readonly newId: (position: number) => string = (n) => `user-${n}`) {}

  findByEmail(email: string): Promise<AuthUser | null> {
    const user = this.users.find((u) => u.email === email);
    return Promise.resolve(
      user ? { id: user.id, email: user.email, emailConfirmed: user.emailConfirmed } : null,
    );
  }

  createConfirmedUser(email: string, password: string): Promise<AuthUser> {
    const user = {
      id: this.newId(this.users.length + 1),
      email,
      emailConfirmed: true,
      password,
    };
    this.users.push(user);
    return Promise.resolve({ id: user.id, email, emailConfirmed: true });
  }
}

export class InMemoryProfileRepository implements ProfileRepository {
  readonly profiles = new Map<string, ProfileRecord>();

  ensureRole(profile: { id: string; email: string }, role: Role): Promise<void> {
    this.profiles.set(profile.id, { ...profile, role });
    return Promise.resolve();
  }

  findRole(id: string): Promise<Role | null> {
    return Promise.resolve(this.profiles.get(id)?.role ?? null);
  }
}
