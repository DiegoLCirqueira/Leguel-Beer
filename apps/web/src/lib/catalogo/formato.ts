// Sem imagemUrl o card e a página de produto usam uma imagem padrão (a marca); as imagens por categoria vêm do LB-124.
export const IMAGEM_PADRAO = "/maioridade/logo.webp";

const formatadorDoTeor = new Intl.NumberFormat("pt-BR", {
  minimumFractionDigits: 1,
  maximumFractionDigits: 1,
});

/** Teor alcoólico com uma casa decimal em pt-BR, sem o símbolo (ex.: 6,5 e 5,0). */
export const formatarTeor = (valor: number) => formatadorDoTeor.format(valor);
