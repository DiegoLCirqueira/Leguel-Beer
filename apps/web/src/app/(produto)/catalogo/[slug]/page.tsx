import type { Metadata } from "next";
import Link from "next/link";
import { ProdutoConteudo } from "@/components/produto/produto-conteudo";
import { CervejaNaoEncontrada } from "@/components/ui";
import { buscarCerveja } from "@/lib/catalogo/cerveja";

type Props = { params: Promise<{ slug: string }> };

export const metadata: Metadata = {
  title: "Cerveja | Leguelé Beer",
};

/** Página de produto no servidor: a busca é na API; 404 vira "Cerveja não encontrada". */
export default async function Produto({ params }: Props) {
  const { slug } = await params;
  const resultado = await buscarCerveja(slug);

  if (resultado.tipo === "nao-encontrada") return <CervejaNaoEncontrada />;
  if (resultado.tipo === "erro") {
    return (
      <main className="mx-auto flex w-full max-w-md flex-1 flex-col items-center justify-center px-4 py-10">
        <div role="alert" className="flex flex-col items-center gap-3 text-center">
          <p className="text-texto">Não foi possível carregar a cerveja agora.</p>
          <Link
            href={`/catalogo/${encodeURIComponent(slug)}`}
            className="inline-flex min-h-11 items-center font-semibold text-primaria underline underline-offset-2"
          >
            Tentar de novo
          </Link>
        </div>
      </main>
    );
  }
  return <ProdutoConteudo cerveja={resultado.cerveja} />;
}
