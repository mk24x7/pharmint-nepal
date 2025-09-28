"use client"

import React, { useState } from "react"
import { Button } from "@medusajs/ui"
import ReviewItem from "./review-item"

interface Review {
  id: string
  title?: string
  content: string
  rating: number
  first_name: string
  last_name: string
  customer_id?: string
  created_at: string
  status: "pending" | "approved" | "rejected"
}

interface ReviewFeedProps {
  reviews: Review[]
  totalReviews: number
  onLoadMore?: () => Promise<void>
  isLoading?: boolean
  hasMore?: boolean
}

const ReviewFeed: React.FC<ReviewFeedProps> = ({
  reviews,
  totalReviews,
  onLoadMore,
  isLoading = false,
  hasMore = false
}) => {
  const [sortBy, setSortBy] = useState<"newest" | "oldest" | "highest" | "lowest">("newest")

  const sortedReviews = [...reviews].sort((a, b) => {
    switch (sortBy) {
      case "newest":
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      case "oldest":
        return new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
      case "highest":
        return b.rating - a.rating
      case "lowest":
        return a.rating - b.rating
      default:
        return 0
    }
  })

  if (totalReviews === 0) {
    return (
      <div className="text-center py-12 space-y-3">
        <div className="w-16 h-16 mx-auto text-ui-fg-muted flex items-center justify-center">
          <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" className="w-12 h-12">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.563.563 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z" />
          </svg>
        </div>
        <div>
          <h3 className="text-lg font-medium text-ui-fg-base">No reviews yet</h3>
          <p className="text-sm text-ui-fg-subtle mt-1">
            Be the first to share your experience with this product
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Sort Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-4 border-b border-ui-border-base">
        <h3 className="text-lg font-semibold text-ui-fg-base">
          Customer Reviews ({totalReviews})
        </h3>
        
        <div className="flex items-center gap-2">
          <span className="text-sm text-ui-fg-subtle hidden sm:block">Sort by:</span>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
            className="px-3 py-1.5 text-sm border border-ui-border-base rounded-lg bg-ui-bg-base text-ui-fg-base focus:ring-2 focus:ring-ui-border-interactive focus:border-transparent"
          >
            <option value="newest">Newest First</option>
            <option value="oldest">Oldest First</option>
            <option value="highest">Highest Rating</option>
            <option value="lowest">Lowest Rating</option>
          </select>
        </div>
      </div>

      {/* Reviews List */}
      <div className="space-y-6">
        {sortedReviews.map((review) => (
          <ReviewItem key={review.id} review={review} />
        ))}
      </div>

      {/* Load More */}
      {hasMore && (
        <div className="text-center pt-6">
          <Button
            onClick={onLoadMore}
            disabled={isLoading}
            variant="secondary"
            className="w-full sm:w-auto min-w-[200px]"
          >
            {isLoading ? "Loading..." : "Load More Reviews"}
          </Button>
        </div>
      )}

      {/* Showing X of Y */}
      {reviews.length > 0 && reviews.length < totalReviews && (
        <div className="text-center text-sm text-ui-fg-subtle">
          Showing {reviews.length} of {totalReviews} reviews
        </div>
      )}
    </div>
  )
}

export default ReviewFeed