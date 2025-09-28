"use client"

import { useState, useMemo } from "react"
import { Button, Heading, Text } from "@medusajs/ui"
import { HttpTypes } from "@medusajs/types"
import { XMark, Star } from "@medusajs/icons"
import { type OrderReviewStatus } from "@lib/util/review-helpers"
import Thumbnail from "@modules/products/components/thumbnail"

interface OrderReviewModalProps {
  order: HttpTypes.StoreOrder
  customer: HttpTypes.StoreCustomer
  reviewStatus: OrderReviewStatus
  isOpen: boolean
  onClose: () => void
}

interface ReviewFormData {
  productId: string
  rating: number
  title: string
  content: string
  productTitle: string
  thumbnail?: string
}

const OrderReviewModal = ({
  order,
  customer,
  reviewStatus,
  isOpen,
  onClose
}: OrderReviewModalProps) => {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [currentStep, setCurrentStep] = useState(0)
  const [reviews, setReviews] = useState<ReviewFormData[]>([])
  const [submitSuccess, setSubmitSuccess] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)

  // Get products that can be reviewed
  const reviewableProducts = useMemo(() => {
    return reviewStatus.reviewStatus
      .filter(status => status.canReview)
      .map(status => {
        const orderItem = order.items?.find(item => item.product_id === status.productId)
        return {
          productId: status.productId,
          productTitle: status.productTitle,
          thumbnail: orderItem?.thumbnail,
          orderItem
        }
      })
  }, [reviewStatus, order.items])

  // Initialize reviews form data
  const initializeReviews = () => {
    const initialReviews = reviewableProducts.map(product => ({
      productId: product.productId,
      rating: 0,
      title: '',
      content: '',
      productTitle: product.productTitle,
      thumbnail: product.thumbnail
    }))
    setReviews(initialReviews)
    setCurrentStep(0)
    setSubmitSuccess(false)
    setSubmitError(null)
  }

  // Initialize when modal opens
  if (isOpen && reviews.length === 0) {
    initializeReviews()
  }

  const currentReview = reviews[currentStep]
  const isLastStep = currentStep === reviews.length - 1

  const handleStarClick = (rating: number) => {
    const updatedReviews = [...reviews]
    updatedReviews[currentStep].rating = rating
    setReviews(updatedReviews)
  }

  const handleInputChange = (field: 'title' | 'content', value: string) => {
    const updatedReviews = [...reviews]
    updatedReviews[currentStep][field] = value
    setReviews(updatedReviews)
  }

  const handleNext = () => {
    if (currentStep < reviews.length - 1) {
      setCurrentStep(currentStep + 1)
    }
  }

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1)
    }
  }

  const handleSubmitAll = async () => {
    setIsSubmitting(true)
    setSubmitError(null)

    try {
      // Submit all reviews
      const promises = reviews.map(async (review) => {
        if (review.rating === 0) return null // Skip unrated products
        
        const response = await fetch('/api/store/reviews', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-publishable-api-key': process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY || '',
          },
          body: JSON.stringify({
            product_id: review.productId,
            rating: review.rating,
            title: review.title || undefined,
            content: review.content,
          })
        })

        if (!response.ok) {
          const error = await response.json()
          throw new Error(error.message || `Failed to submit review for ${review.productTitle}`)
        }

        return response.json()
      })

      await Promise.all(promises)
      setSubmitSuccess(true)
    } catch (error) {
      console.error('Error submitting reviews:', error)
      setSubmitError(error instanceof Error ? error.message : 'Failed to submit reviews')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleClose = () => {
    setReviews([])
    setCurrentStep(0)
    setSubmitSuccess(false)
    setSubmitError(null)
    onClose()
  }

  const isCurrentReviewValid = currentReview?.rating > 0 && currentReview?.content.trim().length > 0

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div>
            <Heading level="h2" className="text-xl font-semibold text-gray-900">
              {submitSuccess ? 'Reviews Submitted!' : `Review Products from Order #${order.display_id}`}
            </Heading>
            {!submitSuccess && (
              <Text className="text-sm text-gray-600 mt-1">
                Step {currentStep + 1} of {reviews.length} • {reviewableProducts.length} products to review
              </Text>
            )}
          </div>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <XMark className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-200px)]">
          {submitError && (
            <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
              <Text className="text-red-600 text-sm">{submitError}</Text>
            </div>
          )}

          {submitSuccess ? (
            <div className="text-center py-8">
              <div className="mb-4 text-6xl">🎉</div>
              <Heading level="h3" className="text-lg font-semibold text-gray-900 mb-2">
                Thank you for your reviews!
              </Heading>
              <Text className="text-gray-600 mb-6">
                Your reviews will be published after moderation. This helps other customers make informed decisions.
              </Text>
              <Button onClick={handleClose} className="bg-accent hover:bg-accent-hover text-white">
                Done
              </Button>
            </div>
          ) : currentReview ? (
            <div className="space-y-6">
              {/* Product Info */}
              <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
                <div className="w-16 h-16 flex-shrink-0">
                  <Thumbnail 
                    thumbnail={currentReview.thumbnail} 
                    images={[]} 
                    size="square"
                  />
                </div>
                <div>
                  <Text className="font-semibold text-gray-900">
                    {currentReview.productTitle}
                  </Text>
                  <Text className="text-sm text-gray-600">
                    From order #{order.display_id}
                  </Text>
                </div>
              </div>

              {/* Star Rating */}
              <div>
                <Text className="block text-sm font-medium text-gray-700 mb-3">
                  Rating <span className="text-red-500">*</span>
                </Text>
                <div className="flex gap-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      onClick={() => handleStarClick(star)}
                      className="text-3xl hover:scale-110 transition-transform"
                    >
                      {star <= currentReview.rating ? (
                        <span className="text-yellow-400">⭐</span>
                      ) : (
                        <span className="text-gray-300">☆</span>
                      )}
                    </button>
                  ))}
                </div>
                {currentReview.rating > 0 && (
                  <Text className="text-sm text-gray-600 mt-1">
                    {currentReview.rating} out of 5 stars
                  </Text>
                )}
              </div>

              {/* Title */}
              <div>
                <Text className="block text-sm font-medium text-gray-700 mb-2">
                  Review Title (Optional)
                </Text>
                <input
                  type="text"
                  value={currentReview.title}
                  onChange={(e) => handleInputChange('title', e.target.value)}
                  placeholder="Summarize your experience..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-accent focus:border-accent"
                  maxLength={100}
                />
                <Text className="text-xs text-gray-500 mt-1">
                  {currentReview.title.length}/100 characters
                </Text>
              </div>

              {/* Content */}
              <div>
                <Text className="block text-sm font-medium text-gray-700 mb-2">
                  Your Review <span className="text-red-500">*</span>
                </Text>
                <textarea
                  value={currentReview.content}
                  onChange={(e) => handleInputChange('content', e.target.value)}
                  placeholder="Share your experience with this product..."
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-accent focus:border-accent resize-none"
                  maxLength={2000}
                />
                <Text className="text-xs text-gray-500 mt-1">
                  {currentReview.content.length}/2000 characters
                </Text>
              </div>
            </div>
          ) : null}
        </div>

        {/* Footer */}
        {!submitSuccess && (
          <div className="flex items-center justify-between p-6 border-t border-gray-200">
            <Button
              onClick={handleBack}
              variant="secondary"
              disabled={currentStep === 0}
              className="min-w-[100px]"
            >
              Back
            </Button>

            <div className="flex gap-2">
              {!isLastStep ? (
                <Button
                  onClick={handleNext}
                  disabled={!isCurrentReviewValid}
                  className="min-w-[100px] bg-accent hover:bg-accent-hover text-white"
                >
                  Next
                </Button>
              ) : (
                <Button
                  onClick={handleSubmitAll}
                  disabled={!isCurrentReviewValid || isSubmitting}
                  className="min-w-[120px] bg-accent hover:bg-accent-hover text-white"
                >
                  {isSubmitting ? 'Submitting...' : 'Submit Reviews'}
                </Button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default OrderReviewModal