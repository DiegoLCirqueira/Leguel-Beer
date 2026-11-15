import { z } from "zod";

/**
 * Endereço como a API o devolve ao site. Latitude, longitude e distância ficam na API: o site
 * recebe só o resultado ("fora da área"), nunca os dados que o geraram.
 */
export const enderecoRespostaSchema = z.object({
  id: z.string(),
  apelido: z.string().optional(),
  cep: z.string(),
  rua: z.string(),
  numero: z.string(),
  complemento: z.string().optional(),
  bairro: z.string(),
  cidade: z.string(),
  uf: z.literal("AL"),
  padrao: z.boolean(),
  foraDaArea: z.boolean(),
});

export type EnderecoResposta = z.output<typeof enderecoRespostaSchema>;

export const listaDeEnderecosSchema = z.array(enderecoRespostaSchema);
