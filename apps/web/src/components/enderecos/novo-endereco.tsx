"use client";

import { useRouter } from "next/navigation";
import { buscarCepAction, salvarEnderecoAction } from "@/app/(loja)/conta/enderecos/actions";
import { FormularioDeEndereco } from "./formulario-de-endereco";

/** Liga o formulário às ações do servidor; salvar ou cancelar volta para Meus endereços. */
export function NovoEndereco() {
  const roteador = useRouter();
  const voltar = () => roteador.push("/conta/enderecos");
  return (
    <FormularioDeEndereco
      buscarCep={buscarCepAction}
      salvar={(entrada) => salvarEnderecoAction(entrada)}
      aoSalvar={voltar}
      aoCancelar={voltar}
    />
  );
}
