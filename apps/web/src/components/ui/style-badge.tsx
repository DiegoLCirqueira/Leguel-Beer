import { cn } from "@/lib/utils";

const categoryClasses: Record<string, string> = {
  ipa: "bg-badge-ipa",
  frutas: "bg-badge-frutas text-texto-na-primaria",
  malt: "bg-badge-malt",
  lager: "bg-badge-lager",
};

type StyleBadgeProps = { slug: string; name: string };

export function StyleBadge({ slug, name }: StyleBadgeProps) {
  return (
    <span
      className={cn(
        "inline-block rounded-full px-3 py-1 text-xs font-semibold tracking-wide text-texto-badge",
        categoryClasses[slug] ?? "bg-badge-neutro",
      )}
    >
      {name.toUpperCase()}
    </span>
  );
}
