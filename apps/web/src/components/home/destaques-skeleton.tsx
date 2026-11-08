import { Skeleton } from "@/components/ui";

/** Enquanto os destaques carregam: o título e blocos no lugar dos cards. */
export function DestaquesSkeleton() {
  return (
    <section className="flex w-full flex-col gap-3">
      <p role="status" className="sr-only">
        Carregando os destaques
      </p>
      <Skeleton className="h-7 w-48" />
      <div className="grid grid-cols-1 gap-3 min-[360px]:grid-cols-2">
        {Array.from({ length: 4 }, (_, i) => (
          <Skeleton key={i} className="h-72 rounded-3xl" />
        ))}
      </div>
    </section>
  );
}
