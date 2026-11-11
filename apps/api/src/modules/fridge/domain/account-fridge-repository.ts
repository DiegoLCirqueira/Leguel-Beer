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

  /**
   * Lê, deixa `decide` calcular e grava, tudo sob a mesma trava da conta: nenhuma gravação de outro
   * aparelho entra no meio. `items: null` não grava. Sem perfil ou sem Geladeira guardada, `decide`
   * recebe a lista vazia; gravar sem perfil lança `FridgeOwnerNotFoundError`.
   */
  update<T>(
    profileId: string,
    decide: (current: StoredFridgeItem[]) => FridgeUpdate<T> | Promise<FridgeUpdate<T>>,
  ): Promise<T>;
}

/** O que `update` grava (`null` não grava) e o que devolve a quem chamou. */
export interface FridgeUpdate<T> {
  items: readonly StoredFridgeItem[] | null;
  result: T;
}
