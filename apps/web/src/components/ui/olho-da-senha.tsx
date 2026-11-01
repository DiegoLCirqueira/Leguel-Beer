import { Eye, EyeOff } from "lucide-react";

/** Olho que mostra e esconde a senha; o rótulo acessível troca junto. */
export function OlhoDaSenha({ visivel, alternar }: { visivel: boolean; alternar: () => void }) {
  const Icone = visivel ? EyeOff : Eye;
  return (
    <button
      type="button"
      onClick={alternar}
      aria-label={visivel ? "Esconder senha" : "Mostrar senha"}
      className="-mr-2 flex size-11 shrink-0 items-center justify-center rounded-full text-texto-suave transition-colors hover:text-texto focus-visible:outline-2 focus-visible:outline-primaria"
    >
      <Icone aria-hidden="true" className="size-6" />
    </button>
  );
}
