"use client"

import { useState, useEffect } from "react"
import { Button } from "@medusajs/ui"
import { HttpTypes } from "@medusajs/types"
import { 
  getOrderReviewStatus, 
  getReviewButtonText, 
  getReviewButtonVariant,
  type OrderReviewStatus 
} from "@lib/util/review-helpers"
import { retrieveCustomer } from "@lib/data/customer"
import OrderReviewModal from "../order-review-modal"

interface OrderReviewButtonProps {
  order: HttpTypes.StoreOrder
  variant?: 'button' | 'link'
  className?: string
}

const OrderReviewButton = ({ 
  order, 
  variant = 'button',
  className = "" 
}: OrderReviewButtonProps) => {
  const [reviewStatus, setReviewStatus] = useState<OrderReviewStatus | null>(null)
  const [customer, setCustomer] = useState<HttpTypes.StoreCustomer | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    async function loadReviewStatus() {
      try {
        setIsLoading(true)
        
        // Get customer data
        const customerData = await retrieveCustomer()
        setCustomer(customerData)
        
        if (!customerData) {
          setIsLoading(false)
          return
        }

        // Get review status for this order
        const status = await getOrderReviewStatus(order, customerData.id)
        setReviewStatus(status)
      } catch (error) {
        console.error('Error loading review status:', error)
      } finally {
        setIsLoading(false)
      }
    }

    loadReviewStatus()
  }, [order])

  // Don't render if loading or not eligible
  if (isLoading || !reviewStatus?.isEligible || !customer) {
    return null
  }

  const buttonText = getReviewButtonText(reviewStatus)
  const buttonVariant = getReviewButtonVariant(reviewStatus)

  const handleClick = () => {
    setIsModalOpen(true)
  }

  const handleModalClose = () => {
    setIsModalOpen(false)
    // Refresh review status after modal closes
    getOrderReviewStatus(order, customer.id).then(setReviewStatus)
  }

  if (variant === 'link') {
    return (
      <>
        <button
          onClick={handleClick}
          className={`text-sm text-accent hover:text-accent-hover underline transition-colors ${className}`}
          data-testid="order-review-link"
        >
          {buttonText}
        </button>
        
        <OrderReviewModal
          order={order}
          customer={customer}
          reviewStatus={reviewStatus}
          isOpen={isModalOpen}
          onClose={handleModalClose}
        />
      </>
    )
  }

  return (
    <>
      <Button
        onClick={handleClick}
        variant={buttonVariant}
        className={`
          flex items-center gap-2 min-w-[120px] transition-all duration-200
          ${buttonVariant === 'primary' 
            ? 'bg-accent hover:bg-accent-hover text-white' 
            : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
          }
          ${className}
        `}
        data-testid="order-review-button"
      >
        <span className="text-sm">⭐</span>
        <span className="hidden sm:inline">{buttonText}</span>
        <span className="sm:hidden">
          {reviewStatus.pendingCount > 0 ? 'Review' : 'Reviewed'}
        </span>
      </Button>
      
      <OrderReviewModal
        order={order}
        customer={customer}
        reviewStatus={reviewStatus}
        isOpen={isModalOpen}
        onClose={handleModalClose}
      />
    </>
  )
}

export default OrderReviewButton