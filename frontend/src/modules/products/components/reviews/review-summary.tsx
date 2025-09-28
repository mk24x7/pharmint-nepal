"use client"

import React from "react"
import StarRating from "./star-rating"

interface ReviewSummaryProps {
  averageRating: number
  totalReviews: number
  ratingDistribution?: {
    5: number
    4: number
    3: number
    2: number
    1: number
  }
}

const ReviewSummary: React.FC<ReviewSummaryProps> = ({
  averageRating,
  totalReviews,
  ratingDistribution
}) => {
  const distribution = ratingDistribution || {
    5: 0, 4: 0, 3: 0, 2: 0, 1: 0
  }

  return (
    <div className="space-y-4">
      {/* Overall Rating */}
      <div className="text-center sm:text-left">
        <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
          <StarRating rating={averageRating} size="lg" showRating />
          <div>
            <div className="text-2xl font-semibold text-ui-fg-base">
              {averageRating > 0 ? averageRating.toFixed(1) : "No ratings"}
            </div>
            <div className="text-sm text-ui-fg-subtle">
              {totalReviews} {totalReviews === 1 ? "review" : "reviews"}
            </div>
          </div>
        </div>
      </div>

      {/* Rating Distribution */}
      {totalReviews > 0 && (
        <div className="space-y-2">
          <h4 className="text-sm font-medium text-ui-fg-base mb-3">
            Rating Breakdown
          </h4>
          {[5, 4, 3, 2, 1].map((rating) => {
            const count = distribution[rating as keyof typeof distribution]
            const percentage = totalReviews > 0 ? (count / totalReviews) * 100 : 0
            
            return (
              <div key={rating} className="flex items-center gap-2 text-xs">
                <div className="flex items-center gap-1 w-12">
                  <span className="text-ui-fg-subtle">{rating}</span>
                  <svg className="w-3 h-3 text-yellow-400 fill-current">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                </div>
                <div className="flex-1 flex items-center gap-2">
                  <div className="flex-1 bg-ui-border-base rounded-full h-1.5 overflow-hidden">
                    <div 
                      className="h-full bg-yellow-400 transition-all duration-300"
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                  <span className="text-ui-fg-subtle min-w-[2rem] text-right">
                    {count}
                  </span>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

export default ReviewSummary