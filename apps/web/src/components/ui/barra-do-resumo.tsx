import { formatPriceBRL } from "@leguele/shared";
import { Button } from "./button";
import { textoDosItens } from "./totais-do-resumo";

export type BarraDoResumoProps = {
  quantidadeTotal: number;
  subtotalCentavos: number;
  aoVerResumo: () => void;
};

/** Barra do resumo no celular: subtotal e "Ver resumo" (que abre o sheet), acima da barra inferior. */
export function BarraDoResumo({
  quantidadeTotal,
  subtotalCentavos,
  aoVerResumo,
}: BarraDoResumoProps) {
  return (
    <div className="flex w-full shrink-0 items-center gap-3 border-t border-borda bg-fundo px-4 py-2 text-texto">
      <div className="min-w-0 flex-1">
        <p className="text-sm text-texto-suave">{`Subtotal (${textoDosItens(quantidadeTotal)})`}</p>
        <p className="text-lg font-bold text-primaria">{formatPriceBRL(subtotalCentavos)}</p>
      </div>
      <Button size="sm" onClick={aoVerResumo}>
        Ver resumo
      </Button>
    </div>
  );
}
