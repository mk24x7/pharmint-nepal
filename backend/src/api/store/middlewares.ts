import { MiddlewareRoute } from "@medusajs/medusa";
import { storeApprovalsMiddlewares } from "./approvals/middlewares";
import { storeCompaniesMiddlewares } from "./companies/middlewares";
import { storeQuotesMiddlewares } from "./quotes/middlewares";

export const storeMiddlewares: MiddlewareRoute[] = [
  ...storeCompaniesMiddlewares,
  ...storeQuotesMiddlewares,
  ...storeApprovalsMiddlewares,
];