import { cn } from "@/lib/utils";
import { seloDaCategoria } from "./selo-da-categoria";

type StyleBadgeProps = { slug: string; name: string };

export function StyleBadge({ slug, name }: StyleBadgeProps) {
  return (
    <span
      className={cn(
        "inline-block rounded-full px-3 py-1 text-xs font-semibold tracking-wide text-texto-badge",
        seloDaCategoria(slug).fundo,
      )}
    >
      {name.toUpperCase()}
    </span>
  );
}
