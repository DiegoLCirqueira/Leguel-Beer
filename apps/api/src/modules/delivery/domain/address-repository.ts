import type { Address } from "./address.js";

/** O que `update` grava (`null` não grava) e o que devolve a quem chamou. */
export interface AddressUpdate<T> {
  addresses: readonly Address[] | null;
  result: T;
}

/** Porta dos endereços: sempre os de um dono, nunca os de outro. */
export interface AddressRepository {
  /** Os endereços do dono, do mais antigo para o mais recente. */
  list(ownerId: string): Promise<Address[]>;

  /**
   * Lê, deixa `decide` calcular e grava a lista inteira do dono, tudo sob a mesma trava da conta:
   * duas operações simultâneas da mesma conta passam uma de cada vez. `addresses: null` não grava.
   */
  update<T>(
    ownerId: string,
    decide: (current: Address[]) => AddressUpdate<T> | Promise<AddressUpdate<T>>,
  ): Promise<T>;
}
