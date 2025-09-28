import { MiddlewareRoute } from "@medusajs/medusa";
import { generalApiLimiter } from "../../../utils/rate-limiter";

export const adminReviewsMiddlewares: MiddlewareRoute[] = [
  {
    method: ["GET", "POST"],
    matcher: "/admin/reviews*",
    middlewares: [
      generalApiLimiter.middleware(),
    ],
  },
];