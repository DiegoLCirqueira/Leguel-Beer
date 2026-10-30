/**
 * Versões dos textos legais em vigor: as datas de "Última atualização" de /termos e /privacidade.
 * Quem muda um dos textos atualiza a data aqui junto.
 */
export const LEGAL_VERSIONS = {
  termosVersao: "2026-10-31",
  privacidadeVersao: "2026-10-31",
} as const;

export type LegalVersions = { termosVersao: string; privacidadeVersao: string };
