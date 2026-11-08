import { buscarDestaques } from "@/lib/catalogo/destaques";
import { DestaquesDaHome } from "./destaques-da-home";

/** Busca os destaques no servidor; se a API falhar, a seção simplesmente não aparece e a home segue. */
export async function DestaquesServidor() {
  const resultado = await buscarDestaques();
  return resultado.ok ? <DestaquesDaHome itens={resultado.itens} /> : null;
}
