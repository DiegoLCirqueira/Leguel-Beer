import { z } from "zod";
import { cepSchema } from "../endereco/cep.js";

const texto = (maximo: number) => z.string().trim().min(1).max(maximo);

/**
 * Configurações de entrega editadas pelo admin. A origem vai como endereço: a API calcula as
 * coordenadas pelo serviço de mapas. Valores em centavos e raio em km inteiros (a API grava em metros).
 */
export const configuracoesDeEntregaSchema = z.strictObject({
  origem: z.strictObject({
    cep: cepSchema,
    rua: texto(120),
    numero: texto(20),
    bairro: texto(80),
    cidade: texto(80),
  }),
  taxaBaseCentavos: z.int().min(0).max(10_000),
  valorPorKmCentavos: z.int().min(0).max(10_000),
  raioMaximoKm: z.int().min(1).max(100),
  freteGratisMinimoCentavos: z.int().min(0).max(1_000_000),
});

export type ConfiguracoesDeEntrega = z.infer<typeof configuracoesDeEntregaSchema>;
