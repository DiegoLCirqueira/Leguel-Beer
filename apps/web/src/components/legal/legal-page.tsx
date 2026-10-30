export type SecaoLegal = { titulo: string; texto: string };

type Props = {
  titulo: string;
  // Data da versão do texto, no formato AAAA-MM-DD.
  atualizadoEm: string;
  secoes: SecaoLegal[];
};

const formatarData = new Intl.DateTimeFormat("pt-BR", { dateStyle: "long", timeZone: "UTC" });

export function LegalPage({ titulo, atualizadoEm, secoes }: Props) {
  return (
    <main className="mx-auto flex min-h-dvh w-full max-w-2xl flex-col gap-6 px-6 pb-12 pt-14 text-texto">
      <header className="flex flex-col gap-2">
        <h1 className="font-titulo text-balance text-3xl">{titulo}</h1>
        <p className="text-sm text-texto-suave">
          Última atualização:{" "}
          <time dateTime={atualizadoEm}>
            {formatarData.format(new Date(`${atualizadoEm}T00:00:00Z`))}
          </time>
        </p>
      </header>
      {secoes.map(({ titulo: tituloSecao, texto }, indice) => (
        <section key={tituloSecao} className="flex flex-col gap-2">
          <h2 className="text-lg font-semibold">{`${indice + 1}. ${tituloSecao}`}</h2>
          <p className="leading-relaxed text-texto-suave">{texto}</p>
        </section>
      ))}
    </main>
  );
}
