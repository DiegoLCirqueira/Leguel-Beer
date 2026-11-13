import { z } from "zod";

export const cepSchema = z.string().transform((valor) => valor.replace(/\D/g, ""));
