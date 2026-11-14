"use client";

import { resumirGeladeira } from "@leguele/shared";
import { useEffect, useState } from "react";
import {
  AvisosDaGeladeira,
  BarraDoResumo,
  BottomSheet,
  MolduraDaGeladeira,
  Skeleton,
  Toast,
} from "@/components/ui";
import type { Desfazer } from "@/lib/geladeira/estado";
import { useTelaLarga } from "@/lib/use-tela-larga";
import { useGeladeira } from "./geladeira-provider";
import { FechamentoDoResumo, LinhasDoResumo } from "./resumo-da-geladeira";

const mensagemDoLimite = (limite: number) =>
  `Só temos ${limite} ${limite === 1 ? "unidade" : "unidades"}`;

/** A Geladeira em prateleiras, uma por categoria, com o resumo: barra e sheet no celular, coluna no desktop. */
export function GeladeiraTela() {
  const { pronta, estado, ajustes, limparAjustes, alterarQuantidade, remover, desfazer } =
    useGeladeira();
  const larga = useTelaLarga();
  // Os avisos valem para esta visita: ao sair da Geladeira, somem.
  useEffect(() => limparAjustes, [limparAjustes]);
  const [sheetAberto, setSheetAberto] = useState(false);
  // Só o toque mais recente tem toast (e pode ser desfeito): um toast novo substitui o anterior.
  const [toast, setToast] = useState<{ mensagem: string; desfazer?: Desfazer } | null>(null);
  const { quantidadeTotal, subtotalCentavos } = resumirGeladeira(estado.itens);
  const comResumo = pronta && estado.itens.length > 0;
  const linhas = (
    <LinhasDoResumo
      itens={estado.itens}
      aoAlterar={(id, quantidade) => {
        const { limite } = alterarQuantidade(id, quantidade);
        if (limite !== undefined) setToast({ mensagem: mensagemDoLimite(limite) });
      }}
      aoRemover={(id) => {
        const nome = estado.itens.find((i) => i.cerveja.id === id)?.cerveja.nome;
        const d = remover(id);
        if (d) setToast({ mensagem: `${nome} saiu da geladeira`, desfazer: d });
      }}
    />
  );
  return (
    <main className="flex h-[calc(100dvh-var(--altura-header-loja)-var(--altura-barra-loja)-env(safe-area-inset-bottom,0px))] flex-col lg:flex-row lg:justify-center lg:gap-8">
      <div className="flex min-h-0 flex-1 flex-col items-center px-4 py-2 lg:aspect-[710/1573] lg:flex-none lg:px-0">
        <h1 className="sr-only">Geladeira</h1>
        <AvisosDaGeladeira ajustes={ajustes} />
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
      {toast ? (
        <Toast
          mensagem={toast.mensagem}
          acao={
            toast.desfazer
              ? { rotulo: "Desfazer", aoAcionar: () => desfazer(toast.desfazer!) }
              : undefined
          }
          aoFechar={() => setToast(null)}
          className="z-[60]"
        />
      ) : null}
    </main>
  );
}
