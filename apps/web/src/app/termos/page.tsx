import type { Metadata } from "next";
import { LegalPage } from "@/components/legal/legal-page";
import { ATUALIZADO_EM, TERMOS } from "@/content/legal";

export const metadata: Metadata = {
  title: "Termos de Uso | Leguelé Beer",
};

export default function Termos() {
  return <LegalPage titulo="Termos de Uso" atualizadoEm={ATUALIZADO_EM} secoes={TERMOS} />;
}
