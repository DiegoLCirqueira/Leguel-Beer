import type { AjusteDaGeladeira } from "@leguele/shared";

const textoDoAviso = (ajuste: AjusteDaGeladeira) => {
  switch (ajuste.tipo) {
    case "preco-mudou":
      return `O preço de ${ajuste.nome} mudou`;
    case "indisponivel":
      return `${ajuste.nome ?? "Uma cerveja"} não está mais disponível`;
    case "quantidade-reduzida":
      return `A quantidade de ${ajuste.nome} foi ajustada para ${ajuste.quantidadeAtual}`;
  }
};

/** Avisos do que o servidor ajustou (preço, disponibilidade, quantidade): região de status no topo da Geladeira. */
export function AvisosDaGeladeira({ ajustes }: { ajustes: AjusteDaGeladeira[] }) {
  return (
    <div role="status" className="w-full">
      {ajustes.length > 0 ? (
        <ul className="flex flex-col gap-1 rounded-xl border border-primaria/60 bg-superficie px-3 py-2 text-sm font-semibold text-texto">
          {ajustes.map((ajuste) => (
            <li key={`${ajuste.tipo}-${ajuste.cervejaId}`}>{textoDoAviso(ajuste)}</li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}
