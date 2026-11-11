/** Item guardado: só o que o cliente escolheu; nome, imagem e preço atual vêm sempre do catálogo. */
export interface StoredFridgeItem {
  beerId: string;
  quantity: number;
  seenPriceCents: number;
}

/** A conta não tem perfil, então não há onde guardar a Geladeira. */
export class FridgeOwnerNotFoundError extends Error {
  constructor() {
    super("A conta não tem perfil para guardar a Geladeira.");
    this.name = "FridgeOwnerNotFoundError";
  }
}

/** Porta da Geladeira da conta: uma por perfil, sempre a do dono. */
export interface AccountFridgeRepository {
  /** Os itens guardados, na ordem de entrada; vazio se a conta nunca guardou nada. */
  find(profileId: string): Promise<StoredFridgeItem[]>;
  /**
   * Troca a Geladeira inteira pelos itens dados, na ordem dada, numa transação.
   * Lança `FridgeOwnerNotFoundError` se a conta não tem perfil.
   */
  replace(profileId: string, items: readonly StoredFridgeItem[]): Promise<void>;
}
