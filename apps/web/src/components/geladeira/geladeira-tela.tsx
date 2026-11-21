"use client";

import { resumirGeladeira } from "@leguele/shared";
import { useEffect, useState } from "react";
import type { ResultadoDoFrete } from "@/app/geladeira/frete";
import {
  AvisosDaGeladeira,
  BarraDoResumo,
  BottomSheet,
  Button,
  MolduraDaGeladeira,
  Skeleton,
  Toast,
} from "@/components/ui";
import type { FreteEstimado } from "@/components/ui";
import type { Desfazer } from "@/lib/geladeira/estado";
import { mensagemDoLimite } from "@/lib/geladeira/estado";
import { useTelaLarga } from "@/lib/use-tela-larga";
import { useGeladeira } from "./geladeira-provider";
import { FechamentoDoResumo, LinhasDoResumo } from "./resumo-da-geladeira";

/**
 * Frete estimado pelo endereço padrão da conta (a API cota; aqui só se mostra). Sem a ação, sem
 * sessão ou sem endereço, fica `undefined` e o resumo pede o endereço. A API cota com a Geladeira da
 * conta, então só cota de novo quando a conta recebe a mudança (`sincronizacoes`), nunca antes.
 */
function useFreteEstimado(
  cotarFrete: (() => Promise<ResultadoDoFrete>) | undefined,
  ativo: boolean,
  sincronizacoes: number,
) {
  const [frete, setFrete] = useState<FreteEstimado>();
  useEffect(() => {
    if (!cotarFrete || !ativo) return;
    let vigente = true;
    cotarFrete()
      .then((resultado) => {
        if (vigente) setFrete(resultado.tipo === "frete" ? resultado.frete : undefined);
      })
      .catch(() => {
        if (vigente) setFrete({ tipo: "indisponivel" });
      });
    return () => {
      vigente = false;
    };
  }, [cotarFrete, ativo, sincronizacoes]);
  return frete;
}

type Props = { cotarFrete?: () => Promise<ResultadoDoFrete> };

/** A Geladeira em prateleiras, uma por categoria, com o resumo: barra e sheet no celular, coluna no desktop. */
export function GeladeiraTela({ cotarFrete }: Props) {
  const {
    pronta,
    estado,
    sincronizacoes,
    falhouAoBuscar,
    buscando,
    tentarDeNovo,
    ajustes,
    limparAjustes,
    alterarQuantidade,
    remover,
    desfazer,
  } = useGeladeira();
  const larga = useTelaLarga();
  // Os avisos valem para esta visita: ao sair da Geladeira, somem.
  useEffect(() => limparAjustes, [limparAjustes]);
  const [sheetAberto, setSheetAberto] = useState(false);
  // Só o toque mais recente tem toast (e pode ser desfeito): um toast novo substitui o anterior.
  const [toast, setToast] = useState<{ mensagem: string; desfazer?: Desfazer } | null>(null);
  const { quantidadeTotal, subtotalCentavos } = resumirGeladeira(estado.itens);
  const comResumo = pronta && estado.itens.length > 0;
  const frete = useFreteEstimado(cotarFrete, comResumo, sincronizacoes);
  const removerComToast = (id: string) => {
    const nome = estado.itens.find((i) => i.cerveja.id === id)?.cerveja.nome;
    const d = remover(id);
    if (d) setToast({ mensagem: `${nome} saiu da geladeira`, desfazer: d });
  };
  const avisoRapido = toast ? (
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
  ) : null;
  // Com o sheet aberto o foco fica preso nele: o toast entra no sheet para o "Desfazer" ter foco.
  const sheetComToast = comResumo && !larga && sheetAberto;
  const linhas = (
    <LinhasDoResumo
      itens={estado.itens}
      aoAlterar={(id, quantidade) => {
        // "−" com 1 unidade pede 0: a cerveja sai, como em "Remover".
        if (quantidade < 1) return removerComToast(id);
        const { limite } = alterarQuantidade(id, quantidade);
        if (limite !== undefined) setToast({ mensagem: mensagemDoLimite(limite) });
      }}
      aoRemover={removerComToast}
    />
  );
  return (
    <main className="flex h-[calc(100dvh-var(--altura-header-loja)-var(--altura-barra-loja)-env(safe-area-inset-bottom,0px))] flex-col lg:flex-row lg:justify-center lg:gap-8">
      <div className="flex min-h-0 flex-1 flex-col items-center px-4 py-2 lg:aspect-[710/1573] lg:flex-none lg:px-0">
        <h1 className="sr-only">Geladeira</h1>
        <AvisosDaGeladeira ajustes={ajustes} />
        {falhouAoBuscar ? (
          <div role="alert" className="flex flex-col items-center gap-2 py-2 text-center text-sm">
            <p>Não foi possível carregar sua Geladeira agora.</p>
            <Button
              size="sm"
              variant="outline"
              className="w-auto"
              disabled={buscando}
              onClick={tentarDeNovo}
            >
              {buscando ? "Tentando..." : "Tentar de novo"}
            </Button>
          </div>
        ) : null}
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
          <FechamentoDoResumo itens={estado.itens} frete={frete} />
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
            rodape={<FechamentoDoResumo itens={estado.itens} frete={frete} />}
          >
            {linhas}
            {avisoRapido}
          </BottomSheet>
        </>
      ) : null}
      {sheetComToast ? null : avisoRapido}
    </main>
  );
}
