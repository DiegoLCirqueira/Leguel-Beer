import type { AuthAdmin, AuthUser } from "../domain/auth-admin.js";
import type { Profile } from "../domain/profile.js";
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
  /** Perfis completos (com nome, telefone e aceite), como no banco. */
  readonly complete = new Map<string, Profile>();

  ensureRole(profile: { id: string; email: string }, role: Role): Promise<void> {
    this.profiles.set(profile.id, { ...profile, role });
    return Promise.resolve();
  }

  findRole(id: string): Promise<Role | null> {
    return Promise.resolve(this.profiles.get(id)?.role ?? null);
  }

  findProfile(id: string): Promise<Profile | null> {
    return Promise.resolve(this.complete.get(id) ?? null);
  }

  createProfile(profile: Profile): Promise<{ profile: Profile; created: boolean }> {
    const existing = this.complete.get(profile.id);
    if (existing) return Promise.resolve({ profile: existing, created: false });
    const role = this.profiles.get(profile.id)?.role ?? profile.role;
    const stored = { ...profile, role };
    this.complete.set(profile.id, stored);
    this.profiles.set(profile.id, { id: profile.id, email: profile.email, role });
    return Promise.resolve({ profile: stored, created: true });
  }
}
