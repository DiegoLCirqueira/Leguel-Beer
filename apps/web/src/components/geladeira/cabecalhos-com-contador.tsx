"use client";

import { LojaHeader, ProdutoHeader } from "@/components/ui";
import { useGeladeira } from "./geladeira-provider";

/** Contador real: a soma das unidades, só depois de ler a cópia local (antes, sem número). */
function useContador(): number | undefined {
  const { pronta, quantidadeTotal } = useGeladeira();
  return pronta ? quantidadeTotal : undefined;
}

export function LojaHeaderComContador() {
  return <LojaHeader count={useContador()} />;
}

export function ProdutoHeaderComContador() {
  return <ProdutoHeader count={useContador()} />;
}
