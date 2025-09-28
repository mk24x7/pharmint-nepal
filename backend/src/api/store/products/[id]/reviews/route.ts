import {
  AuthenticatedMedusaRequest,
  MedusaRequest,
  MedusaResponse,
} from "@medusajs/framework/http"
import { ContainerRegistrationKeys } from "@medusajs/framework/utils"
import { PRODUCT_REVIEW_MODULE } from "../../../../../modules/product-review"
import ProductReviewModuleService from "../../../../../modules/product-review/service"
import { createFindParams } from "@medusajs/medusa/api/utils/validators"
import { createReviewWorkflow } from "../../../../../workflows/create-review"
import { StoreCreateReviewReq } from "../../../reviews/validators"

export const GetStoreReviewsSchema = createFindParams()

export const GET = async (
  req: MedusaRequest,
  res: MedusaResponse
) => {
  const { id } = req.params

  const query = req.scope.resolve(ContainerRegistrationKeys.QUERY)
  const reviewModuleService: ProductReviewModuleService = req.scope.resolve(PRODUCT_REVIEW_MODULE)

  // Get reviews for product
  const { data: reviews, metadata: {
    count,
    take,
    skip
  } = { count: 0, take: 10, skip: 0 } } = await query.graph({
    entity: "review",
    filters: {
      product_id: id,
      status: req.filterableFields?.status || "approved"
    },
    ...req.queryConfig
  })

  res.json({
    reviews,
    count,
    limit: take,
    offset: skip,
    average_rating: await reviewModuleService.getAverageRating(id)
  })
}

export const POST = async (
  req: AuthenticatedMedusaRequest<StoreCreateReviewReq>,
  res: MedusaResponse
) => {
  const input = req.validatedBody
  const product_id = req.params.id
  const customer_id = req.auth_context?.actor_id

  if (!customer_id) {
    return res.status(401).json({ 
      message: "Authentication required to create reviews" 
    })
  }

  // Get customer data
  const query = req.scope.resolve("query")
  const { data: [customer] } = await query.graph({
    entity: "customer",
    fields: ["first_name", "last_name", "email"],
    filters: { id: customer_id },
  })

  if (!customer) {
    return res.status(404).json({ 
      message: "Customer not found" 
    })
  }

  const { result } = await createReviewWorkflow(req.scope)
    .run({
      input: {
        ...input,
        product_id,
        customer_id,
        first_name: customer.first_name || "Anonymous",
        last_name: customer.last_name || "Customer"
      }
    })

  res.json(result)
}



