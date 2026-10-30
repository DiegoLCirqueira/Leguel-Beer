import type { Role } from "./role.js";

export interface ProfileRecord {
  id: string;
  email: string;
  role: Role;
}

export interface ProfileRepository {
  /** Cria o perfil se faltar e grava o papel; repetir não duplica. */
  ensureRole(profile: { id: string; email: string }, role: Role): Promise<void>;
  /** Papel gravado da conta, ou null se ela ainda não tem perfil (quem não tem perfil é cliente). */
  findRole(id: string): Promise<Role | null>;
}
