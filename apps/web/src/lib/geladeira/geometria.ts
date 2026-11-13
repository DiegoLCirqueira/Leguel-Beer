/** Medidas da moldura do estúdio (710 x 1573) e posição de cada garrafa dela, em percentual. */
export const MOLDURA = { largura: 710, altura: 1573 } as const;

/** Linha de apoio de cada prateleira: [altura na esquerda, altura na direita], em px da moldura. */
const LINHAS: readonly (readonly [number, number])[] = [
  [408, 442],
  [687, 699],
  [951, 951],
  [1240, 1240],
];
/** Quanto cada fileira de trás sobe, em px da moldura: só nas prateleiras abaixo da linha dos olhos. */
const SUBIDA_POR_FILEIRA = [0, 0, 6, 17] as const;
const INICIO_X = 134;
const LARGURA_DA_POSICAO = 121;
const COLUNAS = 4;
const ALTURA_DA_GARRAFA = 200;
const PROPORCAO_DA_GARRAFA = 0.36;
const ESCALA_POR_FILEIRA = 0.1;
const RECUO_POR_FILEIRA = 30;
const BRILHO_POR_FILEIRA = 0.3;

export type PosicaoDaGarrafa = {
  left: number;
  bottom: number;
  width: number;
  height: number;
  /** 1 na frente; cada fileira atrás escurece. */
  brilho: number;
};

const percentual = (valor: number, total: number) => (valor / total) * 100;

/** A linha da prateleira é inclinada: a altura do apoio depende do x. */
const alturaDaLinha = (prateleira: number, x: number) => {
  const [esquerda, direita] = LINHAS[prateleira]!;
  return esquerda + ((direita - esquerda) * (x - INICIO_X)) / (COLUNAS * LARGURA_DA_POSICAO);
};

export function posicaoDaGarrafa(
  prateleira: number,
  coluna: number,
  fileira: number,
): PosicaoDaGarrafa {
  const escala = 1 - fileira * ESCALA_POR_FILEIRA;
  const altura = ALTURA_DA_GARRAFA * escala;
  const largura = altura * PROPORCAO_DA_GARRAFA;
  const x =
    INICIO_X +
    coluna * LARGURA_DA_POSICAO +
    (LARGURA_DA_POSICAO - largura) / 2 -
    fileira * RECUO_POR_FILEIRA;
  const apoio = alturaDaLinha(prateleira, x + largura / 2) - fileira * SUBIDA_POR_FILEIRA[prateleira]!;
  return {
    left: percentual(x, MOLDURA.largura),
    bottom: percentual(MOLDURA.altura - apoio, MOLDURA.altura),
    width: percentual(largura, MOLDURA.largura),
    height: percentual(altura, MOLDURA.altura),
    brilho: 1 - fileira * BRILHO_POR_FILEIRA,
  };
}

export type PosicaoDaFaixa = {
  /** Distância da borda de baixo da moldura, em %. */
  bottom: number;
  /** Inclinação do parapeito, em radianos (a faixa gira com ele). */
  giro: number;
};

export function posicaoDaFaixa(_prateleira: number): PosicaoDaFaixa {
  return { bottom: 0, giro: 0 };
}
