"use client";

import { usePathname } from "next/navigation";
import { LojaHeader, ProdutoHeader } from "@/components/ui";
import { useGeladeira } from "./geladeira-provider";

/** Contador real: a soma das unidades, só depois de ler a cópia local (antes, sem número). */
function useContador(): number | undefined {
  const { pronta, quantidadeTotal } = useGeladeira();
  return pronta ? quantidadeTotal : undefined;
}

export function LojaHeaderComContador() {
  const contador = useContador();
  // Só a home tem o logo maior (spec home-topo).
  return <LojaHeader count={contador} grande={usePathname() === "/"} />;
}

export function ProdutoHeaderComContador() {
  return <ProdutoHeader count={useContador()} />;
}
