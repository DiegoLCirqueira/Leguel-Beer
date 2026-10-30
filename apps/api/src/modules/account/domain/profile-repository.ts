import type { Profile } from "./profile.js";
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
  /** Perfil completo da conta, ou null se ela ainda não o criou (perfil só com papel, do seed, não conta). */
  findProfile(id: string): Promise<Profile | null>;
  /**
   * Cria o perfil completo, ou completa o que o seed deixou só com o papel, mantendo o papel gravado.
   * Se o perfil completo já existe, devolve o existente sem alterar nada (`created: false`); duas
   * chamadas simultâneas criam um só.
   */
  createProfile(profile: Profile): Promise<{ profile: Profile; created: boolean }>;
}
