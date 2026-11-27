import type { Metadata } from "next";
import { cotarFreteDoPadraoAction } from "@/app/geladeira/frete";
import { GeladeiraTela } from "@/components/geladeira/geladeira-tela";
import { buscarCatalogo } from "@/lib/catalogo/buscar";

export const metadata: Metadata = {
  title: "Geladeira | Leguelé Beer",
};

export default async function Geladeira() {
  // O catálogo alimenta a lista de adicionar das garrafas fantasma; sem ele a Geladeira abre igual.
  const resultado = await buscarCatalogo({ disponiveis: false, ordem: "relevancia" });
  if (!resultado.ok)
    console.warn("[geladeira] não foi possível buscar o catálogo da lista de adicionar");
  return (
    <GeladeiraTela
      cotarFrete={cotarFreteDoPadraoAction}
      catalogo={resultado.ok ? resultado.dados.itens : []}
    />
  );
}
