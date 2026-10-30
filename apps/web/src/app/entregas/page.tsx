import type { Metadata } from "next";
import { LegalPage } from "@/components/legal/legal-page";
import { ATUALIZADO_EM, ENTREGAS } from "@/content/legal";

export const metadata: Metadata = {
  title: "Entregas | Leguelé Beer",
};

export default function Entregas() {
  return <LegalPage titulo="Entregas" atualizadoEm={ATUALIZADO_EM} secoes={ENTREGAS} />;
}
