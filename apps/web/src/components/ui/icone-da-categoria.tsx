import { Beer, Citrus, Hop, Snowflake, Wheat } from "lucide-react";
import type { ReactElement } from "react";

const CLASSE = "size-4";

/** Ícone de cada categoria do MVP, já como elemento (nada de componente escolhido no render). */
const ICONES = new Map<string, ReactElement>([
  ["ipa", <Hop key="ipa" aria-hidden="true" className={CLASSE} />],
  ["frutas", <Citrus key="frutas" aria-hidden="true" className={CLASSE} />],
  ["malt", <Wheat key="malt" aria-hidden="true" className={CLASSE} />],
  ["lager", <Snowflake key="lager" aria-hidden="true" className={CLASSE} />],
]);

/** Ícone decorativo da categoria (slug); categoria desconhecida e "todas" usam a caneca. */
export function IconeDaCategoria({ slug }: { slug: string }) {
  return ICONES.get(slug) ?? <Beer aria-hidden="true" className={CLASSE} />;
}
