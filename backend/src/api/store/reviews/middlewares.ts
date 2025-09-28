import {
  authenticate,
  AuthenticatedMedusaRequest,
  MedusaNextFunction,
  MedusaResponse,
  validateAndTransformBody,
  validateAndTransformQuery,
} from "@medusajs/framework";
import { MiddlewareRoute } from "@medusajs/medusa";
import { StoreCreateReview, StoreGetReviews, StoreCreateReviewReq } from "./validators";
import { reviewSubmissionLimiter, reviewReadLimiter } from "../../../utils/rate-limiter";

// Middleware to ensure user has purchased the product
const ensurePurchaseVerification = async (
  req: AuthenticatedMedusaRequest<StoreCreateReviewReq>,
  res: MedusaResponse,
  next: MedusaNextFunction
) => {
  const { product_id } = req.validatedBody;
  const { actor_id: customer_id } = req.auth_context;

  if (!customer_id) {
    return res.status(401).json({ 
      message: "Authentication required to leave reviews" 
    });
  }

  const query = req.scope.resolve("query");

  // Check if customer has purchased this product
  const { data: orders } = await query.graph({
    entity: "order",
    fields: [
      "id",
      "items.product_id",
    ],
    filters: {
      customer_id,
      status: "completed"
    },
  });

  const hasPurchased = orders.some((order: any) => 
    order.items?.some((item: any) => item.product_id === product_id)
  );

  if (!hasPurchased) {
    return res.status(403).json({ 
      message: "You can only review products you have purchased" 
    });
  }

  // Check if customer has already reviewed this product
  const { data: existingReviews } = await query.graph({
    entity: "review",
    fields: ["id"],
    filters: {
      customer_id,
      product_id
    },
  });

  if (existingReviews.length > 0) {
    return res.status(409).json({ 
      message: "You have already reviewed this product" 
    });
  }

  next();
};

export const storeReviewsMiddlewares: MiddlewareRoute[] = [
  {
    method: ["POST"],
    matcher: "/store/reviews*",
    middlewares: [
      reviewSubmissionLimiter.middleware(),
      authenticate("customer", ["session", "bearer"]),
    ],
  },
  {
    method: ["POST"],
    matcher: "/store/products/*/reviews*",
    middlewares: [
      reviewSubmissionLimiter.middleware(),
      authenticate("customer", ["session", "bearer"]),
    ],
  },
  {
    method: ["GET"],
    matcher: "/store/reviews",
    middlewares: [
      reviewReadLimiter.middleware(),
      validateAndTransformQuery(StoreGetReviews, {}),
    ],
  },
  {
    method: ["GET"],
    matcher: "/store/products/*/reviews*",
    middlewares: [
      reviewReadLimiter.middleware(),
    ],
  },
  {
    method: ["POST"],
    matcher: "/store/reviews",
    middlewares: [
      validateAndTransformBody(StoreCreateReview),
      ensurePurchaseVerification,
    ],
  },
  {
    method: ["POST"],
    matcher: "/store/products/:id/reviews",
    middlewares: [
      validateAndTransformBody(StoreCreateReview),
      ensurePurchaseVerification,
    ],
  },
];