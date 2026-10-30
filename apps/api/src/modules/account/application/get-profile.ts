import { NotFoundError } from "../../../common/errors/not-found-error.js";
import type { Profile } from "../domain/profile.js";
import type { ProfileRepository } from "../domain/profile-repository.js";

export class GetProfile {
  constructor(private readonly profiles: ProfileRepository) {}

  /** O perfil da própria conta; sem perfil criado, "não encontrado". */
  async execute(userId: string): Promise<Profile> {
    const profile = await this.profiles.findProfile(userId);
    if (!profile) throw new NotFoundError();
    return profile;
  }
}
