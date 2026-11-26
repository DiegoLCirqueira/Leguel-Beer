import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { EtapaPagamento } from "@/components/checkout/etapa-pagamento";
import { lerTokenDeAcesso } from "@/lib/auth/servidor";
import { buscarEnderecos } from "@/lib/enderecos/buscar";

export const metadata: Metadata = {
  title: "Pagamento | Leguelé Beer",
  robots: { index: false },
};

const IR_ENTRAR = "/entrar?retorno=%2Fcheckout%2Fpagamento";

/** Checkout, etapa Pagamento: exige conta; só registra a escolha (nada é cobrado). */
export default async function Pagamento() {
  const token = await lerTokenDeAcesso();
  if (!token) redirect(IR_ENTRAR);
  // Os endereços da conta: o endereço guardado na aba só vale se for um deles.
  const resultado = await buscarEnderecos(token);
  if (resultado.tipo === "sem-sessao") redirect(IR_ENTRAR);

  if (resultado.tipo === "erro") {
    return (
      <main className="mx-auto flex w-full max-w-md flex-1 flex-col gap-4 px-4 pb-6 pt-2 text-texto">
        <h1 className="font-titulo text-4xl">Finalizar pedido</h1>
        <div role="alert" className="flex flex-col items-center gap-3 py-8 text-center">
          <p>Não foi possível carregar seus endereços agora.</p>
          <Link
            href="/checkout/pagamento"
            className="inline-flex min-h-11 items-center font-semibold text-primaria underline underline-offset-2"
          >
            Tentar de novo
          </Link>
        </div>
      </main>
    );
  }

  return <EtapaPagamento enderecoIds={resultado.enderecos.map((e) => e.id)} />;
}
