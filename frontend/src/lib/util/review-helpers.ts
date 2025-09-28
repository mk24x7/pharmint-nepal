import { HttpTypes } from "@medusajs/types"

export interface ReviewStatus {
  productId: string
  productTitle: string
  hasReview: boolean
  reviewId?: string
  canReview: boolean
}

export interface OrderReviewStatus {
  isEligible: boolean
  totalItems: number
  reviewedCount: number
  pendingCount: number
  reviewStatus: ReviewStatus[]
}

/**
 * Check if an order is eligible for reviews
 */
export function isOrderReviewEligible(order: HttpTypes.StoreOrder): boolean {
  // Only allow reviews for completed/delivered orders
  const eligibleStatuses = [
    'completed', 
    'delivered', 
    'shipped', 
    'fulfilled'
  ]
  
  return eligibleStatuses.includes(order.fulfillment_status?.toLowerCase() || '')
}

/**
 * Get review status for all items in an order
 */
export async function getOrderReviewStatus(
  order: HttpTypes.StoreOrder, 
  customerId?: string
): Promise<OrderReviewStatus> {
  const isEligible = isOrderReviewEligible(order)
  const items = order.items || []
  
  if (!isEligible || !customerId) {
    return {
      isEligible: false,
      totalItems: items.length,
      reviewedCount: 0,
      pendingCount: 0,
      reviewStatus: []
    }
  }

  // Fetch existing reviews for all products in the order
  const reviewStatus: ReviewStatus[] = await Promise.all(
    items.map(async (item) => {
      try {
        const response = await fetch(`/api/store/reviews?product_id=${item.product_id}&customer_id=${customerId}`, {
          headers: {
            'x-publishable-api-key': process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY || '',
          },
        })
        
        const data = await response.json()
        const existingReview = data.reviews?.[0] // Get the first review if any
        
        return {
          productId: item.product_id || '',
          productTitle: item.product_title || item.title || 'Unknown Product',
          hasReview: !!existingReview,
          reviewId: existingReview?.id,
          canReview: !existingReview // Can review if no existing review
        }
      } catch (error) {
        console.error(`Error checking review status for product ${item.product_id}:`, error)
        return {
          productId: item.product_id || '',
          productTitle: item.product_title || item.title || 'Unknown Product',
          hasReview: false,
          reviewId: undefined,
          canReview: true
        }
      }
    })
  )

  const reviewedCount = reviewStatus.filter(status => status.hasReview).length
  const pendingCount = reviewStatus.filter(status => status.canReview).length

  return {
    isEligible,
    totalItems: items.length,
    reviewedCount,
    pendingCount,
    reviewStatus
  }
}

/**
 * Generate review button text based on order status
 */
export function getReviewButtonText(orderReviewStatus: OrderReviewStatus): string {
  const { pendingCount, reviewedCount, totalItems } = orderReviewStatus
  
  if (pendingCount === 0) {
    return totalItems === 1 ? 'View Review' : 'All Reviewed'
  }
  
  if (reviewedCount === 0) {
    return pendingCount === 1 ? 'Write Review' : `Write Reviews (${pendingCount})`
  }
  
  // Mixed state
  return `Review (${pendingCount} left)`
}

/**
 * Get review button variant based on status
 */
export function getReviewButtonVariant(orderReviewStatus: OrderReviewStatus): 'primary' | 'secondary' {
  return orderReviewStatus.pendingCount > 0 ? 'primary' : 'secondary'
}

/**
 * Check if a specific product can be reviewed
 */
export async function canReviewProduct(
  productId: string, 
  customerId: string
): Promise<boolean> {
  try {
    const response = await fetch(`/api/store/reviews?product_id=${productId}&customer_id=${customerId}`, {
      headers: {
        'x-publishable-api-key': process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY || '',
      },
    })
    
    const data = await response.json()
    return !data.reviews?.length // Can review if no existing reviews
  } catch (error) {
    console.error('Error checking review eligibility:', error)
    return false
  }
}

/**
 * Format date for review display
 */
export function formatReviewDate(dateString: string): string {
  const date = new Date(dateString)
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  })
}

/**
 * Generate star rating display
 */
export function generateStarRating(rating: number): string {
  const fullStars = Math.floor(rating)
  const hasHalfStar = rating % 1 >= 0.5
  const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0)
  
  return '⭐'.repeat(fullStars) + 
         (hasHalfStar ? '⭐' : '') + 
         '☆'.repeat(emptyStars)
}