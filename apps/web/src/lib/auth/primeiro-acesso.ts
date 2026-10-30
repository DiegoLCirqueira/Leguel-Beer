import { criarPerfilRequestSchema, perfilResponseSchema } from "@leguele/shared";
import type { Sessao } from "./gotrue";

interface Dependencias {
  api: {
    request(
      caminho: string,
      opcoes: { method: string; body: unknown; schema: typeof perfilResponseSchema },
    ): Promise<unknown>;
  };
}

/**
 * Primeiro acesso autenticado: manda à API o nome, o telefone e o aceite guardados no cadastro.
 * A API valida de novo e é idempotente; e-mail, id e papel vêm do token, nunca do corpo.
 * Falha da API não impede a entrada: o pedido se repete no próximo acesso.
 */
export async function criarPerfilNoPrimeiroAcesso(
  sessao: Sessao,
  { api }: Dependencias,
): Promise<"ok" | "sem-dados" | "erro"> {
  const { nome, telefone, aceite } = sessao.user.metadata;
  const dados = criarPerfilRequestSchema.safeParse({ nome, telefone, aceite });
  if (!dados.success) return "sem-dados";

  try {
    await api.request("/me/profile", {
      method: "POST",
      body: dados.data,
      schema: perfilResponseSchema,
    });
    return "ok";
  } catch {
    return "erro";
  }
}
