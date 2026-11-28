"use client";

import { resumirGeladeira, type CervejaCard } from "@leguele/shared";
import { useEffect, useRef, useState } from "react";
import type { ResultadoDoFrete } from "@/app/geladeira/frete";
import {
  AvisosDaGeladeira,
  BarraDoResumo,
  BottomSheet,
  Button,
  MolduraDaGeladeira,
  PRATELEIRAS,
  Skeleton,
  Toast,
} from "@/components/ui";
import type { FreteEstimado } from "@/components/ui";
import type { Desfazer } from "@/lib/geladeira/estado";
import { mensagemDoLimite } from "@/lib/geladeira/estado";
import { useRolavel } from "@/lib/use-rolavel";
import { useTelaLarga } from "@/lib/use-tela-larga";
import { useGeladeira } from "./geladeira-provider";
import { ListaDeAdicionar } from "./lista-de-adicionar";
import { useAdicionarComToast } from "./use-adicionar-com-toast";
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

type Props = {
  cotarFrete?: () => Promise<ResultadoDoFrete>;
  /** Catálogo na ordem de relevância: alimenta a lista de adicionar de cada garrafa fantasma. */
  catalogo?: CervejaCard[];
};

/** A Geladeira em prateleiras, uma por categoria, com o resumo: barra e sheet no celular, coluna no desktop. */
export function GeladeiraTela({ cotarFrete, catalogo = [] }: Props) {
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
  const [areaRef, areaRolavel] = useRolavel<HTMLDivElement>(`${pronta}-${falhouAoBuscar}`);
  // Os avisos valem para esta visita: ao sair da Geladeira, somem.
  useEffect(() => limparAjustes, [limparAjustes]);
  const [sheetAberto, setSheetAberto] = useState(false);
  // Lista de adicionar: a categoria da fantasma tocada (`null` = fechada) e a que recebe o foco ao fechar.
  const [categoriaAberta, setCategoriaAberta] = useState<{ slug: string; nome: string } | null>(
    null,
  );
  const focoDaFaixa = useRef<string | null>(null);
  // Depois de "Tentar de novo" que acerta, o botão some: o foco vai à primeira prateleira.
  const refazendo = useRef(false);
  useEffect(() => {
    if (buscando || !refazendo.current) return;
    refazendo.current = false;
    if (falhouAoBuscar) return;
    document
      .querySelector<HTMLElement>(`[data-titulo-da-prateleira="${PRATELEIRAS[0].slug}"]`)
      ?.focus();
  }, [falhouAoBuscar, buscando]);
  const {
    adicionarComToast,
    toast: toastDeAdicionar,
    limparAviso,
  } = useAdicionarComToast("z-[60]");
  // O foco volta a um elemento que existe: a fantasma tocada some ao adicionar, então vai à faixa.
  useEffect(() => {
    if (categoriaAberta !== null || focoDaFaixa.current === null) return;
    document
      .querySelector<HTMLElement>(`[data-titulo-da-prateleira="${focoDaFaixa.current}"]`)
      ?.focus();
    focoDaFaixa.current = null;
  }, [categoriaAberta]);
  // Só o toque mais recente tem toast (e pode ser desfeito): um toast novo substitui o anterior.
  const [toast, setToast] = useState<{ mensagem: string; desfazer?: Desfazer } | null>(null);
  const { quantidadeTotal, subtotalCentavos } = resumirGeladeira(estado.itens);
  const comResumo = pronta && estado.itens.length > 0;
  const frete = useFreteEstimado(cotarFrete, comResumo, sincronizacoes);
  const removerComToast = (id: string) => {
    limparAviso();
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
        if (limite !== undefined) {
          limparAviso();
          setToast({ mensagem: mensagemDoLimite(limite) });
        }
      }}
      aoRemover={removerComToast}
    />
  );
  return (
    <main className="flex bg-gradient-to-b from-fundo via-superficie to-fundo h-[calc(100dvh-var(--altura-header-loja)-var(--altura-barra-loja)-env(safe-area-inset-bottom,0px))] flex-col lg:flex-row lg:justify-center lg:gap-8">
      <div
        role="region"
        aria-label="Prateleiras da Geladeira"
        ref={areaRef}
        tabIndex={areaRolavel ? 0 : undefined}
        className="flex min-h-0 flex-1 flex-col items-center overflow-y-auto px-4 py-2 outline-offset-[-2px] focus-visible:outline-2 focus-visible:outline-primaria lg:aspect-[710/1573] lg:flex-none lg:overflow-visible lg:px-0"
      >
        <h1 className="sr-only">Geladeira</h1>
        <AvisosDaGeladeira ajustes={ajustes} />
        {falhouAoBuscar ? (
          <div
            role="alert"
            className="flex flex-row flex-wrap items-center justify-center gap-x-3 gap-y-1 py-1 text-center text-sm"
          >
            <p>Não foi possível carregar sua Geladeira agora.</p>
            <Button
              size="sm"
              variant="outline"
              className="w-auto"
              aria-disabled={buscando}
              onClick={() => {
                if (buscando) return;
                refazendo.current = true;
                tentarDeNovo();
              }}
            >
              {buscando ? "Tentando..." : "Tentar de novo"}
            </Button>
          </div>
        ) : null}
        {pronta ? (
          <MolduraDaGeladeira
            itens={estado.itens}
            desatualizada={falhouAoBuscar}
            className="w-[89vw] max-w-[26rem] flex-none lg:min-h-0 lg:w-auto lg:max-w-none lg:flex-1"
            aoAdicionar={(categoria) => setCategoriaAberta(categoria)}
          />
        ) : (
          <>
            <p role="status" className="sr-only">
              Carregando a Geladeira
            </p>
            <Skeleton
              data-testid="esqueleto-da-geladeira"
              className="aspect-[710/1573] w-[89vw] max-w-[26rem] flex-none rounded-2xl lg:min-h-0 lg:w-auto lg:max-w-none lg:flex-1"
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
      <ListaDeAdicionar
        categoria={categoriaAberta}
        cervejas={catalogo}
        aoFechar={() => setCategoriaAberta(null)}
        aoAdicionar={(cerveja) => {
          setToast(null);
          if (adicionarComToast(cerveja)) {
            focoDaFaixa.current = categoriaAberta?.slug ?? null;
            setCategoriaAberta(null);
          }
        }}
      />
      {toastDeAdicionar}
      {sheetComToast ? null : avisoRapido}
    </main>
  );
}
