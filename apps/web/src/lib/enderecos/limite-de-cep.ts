/**
 * Consultas de CEP por visitante e por minuto; o cookie de sessão não é prova de nada, o limite é.
 * O visitante é o primeiro IP de `x-forwarded-for`, que a Vercel define; fora dela, sem o cabeçalho,
 * todos caem no mesmo balde "desconhecido" e dividem o limite.
 */
const LIMITE = 60;
const JANELA_MS = 60_000;

const consultas = new Map<string, number[]>();

/** Visitantes que ainda estão na memória (para os testes). */
export const visitantesNoLimiteDeCep = () => consultas.size;

/** Conta a consulta e diz se cabe no limite. Em memória: numa API serverless vale por instância. */
export function dentroDoLimiteDeCep(visitante: string, agora = Date.now()): boolean {
  // Quem não volta depois da janela sai do mapa, para ele não crescer sem fim.
  for (const [chave, instantes] of consultas) {
    if (agora - (instantes[instantes.length - 1] ?? 0) >= JANELA_MS) consultas.delete(chave);
  }
  const recentes = (consultas.get(visitante) ?? []).filter((t) => agora - t < JANELA_MS);
  if (recentes.length >= LIMITE) {
    consultas.set(visitante, recentes);
    return false;
  }
  recentes.push(agora);
  consultas.set(visitante, recentes);
  return true;
}
