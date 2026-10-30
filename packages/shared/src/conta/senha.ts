import { z } from "zod";

/** De 8 a 72 caracteres, sem exigência de tipos de caractere. */
export const senhaSchema = z
  .string("A senha precisa ter pelo menos 8 caracteres.")
  .min(8, "A senha precisa ter pelo menos 8 caracteres.")
  .max(72, "A senha pode ter no máximo 72 caracteres.");
