import { formatPriceBRL } from "@leguele/shared";

export type BlocoDePrecoProps = {
  precoCentavos: number;
  precoAnteriorCentavos: number | null;
  descontoPercentual: number | null;
};

/** Preço atual; com desconto calculado pela API, mostra também o anterior riscado e o selo "-N%". */
export function BlocoDePreco({
  precoCentavos,
  precoAnteriorCentavos,
  descontoPercentual,
}: BlocoDePrecoProps) {
  const comDesconto = precoAnteriorCentavos !== null && descontoPercentual !== null;
  return (
    <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
      <p className="text-3xl font-bold text-primaria">{formatPriceBRL(precoCentavos)}</p>
      {comDesconto ? (
        <>
          <s className="text-base text-texto-suave">{formatPriceBRL(precoAnteriorCentavos)}</s>
          <span className="rounded-full bg-primaria px-2 py-0.5 text-sm font-bold text-texto-na-primaria">
            {`-${descontoPercentual}%`}
          </span>
        </>
      ) : null}
    </div>
  );
}
