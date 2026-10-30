import { ApiError } from "@leguele/shared";

interface Schema<T> {
  parse(data: unknown): T;
}

export interface RequestOptions<T> {
  method?: string;
  body?: unknown;
  schema?: Schema<T>;
}

export interface ApiClientConfig {
  baseUrl: string;
  fetch?: typeof fetch;
  getToken: () => Promise<string | undefined>;
  /** Renova a sessão e devolve o token novo, ou null se não foi possível. */
  refreshSession: () => Promise<string | null>;
}

/** Cliente HTTP da API, para o lado servidor do site (os cookies de sessão são HttpOnly). */
export function createApiClient(config: ApiClientConfig) {
  const fetchFn = config.fetch ?? fetch;

  async function send(path: string, token: string | undefined, options: RequestOptions<unknown>) {
    return fetchFn(`${config.baseUrl}${path}`, {
      method: options.method ?? "GET",
      headers: {
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...(options.body === undefined ? {} : { "Content-Type": "application/json" }),
      },
      body: options.body === undefined ? undefined : JSON.stringify(options.body),
    });
  }

  async function request<T = unknown>(path: string, options: RequestOptions<T> = {}): Promise<T> {
    let response = await send(path, await config.getToken(), options);
    if (response.status === 401) {
      const token = await config.refreshSession().catch(() => null);
      if (token) response = await send(path, token, options);
    }
    if (!response.ok) throw ApiError.fromBody(response.status, await readBody(response));
    const data = await readBody(response);
    if (!options.schema) return data as T;
    try {
      return options.schema.parse(data);
    } catch {
      throw new ApiError(response.status, {
        code: "INVALID_RESPONSE",
        message: "A resposta da API não está no formato esperado.",
      });
    }
  }

  return { request };
}

async function readBody(response: Response): Promise<unknown> {
  try {
    return await response.json();
  } catch {
    return undefined;
  }
}
