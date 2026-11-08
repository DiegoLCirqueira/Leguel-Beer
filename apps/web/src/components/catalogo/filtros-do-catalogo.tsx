"use client";

import {
  faixasDeFiltro,
  type CatalogoQuery,
  type CategoriaComContador,
  type Faixa,
  type OrdemDoCatalogo,
} from "@leguele/shared";
import { SlidersHorizontal } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { BottomSheet, Button } from "@/components/ui";
import { contarFiltros, paraQueryString } from "@/lib/catalogo/url";

type Grupo = "teor" | "ibu" | "preco";

const GRUPOS: { id: Grupo; rotulo: string }[] = [
  { id: "teor", rotulo: "Teor alcoólico" },
  { id: "ibu", rotulo: "IBU (amargor)" },
  { id: "preco", rotulo: "Faixa de preço" },
];

const ORDENS: { id: OrdemDoCatalogo; rotulo: string }[] = [
  { id: "relevancia", rotulo: "Relevância" },
  { id: "menor-preco", rotulo: "Menor preço" },
  { id: "maior-preco", rotulo: "Maior preço" },
  { id: "mais-novas", rotulo: "Mais novas" },
];

const OPCAO =
  "flex min-h-11 cursor-pointer items-center gap-3 text-texto has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-primaria";

/** "Filtrar (n)" e o bottom sheet com as faixas, "Somente disponíveis" e a ordem; tudo vai para a URL. */
export function FiltrosDoCatalogo({
  query,
  categorias = [],
}: {
  query: CatalogoQuery;
  categorias?: CategoriaComContador[];
}) {
  const router = useRouter();
  const [aberto, setAberto] = useState(false);
  const [rascunho, setRascunho] = useState(query);
  const ativos = contarFiltros(query);

  function abrir() {
    setRascunho(query);
    setAberto(true);
  }

  function ir(proxima: CatalogoQuery) {
    const queryString = paraQueryString(proxima);
    router.push(queryString ? `/catalogo?${queryString}` : "/catalogo");
    setAberto(false);
  }

  return (
    <>
      <Button
        size="sm"
        variant="outline"
        iconLeft={<SlidersHorizontal aria-hidden="true" className="size-5" />}
        onClick={abrir}
        aria-haspopup="dialog"
      >
        {ativos > 0 ? `Filtrar (${ativos})` : "Filtrar"}
      </Button>
      <BottomSheet
        aberto={aberto}
        aoFechar={() => setAberto(false)}
        titulo="Filtros e ordenação"
        rodape={
          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={() =>
                ir({
                  ...query,
                  teor: undefined,
                  ibu: undefined,
                  preco: undefined,
                  disponiveis: false,
                })
              }
            >
              Limpar
            </Button>
            <Button onClick={() => ir(rascunho)}>Aplicar</Button>
          </div>
        }
      >
        <div className="flex flex-col gap-4 pb-3">
          {categorias.length > 0 ? (
            <fieldset className="flex flex-col">
              <legend className="text-sm font-semibold text-texto-suave">Categoria</legend>
              <label className={OPCAO}>
                <input
                  type="radio"
                  name="categoria"
                  checked={rascunho.categoria === undefined}
                  onChange={() => setRascunho({ ...rascunho, categoria: undefined })}
                  className="size-5 accent-primaria"
                />
                Todas
              </label>
              {categorias.map((categoria) => (
                <label key={categoria.slug} className={OPCAO}>
                  <input
                    type="radio"
                    name="categoria"
                    checked={rascunho.categoria === categoria.slug}
                    onChange={() => setRascunho({ ...rascunho, categoria: categoria.slug })}
                    className="size-5 accent-primaria"
                  />
                  {categoria.nome}
                </label>
              ))}
            </fieldset>
          ) : null}
          {GRUPOS.map(({ id, rotulo }) => (
            <fieldset key={id} className="flex flex-col">
              <legend className="text-sm font-semibold text-texto-suave">{rotulo}</legend>
              <label className={OPCAO}>
                <input
                  type="radio"
                  name={id}
                  checked={rascunho[id] === undefined}
                  onChange={() => setRascunho({ ...rascunho, [id]: undefined })}
                  className="size-5 accent-primaria"
                />
                Qualquer
              </label>
              {(faixasDeFiltro[id] as readonly Faixa[]).map((faixa) => (
                <label key={faixa.id} className={OPCAO}>
                  <input
                    type="radio"
                    name={id}
                    checked={rascunho[id] === faixa.id}
                    onChange={() => setRascunho({ ...rascunho, [id]: faixa.id })}
                    className="size-5 accent-primaria"
                  />
                  {faixa.rotulo}
                </label>
              ))}
            </fieldset>
          ))}
          <label className={OPCAO}>
            <input
              type="checkbox"
              role="switch"
              checked={rascunho.disponiveis}
              onChange={(e) => setRascunho({ ...rascunho, disponiveis: e.target.checked })}
              className="size-5 accent-primaria"
            />
            Somente disponíveis
          </label>
          <label className="flex flex-col gap-1 text-sm font-semibold text-texto-suave">
            Ordenar por
            <select
              value={rascunho.ordem}
              onChange={(e) =>
                setRascunho({ ...rascunho, ordem: e.target.value as OrdemDoCatalogo })
              }
              className="min-h-11 rounded-campo border border-borda-campo bg-superficie px-3 text-base font-normal text-texto"
            >
              {ORDENS.map((ordem) => (
                <option key={ordem.id} value={ordem.id}>
                  {ordem.rotulo}
                </option>
              ))}
            </select>
          </label>
        </div>
      </BottomSheet>
    </>
  );
}
