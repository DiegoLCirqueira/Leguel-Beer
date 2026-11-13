export type RotuloDaFaixa = { cervejaId: string; nome: string; quantidade: number; totalCentavos: number; coluna: number };

export type FaixaDaPrateleiraProps = {
  categoriaNome: string;
  rotulos: RotuloDaFaixa[];
};

/** Faixa sobre o parapeito: o que há na prateleira ou o convite para escolher uma cerveja. */
export function FaixaDaPrateleira(_props: FaixaDaPrateleiraProps) {
  return null;
}
