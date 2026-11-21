import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { NovoEndereco } from "@/components/enderecos/novo-endereco";
import { lerTokenDeAcesso } from "@/lib/auth/servidor";

export const metadata: Metadata = {
  title: "Novo endereço | Leguelé Beer",
  robots: { index: false },
};

/** Novo endereço (tela 20): quem autoriza é a API; sem sessão, entra e volta para cá. */
export default async function NovoEnderecoPagina() {
  if (!(await lerTokenDeAcesso())) redirect("/entrar?retorno=%2Fconta%2Fenderecos%2Fnovo");

  return (
    <main className="mx-auto flex w-full max-w-md flex-1 flex-col gap-4 px-4 pb-6 pt-2 text-texto">
      <h1 className="font-titulo text-4xl">Novo endereço</h1>
      <NovoEndereco />
    </main>
  );
}
