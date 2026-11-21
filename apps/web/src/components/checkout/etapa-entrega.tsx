"use client";

import { resumirGeladeira, type EnderecoResposta } from "@leguele/shared";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState, useSyncExternalStore } from "react";
import type { ResultadoDoFrete } from "@/app/geladeira/frete";
import { useGeladeira } from "@/components/geladeira/geladeira-provider";
import { Button, buttonVariants, OpcaoDeEndereco, TotaisDoResumo } from "@/components/ui";
import type { FreteEstimado } from "@/components/ui";
import {
  assinarEstadoDoCheckout,
  estadoDoCheckoutBruto,
  gravarEstadoDoCheckout,
  lerEstadoDoCheckout,
} from "@/lib/checkout/estado";
import { EtapasDoCheckout } from "./etapas-do-checkout";
import { textoDosItens } from "@/components/ui/totais-do-resumo";

type Props = {
  enderecos: EnderecoResposta[];
  cotarFrete: (enderecoId: string) => Promise<ResultadoDoFrete>;
  /** Tela da etapa seguinte; sem ela (ainda não existe), "Continuar" fica desabilitado. */
  destinoDoPagamento?: string;
};

/** Endereço pré-selecionado: o padrão, ou o primeiro da lista. */
const inicial = (enderecos: EnderecoResposta[]) =>
  (enderecos.find((e) => e.padrao) ?? enderecos[0])?.id;

/** Frete do endereço escolhido; `undefined` enquanto a cotação não volta. A API cota, o site mostra. */
function useFreteDoEndereco(
  enderecoId: string | undefined,
  cotarFrete: Props["cotarFrete"],
  /** Só cota com a Geladeira pronta e de novo quando a conta a recebe: a API cota com a da conta. */
  ativo: boolean,
  sincronizacoes: number,
): FreteEstimado | undefined {
  const [cotado, setCotado] = useState<{ id: string; frete: FreteEstimado }>();
  useEffect(() => {
    if (!enderecoId || !ativo) return;
    let vigente = true;
    cotarFrete(enderecoId)
      .then((r) => {
        if (vigente)
          setCotado({
            id: enderecoId,
            frete: r.tipo === "frete" ? r.frete : { tipo: "indisponivel" },
          });
      })
      .catch(() => {
        if (vigente) setCotado({ id: enderecoId, frete: { tipo: "indisponivel" } });
      });
    return () => {
      vigente = false;
    };
  }, [enderecoId, cotarFrete, ativo, sincronizacoes]);
  return cotado && cotado.id === enderecoId ? cotado.frete : undefined;
}

/** Etapa Entrega do checkout (telas 05 e 29): escolher o endereço e ver o frete antes de pagar. */
export function EtapaEntrega({ enderecos, cotarFrete, destinoDoPagamento }: Props) {
  const { pronta, resolvida, falhouAoBuscar, buscando, tentarDeNovo, estado, sincronizacoes } =
    useGeladeira();
  const roteador = useRouter();
  // O que o cliente escolheu antes (voltou de Pagamento): só lido no navegador, para o HTML não divergir.
  const guardado = useSyncExternalStore(assinarEstadoDoCheckout, estadoDoCheckoutBruto, () => null);
  const lembrado = guardado ? lerEstadoDoCheckout().enderecoId : undefined;
  const [escolha, setEscolhido] = useState<string>();
  const escolhido =
    escolha ?? (enderecos.some((e) => e.id === lembrado) ? lembrado : inicial(enderecos));
  // Vazia só depois de a conta responder: antes, a cópia local vazia pode ser só outro aparelho.
  const decidida = pronta && resolvida;
  const vazia = decidida && estado.itens.length === 0;
  const frete = useFreteDoEndereco(escolhido, cotarFrete, decidida && !vazia, sincronizacoes);
  // Antes de ler a cópia local (`pronta`) a contagem é a do servidor, vazia: o HTML não diverge na hidratação.
  const { quantidadeTotal, subtotalCentavos } = resumirGeladeira(pronta ? estado.itens : []);
  const podeContinuar =
    !vazia &&
    destinoDoPagamento !== undefined &&
    (frete?.tipo === "valor" || frete?.tipo === "gratis");
  // Geladeira vazia (ou esvaziada pelos ajustes): não há o que fechar, volta à Geladeira.
  useEffect(() => {
    if (vazia) roteador.replace("/geladeira");
  }, [vazia, roteador]);

  return (
    <main className="mx-auto flex w-full max-w-md flex-1 flex-col gap-4 px-4 pb-6 pt-2 text-texto">
      <h1 className="font-titulo text-4xl">Finalizar pedido</h1>
      <EtapasDoCheckout atual={0} />
      <p className="flex items-center justify-between gap-2 text-sm">
        <span>{`${textoDosItens(quantidadeTotal)} na sua geladeira`}</span>
        <Link
          href="/geladeira"
          className="font-semibold text-primaria underline underline-offset-2"
        >
          Ver resumo
        </Link>
      </p>

      {falhouAoBuscar ? (
        <div role="alert" className="flex flex-col items-start gap-3">
          <p>Não foi possível carregar sua Geladeira agora.</p>
          <Button variant="outline" disabled={buscando} onClick={tentarDeNovo}>
            {buscando ? "Tentando..." : "Tentar de novo"}
          </Button>
        </div>
      ) : enderecos.length === 0 ? (
        <div className="flex flex-col gap-3">
          <p>Cadastre um endereço para continuar.</p>
          <Link href="/conta/enderecos/novo" className={buttonVariants({ variant: "primary" })}>
            Adicionar endereço
          </Link>
        </div>
      ) : (
        <>
          <fieldset className="flex flex-col gap-3">
            <legend className="mb-2 text-lg font-semibold">Endereço de entrega</legend>
            <ul className="flex flex-col gap-3">
              {enderecos.map((endereco) => (
                <OpcaoDeEndereco
                  key={endereco.id}
                  endereco={endereco}
                  grupo="endereco-de-entrega"
                  selecionado={endereco.id === escolhido}
                  aoEscolher={setEscolhido}
                />
              ))}
            </ul>
          </fieldset>
          <Link
            href="/conta/enderecos/novo"
            className="inline-flex min-h-11 items-center font-semibold text-primaria underline underline-offset-2"
          >
            Adicionar novo endereço
          </Link>
          <TotaisDoResumo
            quantidadeTotal={quantidadeTotal}
            subtotalCentavos={subtotalCentavos}
            frete={frete}
          />
          {frete?.tipo === "fora-da-area" ? (
            <div className="flex flex-col gap-2">
              <Link href="/conta/enderecos" className={buttonVariants({ variant: "primary" })}>
                Alterar endereço
              </Link>
              <Link href="/catalogo" className={buttonVariants({ variant: "outline" })}>
                Voltar ao catálogo
              </Link>
            </div>
          ) : null}
          {podeContinuar ? (
            <Link
              href={destinoDoPagamento!}
              onClick={() =>
                gravarEstadoDoCheckout({ ...lerEstadoDoCheckout(), enderecoId: escolhido })
              }
              className={buttonVariants({ variant: "primary" })}
            >
              Continuar para pagamento
            </Link>
          ) : (
            <Button disabled>Continuar para pagamento</Button>
          )}
        </>
      )}
    </main>
  );
}
