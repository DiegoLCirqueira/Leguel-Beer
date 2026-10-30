import type { LucideIcon } from "lucide-react";
import type { InputHTMLAttributes, ReactNode } from "react";
import { cn } from "@/lib/utils";

type Props = Omit<InputHTMLAttributes<HTMLInputElement>, "id"> & {
  id: string;
  rotulo: string;
  icone: LucideIcon;
  erro?: string;
  /** Controle à direita do campo, como o olho da senha. */
  acao?: ReactNode;
};

/** Campo do Figma: ícone à esquerda, rótulo em negrito e o valor embaixo, dentro de um contorno. */
export function Campo({ id, rotulo, icone: Icone, erro, acao, className, ...input }: Props) {
  const idErro = `${id}-erro`;

  return (
    <div className="flex flex-col gap-1">
      <div
        className={cn(
          "flex items-center gap-3 rounded-2xl border bg-superficie/70 px-4 py-2.5 focus-within:border-primaria",
          erro ? "border-erro" : "border-borda",
        )}
      >
        <Icone aria-hidden="true" className="size-6 shrink-0 text-primaria" />
        <div className="min-w-0 flex-1">
          <label htmlFor={id} className="block text-sm font-semibold text-texto">
            {rotulo}
          </label>
          <input
            id={id}
            aria-invalid={erro ? true : undefined}
            aria-describedby={erro ? idErro : undefined}
            className={cn(
              "block min-h-6 w-full bg-transparent text-sm text-texto outline-none placeholder:text-texto-suave",
              className,
            )}
            {...input}
          />
        </div>
        {acao}
      </div>
      {erro ? (
        <p id={idErro} className="px-2 text-sm text-erro">
          {erro}
        </p>
      ) : null}
    </div>
  );
}
