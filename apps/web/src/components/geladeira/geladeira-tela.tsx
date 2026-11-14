"use client";

import { MolduraDaGeladeira, Skeleton } from "@/components/ui";
import { useGeladeira } from "./geladeira-provider";

/** A Geladeira em prateleiras, uma por categoria, com o que o cliente guardou. */
export function GeladeiraTela() {
  const { pronta, estado } = useGeladeira();
  return (
    <main className="flex flex-1 flex-col items-center px-4 pb-2 pt-2">
      <h1 className="sr-only">Geladeira</h1>
      {pronta ? (
        <MolduraDaGeladeira itens={estado.itens} />
      ) : (
        <>
          <p role="status" className="sr-only">
            Carregando a Geladeira
          </p>
          <Skeleton className="aspect-[710/1573] w-full max-w-xs rounded-2xl" />
        </>
      )}
    </main>
  );
}
