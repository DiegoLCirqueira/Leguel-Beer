import type { ItemLocal } from "@/lib/geladeira/estado";
import { cn } from "@/lib/utils";
import { IMAGEM_DA_MOLDURA, PrateleiraDaGeladeira } from "./prateleira-da-geladeira";

export type MolduraDaGeladeiraProps = {
  itens: ItemLocal[];
  className?: string;
};

/** As 4 prateleiras da moldura, de cima para baixo (a ordem das categorias do catálogo do MVP). */
export const PRATELEIRAS = [
  { slug: "ipa", nome: "IPA" },
  { slug: "frutas", nome: "Frutas" },
  { slug: "malt", nome: "Malt" },
  { slug: "lager", nome: "Lager" },
] as const;

/** A geladeira de 4 prateleiras, uma por categoria, com a proporção 710 x 1573 da imagem. */
export function MolduraDaGeladeira({ itens, className }: MolduraDaGeladeiraProps) {
  return (
    <div
      className={cn("@container relative overflow-hidden", className)}
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
          categoria={categoria}
          itens={itens.filter((i) => i.cerveja.categoria.slug === categoria.slug)}
        />
      ))}
    </div>
  );
}
