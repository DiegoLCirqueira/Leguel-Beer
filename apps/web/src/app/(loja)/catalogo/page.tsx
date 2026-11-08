import { catalogoQuerySchema } from "@leguele/shared";
import type { Metadata } from "next";
import Link from "next/link";
import { CatalogoConteudo } from "@/components/catalogo/catalogo-conteudo";
import { FiltrosDoCatalogo } from "@/components/catalogo/filtros-do-catalogo";
import { buscarCatalogo } from "@/lib/catalogo/buscar";
import { paraQueryString } from "@/lib/catalogo/url";

export const metadata: Metadata = {
  title: "Catálogo | Leguelé Beer",
};

type Props = { searchParams: Promise<Record<string, string | string[] | undefined>> };

/** Catálogo no servidor: filtros e ordem vêm da URL (valor inválido é ignorado) e a busca é na API. */
export default async function Catalogo({ searchParams }: Props) {
  const query = catalogoQuerySchema.parse(await searchParams);
  const resultado = await buscarCatalogo(query);
  const queryString = paraQueryString(query);

  return (
    <main className="mx-auto flex w-full max-w-md flex-1 flex-col gap-4 px-4 pb-6 pt-2">
      <div className="flex items-center justify-between gap-3">
        <h1 className="font-titulo text-4xl text-texto">Catálogo</h1>
        <FiltrosDoCatalogo query={query} />
      </div>
      {resultado.ok ? (
        <CatalogoConteudo query={query} dados={resultado.dados} />
      ) : (
        <div role="alert" className="flex flex-col items-center gap-3 py-8 text-center">
          <p className="text-texto">Não foi possível carregar o catálogo agora.</p>
          <Link
            href={queryString ? `/catalogo?${queryString}` : "/catalogo"}
            className="inline-flex min-h-11 items-center font-semibold text-primaria underline underline-offset-2"
          >
            Tentar de novo
          </Link>
        </div>
      )}
    </main>
  );
}
