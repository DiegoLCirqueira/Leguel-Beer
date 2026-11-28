import { z } from "zod";

/** A foto otimizada no navegador: WebP de até 40 KB (o tamanho servido pela Geladeira). */
export const FOTO_TAMANHO_MAXIMO_BYTES = 40 * 1024;

/** Validade do caminho de envio, em minutos. */
export const FOTO_VALIDADE_MINUTOS = 10;

/** Nome do arquivo de envio que a API gera: UUID e extensão `.webp`, nada escolhido pelo cliente. */
export const caminhoDeEnvioSchema = z
  .string()
  .regex(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}\.webp$/);

export const caminhoDeEnvioRespostaSchema = z.strictObject({
  caminho: caminhoDeEnvioSchema,
  expiraEm: z.iso.datetime(),
});
export type CaminhoDeEnvioResposta = z.infer<typeof caminhoDeEnvioRespostaSchema>;

export const publicarFotoSchema = z.strictObject({ caminho: caminhoDeEnvioSchema });
export type PublicarFoto = z.infer<typeof publicarFotoSchema>;

/** Confere os bytes: um WebP de verdade (cabeçalho RIFF....WEBP), não só o tipo ou a extensão declarados. */
export function ehWebp(bytes: Uint8Array): boolean {
  if (bytes.length < 12) return false;
  const text = (from: number, to: number) => String.fromCharCode(...bytes.slice(from, to));
  return text(0, 4) === "RIFF" && text(8, 12) === "WEBP";
}
