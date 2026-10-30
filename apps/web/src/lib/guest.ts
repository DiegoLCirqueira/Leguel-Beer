export const GUEST_COOKIE = "leguele_convidado";

// Cookie de sessão (sem max-age): vale até o navegador ser fechado.
export function markGuest() {
  document.cookie = `${GUEST_COOKIE}=1; path=/; SameSite=Lax`;
}
