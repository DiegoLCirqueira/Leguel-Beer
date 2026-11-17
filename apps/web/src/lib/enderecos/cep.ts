export type ResultadoDoCep =
  | { tipo: "ok"; rua: string; bairro: string; cidade: string; uf: "AL" }
  | { tipo: "nao-encontrado" | "fora-de-alagoas" | "indisponivel" | "invalido" };

/** Mais que isso sem resposta e a pessoa preenche à mão. */
const TEMPO_LIMITE_MS = 5000;

const texto = (valor: unknown) => (typeof valor === "string" ? valor : undefined);

/**
 * Consulta o CEP no ViaCEP, só no servidor e levando só o CEP (minimização, LGPD). Nunca lança.
 * Só Alagoas entra: a faixa 57 do CEP e a UF AL.
 */
export async function consultarCep(cep: string): Promise<ResultadoDoCep> {
  const digitos = cep.replace(/\D/g, "");
  if (!/^\d{8}$/.test(digitos)) return { tipo: "invalido" };
  if (!digitos.startsWith("57")) return { tipo: "fora-de-alagoas" };
  try {
    const resposta = await fetch(`https://viacep.com.br/ws/${digitos}/json/`, {
      cache: "no-store",
      signal: AbortSignal.timeout(TEMPO_LIMITE_MS),
    });
    if (!resposta.ok) return { tipo: "indisponivel" };
    const corpo: unknown = await resposta.json();
    if (typeof corpo !== "object" || corpo === null) return { tipo: "indisponivel" };
    const dados = corpo as Record<string, unknown>;
    if (dados.erro === true || dados.erro === "true") return { tipo: "nao-encontrado" };
    const rua = texto(dados.logradouro);
    const bairro = texto(dados.bairro);
    const cidade = texto(dados.localidade);
    const uf = texto(dados.uf);
    if (rua === undefined || bairro === undefined || cidade === undefined || uf === undefined) {
      return { tipo: "indisponivel" };
    }
    if (uf !== "AL") return { tipo: "fora-de-alagoas" };
    return { tipo: "ok", rua, bairro, cidade, uf };
  } catch {
    return { tipo: "indisponivel" };
  }
}
