export type ModoSupabase = "rodar" | "pular" | "falhar";

/**
 * O que fazer com os cenários que precisam do Supabase local: rodar quando ele existe, pular na
 * máquina de quem não subiu o Supabase e falhar no CI, onde pular esconderia a falta dele.
 */
export function modoSupabase(env: Record<string, string | undefined>): ModoSupabase {
  if (env.SUPABASE_URL && env.SUPABASE_ANON_KEY) return "rodar";
  return env.CI ? "falhar" : "pular";
}
