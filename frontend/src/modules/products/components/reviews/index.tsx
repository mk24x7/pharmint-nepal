"use client"

import React, { useState, useEffect } from "react"
import { HttpTypes } from "@medusajs/types"
import ReviewSummary from "./review-summary"
import ReviewForm from "./review-form"
import ReviewFeed from "./review-feed"
import AuthPrompt from "./auth-prompt"

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

interface ReviewSectionProps {
  product: HttpTypes.StoreProduct
  customer?: HttpTypes.StoreCustomer | null
  countryCode: string
}

const ReviewSection: React.FC<ReviewSectionProps> = ({
  product,
  customer,
  countryCode
}) => {
  const [reviews, setReviews] = useState<Review[]>([])
  const [averageRating, setAverageRating] = useState(0)
  const [totalReviews, setTotalReviews] = useState(0)
  const [isLoading, setIsLoading] = useState(true)
  const [isLoadingMore, setIsLoadingMore] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [hasMore, setHasMore] = useState(false)
  const [offset, setOffset] = useState(0)
  const [ratingDistribution, setRatingDistribution] = useState<{
    5: number
    4: number
    3: number
    2: number
    1: number
  }>({ 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 })

  const limit = 10

  // Fetch reviews
  const fetchReviews = async (loadMore = false) => {
    try {
      const currentOffset = loadMore ? offset : 0
      if (loadMore) setIsLoadingMore(true)
      else setIsLoading(true)

      const response = await fetch(
        `/api/store/products/${product.id}/reviews?limit=${limit}&offset=${currentOffset}`,
        {
          headers: {
            'x-publishable-api-key': process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY || '',
          },
        }
      )

      if (!response.ok) {
        throw new Error('Failed to fetch reviews')
      }

      const data = await response.json()
      
      if (loadMore) {
        setReviews(prev => [...prev, ...data.reviews])
      } else {
        setReviews(data.reviews)
      }
      
      setTotalReviews(data.count)
      setAverageRating(data.average_rating || 0)
      setHasMore(data.reviews.length === limit && currentOffset + data.reviews.length < data.count)
      
      if (loadMore) {
        setOffset(currentOffset + data.reviews.length)
      } else {
        setOffset(data.reviews.length)
      }

      // Calculate rating distribution
      const distribution = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 }
      data.reviews.forEach((review: Review) => {
        const rating = Math.floor(review.rating) as keyof typeof distribution
        if (rating >= 1 && rating <= 5) {
          distribution[rating]++
        }
      })
      setRatingDistribution(distribution)

    } catch (error) {
      console.error('Failed to fetch reviews:', error)
    } finally {
      setIsLoading(false)
      setIsLoadingMore(false)
    }
  }

  // Load more reviews
  const handleLoadMore = async () => {
    await fetchReviews(true)
  }

  // Submit review
  const handleSubmitReview = async (reviewData: {
    title?: string
    content: string
    rating: number
  }) => {
    if (!customer) {
      throw new Error('Authentication required')
    }

    setIsSubmitting(true)
    try {
      const response = await fetch('/api/store/reviews', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-publishable-api-key': process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY || '',
          // Add authentication headers here when available
        },
        body: JSON.stringify({
          ...reviewData,
          product_id: product.id
        })
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || 'Failed to submit review')
      }

      // Show success message
      alert('Thank you for your review! It will be published after moderation.')
      
      // Refresh reviews
      await fetchReviews()
      
    } catch (error) {
      console.error('Failed to submit review:', error)
      throw error
    } finally {
      setIsSubmitting(false)
    }
  }

  // Handle sign in
  const handleSignIn = () => {
    // Redirect to sign in page or open modal
    window.location.href = `/${countryCode}/account`
  }

  // Load initial reviews
  useEffect(() => {
    fetchReviews()
  }, [product.id])

  return (
    <div className="bg-background-secondary/50 backdrop-blur-sm border border-pharmint-border rounded-xl p-6 space-y-8">
      <div>
        <h2 className="text-2xl font-bold text-ui-fg-base mb-6">
          Customer Reviews
        </h2>

        {/* Desktop Layout: 25-75 split */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Review Summary - 25% width */}
          <div className="lg:col-span-1">
            <ReviewSummary
              averageRating={averageRating}
              totalReviews={totalReviews}
              ratingDistribution={ratingDistribution}
            />
          </div>

          {/* Review Form or Auth Prompt - 75% width */}
          <div className="lg:col-span-3">
            {customer ? (
              <ReviewForm
                productId={product.id}
                onSubmit={handleSubmitReview}
                isLoading={isSubmitting}
              />
            ) : (
              <AuthPrompt onSignIn={handleSignIn} />
            )}
          </div>
        </div>
      </div>

      {/* Review Feed */}
      <div>
        {isLoading ? (
          <div className="space-y-6">
            {/* Loading Skeleton */}
            {[...Array(3)].map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="flex items-center gap-2 mb-2">
                  <div className="flex gap-1">
                    {[...Array(5)].map((_, j) => (
                      <div key={j} className="w-4 h-4 bg-ui-border-base rounded" />
                    ))}
                  </div>
                  <div className="h-4 bg-ui-border-base rounded w-24" />
                </div>
                <div className="h-4 bg-ui-border-base rounded w-32 mb-2" />
                <div className="space-y-1">
                  <div className="h-4 bg-ui-border-base rounded w-full" />
                  <div className="h-4 bg-ui-border-base rounded w-3/4" />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <ReviewFeed
            reviews={reviews}
            totalReviews={totalReviews}
            onLoadMore={handleLoadMore}
            isLoading={isLoadingMore}
            hasMore={hasMore}
          />
        )}
      </div>
    </div>
  )
}

export default ReviewSection