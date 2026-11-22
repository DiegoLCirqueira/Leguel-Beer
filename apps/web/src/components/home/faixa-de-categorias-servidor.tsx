import { buscarCatalogo } from "@/lib/catalogo/buscar";
import { FaixaDeCategorias } from "./faixa-de-categorias";

/** Busca as categorias (e as contagens) no servidor; se a API falhar, a faixa some e a home segue. */
export async function FaixaDeCategoriasServidor() {
  const resultado = await buscarCatalogo({ disponiveis: false, ordem: "relevancia" });
  if (!resultado.ok) {
    console.warn("[home] não foi possível buscar as categorias; a faixa foi omitida");
    return null;
  }
  return <FaixaDeCategorias categorias={resultado.dados.categorias} />;
}
