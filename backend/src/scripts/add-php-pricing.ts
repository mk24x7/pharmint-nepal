import { ExecArgs } from "@medusajs/framework/types";
import {
  ContainerRegistrationKeys,
  Modules,
} from "@medusajs/framework/utils";
import {
  updateProductVariantsWorkflow,
} from "@medusajs/medusa/core-flows";

export default async function addPhpPricing({ container }: ExecArgs) {
  const logger = container.resolve(ContainerRegistrationKeys.LOGGER);
  const productModuleService = container.resolve(Modules.PRODUCT);

  logger.info("Adding PHP pricing to existing products...");

  // Get all products
  const products = await productModuleService.listProducts({}, {
    relations: ["variants"]
  });

  logger.info(`Found ${products.length} products`);

  // Exchange rate: 1 EUR = 60 PHP, 1 USD = 55 PHP (approximate)
  const eurToPhp = 60;
  const usdToPhp = 55;

  for (const product of products) {
    logger.info(`Processing product: ${product.title}`);
    
    for (const variant of product.variants || []) {
      try {
        // Get existing prices to calculate PHP equivalent
        const prices = variant.prices || [];
        let phpPrice = 500; // default PHP price
        
        // Calculate PHP price based on EUR or USD price
        const eurPrice = prices.find(p => p.currency_code === "eur");
        const usdPrice = prices.find(p => p.currency_code === "usd");
        
        if (eurPrice && eurPrice.amount) {
          phpPrice = Math.round(eurPrice.amount * eurToPhp);
        } else if (usdPrice && usdPrice.amount) {
          phpPrice = Math.round(usdPrice.amount * usdToPhp);
        }

        // Add PHP pricing
        await updateProductVariantsWorkflow(container).run({
          input: {
            selector: { id: variant.id },
            update: {
              prices: [
                ...prices,
                {
                  amount: phpPrice,
                  currency_code: "php",
                }
              ]
            }
          }
        });

        logger.info(`Added PHP pricing (₱${phpPrice}) to variant: ${variant.title}`);
      } catch (error) {
        logger.error(`Failed to add pricing to variant ${variant.id}:`, error);
      }
    }
  }

  logger.info("Completed adding PHP pricing to products!");
}