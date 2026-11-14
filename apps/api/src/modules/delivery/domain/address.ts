export interface Coordinates {
  latitude: number;
  longitude: number;
}

/** Dados de um endereço como o cliente os informa (o CEP já normalizado, 8 dígitos). */
export interface AddressInput {
  nickname?: string | undefined;
  zip: string;
  street: string;
  number: string;
  complement?: string | undefined;
  district: string;
  city: string;
  state: "AL";
}

export interface Address extends AddressInput {
  id: string;
  ownerId: string;
  isDefault: boolean;
  /** Calculadas pela API ao salvar; o site nunca as envia. */
  coordinates: Coordinates;
  /** Distância de rota até a origem, em metros; `null` quando não há rota (fora da área). */
  distanceMeters: number | null;
  /** Origem (cervejaria) usada no cálculo da distância, para recalcular se ela mudar. */
  routeOrigin: Coordinates;
  createdAt: Date;
}
