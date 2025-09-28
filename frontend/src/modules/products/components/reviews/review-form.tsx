"use client"

import React, { useState } from "react"
import { Button } from "@medusajs/ui"
import StarRating from "./star-rating"

interface ReviewFormProps {
  productId: string
  onSubmit: (review: {
    title?: string
    content: string
    rating: number
  }) => Promise<void>
  isLoading?: boolean
}

const ReviewForm: React.FC<ReviewFormProps> = ({
  productId,
  onSubmit,
  isLoading = false
}) => {
  const [rating, setRating] = useState(0)
  const [title, setTitle] = useState("")
  const [content, setContent] = useState("")
  const [hoveredRating, setHoveredRating] = useState(0)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (rating === 0) {
      alert("Please select a rating")
      return
    }
    
    if (content.trim().length === 0) {
      alert("Please write a review")
      return
    }

    setIsSubmitting(true)
    try {
      await onSubmit({
        title: title.trim() || undefined,
        content: content.trim(),
        rating
      })
      
      // Reset form
      setRating(0)
      setTitle("")
      setContent("")
    } catch (error) {
      console.error("Failed to submit review:", error)
      alert("Failed to submit review. Please try again.")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-lg font-semibold text-ui-fg-base mb-4">
          Write a Review
        </h3>
        
        {/* Rating Selection */}
        <div className="space-y-2 mb-4">
          <label className="block text-sm font-medium text-ui-fg-base">
            Rating <span className="text-red-500">*</span>
          </label>
          <div className="flex items-center gap-1">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                type="button"
                className="focus:outline-none focus:ring-2 focus:ring-ui-border-interactive rounded"
                onMouseEnter={() => setHoveredRating(star)}
                onMouseLeave={() => setHoveredRating(0)}
                onClick={() => setRating(star)}
              >
                <svg
                  className={`w-8 h-8 transition-colors ${
                    star <= (hoveredRating || rating)
                      ? "text-yellow-400"
                      : "text-gray-300"
                  } fill-current`}
                  viewBox="0 0 20 20"
                >
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
              </button>
            ))}
            <span className="ml-2 text-sm text-ui-fg-subtle">
              {rating > 0 && (
                <>
                  {rating === 1 && "Poor"}
                  {rating === 2 && "Fair"}
                  {rating === 3 && "Good"}
                  {rating === 4 && "Very Good"}
                  {rating === 5 && "Excellent"}
                </>
              )}
            </span>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Review Title */}
          <div>
            <label htmlFor="review-title" className="block text-sm font-medium text-ui-fg-base mb-1">
              Review Title (Optional)
            </label>
            <input
              type="text"
              id="review-title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              maxLength={100}
              placeholder="Summarize your experience"
              className="w-full px-3 py-2 border border-ui-border-base rounded-lg focus:ring-2 focus:ring-ui-border-interactive focus:border-transparent bg-ui-bg-base text-ui-fg-base placeholder:text-ui-fg-muted transition-colors"
            />
            <div className="text-xs text-ui-fg-subtle mt-1">
              {title.length}/100 characters
            </div>
          </div>

          {/* Review Content */}
          <div>
            <label htmlFor="review-content" className="block text-sm font-medium text-ui-fg-base mb-1">
              Your Review <span className="text-red-500">*</span>
            </label>
            <textarea
              id="review-content"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              maxLength={2000}
              rows={4}
              placeholder="Share your experience with this product..."
              className="w-full px-3 py-2 border border-ui-border-base rounded-lg focus:ring-2 focus:ring-ui-border-interactive focus:border-transparent bg-ui-bg-base text-ui-fg-base placeholder:text-ui-fg-muted resize-none transition-colors"
              required
            />
            <div className="text-xs text-ui-fg-subtle mt-1">
              {content.length}/2000 characters
            </div>
          </div>

          {/* Submit Button */}
          <div className="flex flex-col sm:flex-row gap-3 pt-2">
            <Button
              type="submit"
              disabled={rating === 0 || content.trim().length === 0 || isSubmitting || isLoading}
              className="w-full sm:w-auto"
              size="base"
            >
              {isSubmitting ? "Submitting..." : "Submit Review"}
            </Button>
            
            {/* Guidelines */}
            <div className="text-xs text-ui-fg-subtle space-y-1">
              <div className="flex items-center gap-1">
                <svg className="w-3 h-3 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                <span>Only verified purchasers can review</span>
              </div>
              <div className="flex items-center gap-1">
                <svg className="w-3 h-3 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                <span>Reviews are moderated before publishing</span>
              </div>
              <div className="flex items-center gap-1">
                <svg className="w-3 h-3 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                <span>One review per customer per product</span>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  )
}

export default ReviewForm