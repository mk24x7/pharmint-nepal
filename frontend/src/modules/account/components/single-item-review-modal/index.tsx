"use client"

import { useState, useEffect } from "react"
import { Button, Heading, Text } from "@medusajs/ui"
import { HttpTypes } from "@medusajs/types"
import { XMark, Star, Check } from "@medusajs/icons"
import Thumbnail from "@modules/products/components/thumbnail"

interface SingleItemReviewModalProps {
  productId: string
  productTitle: string
  thumbnail?: string
  customer: HttpTypes.StoreCustomer
  existingReview?: any
  isOpen: boolean
  onClose: () => void
}

const SingleItemReviewModal = ({
  productId,
  productTitle,
  thumbnail,
  customer,
  existingReview,
  isOpen,
  onClose
}: SingleItemReviewModalProps) => {
  const [rating, setRating] = useState(0)
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [submitSuccess, setSubmitSuccess] = useState(false)

  // Initialize form with existing review data
  useEffect(() => {
    if (existingReview) {
      setRating(existingReview.rating || 0)
      setTitle(existingReview.title || '')
      setContent(existingReview.content || '')
      setIsEditing(false)
    } else {
      setRating(0)
      setTitle('')
      setContent('')
      setIsEditing(true)
    }
    setSubmitError(null)
    setSubmitSuccess(false)
  }, [existingReview, isOpen])

  const handleSubmit = async () => {
    if (rating === 0 || content.trim().length === 0) return

    setIsSubmitting(true)
    setSubmitError(null)

    try {
      const response = await fetch('/api/store/reviews', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-publishable-api-key': process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY || '',
        },
        body: JSON.stringify({
          product_id: productId,
          rating,
          title: title || undefined,
          content,
        })
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || 'Failed to submit review')
      }

      setSubmitSuccess(true)
      setTimeout(() => {
        handleClose()
      }, 2000) // Auto-close after 2 seconds
    } catch (error) {
      console.error('Error submitting review:', error)
      setSubmitError(error instanceof Error ? error.message : 'Failed to submit review')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleClose = () => {
    setRating(0)
    setTitle('')
    setContent('')
    setIsEditing(false)
    setSubmitError(null)
    setSubmitSuccess(false)
    onClose()
  }

  const isFormValid = rating > 0 && content.trim().length > 0

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-lg max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center gap-3">
            {existingReview && !isEditing ? (
              <div className="flex items-center gap-2">
                <Check className="text-green-600" size={20} />
                <Heading level="h3" className="text-lg font-semibold text-gray-900">
                  Your Review
                </Heading>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Star className="text-accent" size={20} />
                <Heading level="h3" className="text-lg font-semibold text-gray-900">
                  {existingReview ? 'Edit Review' : 'Write Review'}
                </Heading>
              </div>
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
              <Heading level="h4" className="text-lg font-semibold text-gray-900 mb-2">
                Review Submitted!
              </Heading>
              <Text className="text-gray-600">
                Thank you for your review. It will be published after moderation.
              </Text>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Product Info */}
              <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
                <div className="w-16 h-16 flex-shrink-0">
                  <Thumbnail 
                    thumbnail={thumbnail} 
                    images={[]} 
                    size="square"
                  />
                </div>
                <div>
                  <Text className="font-semibold text-gray-900">
                    {productTitle}
                  </Text>
                  <Text className="text-sm text-gray-600">
                    Purchased product
                  </Text>
                </div>
              </div>

              {/* Existing Review Display */}
              {existingReview && !isEditing ? (
                <div className="space-y-4 p-4 bg-green-50 border border-green-200 rounded-lg">
                  <div className="flex items-center justify-between">
                    <div className="flex gap-1">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <span key={star} className="text-lg">
                          {star <= existingReview.rating ? '⭐' : '☆'}
                        </span>
                      ))}
                    </div>
                    <Button
                      onClick={() => setIsEditing(true)}
                      variant="secondary"
                      size="small"
                      className="flex items-center gap-2"
                    >
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                      Edit
                    </Button>
                  </div>
                  {existingReview.title && (
                    <Text className="font-medium text-gray-900">
                      {existingReview.title}
                    </Text>
                  )}
                  <Text className="text-gray-700">
                    {existingReview.content}
                  </Text>
                  <Text className="text-sm text-gray-500">
                    Status: {existingReview.status === 'approved' ? '✅ Published' : '⏳ Under Review'}
                  </Text>
                </div>
              ) : (
                <>
                  {/* Star Rating */}
                  <div>
                    <Text className="block text-sm font-medium text-gray-700 mb-3">
                      Rating <span className="text-red-500">*</span>
                    </Text>
                    <div className="flex gap-1">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          onClick={() => setRating(star)}
                          disabled={!isEditing}
                          className="text-2xl sm:text-3xl hover:scale-110 transition-transform disabled:cursor-not-allowed"
                        >
                          {star <= rating ? (
                            <span className="text-yellow-400">⭐</span>
                          ) : (
                            <span className="text-gray-300">☆</span>
                          )}
                        </button>
                      ))}
                    </div>
                    {rating > 0 && (
                      <Text className="text-sm text-gray-600 mt-1">
                        {rating} out of 5 stars
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
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      disabled={!isEditing}
                      placeholder="Summarize your experience..."
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-accent focus:border-accent disabled:bg-gray-100 disabled:cursor-not-allowed"
                      maxLength={100}
                    />
                    <Text className="text-xs text-gray-500 mt-1">
                      {title.length}/100 characters
                    </Text>
                  </div>

                  {/* Content */}
                  <div>
                    <Text className="block text-sm font-medium text-gray-700 mb-2">
                      Your Review <span className="text-red-500">*</span>
                    </Text>
                    <textarea
                      value={content}
                      onChange={(e) => setContent(e.target.value)}
                      disabled={!isEditing}
                      placeholder="Share your experience with this product..."
                      rows={4}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-accent focus:border-accent resize-none disabled:bg-gray-100 disabled:cursor-not-allowed"
                      maxLength={2000}
                    />
                    <Text className="text-xs text-gray-500 mt-1">
                      {content.length}/2000 characters
                    </Text>
                  </div>
                </>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        {!submitSuccess && (
          <div className="flex items-center justify-between p-6 border-t border-gray-200">
            <Button
              onClick={handleClose}
              variant="secondary"
              className="min-w-[80px]"
            >
              {existingReview && !isEditing ? 'Close' : 'Cancel'}
            </Button>

            {isEditing && (
              <Button
                onClick={handleSubmit}
                disabled={!isFormValid || isSubmitting}
                className="min-w-[120px] bg-accent hover:bg-accent-hover text-white"
              >
                {isSubmitting ? 'Submitting...' : (existingReview ? 'Update Review' : 'Submit Review')}
              </Button>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

export default SingleItemReviewModal