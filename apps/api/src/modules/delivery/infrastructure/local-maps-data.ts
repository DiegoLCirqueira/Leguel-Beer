import type { Coordinates } from "../domain/address.js";

/**
 * Coordenadas APROXIMADAS (centro de cada bairro ou cidade), só para o MVP de portfólio: não são
 * medidas de campo nem de um serviço de mapas. Chaves sem acento e em minúsculas.
 */
export const MACEIO_DISTRICTS: Record<string, Coordinates> = {
  centro: { latitude: -9.6658, longitude: -35.7353 },
  jaragua: { latitude: -9.6649, longitude: -35.7313 },
  pajucara: { latitude: -9.6666, longitude: -35.7226 },
  "ponta verde": { latitude: -9.6636, longitude: -35.7064 },
  jatiuca: { latitude: -9.659, longitude: -35.7019 },
  mangabeiras: { latitude: -9.6494, longitude: -35.7114 },
  "cruz das almas": { latitude: -9.648, longitude: -35.704 },
  farol: { latitude: -9.656, longitude: -35.735 },
  pinheiro: { latitude: -9.633, longitude: -35.75 },
  "gruta de lourdes": { latitude: -9.6307, longitude: -35.7322 },
  "ponta grossa": { latitude: -9.6728, longitude: -35.7458 },
  bebedouro: { latitude: -9.6361, longitude: -35.7599 },
  "bom parto": { latitude: -9.6406, longitude: -35.7432 },
  prado: { latitude: -9.6694, longitude: -35.7381 },
  "trapiche da barra": { latitude: -9.6824, longitude: -35.7559 },
  "santa amelia": { latitude: -9.6203, longitude: -35.7494 },
  jacintinho: { latitude: -9.6352, longitude: -35.7106 },
  "tabuleiro do martins": { latitude: -9.5532, longitude: -35.7715 },
  "benedito bentes": { latitude: -9.5662, longitude: -35.7189 },
  "cidade universitaria": { latitude: -9.5555, longitude: -35.7783 },
  serraria: { latitude: -9.5953, longitude: -35.7164 },
  "santos dumont": { latitude: -9.6258, longitude: -35.7209 },
  ipioca: { latitude: -9.5266, longitude: -35.6489 },
  "garca torta": { latitude: -9.5855, longitude: -35.6702 },
  "riacho doce": { latitude: -9.6006, longitude: -35.6808 },
  guaxuma: { latitude: -9.5774, longitude: -35.6683 },
  pescaria: { latitude: -9.5494, longitude: -35.6573 },
  antares: { latitude: -9.5823, longitude: -35.7389 },
  "clima bom": { latitude: -9.5683, longitude: -35.7571 },
};

/** Centro das cidades de Alagoas que o formulário aceita (o CEP é de Alagoas). */
export const CITIES: Record<string, Coordinates> = {
  maceio: { latitude: -9.6658, longitude: -35.7353 },
  "rio largo": { latitude: -9.4781, longitude: -35.8528 },
  "marechal deodoro": { latitude: -9.7106, longitude: -35.8969 },
  satuba: { latitude: -9.5658, longitude: -35.8228 },
  "coqueiro seco": { latitude: -9.6381, longitude: -35.801 },
  "santa luzia do norte": { latitude: -9.6014, longitude: -35.8239 },
  pilar: { latitude: -9.6014, longitude: -35.9544 },
  paripueira: { latitude: -9.4636, longitude: -35.5519 },
  "barra de sao miguel": { latitude: -9.8397, longitude: -35.9025 },
  messias: { latitude: -9.3917, longitude: -35.8386 },
  murici: { latitude: -9.3067, longitude: -35.9444 },
  arapiraca: { latitude: -9.7525, longitude: -36.6611 },
};
