import Link from "next/link";
import { buttonVariants } from "./button";

/** Estado da página de produto para slug inexistente ou de cerveja inativa. */
export function CervejaNaoEncontrada() {
  return (
    <main className="mx-auto flex w-full max-w-md flex-1 flex-col items-center justify-center gap-5 px-4 py-10 text-center">
      <h1 className="font-titulo text-balance text-4xl text-texto">Cerveja não encontrada</h1>
      <Link href="/catalogo" className={buttonVariants({ size: "sm" })}>
        Ver catálogo
      </Link>
    </main>
  );
}
