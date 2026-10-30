export interface GoTrueConfig {
  url: string;
  anonKey: string;
  fetch?: typeof fetch;
}

export interface DadosCadastro {
  email: string;
  senha: string;
  /** Guardados no cadastro; o perfil é criado no primeiro acesso, depois da confirmação do e-mail. */
  metadata: { nome: string; telefone: string; aceite: true };
  redirectTo: string;
}

export type ResultadoCadastro =
  { tipo: "enviado" } | { tipo: "email-ja-cadastrado" } | { tipo: "erro" };

/** Cliente mínimo do Supabase Auth (GoTrue) por HTTP, para o lado servidor do site. */
export function createGoTrue(config: GoTrueConfig) {
  const fetchFn = config.fetch ?? fetch;

  async function signUp(dados: DadosCadastro): Promise<ResultadoCadastro> {
    try {
      const resposta = await fetchFn(
        `${config.url}/auth/v1/signup?redirect_to=${encodeURIComponent(dados.redirectTo)}`,
        {
          method: "POST",
          headers: { apikey: config.anonKey, "Content-Type": "application/json" },
          body: JSON.stringify({
            email: dados.email,
            password: dados.senha,
            data: dados.metadata,
          }),
        },
      );
      if (!resposta.ok) return { tipo: "erro" };
      const corpo = (await resposta.json()) as { identities?: unknown[] };
      // Com confirmação de e-mail ligada, o Supabase responde 200 para um e-mail que já tem conta,
      // mas sem identidades.
      return corpo.identities?.length === 0 ? { tipo: "email-ja-cadastrado" } : { tipo: "enviado" };
    } catch {
      return { tipo: "erro" };
    }
  }

  return { signUp };
}
