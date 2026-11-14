"use client";

import { resumirGeladeira } from "@leguele/shared";
import { useState } from "react";
import { BarraDoResumo, BottomSheet, MolduraDaGeladeira, Skeleton } from "@/components/ui";
import { useTelaLarga } from "@/lib/use-tela-larga";
import { useGeladeira } from "./geladeira-provider";
import { FechamentoDoResumo, LinhasDoResumo } from "./resumo-da-geladeira";

/** A Geladeira em prateleiras, uma por categoria, com o resumo: barra e sheet no celular, coluna no desktop. */
export function GeladeiraTela() {
  const { pronta, estado, alterarQuantidade, remover } = useGeladeira();
  const larga = useTelaLarga();
  const [sheetAberto, setSheetAberto] = useState(false);
  const { quantidadeTotal, subtotalCentavos } = resumirGeladeira(estado.itens);
  const comResumo = pronta && estado.itens.length > 0;
  const linhas = (
    <LinhasDoResumo
      itens={estado.itens}
      aoAlterar={(id, quantidade) => void alterarQuantidade(id, quantidade)}
      aoRemover={(id) => void remover(id)}
    />
  );
  return (
    <main className="flex h-[calc(100dvh-var(--altura-header-loja)-var(--altura-barra-loja)-env(safe-area-inset-bottom,0px))] flex-col lg:flex-row lg:justify-center lg:gap-8">
      <div className="flex min-h-0 flex-1 flex-col items-center px-4 py-2 lg:flex-none">
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
      </div>
      {comResumo && larga ? (
        <aside aria-label="Resumo da Geladeira" className="w-96 shrink-0 overflow-y-auto px-4 py-2">
          {linhas}
          <FechamentoDoResumo itens={estado.itens} />
        </aside>
      ) : null}
      {comResumo && !larga ? (
        <>
          <BarraDoResumo
            quantidadeTotal={quantidadeTotal}
            subtotalCentavos={subtotalCentavos}
            aoVerResumo={() => setSheetAberto(true)}
          />
          <BottomSheet
            aberto={sheetAberto}
            aoFechar={() => setSheetAberto(false)}
            titulo="Resumo da Geladeira"
            rodape={<FechamentoDoResumo itens={estado.itens} />}
          >
            {linhas}
          </BottomSheet>
        </>
      ) : null}
    </main>
  );
}
