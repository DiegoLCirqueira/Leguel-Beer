import { z } from "zod";
import { hojeEmMaceio } from "./maioridade.js";

const MENSAGEM = "Informe uma data de nascimento válida.";
const PRIMEIRO_DIA = "1900-01-01";

function paraIso(valor: string): string | null {
  const mascara = /^(\d{2})\/(\d{2})\/(\d{4})$/.exec(valor);
  const iso = mascara ? `${mascara[3]}-${mascara[2]}-${mascara[1]}` : valor;
  if (!/^\d{4}-\d{2}-\d{2}$/.test(iso)) return null;
  // Data real: o Date em UTC "corrige" 31/04 para 01/05, então só vale se voltar igual.
  const data = new Date(`${iso}T00:00:00.000Z`);
  if (Number.isNaN(data.getTime()) || data.toISOString().slice(0, 10) !== iso) return null;
  return iso;
}

/**
 * Data de nascimento: aceita "DD/MM/AAAA" (máscara do formulário) ou "AAAA-MM-DD" (o que a API
 * devolve) e entrega "AAAA-MM-DD". Precisa ser uma data real, de 01/01/1900 em diante e não futura
 * (hoje no fuso de Maceió). Menor de 18 anos é aceito: quem recusa é a criação do pedido.
 */
export const dataDeNascimentoSchema = z
  .string(MENSAGEM)
  .transform((valor, ctx) => {
    const iso = paraIso(valor.trim());
    if (iso === null || iso < PRIMEIRO_DIA) {
      ctx.addIssue({ code: "custom", message: MENSAGEM });
      return z.NEVER;
    }
    if (iso > hojeEmMaceio()) {
      ctx.addIssue({ code: "custom", message: "A data de nascimento não pode ser no futuro." });
      return z.NEVER;
    }
    return iso;
  });
