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

export interface Sessao {
  accessToken: string;
  refreshToken: string;
  user: { id: string; email: string; metadata: Record<string, unknown> };
}

export type ResultadoRenovacao =
  { tipo: "ok"; sessao: Sessao } | { tipo: "recusada" } | { tipo: "indisponivel" };

export type ResultadoEntrada =
  | { tipo: "ok"; sessao: Sessao }
  | { tipo: "credenciais" }
  | { tipo: "nao-confirmado" }
  | { tipo: "erro" };

interface CorpoSessao {
  access_token?: string;
  refresh_token?: string;
  user?: { id: string; email?: string; user_metadata?: Record<string, unknown> };
}

function lerSessao(corpo: CorpoSessao): Sessao | null {
  if (!corpo.access_token || !corpo.refresh_token || !corpo.user) return null;
  return {
    accessToken: corpo.access_token,
    refreshToken: corpo.refresh_token,
    user: {
      id: corpo.user.id,
      email: corpo.user.email ?? "",
      metadata: corpo.user.user_metadata ?? {},
    },
  };
}

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
      if (!resposta.ok) {
        // O Supabase local responde 422 user_already_exists para a conta já registrada.
        const erro = (await resposta.json().catch(() => ({}))) as { error_code?: string };
        return erro.error_code === "user_already_exists"
          ? { tipo: "email-ja-cadastrado" }
          : { tipo: "erro" };
      }
      const corpo = (await resposta.json()) as { identities?: unknown[] };
      // Em outras configurações o Supabase responde 200 para um e-mail que já tem conta, mas sem
      // identidades.
      return corpo.identities?.length === 0 ? { tipo: "email-ja-cadastrado" } : { tipo: "enviado" };
    } catch {
      return { tipo: "erro" };
    }
  }

  async function chamar(caminho: string, corpo: unknown, cabecalhos: Record<string, string> = {}) {
    return fetchFn(`${config.url}${caminho}`, {
      method: "POST",
      headers: { apikey: config.anonKey, "Content-Type": "application/json", ...cabecalhos },
      body: JSON.stringify(corpo),
    });
  }

  async function lerSessaoDaResposta(resposta: Response): Promise<Sessao | null> {
    if (!resposta.ok) return null;
    return lerSessao((await resposta.json()) as CorpoSessao);
  }

  async function signInPassword(email: string, senha: string): Promise<ResultadoEntrada> {
    try {
      const resposta = await chamar("/auth/v1/token?grant_type=password", {
        email,
        password: senha,
      });
      if (resposta.ok) {
        const sessao = lerSessao((await resposta.json()) as CorpoSessao);
        return sessao ? { tipo: "ok", sessao } : { tipo: "erro" };
      }
      const corpo = (await resposta.json().catch(() => ({}))) as { error_code?: string };
      if (corpo.error_code === "invalid_credentials") return { tipo: "credenciais" };
      if (corpo.error_code === "email_not_confirmed") return { tipo: "nao-confirmado" };
      return { tipo: "erro" };
    } catch {
      return { tipo: "erro" };
    }
  }

  /**
   * Renova a sessão. 400 e 401 são a recusa do Supabase (a sessão acabou); qualquer outra falha
   * (5xx, rede, tempo esgotado) deixa a dúvida: a sessão pode estar boa, só o serviço não respondeu.
   */
  async function refresh(refreshToken: string): Promise<ResultadoRenovacao> {
    try {
      const resposta = await chamar("/auth/v1/token?grant_type=refresh_token", {
        refresh_token: refreshToken,
      });
      if (resposta.status === 400 || resposta.status === 401) return { tipo: "recusada" };
      const sessao = await lerSessaoDaResposta(resposta);
      return sessao ? { tipo: "ok", sessao } : { tipo: "indisponivel" };
    } catch {
      return { tipo: "indisponivel" };
    }
  }

  async function verify(dados: {
    tokenHash: string;
    type: "signup" | "recovery";
  }): Promise<Sessao | null> {
    try {
      const resposta = await chamar("/auth/v1/verify", {
        type: dados.type,
        token_hash: dados.tokenHash,
      });
      return await lerSessaoDaResposta(resposta);
    } catch {
      return null;
    }
  }

  async function resend(email: string, redirectTo: string): Promise<"enviado" | "erro"> {
    try {
      const resposta = await chamar("/auth/v1/resend", {
        type: "signup",
        email,
        options: { email_redirect_to: redirectTo },
      });
      return resposta.ok ? "enviado" : "erro";
    } catch {
      return "erro";
    }
  }

  /** Encerra só a sessão deste aparelho: a renovação deixa de funcionar. */
  async function signOut(accessToken: string): Promise<boolean> {
    try {
      const resposta = await chamar("/auth/v1/logout?scope=local", undefined, {
        Authorization: `Bearer ${accessToken}`,
      });
      return resposta.ok;
    } catch {
      return false;
    }
  }

  /** Pede o e-mail de recuperação. O limite de pedidos (429) volta como "limite", sem erro. */
  async function recover(
    email: string,
    redirectTo: string,
  ): Promise<"enviado" | "limite" | "erro"> {
    try {
      const resposta = await fetchFn(
        `${config.url}/auth/v1/recover?redirect_to=${encodeURIComponent(redirectTo)}`,
        {
          method: "POST",
          headers: { apikey: config.anonKey, "Content-Type": "application/json" },
          body: JSON.stringify({ email }),
        },
      );
      if (resposta.status === 429) return "limite";
      return resposta.ok ? "enviado" : "erro";
    } catch {
      return "erro";
    }
  }

  /** Troca a senha da conta da sessão (PUT /user com o token de acesso). */
  async function updatePassword(accessToken: string, senha: string): Promise<boolean> {
    try {
      const resposta = await fetchFn(`${config.url}/auth/v1/user`, {
        method: "PUT",
        headers: {
          apikey: config.anonKey,
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({ password: senha }),
      });
      return resposta.ok;
    } catch {
      return false;
    }
  }

  /** Encerra as outras sessões da conta e mantém a atual. */
  async function signOutOthers(accessToken: string): Promise<boolean> {
    try {
      const resposta = await chamar("/auth/v1/logout?scope=others", undefined, {
        Authorization: `Bearer ${accessToken}`,
      });
      return resposta.ok;
    } catch {
      return false;
    }
  }

  return {
    signUp,
    signInPassword,
    refresh,
    verify,
    resend,
    signOut,
    recover,
    updatePassword,
    signOutOthers,
  };
}
