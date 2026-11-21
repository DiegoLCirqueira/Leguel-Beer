import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { EtapaPagamento } from "@/components/checkout/etapa-pagamento";
import { lerTokenDeAcesso } from "@/lib/auth/servidor";

export const metadata: Metadata = {
  title: "Pagamento | Leguelé Beer",
  robots: { index: false },
};

/** Checkout, etapa Pagamento: exige conta; só registra a escolha (nada é cobrado). */
export default async function Pagamento() {
  const token = await lerTokenDeAcesso();
  if (!token) redirect("/entrar?retorno=%2Fcheckout%2Fpagamento");

  return <EtapaPagamento />;
}
