export type LinhaDaGeladeira = {
  readonly quantidade: number;
  readonly cerveja: { readonly precoCentavos: number };
};

export type ResumoDaGeladeira = {
  quantidadeTotal: number;
  subtotalCentavos: number;
};

export function resumirGeladeira(itens: readonly LinhaDaGeladeira[]): ResumoDaGeladeira {
  let quantidadeTotal = 0;
  let subtotalCentavos = 0;
  for (const { quantidade, cerveja } of itens) {
    quantidadeTotal += quantidade;
    subtotalCentavos += quantidade * cerveja.precoCentavos;
  }
  return { quantidadeTotal, subtotalCentavos };
}
