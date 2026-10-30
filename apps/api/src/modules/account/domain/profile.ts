import type { Role } from "./role.js";

/** Aceite dos Termos de Uso e da Política de Privacidade: data pelo relógio da API e versões em vigor. */
export interface TermsAcceptance {
  termosVersao: string;
  privacidadeVersao: string;
  aceitoEm: Date;
}

/** Perfil completo da conta: o que o cadastro coleta, o papel e o aceite dos termos. */
export interface Profile {
  id: string;
  email: string;
  nome: string;
  telefone: string;
  role: Role;
  aceite: TermsAcceptance;
}
