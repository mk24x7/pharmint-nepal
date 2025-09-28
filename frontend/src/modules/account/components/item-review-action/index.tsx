"use client"

import { useState, useEffect } from "react"
import { Button } from "@medusajs/ui"
import { HttpTypes } from "@medusajs/types"
import { Star, Check, Clock, XMark } from "@medusajs/icons"
import { canReviewProduct } from "@lib/util/review-helpers"
import { retrieveCustomer } from "@lib/data/customer"
import SingleItemReviewModal from "../single-item-review-modal"

interface ItemReviewActionProps {
  orderItem: HttpTypes.StoreOrderLineItem | HttpTypes.StoreCartLineItem
  orderStatus: string
  className?: string
}

type ReviewActionState = 'loading' | 'can-review' | 'reviewed' | 'not-eligible' | 'error'

const ItemReviewAction = ({ orderItem, orderStatus, className = "" }: ItemReviewActionProps) => {
  const [actionState, setActionState] = useState<ReviewActionState>('loading')
  const [customer, setCustomer] = useState<HttpTypes.StoreCustomer | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [existingReview, setExistingReview] = useState<any>(null)

  useEffect(() => {
    async function checkReviewStatus() {
      try {
        // Check if order is eligible for reviews
        const eligibleStatuses = ['completed', 'delivered', 'shipped', 'fulfilled']
        if (!eligibleStatuses.includes(orderStatus?.toLowerCase() || '')) {
          setActionState('not-eligible')
          return
        }

        // Get customer
        const customerData = await retrieveCustomer()
        setCustomer(customerData)

        if (!customerData) {
          setActionState('not-eligible')
          return
        }

        // Check if this specific product has been reviewed
        const response = await fetch(
          `/api/store/reviews?product_id=${orderItem.product_id}&customer_id=${customerData.id}`,
          {
            headers: {
              'x-publishable-api-key': process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY || '',
            },
          }
        )

        const data = await response.json()
        const review = data.reviews?.[0]

        if (review) {
          setExistingReview(review)
          setActionState('reviewed')
        } else {
          setActionState('can-review')
        }
      } catch (error) {
        console.error('Error checking review status:', error)
        setActionState('error')
      }
    }

    if (orderItem.product_id) {
      checkReviewStatus()
    }
  }, [orderItem.product_id, orderStatus])

  const handleReviewClick = () => {
    setIsModalOpen(true)
  }

  const handleModalClose = () => {
    setIsModalOpen(false)
    // Refresh review status
    if (orderItem.product_id && customer) {
      fetch(`/api/store/reviews?product_id=${orderItem.product_id}&customer_id=${customer.id}`, {
        headers: {
          'x-publishable-api-key': process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY || '',
        },
      })
        .then(response => response.json())
        .then(data => {
          const review = data.reviews?.[0]
          if (review) {
            setExistingReview(review)
            setActionState('reviewed')
          }
        })
        .catch(console.error)
    }
  }

  const renderAction = () => {
    switch (actionState) {
      case 'loading':
        return (
          <div className="flex items-center gap-2 text-gray-400">
            <Clock className="w-4 h-4" />
            <span className="text-xs">Loading...</span>
          </div>
        )

      case 'can-review':
        return (
          <Button
            onClick={handleReviewClick}
            size="small"
            className="flex items-center gap-2 bg-accent hover:bg-accent-hover text-white text-xs px-3 py-1.5"
          >
            <Star className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Review Product</span>
            <span className="sm:hidden">Review</span>
          </Button>
        )

      case 'reviewed':
        return (
          <button
            onClick={handleReviewClick}
            className="flex items-center gap-2 text-green-600 hover:text-green-700 transition-colors"
          >
            <Check className="w-4 h-4" />
            <span className="text-xs font-medium">
              <span className="hidden sm:inline">Reviewed</span>
              <span className="sm:hidden">✓</span>
            </span>
          </button>
        )

      case 'not-eligible':
        return (
          <div className="flex items-center gap-2 text-gray-400">
            <Clock className="w-4 h-4" />
            <span className="text-xs">
              <span className="hidden sm:inline">Pending</span>
              <span className="sm:hidden">⏳</span>
            </span>
          </div>
        )

      case 'error':
        return (
          <div className="flex items-center gap-2 text-red-400">
            <XMark className="w-4 h-4" />
            <span className="text-xs">Error</span>
          </div>
        )

      default:
        return null
    }
  }

  return (
    <div className={`flex justify-center ${className}`}>
      {renderAction()}
      
      {customer && orderItem.product_id && (
        <SingleItemReviewModal
          productId={orderItem.product_id}
          productTitle={orderItem.product_title || orderItem.title || 'Product'}
          thumbnail={orderItem.thumbnail}
          customer={customer}
          existingReview={existingReview}
          isOpen={isModalOpen}
          onClose={handleModalClose}
        />
      )}
    </div>
  )
}

export default ItemReviewAction