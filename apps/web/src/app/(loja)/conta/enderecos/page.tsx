import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { AcoesDoEndereco } from "@/components/enderecos/acoes-do-endereco";
import { CartaoDeEndereco } from "@/components/ui";
import { lerTokenDeAcesso } from "@/lib/auth/servidor";
import { buscarEnderecos } from "@/lib/enderecos/buscar";

export const metadata: Metadata = {
  title: "Meus endereços | Leguelé Beer",
  robots: { index: false },
};

const IR_ENTRAR = "/entrar?retorno=%2Fconta%2Fenderecos";

/** Meus endereços (tela 20): a lista vem da API com o token da sessão; quem autoriza é a API. */
export default async function MeusEnderecos() {
  const token = await lerTokenDeAcesso();
  if (!token) redirect(IR_ENTRAR);
  const resultado = await buscarEnderecos(token);
  if (resultado.tipo === "sem-sessao") redirect(IR_ENTRAR);

  return (
    <main className="mx-auto flex w-full max-w-md flex-1 flex-col gap-4 px-4 pb-6 pt-2 text-texto">
      <div>
        <h1 className="font-titulo text-4xl">Meus endereços</h1>
        <p className="text-sm text-texto-suave">Gerencie seus endereços de entrega</p>
      </div>
      {resultado.tipo === "erro" ? (
        <div role="alert" className="flex flex-col items-center gap-3 py-8 text-center">
          <p>Não foi possível carregar seus endereços agora.</p>
          <Link
            href="/conta/enderecos"
            className="inline-flex min-h-11 items-center font-semibold text-primaria underline underline-offset-2"
          >
            Tentar de novo
          </Link>
        </div>
      ) : resultado.enderecos.length === 0 ? (
        <p>Você ainda não tem endereço salvo.</p>
      ) : (
        <ul className="flex flex-col gap-3">
          {resultado.enderecos.map((endereco) => (
            <CartaoDeEndereco
              key={endereco.id}
              endereco={endereco}
              acoes={
                <AcoesDoEndereco
                  id={endereco.id}
                  nome={endereco.apelido ?? "Endereço"}
                  padrao={endereco.padrao}
                />
              }
            />
          ))}
        </ul>
      )}
    </main>
  );
}
