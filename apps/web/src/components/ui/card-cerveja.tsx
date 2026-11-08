import { formatPriceBRL, type CervejaCard } from "@leguele/shared";
import Image from "next/image";
import { cn } from "@/lib/utils";
import { StyleBadge } from "./style-badge";

export type CardCervejaProps = {
  cerveja: CervejaCard;
  aoAdicionar?: () => void;
  className?: string;
};

// Sem imagemUrl o card usa uma imagem padrão (a marca); as imagens por categoria vêm do LB-124.
const IMAGEM_PADRAO = "/maioridade/logo.webp";

const teor = (valor: number) =>
  new Intl.NumberFormat("pt-BR", { minimumFractionDigits: 1, maximumFractionDigits: 1 }).format(
    valor,
  );

/** Card de cerveja da grade do catálogo e da home: imagem, nome, estilo, preço e ação. */
export function CardCerveja({ cerveja, className }: CardCervejaProps) {
  const { nome, estilo, categoria, teorAlcoolico, volumeMl, precoCentavos, imagemUrl } = cerveja;
  return (
    <article
      className={cn(
        "flex flex-col gap-2 rounded-3xl border border-borda bg-superficie/70 p-3 text-texto",
        className,
      )}
    >
      <div className="relative flex h-40 items-center justify-center">
        <div className="absolute left-0 top-0">
          <StyleBadge slug={categoria.slug} name={categoria.nome} />
        </div>
        <Image
          src={imagemUrl ?? IMAGEM_PADRAO}
          alt={imagemUrl ? `${nome}, ${estilo}` : ""}
          width={160}
          height={160}
          sizes="160px"
          className="h-36 w-auto object-contain"
        />
      </div>
      <h3 className="text-lg font-semibold leading-tight">{nome}</h3>
      <p className="text-sm text-texto-suave">{`${estilo} • ${teor(teorAlcoolico)}% • ${volumeMl}ml`}</p>
      <p className="text-xl font-bold text-primaria">{formatPriceBRL(precoCentavos)}</p>
    </article>
  );
}
