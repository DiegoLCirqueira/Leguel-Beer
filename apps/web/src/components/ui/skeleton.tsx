import { cn } from "@/lib/utils";

/** Bloco de carregamento: só decoração (fora da acessibilidade); pulsa, exceto com menos movimento. */
export function Skeleton({
  className,
  "data-testid": testId,
}: {
  className?: string;
  "data-testid"?: string;
}) {
  return (
    <div
      aria-hidden="true"
      data-testid={testId}
      className={cn(
        "animate-pulse rounded-xl bg-superficie-elevada motion-reduce:animate-none",
        className,
      )}
    />
  );
}
