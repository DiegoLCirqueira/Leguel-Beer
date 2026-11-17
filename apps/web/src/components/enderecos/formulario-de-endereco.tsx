"use client";

import type { EnderecoResposta } from "@leguele/shared";
import type { ResultadoDoCep } from "@/lib/enderecos/cep";
import type { ResultadoDoSalvar } from "@/app/(loja)/conta/enderecos/actions";

export type FormularioProps = {
  buscarCep: (cep: string) => Promise<ResultadoDoCep>;
  salvar: (entrada: unknown) => Promise<ResultadoDoSalvar>;
  aoSalvar: () => void;
  aoCancelar: () => void;
  inicial?: EnderecoResposta;
};

export function FormularioDeEndereco(_props: FormularioProps) {
  return <form />;
}
