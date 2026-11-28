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

const SIGLAS = /^(IPA|Lager|Ale)$/;

/** Palavras do nome sem o prefixo da marca e sem a sigla do estilo (nome só de sigla fica inteiro). */
const palavrasDoNome = (nome: string) => {
  const todas = nome.replace(/^Leguelé\s+/, "").split(/\s+/);
  const semSigla = todas.filter((palavra) => !SIGLAS.test(palavra));
  return semSigla.length > 0 ? semSigla : todas;
};

/**
 * Apelidos da prateleira, calculados juntos: 1ª palavra (2 se a placa é única) e, onde dois apelidos
 * se repetem, mais uma palavra em cada um, até ficarem diferentes ou acabarem as palavras.
 */
export function apelidosDaPrateleira(nomes: string[]): string[] {
  const palavras = nomes.map(palavrasDoNome);
  const tamanhos: number[] = nomes.map(() => (nomes.length === 1 ? 2 : 1));
  const apelido = (i: number) => palavras[i]!.slice(0, tamanhos[i]).join(" ");
  for (let rodada = 0; rodada < 10; rodada++) {
    const repetidos = nomes
      .map((_, i) => i)
      .filter((i) => nomes.some((_, j) => j !== i && apelido(j) === apelido(i)));
    const crescem = repetidos.filter((i) => tamanhos[i]! < palavras[i]!.length);
    if (crescem.length === 0) break;
    crescem.forEach((i) => (tamanhos[i] = tamanhos[i]! + 1));
  }
  // Ainda repetidos (só diferem pela sigla): o nome inteiro, que a placa trunca se não couber.
  return nomes.map((nome, i) =>
    nomes.some((_, j) => j !== i && apelido(j) === apelido(i)) ? nome : apelido(i),
  );
}

/** Faixa sobre o parapeito: o que há na prateleira ou o convite para escolher uma cerveja. */
export function FaixaDaPrateleira({ categoriaNome, rotulos }: FaixaDaPrateleiraProps) {
  const unico = rotulos.length === 1;
  const apelidos = apelidosDaPrateleira(rotulos.map((r) => r.nome));
  return (
    <div className="grid grid-cols-4 items-center px-1.5 text-[clamp(7px,3.2cqw,13px)] text-texto">
      {rotulos.length === 0 ? (
        <span
          data-placa=""
          className="col-span-4 justify-self-center whitespace-nowrap rounded-full border border-primaria/40 bg-superficie px-2 text-texto-suave"
        >{`Toque no + para escolher uma ${categoriaNome}`}</span>
      ) : (
        rotulos.map((rotulo, i) => (
          <span
            key={rotulo.cervejaId}
            data-placa=""
            className={`flex min-w-0 max-w-full items-center justify-center gap-1 whitespace-nowrap rounded-full border border-primaria/40 bg-superficie px-1.5 ${
              unico ? "col-span-4 justify-self-center" : "justify-self-center"
            }`}
            style={unico ? undefined : { gridColumn: rotulo.coluna + 1 }}
          >
            <span aria-hidden="true" className="min-w-0 truncate">
              {apelidos[i]}
            </span>
            <em aria-hidden="true" className="shrink-0 font-semibold not-italic text-primaria">
              {`×${rotulo.quantidade}`}
            </em>
            <span className="sr-only">{leitura(rotulo)}</span>
          </span>
        ))
      )}
    </div>
  );
}
