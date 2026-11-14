import type { PrismaService } from "../../../common/prisma/prisma.service.js";
import type { Address as AddressRow } from "../../../generated/prisma/client.js";
import type { Address } from "../domain/address.js";
import {
  AddressOwnerNotFoundError,
  type AddressRepository,
  type AddressUpdate,
} from "../domain/address-repository.js";

function toAddress(row: AddressRow): Address {
  return {
    id: row.id,
    ownerId: row.profileId,
    nickname: row.nickname ?? undefined,
    zip: row.zip,
    street: row.street,
    number: row.number,
    complement: row.complement ?? undefined,
    district: row.district,
    city: row.city,
    state: row.state as "AL",
    isDefault: row.isDefault,
    coordinates: { latitude: row.latitude, longitude: row.longitude },
    distanceMeters: row.distanceMeters,
    routeOrigin: { latitude: row.routeOriginLatitude, longitude: row.routeOriginLongitude },
    createdAt: row.createdAt,
  };
}

function toRow(address: Address) {
  return {
    id: address.id,
    nickname: address.nickname ?? null,
    zip: address.zip,
    street: address.street,
    number: address.number,
    complement: address.complement ?? null,
    district: address.district,
    city: address.city,
    state: address.state,
    isDefault: address.isDefault,
    latitude: address.coordinates.latitude,
    longitude: address.coordinates.longitude,
    distanceMeters: address.distanceMeters,
    routeOriginLatitude: address.routeOrigin.latitude,
    routeOriginLongitude: address.routeOrigin.longitude,
    createdAt: address.createdAt,
  };
}

export class PrismaAddressRepository implements AddressRepository {
  constructor(private readonly prisma: PrismaService) {}

  async list(ownerId: string): Promise<Address[]> {
    const rows = await this.prisma.address.findMany({
      where: { profileId: ownerId },
      orderBy: [{ createdAt: "asc" }, { id: "asc" }],
    });
    return rows.map(toAddress);
  }

  async update<T>(
    ownerId: string,
    decide: (current: Address[]) => AddressUpdate<T> | Promise<AddressUpdate<T>>,
  ): Promise<T> {
    return this.prisma.$transaction(async (tx) => {
      // Trava a linha do perfil até o fim da transação (NO KEY UPDATE basta e não bloqueia inserções que só referenciam o perfil, como pedidos): as operações da mesma conta passam uma de cada vez.
      const locked = await tx.$queryRaw<
        { id: string }[]
      >`SELECT id FROM profiles WHERE id = ${ownerId}::uuid FOR NO KEY UPDATE`;
      const rows = await tx.address.findMany({
        where: { profileId: ownerId },
        orderBy: [{ createdAt: "asc" }, { id: "asc" }],
      });
      const outcome = await decide(rows.map(toAddress));
      if (outcome.addresses) {
        if (locked.length === 0) throw new AddressOwnerNotFoundError();
        const ids = outcome.addresses.map(({ id }) => id);
        await tx.address.deleteMany({ where: { profileId: ownerId, id: { notIn: ids } } });
        // Tira o padrão de todos antes de gravar: o índice único aceita um padrão só por cliente.
        await tx.address.updateMany({ where: { profileId: ownerId }, data: { isDefault: false } });
        for (const address of outcome.addresses) {
          // O dono vem só da operação (`ownerId`), nunca do dado gravado: entra no filtro e na criação e
          // fica fora do que o `updateMany` escreve, então nenhum endereço muda de dono. Um id de outro
          // cliente cai no create, a chave primária recusa e a transação inteira desfaz.
          const { id, ...data } = toRow(address);
          const { count } = await tx.address.updateMany({
            where: { id, profileId: ownerId },
            data,
          });
          if (count === 0) await tx.address.create({ data: { id, profileId: ownerId, ...data } });
        }
      }
      return outcome.result;
    });
  }
}
