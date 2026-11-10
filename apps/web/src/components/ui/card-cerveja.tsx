"use client";

import { formatPriceBRL, type CervejaCard } from "@leguele/shared";
import { PackageX, Plus, Refrigerator } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useId } from "react";
import { cn } from "@/lib/utils";
import { Button } from "./button";
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
export function CardCerveja({ cerveja, aoAdicionar, className }: CardCervejaProps) {
  const idMotivo = useId();
  const { nome, estilo, categoria, teorAlcoolico, volumeMl, precoCentavos, imagemUrl, esgotada } =
    cerveja;
  const podeAdicionar = Boolean(aoAdicionar) && !esgotada;
  return (
    <article
      className={cn(
        "relative flex flex-col gap-2 rounded-3xl border border-borda bg-superficie/70 p-3 text-texto",
        className,
      )}
    >
      <div className="relative flex h-40 items-center justify-center">
        <div className="absolute left-0 top-0">
          <StyleBadge slug={categoria.slug} name={categoria.nome} />
        </div>
        {esgotada ? (
          <span className="absolute right-0 top-1/3 inline-flex items-center gap-1 rounded-full border-2 border-erro bg-fundo px-3 py-1 text-sm font-semibold text-erro">
            <PackageX aria-hidden="true" className="size-4" />
            Esgotado
          </span>
        ) : null}
        <Image
          src={imagemUrl ?? IMAGEM_PADRAO}
          alt={imagemUrl ? `${nome}, ${estilo}` : ""}
          width={160}
          height={160}
          sizes="160px"
          className="h-36 w-auto object-contain"
        />
      </div>
      <h3 className="text-lg font-semibold leading-tight">
        {/* O link cobre o card todo (after:inset-0); o botão Adicionar fica acima dele (z-10). */}
        <Link
          href={`/catalogo/${cerveja.slug}`}
          className="after:absolute after:inset-0 after:rounded-3xl focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primaria"
        >
          {nome}
        </Link>
      </h3>
      <p className="text-sm text-texto-suave">{`${estilo} • ${teor(teorAlcoolico)}% • ${volumeMl}ml`}</p>
      <p className="text-xl font-bold text-primaria">{formatPriceBRL(precoCentavos)}</p>
      <Button
        className="relative z-10"
        disabled={!podeAdicionar}
        onClick={aoAdicionar}
        aria-describedby={podeAdicionar ? undefined : idMotivo}
        iconLeft={
          <>
            <Plus aria-hidden="true" className="size-4" />
            <Refrigerator aria-hidden="true" className="size-5" />
          </>
        }
      >
        Adicionar
      </Button>
      {podeAdicionar ? null : (
        <span id={idMotivo} className="sr-only">
          {esgotada ? "Cerveja esgotada." : "A Geladeira ainda não está disponível."}
        </span>
      )}
    </article>
  );
}
