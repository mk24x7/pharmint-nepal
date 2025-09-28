import { ExecArgs } from "@medusajs/framework/types";
import {
  ContainerRegistrationKeys,
  Modules,
} from "@medusajs/framework/utils";
import {
  createShippingOptionsWorkflow,
  createStockLocationsWorkflow,
  linkSalesChannelsToStockLocationWorkflow,
} from "@medusajs/medusa/core-flows";

export default async function setupPhilippinesShipping({ container }: ExecArgs) {
  const logger = container.resolve(ContainerRegistrationKeys.LOGGER);
  const link = container.resolve(ContainerRegistrationKeys.LINK);
  const fulfillmentModuleService = container.resolve(Modules.FULFILLMENT);
  const regionModuleService = container.resolve(Modules.REGION);
  const salesChannelModuleService = container.resolve(Modules.SALES_CHANNEL);
  const stockLocationModuleService = container.resolve(Modules.STOCK_LOCATION);

  logger.info("Setting up Philippines shipping configuration...");

  // Get Philippines region
  const regions = await regionModuleService.listRegions({
    name: "Philippines"
  });
  
  if (regions.length === 0) {
    logger.error("Philippines region not found!");
    return;
  }
  
  const philippinesRegion = regions[0];
  logger.info(`Found Philippines region: ${philippinesRegion.id}`);

  // Get default sales channel
  const salesChannels = await salesChannelModuleService.listSalesChannels({
    name: "Default Sales Channel"
  });
  
  const defaultSalesChannel = salesChannels[0];
  if (!defaultSalesChannel) {
    logger.error("Default sales channel not found!");
    return;
  }

  // Check if stock location already exists
  let stockLocations = await stockLocationModuleService.listStockLocations({
    name: "Philippines Warehouse"
  });

  let philippinesStockLocation;

  if (stockLocations.length === 0) {
    logger.info("Creating Philippines warehouse stock location...");
    
    // Create Philippines stock location
    const { result: stockLocationResult } = await createStockLocationsWorkflow(container).run({
      input: {
        locations: [
          {
            name: "Philippines Warehouse",
            address: {
              city: "Manila",
              country_code: "PH",
              address_1: "Metro Manila",
            },
          },
        ],
      },
    });
    philippinesStockLocation = stockLocationResult[0];
  } else {
    philippinesStockLocation = stockLocations[0];
    logger.info(`Using existing stock location: ${philippinesStockLocation.id}`);
  }

  // Link stock location to fulfillment provider
  await link.create({
    [Modules.STOCK_LOCATION]: {
      stock_location_id: philippinesStockLocation.id,
    },
    [Modules.FULFILLMENT]: {
      fulfillment_provider_id: "manual_manual",
    },
  });

  // Get or create fulfillment set for Philippines
  logger.info("Setting up fulfillment configuration for Philippines...");
  
  const existingFulfillmentSets = await fulfillmentModuleService.listFulfillmentSets({
    name: "Philippines Delivery"
  });

  let fulfillmentSet;
  
  if (existingFulfillmentSets.length === 0) {
    fulfillmentSet = await fulfillmentModuleService.createFulfillmentSets({
      name: "Philippines Delivery",
      type: "shipping",
      service_zones: [
        {
          name: "Philippines",
          geo_zones: [
            {
              country_code: "ph",
              type: "country",
            },
          ],
        },
      ],
    });
  } else {
    fulfillmentSet = existingFulfillmentSets[0];
  }

  // Link stock location to fulfillment set
  await link.create({
    [Modules.STOCK_LOCATION]: {
      stock_location_id: philippinesStockLocation.id,
    },
    [Modules.FULFILLMENT]: {
      fulfillment_set_id: fulfillmentSet.id,
    },
  });

  // Get shipping profile
  const shippingProfiles = await fulfillmentModuleService.listShippingProfiles({
    type: "default"
  });
  const shippingProfile = shippingProfiles[0];

  if (!shippingProfile) {
    logger.error("Default shipping profile not found!");
    return;
  }

  logger.info("Creating shipping options for Philippines...");
  
  // Create shipping options for Philippines
  await createShippingOptionsWorkflow(container).run({
    input: [
      {
        name: "Standard Delivery",
        price_type: "flat",
        provider_id: "manual_manual",
        service_zone_id: fulfillmentSet.service_zones[0].id,
        shipping_profile_id: shippingProfile.id,
        type: {
          label: "Standard",
          description: "Delivery within 3-5 business days",
          code: "standard",
        },
        prices: [
          {
            currency_code: "php",
            amount: 150, // ₱150
          },
          {
            currency_code: "usd",
            amount: 3, // $3
          },
          {
            region_id: philippinesRegion.id,
            amount: 150,
          },
        ],
        rules: [
          {
            attribute: "enabled_in_store",
            value: "true",
            operator: "eq",
          },
          {
            attribute: "is_return",
            value: "false",
            operator: "eq",
          },
        ],
      },
      {
        name: "Express Delivery",
        price_type: "flat",
        provider_id: "manual_manual",
        service_zone_id: fulfillmentSet.service_zones[0].id,
        shipping_profile_id: shippingProfile.id,
        type: {
          label: "Express",
          description: "Next-day delivery within Metro Manila",
          code: "express",
        },
        prices: [
          {
            currency_code: "php",
            amount: 300, // ₱300
          },
          {
            currency_code: "usd",
            amount: 6, // $6
          },
          {
            region_id: philippinesRegion.id,
            amount: 300,
          },
        ],
        rules: [
          {
            attribute: "enabled_in_store",
            value: "true",
            operator: "eq",
          },
          {
            attribute: "is_return",
            value: "false",
            operator: "eq",
          },
        ],
      },
    ],
  });

  // Link sales channel to stock location
  await linkSalesChannelsToStockLocationWorkflow(container).run({
    input: {
      id: philippinesStockLocation.id,
      add: [defaultSalesChannel.id],
    },
  });

  logger.info("Philippines shipping configuration completed successfully!");
  logger.info("Available delivery options:");
  logger.info("- Standard Delivery: ₱150 (3-5 business days)");
  logger.info("- Express Delivery: ₱300 (Next-day in Metro Manila)");
}