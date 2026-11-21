import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { cotarFreteDoEnderecoAction } from "@/app/geladeira/frete";
import { EtapaEntrega } from "@/components/checkout/etapa-entrega";
import { lerTokenDeAcesso } from "@/lib/auth/servidor";
import { buscarEnderecos } from "@/lib/enderecos/buscar";

export const metadata: Metadata = {
  title: "Finalizar pedido | Leguelé Beer",
  robots: { index: false },
};

const IR_ENTRAR = "/entrar?retorno=%2Fcheckout";

/** Checkout, etapa Entrega: exige conta; quem autoriza é a API, o site só mostra. */
export default async function Checkout() {
  const token = await lerTokenDeAcesso();
  if (!token) redirect(IR_ENTRAR);
  const resultado = await buscarEnderecos(token);
  if (resultado.tipo === "sem-sessao") redirect(IR_ENTRAR);

  if (resultado.tipo === "erro") {
    return (
      <main className="mx-auto flex w-full max-w-md flex-1 flex-col gap-4 px-4 pb-6 pt-2 text-texto">
        <h1 className="font-titulo text-4xl">Finalizar pedido</h1>
        <div role="alert" className="flex flex-col items-center gap-3 py-8 text-center">
          <p>Não foi possível carregar seus endereços agora.</p>
          <Link
            href="/checkout"
            className="inline-flex min-h-11 items-center font-semibold text-primaria underline underline-offset-2"
          >
            Tentar de novo
          </Link>
        </div>
      </main>
    );
  }

  return <EtapaEntrega enderecos={resultado.enderecos} cotarFrete={cotarFreteDoEnderecoAction} />;
}
