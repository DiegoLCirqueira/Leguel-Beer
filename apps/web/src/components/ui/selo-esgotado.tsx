import { PackageX } from "lucide-react";
import { cn } from "@/lib/utils";

/** Selo "Esgotado" (tokens `erro` e `fundo`), posicionado por quem usa (card e página de produto). */
export function SeloEsgotado({ className }: { className?: string }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full border-2 border-erro bg-fundo px-3 py-1 text-sm font-semibold text-erro",
        className,
      )}
    >
      <PackageX aria-hidden="true" className="size-4" />
      Esgotado
    </span>
  );
}
