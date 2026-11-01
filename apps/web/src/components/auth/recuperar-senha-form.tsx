"use client";

import { recuperarSenhaSchema } from "@leguele/shared";
import { ArrowLeft, ArrowRight, Clock, Mail, ShieldCheck } from "lucide-react";
import Link from "next/link";
import { useState, type FormEvent, type ReactNode } from "react";
import { Button, Campo } from "@/components/ui";
import type { ResultadoPedido } from "@/lib/auth/recuperar-senha";

type Props = { pedir: (entrada: { email: string }) => Promise<ResultadoPedido> };

type Aviso = { tipo: "enviado" } | { tipo: "erro" };

function Aviso({
  icone,
  titulo,
  children,
}: {
  icone: ReactNode;
  titulo: string;
  children: string;
}) {
  return (
    <li className="flex gap-3 py-3 first:pt-0 last:pb-0">
      <span className="flex size-10 shrink-0 items-center justify-center rounded-full border border-primaria text-primaria">
        {icone}
      </span>
      <div className="flex flex-col gap-0.5 text-sm">
        <p className="font-semibold text-texto">{titulo}</p>
        <p className="text-texto-suave">{children}</p>
      </div>
    </li>
  );
}

export function RecuperarSenhaForm({ pedir }: Props) {
  const [email, setEmail] = useState("");
  const [erro, setErro] = useState<string | undefined>();
  const [aviso, setAviso] = useState<Aviso | null>(null);
  const [enviando, setEnviando] = useState(false);

  async function enviar(evento: FormEvent) {
    evento.preventDefault();
    setAviso(null);
    const validacao = recuperarSenhaSchema.safeParse({ email });
    if (!validacao.success) {
      setErro(validacao.error.issues[0]?.message);
      document.getElementById("email")?.focus();
      return;
    }
    setErro(undefined);
    setEnviando(true);
    try {
      const resultado = await pedir({ email });
      if (resultado.tipo === "invalido") setErro(resultado.erros.email);
      else setAviso(resultado);
    } catch {
      setAviso({ tipo: "erro" });
    } finally {
      setEnviando(false);
    }
  }

  return (
    <form onSubmit={enviar} noValidate className="flex flex-col gap-4">
      <Campo
        id="email"
        name="email"
        rotulo="E-mail"
        icone={Mail}
        type="email"
        placeholder="Digite seu e-mail cadastrado"
        autoComplete="email"
        spellCheck={false}
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        erro={erro}
      />

      <ul className="divide-y divide-borda rounded-2xl border border-borda bg-superficie/70 px-4 py-4">
        <Aviso
          icone={<Mail aria-hidden="true" className="size-5" />}
          titulo="Verifique sua caixa de entrada"
        >
          Enviaremos um link seguro para redefinir sua senha. Não se esqueça de checar a pasta de
          spam, se necessário.
        </Aviso>
        <Aviso icone={<Clock aria-hidden="true" className="size-5" />} titulo="O link tem validade">
          O link expira em 1 hora por questões de segurança.
        </Aviso>
        <Aviso
          icone={<ShieldCheck aria-hidden="true" className="size-5" />}
          titulo="Precisa de ajuda?"
        >
          Se não receber o e-mail, entre em contato com nosso suporte.
        </Aviso>
      </ul>

      {aviso?.tipo === "enviado" ? (
        <p role="status" className="text-center text-sm text-sucesso">
          Se houver uma conta com esse e-mail, você vai receber o link em instantes.
        </p>
      ) : null}
      {aviso?.tipo === "erro" ? (
        <p role="alert" className="text-center text-sm text-erro">
          Não foi possível concluir agora. Tente de novo em instantes.
        </p>
      ) : null}

      <Button
        type="submit"
        loading={enviando}
        iconRight={<ArrowRight aria-hidden="true" className="size-5" />}
      >
        Enviar link
      </Button>

      <div className="flex justify-center pt-2">
        <Link
          href="/entrar"
          className="inline-flex min-h-11 items-center gap-2 text-sm font-semibold text-primaria underline underline-offset-2"
        >
          <ArrowLeft aria-hidden="true" className="size-4" />
          Voltar para o login
        </Link>
      </div>
    </form>
  );
}
