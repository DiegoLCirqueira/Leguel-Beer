import type { ConfiguracaoDeEntrega } from "@leguele/shared";

/** Configurações de entrega no formato do contrato de frete, mais a origem (a cervejaria). */
export type DeliverySettings = ConfiguracaoDeEntrega & {
  readonly origem: { readonly latitude: number; readonly longitude: number };
};

export interface DeliverySettingsRepository {
  get(): Promise<DeliverySettings>;
}
