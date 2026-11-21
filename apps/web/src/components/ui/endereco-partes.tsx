import type { EnderecoResposta } from "@leguele/shared";

/** "57035000" vira "57035-000". */
export const cepComMascara = (cep: string) => `${cep.slice(0, 5)}-${cep.slice(5)}`;

/** Os selos "Padrão" e "Fora da área", iguais no cartão de Meus endereços e na opção da Entrega. */
export function SelosDoEndereco({ endereco }: { endereco: EnderecoResposta }) {
  return (
    <>
      {endereco.padrao ? (
        <span className="rounded-full bg-primaria px-3 py-1 text-xs font-semibold text-texto-badge">
          Padrão
        </span>
      ) : null}
      {endereco.foraDaArea ? (
        <span className="rounded-full border border-erro px-3 py-1 text-xs font-semibold text-erro">
          Fora da área
        </span>
      ) : null}
    </>
  );
}
