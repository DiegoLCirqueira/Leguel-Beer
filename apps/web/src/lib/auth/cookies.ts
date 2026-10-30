export const COOKIE_ACESSO = "lb_acesso";
export const COOKIE_RENOVACAO = "lb_renovacao";
/** Guarda a escolha de "Manter-me conectado" para a renovação usar a mesma validade. */
export const COOKIE_MANTER = "lb_manter";

const TRINTA_DIAS_EM_SEGUNDOS = 30 * 24 * 60 * 60;

interface Entrada {
  manterConectado: boolean;
  /** `false` em http://localhost, onde o navegador recusaria um cookie Secure. */
  producao: boolean;
}

/**
 * Atributos dos cookies de sessão (cadastro-login, "Sessão e cookies"): HttpOnly, Secure fora do
 * desenvolvimento, SameSite=Lax e Path=/. Marcado: 30 dias, renovados a cada uso; desmarcado: sem
 * validade, o cookie some ao fechar o navegador.
 */
export function opcoesCookieSessao({ manterConectado, producao }: Entrada) {
  return {
    httpOnly: true,
    secure: producao,
    sameSite: "lax" as const,
    path: "/",
    ...(manterConectado ? { maxAge: TRINTA_DIAS_EM_SEGUNDOS } : {}),
  };
}
