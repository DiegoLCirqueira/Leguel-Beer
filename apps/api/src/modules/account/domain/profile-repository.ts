import type { Role } from "./role.js";

export interface ProfileRecord {
  id: string;
  email: string;
  role: Role;
}

export interface ProfileRepository {
  /** Cria o perfil se faltar e grava o papel; repetir não duplica. */
  ensureRole(profile: { id: string; email: string }, role: Role): Promise<void>;
}
