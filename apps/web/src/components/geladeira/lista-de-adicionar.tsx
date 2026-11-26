"use client";

import type { CervejaCard } from "@leguele/shared";

export type ListaDeAdicionarProps = {
  categoria: { slug: string; nome: string } | null;
  cervejas: CervejaCard[];
  aoFechar: () => void;
  aoAdicionar: (cerveja: CervejaCard) => void;
};

export function ListaDeAdicionar(_props: ListaDeAdicionarProps) {
  return null;
}
