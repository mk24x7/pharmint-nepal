"use server"

import { sdk } from "@lib/config"
import { HttpTypes } from "@medusajs/types"
import { getAuthHeaders, getCacheOptions } from "./cookies"
import { getRegion } from "./regions"

export const searchProducts = async ({
  query,
  pageParam = 1,
  countryCode,
  categoryId,
  limit = 12,
}: {
  query: string
  pageParam?: number
  countryCode: string
  categoryId?: string
  limit?: number
}): Promise<{
  response: { products: HttpTypes.StoreProduct[]; count: number }
  nextPage: number | null
  queryParams?: any
}> => {
  const region = await getRegion(countryCode)

  if (!region || !query.trim()) {
    return {
      response: { products: [], count: 0 },
      nextPage: null,
    }
  }

  const _pageParam = Math.max(pageParam, 1)
  const offset = (_pageParam === 1) ? 0 : (_pageParam - 1) * limit

  const headers = {
    ...(await getAuthHeaders()),
  }

  const next = {
    ...(await getCacheOptions("search")),
  }

  const queryParams: any = {
    q: query.trim(),
    limit,
    offset,
    region_id: region.id,
    fields: "*variants.calculated_price,+variants.inventory_quantity,+metadata,+tags,+images,+thumbnail",
  }

  // Add category filter if specified
  if (categoryId) {
    queryParams.category_id = [categoryId]
  }

  return sdk.client
    .fetch<{ products: HttpTypes.StoreProduct[]; count: number }>(
      `/store/products`,
      {
        method: "GET",
        query: queryParams,
        headers,
        next,
        cache: "no-store", // Don't cache search results for real-time data
      }
    )
    .then(({ products, count }) => {
      const nextPage = count > offset + limit ? pageParam + 1 : null

      return {
        response: {
          products,
          count,
        },
        nextPage,
        queryParams,
      }
    })
    .catch((error) => {
      console.error("Search error:", error)
      return {
        response: { products: [], count: 0 },
        nextPage: null,
      }
    })
}