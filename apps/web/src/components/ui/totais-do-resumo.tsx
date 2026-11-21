import { formatPriceBRL } from "@leguele/shared";

export const textoDosItens = (quantidade: number) =>
  `${quantidade} ${quantidade === 1 ? "item" : "itens"}`;

/** O frete estimado pelo endereço padrão; sem ele, o resumo pede o endereço. */
export type FreteEstimado =
  | { tipo: "valor"; centavos: number }
  | { tipo: "gratis" }
  | { tipo: "fora-da-area" }
  | { tipo: "indisponivel" };

export type TotaisDoResumoProps = {
  quantidadeTotal: number;
  subtotalCentavos: number;
  frete?: FreteEstimado;
};

function textoDoFrete(frete?: FreteEstimado): string {
  if (!frete) return "Informe seu endereço para calcular o frete";
  if (frete.tipo === "valor") return formatPriceBRL(frete.centavos);
  if (frete.tipo === "gratis") return "Grátis";
  if (frete.tipo === "fora-da-area") return "Ainda não entregamos neste endereço";
  return "Não conseguimos calcular o frete agora. Tente de novo em instantes.";
}

/** Subtotal, frete e total do resumo. Sem frete estimado, o total é o subtotal. */
export function TotaisDoResumo({ quantidadeTotal, subtotalCentavos, frete }: TotaisDoResumoProps) {
  const subtotal = formatPriceBRL(subtotalCentavos);
  const total = formatPriceBRL(subtotalCentavos + (frete?.tipo === "valor" ? frete.centavos : 0));
  return (
    <dl className="flex flex-col gap-2 text-texto">
      <div className="flex justify-between gap-4">
        <dt>{`Subtotal (${textoDosItens(quantidadeTotal)})`}</dt>
        <dd className="font-semibold">{subtotal}</dd>
      </div>
      <div className="flex justify-between gap-4 text-sm text-texto-suave">
        <dt>Frete</dt>
        <dd className="text-right">{textoDoFrete(frete)}</dd>
      </div>
      <div className="flex justify-between gap-4 border-t border-borda pt-2 text-lg font-bold">
        <dt>Total</dt>
        <dd className="text-primaria">{total}</dd>
      </div>
    </dl>
  );
}
