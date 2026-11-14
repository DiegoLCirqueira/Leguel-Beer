"use client";

import { MolduraDaGeladeira } from "@/components/ui";
import { useGeladeira } from "./geladeira-provider";

/** A Geladeira em prateleiras, uma por categoria, com o que o cliente guardou. */
export function GeladeiraTela() {
  const { estado } = useGeladeira();
  return (
    <main className="flex flex-1 flex-col items-center px-4 pb-2 pt-2">
      <h1 className="sr-only">Geladeira</h1>
      <MolduraDaGeladeira itens={estado.itens} />
    </main>
  );
}
