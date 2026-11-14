import { formatPriceBRL, type CervejaCard } from "@leguele/shared";
import { Trash2 } from "lucide-react";
import Image from "next/image";
import { IMAGEM_PADRAO, formatarTeor } from "@/lib/catalogo/formato";
import { Stepper } from "./stepper";
import { StyleBadge } from "./style-badge";

export type LinhaDoResumoProps = {
  item: { cerveja: CervejaCard; quantidade: number };
  /** Recebe a quantidade pedida, mesmo acima do limite: quem usa decide o aviso. */
  aoAlterar: (quantidade: number) => void;
  aoRemover: () => void;
};

/** Uma cerveja no resumo da Geladeira: dados, quantidade, "Remover" e preços. */
export function LinhaDoResumo({ item, aoAlterar, aoRemover }: LinhaDoResumoProps) {
  const { cerveja, quantidade } = item;
  return (
    <li className="flex gap-3 border-b border-borda py-3 text-texto">
      <Image
        src={cerveja.imagemUrl ?? IMAGEM_PADRAO}
        alt=""
        width={56}
        height={80}
        sizes="56px"
        className="h-20 w-14 shrink-0 object-contain"
      />
      <div className="flex min-w-0 flex-1 flex-col gap-1">
        <div>
          <StyleBadge slug={cerveja.categoria.slug} name={cerveja.categoria.nome} />
        </div>
        <p className="font-semibold leading-tight">{cerveja.nome}</p>
        <p className="text-sm text-texto-suave">
          {`${cerveja.estilo} • ${formatarTeor(cerveja.teorAlcoolico)}% • ${cerveja.volumeMl}ml`}
        </p>
        <div className="flex items-center gap-2">
          <Stepper
            valor={quantidade}
            aoAlterar={aoAlterar}
            rotulo={`Quantidade de ${cerveja.nome}`}
          />
          <button
            type="button"
            aria-label={`Remover ${cerveja.nome}`}
            onClick={aoRemover}
            className="flex size-11 items-center justify-center rounded-full text-texto-suave hover:bg-primaria/10 focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-primaria"
          >
            <Trash2 aria-hidden="true" className="size-5" />
          </button>
        </div>
      </div>
      <div className="flex shrink-0 flex-col items-end justify-between text-right">
        <p className="text-sm text-texto-suave">{`${formatPriceBRL(cerveja.precoCentavos)} un.`}</p>
        <p className="text-lg font-bold text-primaria">
          {formatPriceBRL(cerveja.precoCentavos * quantidade)}
        </p>
      </div>
    </li>
  );
}
