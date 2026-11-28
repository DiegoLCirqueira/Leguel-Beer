import { z } from "zod";

const umaCasaDecimal = (valor: number) => Math.abs(valor * 10 - Math.round(valor * 10)) < 1e-9;

/** Tetos do contrato: cabem no Int de 32 bits do banco e não estouram o subtotal do pedido. */
export const PRECO_MAXIMO_CENTAVOS = 1_000_000;
export const ESTOQUE_MAXIMO = 100_000;

const campos = {
  nome: z.string().trim().min(1).max(80),
  /** Slug de uma das categorias do cadastro; a API confere que existe. */
  categoriaSlug: z.string().min(1).max(60),
  estilo: z.string().trim().min(1).max(40),
  // Vazio ou só espaços vira ausente.
  descricao: z
    .string()
    .trim()
    .max(200)
    .transform((texto) => (texto === "" ? undefined : texto))
    .optional(),
  precoCentavos: z.int().positive().max(PRECO_MAXIMO_CENTAVOS),
  precoAnteriorCentavos: z.int().positive().max(PRECO_MAXIMO_CENTAVOS).optional(),
  volumeMl: z.int().min(100).max(2000),
  teorAlcoolico: z
    .number()
    .min(0)
    .max(20)
    .refine(umaCasaDecimal, { message: "Use no máximo uma casa decimal." }),
  ibu: z.int().min(0).max(150),
  estoqueMinimo: z.int().min(0).max(ESTOQUE_MAXIMO).default(6),
  destaque: z.boolean(),
  /** Disponível no catálogo; cerveja inativa some do catálogo mas fica nos pedidos antigos. */
  ativa: z.boolean(),
};

const precoAnteriorMaior = {
  path: ["precoAnteriorCentavos"],
  message: "O preço anterior deve ser maior que o atual",
};

type ComPrecos = { precoCentavos: number; precoAnteriorCentavos?: number | undefined };

const anteriorMaiorQueAtual = (v: ComPrecos) =>
  v.precoAnteriorCentavos === undefined || v.precoAnteriorCentavos > v.precoCentavos;

/** Cadastro: leva o estoque inicial, que depois só muda pela tela de Estoque. */
export const criarCervejaSchema = z
  .strictObject({ ...campos, estoqueInicial: z.int().min(0).max(ESTOQUE_MAXIMO) })
  .refine(anteriorMaiorQueAtual, precoAnteriorMaior);

/** Edição: sem estoque inicial e sem slug (fixo depois de criado); campo a mais é recusado. */
export const editarCervejaSchema = z
  .strictObject(campos)
  .refine(anteriorMaiorQueAtual, precoAnteriorMaior);

export type CriarCerveja = z.infer<typeof criarCervejaSchema>;
export type EditarCerveja = z.infer<typeof editarCervejaSchema>;
