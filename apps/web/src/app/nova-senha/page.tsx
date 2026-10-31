import type { Metadata } from "next";
import { LinkInvalido, NovaSenhaForm } from "@/components/auth/nova-senha-form";
import { TelaDeAcesso } from "@/components/auth/tela-de-acesso";
import { novaSenhaAction } from "./actions";

export const metadata: Metadata = {
  title: "Nova senha | Leguelé Beer",
  robots: { index: false },
};

type Props = { searchParams: Promise<{ token_hash?: string; type?: string }> };

/**
 * Destino do link do e-mail de recuperação. Abrir o link (GET) só mostra o formulário; o link é
 * gasto no POST da ação, para scanners de e-mail não o consumirem.
 */
export default async function NovaSenha({ searchParams }: Props) {
  const { token_hash: tokenHash, type } = await searchParams;
  const linkPossivel = Boolean(tokenHash) && type === "recovery";

  return (
    <TelaDeAcesso
      titulo={
        <>
          Nova <span className="text-primaria">senha</span>
        </>
      }
    >
      {linkPossivel ? (
        <NovaSenhaForm salvar={novaSenhaAction.bind(null, tokenHash ?? "", type ?? "")} />
      ) : (
        <LinkInvalido />
      )}
    </TelaDeAcesso>
  );
}
