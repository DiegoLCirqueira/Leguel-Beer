import { z } from "zod";
import { formatPriceBRL } from "../format-price.js";
import { PARCELAS_MAXIMAS } from "./forma.js";

export const opcaoDeParcelaSchema = z.object({
  parcelas: z.int().min(1).max(PARCELAS_MAXIMAS),
  valorParcelaCentavos: z.int().positive(),
  totalCentavos: z.int().positive(),
  semJuros: z.boolean(),
});

export type OpcaoDeParcela = z.infer<typeof opcaoDeParcelaSchema>;

/** A tabela do gateway começa em 1x e segue sem saltos; um total baixo pode ter menos de 12 opções. */
export const tabelaDeParcelasSchema = z
  .array(opcaoDeParcelaSchema)
  .min(1)
  .max(PARCELAS_MAXIMAS)
  .refine((tabela) => tabela.every((opcao, indice) => opcao.parcelas === indice + 1), {
    message: "As parcelas devem começar em 1x e seguir em ordem, sem saltos.",
  });

export type TabelaDeParcelas = z.infer<typeof tabelaDeParcelasSchema>;

export function descreverParcela(opcao: OpcaoDeParcela): string {
  const parcela = `${opcao.parcelas}x de ${formatPriceBRL(opcao.valorParcelaCentavos)}`;
  return opcao.semJuros
    ? `${parcela} sem juros`
    : `${parcela} (total ${formatPriceBRL(opcao.totalCentavos)})`;
}
