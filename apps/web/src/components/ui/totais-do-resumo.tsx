import { formatPriceBRL } from "@leguele/shared";

export const textoDosItens = (quantidade: number) =>
  `${quantidade} ${quantidade === 1 ? "item" : "itens"}`;

export type TotaisDoResumoProps = { quantidadeTotal: number; subtotalCentavos: number };

/** Subtotal, frete e total do resumo. Sem endereço e frete (item 4), o total é o subtotal. */
export function TotaisDoResumo({ quantidadeTotal, subtotalCentavos }: TotaisDoResumoProps) {
  const subtotal = formatPriceBRL(subtotalCentavos);
  return (
    <dl className="flex flex-col gap-2 text-texto">
      <div className="flex justify-between gap-4">
        <dt>{`Subtotal (${textoDosItens(quantidadeTotal)})`}</dt>
        <dd className="font-semibold">{subtotal}</dd>
      </div>
      <div className="flex justify-between gap-4 text-sm text-texto-suave">
        <dt>Frete</dt>
        <dd className="text-right">Informe seu endereço para calcular o frete</dd>
      </div>
      <div className="flex justify-between gap-4 border-t border-borda pt-2 text-lg font-bold">
        <dt>Total</dt>
        <dd className="text-primaria">{subtotal}</dd>
      </div>
    </dl>
  );
}
