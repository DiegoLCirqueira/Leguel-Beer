import { buscarDestaques } from "@/lib/catalogo/destaques";
import { DestaquesDaHome } from "./destaques-da-home";

/** Busca os destaques no servidor; se a API falhar, a seção simplesmente não aparece e a home segue. */
export async function DestaquesServidor() {
  const resultado = await buscarDestaques();
  if (!resultado.ok) {
    // Aviso no log do servidor, sem dado de cliente: a seção some em silêncio para a pessoa.
    console.warn("[destaques] não foi possível buscar os destaques da home; a seção foi omitida");
    return null;
  }
  return <DestaquesDaHome itens={resultado.itens} />;
}
