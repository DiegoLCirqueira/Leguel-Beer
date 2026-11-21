/** Consultas de CEP por visitante e por minuto; o cookie de sessão não é prova de nada, o limite é. */
const LIMITE = 60;
const JANELA_MS = 60_000;

const consultas = new Map<string, number[]>();

/** Conta a consulta e diz se cabe no limite. Em memória: numa API serverless vale por instância. */
export function dentroDoLimiteDeCep(visitante: string, agora = Date.now()): boolean {
  const recentes = (consultas.get(visitante) ?? []).filter((t) => agora - t < JANELA_MS);
  if (recentes.length >= LIMITE) {
    consultas.set(visitante, recentes);
    return false;
  }
  recentes.push(agora);
  consultas.set(visitante, recentes);
  return true;
}
