import { Skeleton } from "@/components/ui";

/** Carregamento do catálogo: o mesmo esqueleto da tela (título, chips e grade de cards). */
export default function CarregandoCatalogo() {
  return (
    <main className="mx-auto flex w-full max-w-md flex-1 flex-col gap-4 px-4 pb-6 pt-2">
      <p role="status" className="sr-only">
        Carregando o catálogo
      </p>
      <div className="flex items-center justify-between gap-3">
        <h1 className="font-titulo text-4xl text-texto">Catálogo</h1>
        <Skeleton className="h-11 w-24 rounded-full" />
      </div>
      <div className="flex gap-2 overflow-hidden">
        {Array.from({ length: 4 }, (_, i) => (
          <Skeleton key={i} className="h-14 w-20 shrink-0" />
        ))}
      </div>
      <div className="grid grid-cols-1 gap-3 min-[360px]:grid-cols-2">
        {Array.from({ length: 4 }, (_, i) => (
          <Skeleton key={i} className="h-72 rounded-3xl" />
        ))}
      </div>
    </main>
  );
}
