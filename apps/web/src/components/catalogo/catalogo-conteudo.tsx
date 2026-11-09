"use client";

import type { CatalogoQuery, CatalogoResponse } from "@leguele/shared";
import { useRouter } from "next/navigation";
import { Button, CardCerveja, CategoryChips } from "@/components/ui";
import { contarFiltros, paraQueryString } from "@/lib/catalogo/url";

const TODAS = "todas";

/** Chips de categoria com contador, contagem e grade de cards (ou o estado vazio). */
export function CatalogoConteudo({
  query,
  dados,
}: {
  query: CatalogoQuery;
  dados: CatalogoResponse;
}) {
  const router = useRouter();
  const { itens, categorias } = dados;
  const filtrado = Boolean(query.categoria) || contarFiltros(query) > 0;
  const totalGeral = categorias.reduce((soma, categoria) => soma + categoria.quantidade, 0);
  const chips = [
    { id: TODAS, label: "Todas", count: totalGeral },
    ...categorias.map((c) => ({ id: c.slug, label: c.nome, count: c.quantidade })),
  ];

  function escolherCategoria(id: string) {
    const queryString = paraQueryString({ ...query, categoria: id === TODAS ? undefined : id });
    router.push(queryString ? `/catalogo?${queryString}` : "/catalogo");
  }

  return (
    <div className="flex flex-col gap-4">
      <CategoryChips items={chips} value={query.categoria ?? TODAS} onChange={escolherCategoria} />
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h2 className="text-sm font-normal text-texto-suave">
          {itens.length === 1 ? "1 cerveja" : `${itens.length} cervejas`}
        </h2>
        {filtrado ? (
          <Button size="sm" variant="ghost" onClick={() => router.push("/catalogo")}>
            Limpar filtros
          </Button>
        ) : null}
      </div>
      {itens.length === 0 ? (
        <p className="py-8 text-center text-texto">Nenhuma cerveja encontrada com esses filtros.</p>
      ) : (
        <div className="grid grid-cols-1 gap-3 min-[360px]:grid-cols-2">
          {itens.map((cerveja) => (
            <CardCerveja key={cerveja.id} cerveja={cerveja} />
          ))}
        </div>
      )}
    </div>
  );
}
