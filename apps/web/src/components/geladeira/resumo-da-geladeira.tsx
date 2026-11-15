import { resumirGeladeira } from "@leguele/shared";
import Link from "next/link";
import { LinhaDoResumo, TotaisDoResumo, Button, buttonVariants } from "@/components/ui";
import type { ItemLocal } from "@/lib/geladeira/estado";

export type LinhasDoResumoProps = {
  itens: ItemLocal[];
  aoAlterar: (cervejaId: string, quantidade: number) => void;
  aoRemover: (cervejaId: string) => void;
};

/** As cervejas da Geladeira, uma linha para cada, na ordem de entrada. */
export function LinhasDoResumo({ itens, aoAlterar, aoRemover }: LinhasDoResumoProps) {
  return (
    <ul>
      {itens.map((item) => (
        <LinhaDoResumo
          key={item.cerveja.id}
          item={item}
          aoAlterar={(quantidade) => aoAlterar(item.cerveja.id, quantidade)}
          aoRemover={() => aoRemover(item.cerveja.id)}
        />
      ))}
    </ul>
  );
}

/** Totais e as duas saídas do resumo. "Finalizar compra" espera o checkout (item 5 da sequência). */
export function FechamentoDoResumo({ itens }: { itens: ItemLocal[] }) {
  const { quantidadeTotal, subtotalCentavos } = resumirGeladeira(itens);
  return (
    <div className="flex flex-col gap-3">
      <TotaisDoResumo quantidadeTotal={quantidadeTotal} subtotalCentavos={subtotalCentavos} />
      <Button disabled>Finalizar compra</Button>
      <Link href="/catalogo" className={buttonVariants({ variant: "outline" })}>
        Continuar comprando
      </Link>
    </div>
  );
}
