import { formatPriceBRL } from "@leguele/shared";

export type RotuloDaFaixa = {
  cervejaId: string;
  nome: string;
  quantidade: number;
  totalCentavos: number;
  coluna: number;
};

export type FaixaDaPrateleiraProps = {
  categoriaNome: string;
  rotulos: RotuloDaFaixa[];
};

const leitura = ({ nome, quantidade, totalCentavos }: RotuloDaFaixa) =>
  `${nome}, ${quantidade} ${quantidade === 1 ? "unidade" : "unidades"}, ${formatPriceBRL(totalCentavos)}`;

/** Faixa sobre o parapeito: o que há na prateleira ou o convite para escolher uma cerveja. */
export function FaixaDaPrateleira({ categoriaNome, rotulos }: FaixaDaPrateleiraProps) {
  const unico = rotulos.length === 1;
  return (
    <div className="grid grid-cols-4 items-center px-1.5 text-[clamp(7px,3.2cqw,13px)] text-texto">
      {rotulos.length === 0 ? (
        <span className="col-span-4 text-texto-suave">{`Toque no + para escolher uma ${categoriaNome}`}</span>
      ) : (
        rotulos.map((rotulo) => (
          <span
            key={rotulo.cervejaId}
            className={unico ? "col-span-4 flex justify-between gap-2" : "flex min-w-0 gap-1"}
            style={unico ? undefined : { gridColumn: rotulo.coluna + 1 }}
          >
            <span aria-hidden="true" className="min-w-0 truncate px-0.5">
              {rotulo.nome}
            </span>
            <em aria-hidden="true" className="font-semibold not-italic text-primaria">
              {`×${rotulo.quantidade}`}
            </em>
            <span className="sr-only">{leitura(rotulo)}</span>
          </span>
        ))
      )}
    </div>
  );
}
