import {
  MedusaNextFunction,
  MedusaRequest,
  MedusaResponse,
} from "@medusajs/framework";
import { defineMiddlewares } from "@medusajs/medusa";
import { adminMiddlewares } from "./admin/middlewares";
import { storeMiddlewares } from "./store/middlewares";
import { storeReviewsMiddlewares } from "./store/reviews/middlewares";
import { adminReviewsMiddlewares } from "./admin/reviews/middlewares";

export default defineMiddlewares({
  routes: [
    ...adminMiddlewares,
    ...adminReviewsMiddlewares,
    ...storeMiddlewares,
    ...storeReviewsMiddlewares,
    {
      matcher: "/store/customers/me",
      middlewares: [
        (req: MedusaRequest, res: MedusaResponse, next: MedusaNextFunction) => {
          req.allowed = ["employee"];
          next();
        },
      ],
    },
  ],
});