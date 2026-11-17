import type { ProfileRepository } from "../../account/domain/profile-repository.js";
import type { CustomerSource, OrderCustomer } from "../domain/create-order-ports.js";

/** O pedido lê nome, telefone e data de nascimento pela porta de perfis do módulo da conta. */
export class ProfileCustomerSource implements CustomerSource {
  constructor(private readonly profiles: ProfileRepository) {}

  async find(ownerId: string): Promise<OrderCustomer | null> {
    const profile = await this.profiles.findProfile(ownerId);
    if (!profile) return null;
    return {
      nome: profile.nome,
      telefone: profile.telefone,
      dataNascimento: profile.dataNascimento,
    };
  }
}
