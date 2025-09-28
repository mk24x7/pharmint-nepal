"use client"

import React from "react"
import StarRating from "./star-rating"

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

interface ReviewItemProps {
  review: Review
  showVerified?: boolean
}

const ReviewItem: React.FC<ReviewItemProps> = ({
  review,
  showVerified = true
}) => {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffTime = Math.abs(now.getTime() - date.getTime())
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24))
    
    if (diffDays === 0) {
      return "Today"
    } else if (diffDays === 1) {
      return "1 day ago"
    } else if (diffDays < 7) {
      return `${diffDays} days ago`
    } else if (diffDays < 30) {
      const weeks = Math.floor(diffDays / 7)
      return weeks === 1 ? "1 week ago" : `${weeks} weeks ago`
    } else if (diffDays < 365) {
      const months = Math.floor(diffDays / 30)
      return months === 1 ? "1 month ago" : `${months} months ago`
    } else {
      const years = Math.floor(diffDays / 365)
      return years === 1 ? "1 year ago" : `${years} years ago`
    }
  }

  const displayName = review.customer_id 
    ? `${review.first_name} ${review.last_name.charAt(0)}.`
    : "Anonymous Customer"

  return (
    <div className="border-b border-ui-border-base pb-6 last:border-b-0 last:pb-0">
      <div className="space-y-3">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2">
          <div className="space-y-1">
            <div className="flex items-center gap-2 flex-wrap">
              <StarRating rating={review.rating} size="sm" />
              {review.title && (
                <h4 className="font-medium text-ui-fg-base text-sm">
                  {review.title}
                </h4>
              )}
            </div>
            <div className="flex items-center gap-2 text-xs text-ui-fg-subtle flex-wrap">
              <span>by {displayName}</span>
              {showVerified && review.customer_id && (
                <>
                  <span>•</span>
                  <div className="flex items-center gap-1 text-green-600">
                    <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    <span>Verified Purchase</span>
                  </div>
                </>
              )}
              <span>•</span>
              <span>{formatDate(review.created_at)}</span>
            </div>
          </div>
        </div>

        {/* Review Content */}
        <div className="space-y-2">
          <p className="text-ui-fg-base text-sm leading-relaxed whitespace-pre-wrap">
            {review.content}
          </p>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-4 pt-2">
          <button className="flex items-center gap-1 text-xs text-ui-fg-subtle hover:text-ui-fg-base transition-colors">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V18m-7-8a2 2 0 01-2-2V4a2 2 0 012-2h2.07a2 2 0 011.99 1.81l.853 9.39M7 20a2 2 0 002 2h.096c.5 0 .905-.405.905-.904 0-.715.211-1.413.608-2.008L11 17M7 20a2 2 0 01-2-2V9a2 2 0 012-2h1m0 0V4a2 2 0 012-2h4a2 2 0 012 2v3m0 0a2 2 0 010 4h-8a2 2 0 01-2-2V9z" />
            </svg>
            <span>Helpful</span>
          </button>
          
          <button className="text-xs text-ui-fg-subtle hover:text-ui-fg-base transition-colors">
            Report
          </button>
        </div>
      </div>
    </div>
  )
}

export default ReviewItem