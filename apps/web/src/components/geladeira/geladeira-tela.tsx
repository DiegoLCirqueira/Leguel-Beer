"use client";

import { MolduraDaGeladeira, Skeleton } from "@/components/ui";
import { useGeladeira } from "./geladeira-provider";

/** A Geladeira em prateleiras, uma por categoria, com o que o cliente guardou. */
export function GeladeiraTela() {
  const { pronta, estado } = useGeladeira();
  return (
    <main className="flex h-[calc(100dvh-var(--altura-header-loja)-var(--altura-barra-loja)-env(safe-area-inset-bottom,0px))] flex-col items-center px-4 py-2">
      <h1 className="sr-only">Geladeira</h1>
      {pronta ? (
        <MolduraDaGeladeira itens={estado.itens} className="min-h-0 flex-1" />
      ) : (
        <>
          <p role="status" className="sr-only">
            Carregando a Geladeira
          </p>
          <Skeleton
            data-testid="esqueleto-da-geladeira"
            className="aspect-[710/1573] min-h-0 flex-1 rounded-2xl"
          />
        </>
      )}
    </main>
  );
}
