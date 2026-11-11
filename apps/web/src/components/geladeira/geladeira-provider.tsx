"use client";

import type { CervejaCard } from "@leguele/shared";
import { createContext, useContext, type ReactNode } from "react";
import type { Desfazer, EstadoDaGeladeira, Resultado } from "@/lib/geladeira/estado";

export type GeladeiraContexto = {
  /** `false` até ler a cópia local: o contador só aparece depois, para o HTML não divergir. */
  pronta: boolean;
  estado: EstadoDaGeladeira;
  quantidadeTotal: number;
  adicionar: (cerveja: CervejaCard, quantidade?: number) => Resultado;
  alterarQuantidade: (cervejaId: string, quantidade: number) => Resultado;
  remover: (cervejaId: string) => Desfazer | null;
  desfazer: (d: Desfazer) => void;
};

const Contexto = createContext<GeladeiraContexto | null>(null);

export function useGeladeira(): GeladeiraContexto {
  const contexto = useContext(Contexto);
  if (!contexto) throw new Error("useGeladeira precisa estar dentro do GeladeiraProvider.");
  return contexto;
}

export function GeladeiraProvider({ children }: { children: ReactNode }) {
  void Contexto;
  return children;
}
