import { Beer, Citrus, Hop, Snowflake, Wheat, type LucideIcon } from "lucide-react";

const ICONES = new Map<string, LucideIcon>([
  ["ipa", Hop],
  ["frutas", Citrus],
  ["malt", Wheat],
  ["lager", Snowflake],
]);

/** Ícone decorativo da categoria (slug); categoria desconhecida e "todas" usam a caneca. */
export function IconeDaCategoria({ slug }: { slug: string }) {
  const Icone = ICONES.get(slug) ?? Beer;
  return <Icone aria-hidden="true" className="size-4" />;
}
