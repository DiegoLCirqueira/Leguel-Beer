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
 * Apelidos da prateleira, calculados juntos: a 1ª palavra (2 se a placa é única). Onde a 1ª palavra se
 * repete, a placa mostra a palavra que distingue (depois do prefixo comum: "Jaraguá Premium" e
 * "Jaraguá Extra" viram "Premium" e "Extra"). Se ainda sobrar repetido (só diferem pela sigla), o
 * nome inteiro, que a placa trunca se não couber.
 */
export function apelidosDaPrateleira(nomes: string[]): string[] {
  const palavras = nomes.map(palavrasDoNome);
  const primeira = (i: number) => palavras[i]![0]!;
  const apelidos = nomes.map((_, i) => {
    if (nomes.length === 1) return palavras[i]!.slice(0, 2).join(" ");
    const iguais = nomes.map((_, j) => j).filter((j) => primeira(j) === primeira(i));
    if (iguais.length === 1) return primeira(i);
    let comum = 0;
    while (
      comum < palavras[i]!.length &&
      iguais.every((j) => palavras[j]![comum] === palavras[i]![comum])
    )
      comum += 1;
    return palavras[i]![comum] ?? palavras[i]!.join(" ");
  });
  return nomes.map((nome, i) =>
    apelidos.some((outro, j) => j !== i && outro === apelidos[i]) ? nome : apelidos[i]!,
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
          className="col-span-4 justify-self-center whitespace-nowrap rounded-full border border-primaria/60 bg-superficie px-2 text-texto"
        >{`Toque no + para escolher uma ${categoriaNome}`}</span>
      ) : (
        rotulos.map((rotulo, i) => (
          <span
            key={rotulo.cervejaId}
            data-placa=""
            className={`relative flex min-w-0 max-w-full items-center justify-center gap-1 whitespace-nowrap rounded-full border border-primaria/40 bg-superficie ${unico ? "px-1.5" : "px-1"} ${
              unico ? "col-span-4 justify-self-center" : "justify-self-center"
            }`}
            style={unico ? undefined : { gridColumn: rotulo.coluna + 1 }}
          >
            <span aria-hidden="true" className="min-w-0 truncate">
              {apelidos[i]}
            </span>
            <em
              aria-hidden="true"
              className="absolute -right-1 -top-[0.9em] rounded-full bg-primaria px-1 text-[max(8px,0.85em)] font-bold not-italic leading-tight text-texto-na-primaria"
            >
              {`×${rotulo.quantidade}`}
            </em>
            <span className="sr-only">{leitura(rotulo)}</span>
          </span>
        ))
      )}
    </div>
  );
}
