import type { Metadata } from "next";
import { RecuperarSenhaForm } from "@/components/auth/recuperar-senha-form";
import { TelaDeAcesso } from "@/components/auth/tela-de-acesso";
import { pedirRecuperacaoAction } from "./actions";

export const metadata: Metadata = {
  title: "Recuperar senha | Leguelé Beer",
};

export default function RecuperarSenha() {
  return (
    <TelaDeAcesso
      titulo={
        <>
          Recuperar <span className="text-primaria">senha</span>
        </>
      }
      subtitulo="Digite seu e-mail e enviaremos um link para você redefinir sua senha."
    >
      <RecuperarSenhaForm pedir={pedirRecuperacaoAction} />
    </TelaDeAcesso>
  );
}
