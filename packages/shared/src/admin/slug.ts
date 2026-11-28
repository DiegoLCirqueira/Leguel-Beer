import { slugReservado } from "../catalogo/slugs-reservados.js";

/** Slug do nome: sem acento, minúsculo, com hífen; se já existe (ou é reservado), ganha "-2", "-3"... */
export function gerarSlug(nome: string, existentes: readonly string[]): string {
  const normalizado = nome
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
  // Nome só com símbolos não tem letra nem número para virar slug.
  const base = normalizado || "cerveja";
  const ocupado = (slug: string) => existentes.includes(slug) || slugReservado(slug);
  if (!ocupado(base)) return base;
  let numero = 2;
  while (ocupado(`${base}-${numero}`)) numero += 1;
  return `${base}-${numero}`;
}
