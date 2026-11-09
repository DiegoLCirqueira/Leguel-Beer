import { LogOut } from "lucide-react";
import type { Metadata } from "next";
import { SiteFooter } from "@/components/site/site-footer";
import { Button } from "@/components/ui";
import { sairAction } from "../../sair/actions";

export const metadata: Metadata = {
  title: "Minha conta | Leguelé Beer",
  robots: { index: false },
};

// Página mínima: o perfil completo vem com o LB-29. Por ora traz o "Sair", pedido pela spec.
export default function Conta() {
  return (
    <>
      <main className="mx-auto flex w-full flex-1 max-w-sm flex-col gap-6 px-6 pb-12 pt-14 text-texto">
        <h1 className="font-titulo text-balance text-4xl">Minha conta</h1>
        <form action={sairAction}>
          <Button
            type="submit"
            variant="outline"
            iconLeft={<LogOut aria-hidden="true" className="size-5" />}
          >
            Sair
          </Button>
        </form>
      </main>
      <SiteFooter />
    </>
  );
}
