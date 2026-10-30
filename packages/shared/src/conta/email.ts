import { z } from "zod";

const MENSAGEM = "Informe um e-mail válido.";

/** E-mail comparado sem diferenciar maiúsculas e minúsculas: o valor sai aparado e em minúsculas. */
export const emailSchema = z.string(MENSAGEM).trim().toLowerCase().pipe(z.email(MENSAGEM));
