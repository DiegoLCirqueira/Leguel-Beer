import { NotFoundError } from "../../../common/errors/not-found-error.js";
import type { Profile } from "../domain/profile.js";
import type { ProfileEdit, ProfileRepository } from "../domain/profile-repository.js";

export class EditProfile {
  constructor(private readonly profiles: ProfileRepository) {}

  /**
   * Troca os dados editáveis do perfil da própria conta (o id vem do token). E-mail, papel e aceite
   * dos termos ficam como estão. Sem perfil criado, "não encontrado".
   */
  async execute(userId: string, data: ProfileEdit): Promise<Profile> {
    const profile = await this.profiles.updateProfile(userId, data);
    if (!profile) throw new NotFoundError();
    return profile;
  }
}
