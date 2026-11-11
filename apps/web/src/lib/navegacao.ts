export const CHAVE_NAVEGOU_NO_SITE = "lb:navegou-no-site";

/** Lembra, só nesta aba, que houve navegação dentro do site (o `document.referrer` não muda em navegação do app). */
export function marcarNavegouNoSite(): void {
  try {
    window.sessionStorage.setItem(CHAVE_NAVEGOU_NO_SITE, "1");
  } catch {
    // sessionStorage bloqueado: sem a marca, o Voltar usa o link de reserva.
  }
}

export function navegouNoSite(): boolean {
  try {
    return window.sessionStorage.getItem(CHAVE_NAVEGOU_NO_SITE) === "1";
  } catch {
    return false;
  }
}
