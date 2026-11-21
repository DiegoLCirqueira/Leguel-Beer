"use client";

import { resumirGeladeira, type EnderecoResposta } from "@leguele/shared";
import Link from "next/link";
import { useEffect, useState } from "react";
import type { ResultadoDoFrete } from "@/app/geladeira/frete";
import { useGeladeira } from "@/components/geladeira/geladeira-provider";
import { Button, buttonVariants, OpcaoDeEndereco, TotaisDoResumo } from "@/components/ui";
import type { FreteEstimado } from "@/components/ui";
import { textoDosItens } from "@/components/ui/totais-do-resumo";

type Props = {
  enderecos: EnderecoResposta[];
  cotarFrete: (enderecoId: string) => Promise<ResultadoDoFrete>;
};

const ETAPAS = ["Entrega", "Pagamento", "Revisão"];

/** Endereço pré-selecionado: o padrão, ou o primeiro da lista. */
const inicial = (enderecos: EnderecoResposta[]) =>
  (enderecos.find((e) => e.padrao) ?? enderecos[0])?.id;

/** Frete do endereço escolhido; `undefined` enquanto a cotação não volta. A API cota, o site mostra. */
function useFreteDoEndereco(
  enderecoId: string | undefined,
  cotarFrete: Props["cotarFrete"],
): FreteEstimado | undefined {
  const [cotado, setCotado] = useState<{ id: string; frete: FreteEstimado }>();
  useEffect(() => {
    if (!enderecoId) return;
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
  }, [enderecoId, cotarFrete]);
  return cotado && cotado.id === enderecoId ? cotado.frete : undefined;
}

/** Etapa Entrega do checkout (telas 05 e 29): escolher o endereço e ver o frete antes de pagar. */
export function EtapaEntrega({ enderecos, cotarFrete }: Props) {
  const { estado } = useGeladeira();
  const [escolhido, setEscolhido] = useState(() => inicial(enderecos));
  const frete = useFreteDoEndereco(escolhido, cotarFrete);
  const { quantidadeTotal, subtotalCentavos } = resumirGeladeira(estado.itens);
  const podeContinuar = frete?.tipo === "valor" || frete?.tipo === "gratis";

  return (
    <main className="mx-auto flex w-full max-w-md flex-1 flex-col gap-4 px-4 pb-6 pt-2 text-texto">
      <h1 className="font-titulo text-4xl">Finalizar pedido</h1>
      <ol aria-label="Etapas do pedido" className="flex gap-2 text-sm">
        {ETAPAS.map((etapa, i) => (
          <li
            key={etapa}
            aria-current={i === 0 ? "step" : undefined}
            className={i === 0 ? "font-semibold text-primaria" : "text-texto-suave"}
          >
            {i + 1}. {etapa}
          </li>
        ))}
      </ol>
      <p className="flex items-center justify-between gap-2 text-sm">
        <span>{`${textoDosItens(quantidadeTotal)} na sua geladeira`}</span>
        <Link
          href="/geladeira"
          className="font-semibold text-primaria underline underline-offset-2"
        >
          Ver resumo
        </Link>
      </p>

      {enderecos.length === 0 ? (
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
            <Link href="/checkout/pagamento" className={buttonVariants({ variant: "primary" })}>
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
