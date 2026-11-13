/** Medidas da moldura do estúdio (710 x 1573) e posição de cada garrafa dela, em percentual. */
export type PosicaoDaGarrafa = {
  left: number;
  bottom: number;
  width: number;
  height: number;
  /** 1 na frente; cada fileira atrás escurece. */
  brilho: number;
};

export function posicaoDaGarrafa(
  _prateleira: number,
  _coluna: number,
  _fileira: number,
): PosicaoDaGarrafa {
  return { left: 0, bottom: 0, width: 0, height: 0, brilho: 1 };
}
