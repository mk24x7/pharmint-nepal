import { Metadata } from "next"

import ReviewsOverview from "@modules/account/components/reviews-overview"
import { notFound } from "next/navigation"
import { listOrders } from "@lib/data/orders"

export const metadata: Metadata = {
  title: "Reviews",
  description: "Manage your product reviews and ratings.",
}

export default async function Reviews() {
  const orders = await listOrders()

  if (!orders) {
    notFound()
  }

  return (
    <div className="w-full" data-testid="reviews-page-wrapper">
      <div className="mb-8 flex flex-col gap-y-4">
        <h1 className="text-2xl-semi text-pharmint-white">Reviews</h1>
        <p className="text-base-regular text-pharmint-muted">
          View and manage your product reviews and ratings. Write reviews for products you've purchased and track their status.
        </p>
      </div>
      <div>
        <ReviewsOverview orders={orders} />
      </div>
    </div>
  )
}