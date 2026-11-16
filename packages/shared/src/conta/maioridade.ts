const FUSO_DA_LOJA = "America/Maceio";
const MAIORIDADE_EM_ANOS = 18;

const formatadorDoDia = new Intl.DateTimeFormat("en-CA", {
  timeZone: FUSO_DA_LOJA,
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
});

/** O dia de hoje no fuso de Maceió, como "AAAA-MM-DD". */
export function hojeEmMaceio(agora: Date = new Date()): string {
  return formatadorDoDia.format(agora);
}

function anoBissexto(ano: number): boolean {
  return (ano % 4 === 0 && ano % 100 !== 0) || ano % 400 === 0;
}

/**
 * Tem 18 anos ou mais hoje (dia de Maceió), a partir da data de nascimento "AAAA-MM-DD".
 * Quem faz 18 anos hoje já pode comprar. Nascido em 29/02 completa 18 anos em 01/03 nos anos não
 * bissextos (regra conservadora).
 */
export function temMaioridade(nascimento: string, agora: Date = new Date()): boolean {
  const [ano, mes, dia] = nascimento.split("-").map(Number) as [number, number, number];
  const anoDosDezoito = ano + MAIORIDADE_EM_ANOS;
  const semDiaBissexto = mes === 2 && dia === 29 && !anoBissexto(anoDosDezoito);
  const aniversario = semDiaBissexto
    ? `${anoDosDezoito}-03-01`
    : `${anoDosDezoito}-${String(mes).padStart(2, "0")}-${String(dia).padStart(2, "0")}`;
  return hojeEmMaceio(agora) >= aniversario;
}
