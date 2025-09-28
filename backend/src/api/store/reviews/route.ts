import type {
  AuthenticatedMedusaRequest,
  MedusaResponse,
} from "@medusajs/framework/http"
import { createReviewWorkflow } from "../../../workflows/create-review"
import { StoreCreateReviewReq } from "./validators"
import { createFindParams } from "@medusajs/medusa/api/utils/validators"

export const GET = async (
  req: AuthenticatedMedusaRequest,
  res: MedusaResponse
) => {
  const query = req.scope.resolve("query")
  
  const { 
    data: reviews, 
    metadata: { count, take, skip } = {
      count: 0,
      take: 20,
      skip: 0
    },
  } = await query.graph({
    entity: "review",
    filters: {
      ...req.filterableFields,
      status: req.filterableFields?.status || "approved"
    },
    ...req.queryConfig,
  })

  res.json({ 
    reviews,
    count,
    limit: take,
    offset: skip,
  })
}

export const POST = async (
  req: AuthenticatedMedusaRequest<StoreCreateReviewReq>,
  res: MedusaResponse
) => {
  const input = req.validatedBody
  const customer_id = req.auth_context?.actor_id

  if (!customer_id) {
    return res.status(401).json({ 
      message: "Authentication required to create reviews" 
    })
  }

  // Get customer data to use instead of manual first_name/last_name
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
        customer_id,
        first_name: customer.first_name || "Anonymous",
        last_name: customer.last_name || "Customer"
      }
    })

  res.json(result)
}




