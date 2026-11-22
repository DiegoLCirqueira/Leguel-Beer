"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useSyncExternalStore } from "react";
import { useGeladeira } from "@/components/geladeira/geladeira-provider";
import { AvisoDePortfolio, Button, buttonVariants } from "@/components/ui";
import {
  assinarEstadoDoCheckout,
  estadoDoCheckoutBruto,
  gravarEstadoDoCheckout,
  lerEstadoDoCheckout,
} from "@/lib/checkout/estado";
import { EtapasDoCheckout } from "./etapas-do-checkout";

type Props = {
  /** Ids dos endereços da conta: o guardado na aba só vale se estiver aqui (a API é quem autoriza). */
  enderecoIds: string[];
  /** Tela da etapa seguinte; sem ela (ainda não existe), "Continuar para revisão" fica desabilitado. */
  destinoDaRevisao?: string;
};

/** Etapa Pagamento do checkout (tela 06): só a escolha da forma; nada é cobrado (ADR-020). */
export function EtapaPagamento({ enderecoIds, destinoDaRevisao }: Props) {
  const { pronta, resolvida, estado } = useGeladeira();
  const roteador = useRouter();
  // Só lido no navegador: no servidor é vazio, e o HTML não diverge na hidratação.
  const guardado = useSyncExternalStore(assinarEstadoDoCheckout, estadoDoCheckoutBruto, () => null);
  const enderecoGuardado = guardado ? lerEstadoDoCheckout().enderecoId : undefined;
  const semEndereco = pronta && !(enderecoGuardado && enderecoIds.includes(enderecoGuardado));
  // Vazia só depois de a conta responder: antes, a cópia local vazia pode ser só outro aparelho.
  const vazia = pronta && resolvida && estado.itens.length === 0;
  // Não dá para pular etapas pela URL: sem Geladeira ou sem endereço da conta, volta atrás.
  useEffect(() => {
    if (vazia) roteador.replace("/geladeira");
    else if (semEndereco) roteador.replace("/checkout");
  }, [vazia, semEndereco, roteador]);

  return (
    <main className="mx-auto flex w-full max-w-md flex-1 flex-col gap-4 px-4 pb-6 pt-2 text-texto">
      <h1 className="font-titulo text-4xl">Finalizar pedido</h1>
      <EtapasDoCheckout atual={1} />
      <AvisoDePortfolio />
      <fieldset className="flex flex-col gap-3">
        <legend className="mb-2 text-lg font-semibold">Forma de pagamento</legend>
        <label className="flex min-h-11 cursor-pointer gap-3 rounded-2xl border border-primaria bg-superficie p-4 has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-primaria">
          <input
            type="radio"
            name="forma-de-pagamento"
            value="pix"
            checked
            readOnly
            className="mt-1 size-5 shrink-0 accent-primaria"
          />
          <span className="flex flex-col gap-1 text-sm">
            <span className="text-base font-semibold">Pix</span>
            <span className="text-texto-suave">
              O QR code de demonstração aparece depois de confirmar o pedido.
            </span>
          </span>
        </label>
      </fieldset>
      <div className="flex flex-col gap-2">
        {destinoDaRevisao ? (
          <Link
            href={destinoDaRevisao}
            onClick={() =>
              gravarEstadoDoCheckout({ ...lerEstadoDoCheckout(), pagamento: { tipo: "pix" } })
            }
            className={buttonVariants({ variant: "primary" })}
          >
            Continuar para revisão
          </Link>
        ) : (
          <Button disabled>Continuar para revisão</Button>
        )}
        <Link href="/checkout" className={buttonVariants({ variant: "outline" })}>
          Voltar
        </Link>
      </div>
    </main>
  );
}
