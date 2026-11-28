import type { ItemLocal } from "@/lib/geladeira/estado";
import { cn } from "@/lib/utils";
import {
  IMAGEM_DA_MOLDURA,
  PrateleiraDaGeladeira,
  type PrateleiraDaGeladeiraProps,
} from "./prateleira-da-geladeira";

export type MolduraDaGeladeiraProps = {
  itens: ItemLocal[];
  className?: string;
  /** A conta não respondeu: o que se vê pode estar velho, então aparece esmaecido. */
  desatualizada?: boolean;
  /** Toque numa garrafa fantasma (abre a lista de adicionar da categoria). */
  aoAdicionar?: PrateleiraDaGeladeiraProps["aoAdicionar"];
};

/** As 4 prateleiras da moldura, de cima para baixo (a ordem das categorias do catálogo do MVP). */
export const PRATELEIRAS = [
  { slug: "ipa", nome: "IPA" },
  { slug: "frutas", nome: "Frutas" },
  { slug: "malt", nome: "Malt" },
  { slug: "lager", nome: "Lager" },
] as const;

/** A geladeira de 4 prateleiras, uma por categoria, com a proporção 710 x 1573 da imagem. */
export function MolduraDaGeladeira({
  itens,
  className,
  desatualizada,
  aoAdicionar,
}: MolduraDaGeladeiraProps) {
  return (
    <div
      data-desatualizada={desatualizada ? "" : undefined}
      className={cn(
        "@container relative overflow-hidden",
        desatualizada && "opacity-60",
        className,
      )}
      style={{
        aspectRatio: "710 / 1573",
        backgroundImage: `url(${IMAGEM_DA_MOLDURA})`,
        backgroundSize: "100% 100%",
      }}
    >
      {PRATELEIRAS.map((categoria, indice) => (
        <PrateleiraDaGeladeira
          key={categoria.slug}
          indice={indice}
          aoAdicionar={aoAdicionar}
          categoria={categoria}
          itens={itens.filter((i) => i.cerveja.categoria.slug === categoria.slug)}
        />
      ))}
      <span
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-[88.5%] z-45 -translate-y-1/2 text-center font-titulo text-[8cqw] leading-none text-primaria"
        style={{
          textShadow:
            "0 0 0.15em color-mix(in oklab, var(--color-primaria) 80%, transparent), 0 0 0.5em color-mix(in oklab, var(--color-primaria) 45%, transparent)",
        }}
      >
        Leguelé Beer
      </span>
    </div>
  );
}
