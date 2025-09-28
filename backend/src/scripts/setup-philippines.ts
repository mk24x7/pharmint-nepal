import { ExecArgs } from "@medusajs/framework/types";
import {
  ContainerRegistrationKeys,
  Modules,
} from "@medusajs/framework/utils";
import {
  createRegionsWorkflow,
  createTaxRegionsWorkflow,
  updateStoresWorkflow,
  deleteRegionsWorkflow,
} from "@medusajs/medusa/core-flows";

export default async function setupPhilippines({ container }: ExecArgs) {
  const logger = container.resolve(ContainerRegistrationKeys.LOGGER);
  const storeModuleService = container.resolve(Modules.STORE);
  const regionModuleService = container.resolve(Modules.REGION);

  logger.info("Starting Philippines region setup...");

  // Get the store
  const [store] = await storeModuleService.listStores();
  if (!store) {
    logger.error("No store found!");
    return;
  }

  logger.info("Updating store currencies to support PHP and USD...");
  
  // Update store to support PHP and USD currencies
  await updateStoresWorkflow(container).run({
    input: {
      selector: { id: store.id },
      update: {
        supported_currencies: [
          {
            currency_code: "php",
            is_default: true,
          },
          {
            currency_code: "usd",
          },
        ],
      },
    },
  });

  logger.info("Removing existing regions...");
  
  // Get existing regions and remove them
  const existingRegions = await regionModuleService.listRegions();
  if (existingRegions.length > 0) {
    await deleteRegionsWorkflow(container).run({
      input: {
        ids: existingRegions.map(r => r.id),
      },
    });
  }

  logger.info("Creating Philippines region...");
  
  // Create Philippines region
  const { result: regionResult } = await createRegionsWorkflow(container).run({
    input: {
      regions: [
        {
          name: "Philippines",
          currency_code: "php",
          countries: ["ph"],
          payment_providers: ["pp_system_default"],
        },
      ],
    },
  });
  
  const philippinesRegion = regionResult[0];
  logger.info(`Created Philippines region with ID: ${philippinesRegion.id}`);

  logger.info("Setting up tax regions for Philippines...");
  
  // Create tax region for Philippines
  await createTaxRegionsWorkflow(container).run({
    input: [
      {
        country_code: "ph",
        provider_id: "tp_system"
      }
    ],
  });

  logger.info("Philippines region setup completed successfully!");
  logger.info("Region details:", {
    id: philippinesRegion.id,
    name: philippinesRegion.name,
    currency_code: philippinesRegion.currency_code,
    countries: philippinesRegion.countries?.map(c => c.iso_2),
  });
}