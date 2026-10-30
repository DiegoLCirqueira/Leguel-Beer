import type { Metadata } from "next";
import { MaioridadePergunta } from "@/components/maioridade/maioridade-pergunta";
import { retornoSeguro } from "@/lib/maioridade";
import { confirmarMaioridade } from "./actions";

export const metadata: Metadata = {
  title: "Confirmação de maioridade | Leguelé Beer",
  robots: { index: false },
};

type Props = { searchParams: Promise<{ retorno?: string | string[] }> };

export default async function Maioridade({ searchParams }: Props) {
  const { retorno } = await searchParams;
  const pedido = Array.isArray(retorno) ? retorno[0] : retorno;

  return <MaioridadePergunta retorno={retornoSeguro(pedido)} confirmar={confirmarMaioridade} />;
}
