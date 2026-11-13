import type { ItemLocal } from "@/lib/geladeira/estado";

export type PrateleiraDaGeladeiraProps = {
  /** Posição da prateleira na moldura, de 0 (em cima) a 3. */
  indice: number;
  categoria: { slug: string; nome: string };
  /** Só os itens desta categoria, na ordem de entrada. */
  itens: ItemLocal[];
};

/** Uma prateleira da moldura: garrafas, garrafas fantasma e a faixa sobre o parapeito. */
export function PrateleiraDaGeladeira(_props: PrateleiraDaGeladeiraProps) {
  return null;
}
