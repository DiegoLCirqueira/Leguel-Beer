import type { PrismaService } from "../../../common/prisma/prisma.service.js";
import type { Address as AddressRow } from "../../../generated/prisma/client.js";
import type { Address } from "../domain/address.js";
import type { AddressRepository, AddressUpdate } from "../domain/address-repository.js";

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
    profileId: address.ownerId,
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
      const rows = await tx.address.findMany({
        where: { profileId: ownerId },
        orderBy: [{ createdAt: "asc" }, { id: "asc" }],
      });
      const outcome = await decide(rows.map(toAddress));
      if (outcome.addresses) {
        const ids = outcome.addresses.map(({ id }) => id);
        await tx.address.deleteMany({ where: { profileId: ownerId, id: { notIn: ids } } });
        // Tira o padrão de todos antes de gravar: o índice único aceita um padrão só por cliente.
        await tx.address.updateMany({ where: { profileId: ownerId }, data: { isDefault: false } });
        for (const address of outcome.addresses) {
          const { id, ...data } = toRow(address);
          await tx.address.upsert({ where: { id }, create: { id, ...data }, update: data });
        }
      }
      return outcome.result;
    });
  }
}
