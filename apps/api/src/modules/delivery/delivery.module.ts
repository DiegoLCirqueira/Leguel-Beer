import { Module } from "@nestjs/common";
import { FridgeModule } from "../fridge/fridge.module.js";
import { GetAccountFridge } from "../fridge/application/get-account-fridge.js";
import { PrismaService } from "../../common/prisma/prisma.service.js";
import { randomUUID } from "node:crypto";
import { AddAddress } from "./application/add-address.js";
import { DeleteAddress } from "./application/delete-address.js";
import { QuoteShipping } from "./application/quote-shipping.js";
import { ListAddresses } from "./application/list-addresses.js";
import { SetDefaultAddress } from "./application/set-default-address.js";
import { UpdateAddress } from "./application/update-address.js";
import {
  ADDRESS_REPOSITORY,
  DELIVERY_SETTINGS_REPOSITORY,
  FRIDGE_SUBTOTAL,
} from "./delivery.tokens.js";
import { GEOCODER, ROUTE_CALCULATOR } from "./delivery.tokens.js";
import type { AddressRepository } from "./domain/address-repository.js";
import type { Geocoder, RouteCalculator } from "./domain/maps.js";
import type { FridgeSubtotalProvider } from "./domain/fridge-subtotal.js";
import type { DeliverySettingsRepository } from "./domain/delivery-settings-repository.js";
import { AccountFridgeSubtotal } from "./infrastructure/account-fridge-subtotal.js";
import { PrismaAddressRepository } from "./infrastructure/prisma-address-repository.js";
import { PrismaDeliverySettingsRepository } from "./infrastructure/prisma-delivery-settings-repository.js";
import { mapsAdapterFromEnv } from "./infrastructure/maps-adapter.js";
import { AddressController } from "./presentation/address.controller.js";

@Module({
  imports: [FridgeModule],
  controllers: [AddressController],
  exports: [QuoteShipping],
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
    // `MAPS_ADAPTER=local` liga os mapas locais do MVP; sem ela a API responde 503 e nunca inventa coordenadas.
    { provide: GEOCODER, useFactory: () => mapsAdapterFromEnv(process.env) },
    { provide: ROUTE_CALCULATOR, useFactory: () => mapsAdapterFromEnv(process.env) },
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
      provide: UpdateAddress,
      useFactory: (
        addresses: AddressRepository,
        geocoder: Geocoder,
        router: RouteCalculator,
        settings: DeliverySettingsRepository,
      ) => new UpdateAddress(addresses, geocoder, router, settings),
      inject: [ADDRESS_REPOSITORY, GEOCODER, ROUTE_CALCULATOR, DELIVERY_SETTINGS_REPOSITORY],
    },
    {
      provide: DeleteAddress,
      useFactory: (addresses: AddressRepository) => new DeleteAddress(addresses),
      inject: [ADDRESS_REPOSITORY],
    },
    {
      provide: SetDefaultAddress,
      useFactory: (addresses: AddressRepository) => new SetDefaultAddress(addresses),
      inject: [ADDRESS_REPOSITORY],
    },
    {
      provide: FRIDGE_SUBTOTAL,
      useFactory: (fridge: GetAccountFridge) => new AccountFridgeSubtotal(fridge),
      inject: [GetAccountFridge],
    },
    {
      provide: QuoteShipping,
      useFactory: (
        addresses: AddressRepository,
        settings: DeliverySettingsRepository,
        router: RouteCalculator,
        subtotal: FridgeSubtotalProvider,
      ) => new QuoteShipping(addresses, settings, router, subtotal),
      inject: [ADDRESS_REPOSITORY, DELIVERY_SETTINGS_REPOSITORY, ROUTE_CALCULATOR, FRIDGE_SUBTOTAL],
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
