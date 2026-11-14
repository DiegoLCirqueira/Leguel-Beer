import { Module } from "@nestjs/common";
import { PrismaService } from "../../common/prisma/prisma.service.js";
import { randomUUID } from "node:crypto";
import { AddAddress } from "./application/add-address.js";
import { ListAddresses } from "./application/list-addresses.js";
import { ADDRESS_REPOSITORY, DELIVERY_SETTINGS_REPOSITORY } from "./delivery.tokens.js";
import { GEOCODER, ROUTE_CALCULATOR } from "./delivery.tokens.js";
import type { AddressRepository } from "./domain/address-repository.js";
import type { Geocoder, RouteCalculator } from "./domain/maps.js";
import type { DeliverySettingsRepository } from "./domain/delivery-settings-repository.js";
import { PrismaAddressRepository } from "./infrastructure/prisma-address-repository.js";
import { PrismaDeliverySettingsRepository } from "./infrastructure/prisma-delivery-settings-repository.js";
import { UnconfiguredMaps } from "./infrastructure/unconfigured-maps.js";
import { AddressController } from "./presentation/address.controller.js";

@Module({
  controllers: [AddressController],
  providers: [
    {
      provide: ADDRESS_REPOSITORY,
      useFactory: (prisma: PrismaService) => new PrismaAddressRepository(prisma),
      inject: [PrismaService],
    },
    {
      provide: DELIVERY_SETTINGS_REPOSITORY,
      useFactory: (prisma: PrismaService) => new PrismaDeliverySettingsRepository(prisma),
      inject: [PrismaService],
    },
    // Sem serviço de mapas configurado, a API responde 503 e nunca inventa coordenadas.
    { provide: GEOCODER, useClass: UnconfiguredMaps },
    { provide: ROUTE_CALCULATOR, useClass: UnconfiguredMaps },
    {
      provide: AddAddress,
      useFactory: (
        addresses: AddressRepository,
        geocoder: Geocoder,
        router: RouteCalculator,
        settings: DeliverySettingsRepository,
      ) => new AddAddress(addresses, geocoder, router, settings, randomUUID, () => new Date()),
      inject: [ADDRESS_REPOSITORY, GEOCODER, ROUTE_CALCULATOR, DELIVERY_SETTINGS_REPOSITORY],
    },
    {
      provide: ListAddresses,
      useFactory: (addresses: AddressRepository, settings: DeliverySettingsRepository) =>
        new ListAddresses(addresses, settings),
      inject: [ADDRESS_REPOSITORY, DELIVERY_SETTINGS_REPOSITORY],
    },
  ],
})
export class DeliveryModule {}
