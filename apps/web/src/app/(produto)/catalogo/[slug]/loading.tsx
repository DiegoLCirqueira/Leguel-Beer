import { Skeleton } from "@/components/ui";

/** Carregamento da página de produto: o mesmo esqueleto da ficha. */
export default function CarregandoProduto() {
  return (
    <main className="mx-auto flex w-full max-w-md flex-1 flex-col gap-5 px-4 pb-6 pt-2">
      <p role="status" className="sr-only">
        Carregando a cerveja
      </p>
      <Skeleton className="h-52 w-full" />
      <Skeleton className="h-6 w-20 rounded-full" />
      <Skeleton className="h-10 w-3/4" />
      <div className="grid grid-cols-3 gap-2">
        {Array.from({ length: 3 }, (_, i) => (
          <Skeleton key={i} className="h-20 rounded-2xl" />
        ))}
      </div>
      <Skeleton className="h-32 rounded-3xl" />
    </main>
  );
}
