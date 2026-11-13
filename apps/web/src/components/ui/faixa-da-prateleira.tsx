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

/** Faixa sobre o parapeito: o que há na prateleira ou o convite para escolher uma cerveja. */
export function FaixaDaPrateleira({ categoriaNome, rotulos }: FaixaDaPrateleiraProps) {
  return (
    <div className="grid grid-cols-4 items-center px-1.5 text-[clamp(8px,2.4vw,12px)] text-texto">
      {rotulos.length === 0 ? (
        <span className="col-span-4 text-texto-suave">{`Toque no + para escolher uma ${categoriaNome}`}</span>
      ) : null}
    </div>
  );
}
