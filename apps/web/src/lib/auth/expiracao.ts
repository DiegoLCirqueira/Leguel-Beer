const MARGEM_EM_SEGUNDOS = 60;

/**
 * Validade (exp, em segundos) lida do payload do token. Só serve para decidir quando renovar:
 * quem valida a assinatura e a validade de verdade é a API.
 */
export function expiracaoDoToken(token: string): number | undefined {
  const payload = token.split(".")[1];
  if (!payload) return undefined;
  try {
    const { exp } = JSON.parse(Buffer.from(payload, "base64url").toString("utf8")) as {
      exp?: unknown;
    };
    return typeof exp === "number" ? exp : undefined;
  } catch {
    return undefined;
  }
}

/** Renova quando falta menos de 1 minuto para vencer, quando já venceu ou quando não dá para ler. */
export function precisaRenovar(token: string | undefined, agoraEmMs: number): boolean {
  const exp = token ? expiracaoDoToken(token) : undefined;
  if (exp === undefined) return true;
  return exp - agoraEmMs / 1000 < MARGEM_EM_SEGUNDOS;
}
