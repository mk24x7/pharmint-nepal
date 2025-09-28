"use client"

import { useState, useEffect } from "react"
import { HttpTypes } from "@medusajs/types"
import { Button, Heading, Text } from "@medusajs/ui"
import { Star, Check, Clock, XMark } from "@medusajs/icons"

import { 
  isOrderReviewEligible, 
  getOrderReviewStatus, 
  OrderReviewStatus 
} from "@lib/util/review-helpers"
import Thumbnail from "@modules/products/components/thumbnail"
import OrderReviewModal from "@modules/account/components/order-review-modal"
import SingleItemReviewModal from "@modules/account/components/single-item-review-modal"
import { retrieveCustomer } from "@lib/data/customer"

interface ReviewsOverviewProps {
  orders: HttpTypes.StoreOrder[]
}

interface ProductReview {
  id: string
  product_id: string
  product_title: string
  thumbnail?: string
  rating: number
  title?: string
  content: string
  status: 'pending' | 'approved' | 'rejected'
  created_at: string
  updated_at: string
}

interface ReviewableProduct {
  orderId: string
  orderDate: string
  orderNumber: string
  productId: string
  productTitle: string
  thumbnail?: string
  quantity: number
  hasReview: boolean
  review?: ProductReview
}

const ReviewsOverview = ({ orders }: ReviewsOverviewProps) => {
  const [reviewableProducts, setReviewableProducts] = useState<ReviewableProduct[]>([])
  const [existingReviews, setExistingReviews] = useState<ProductReview[]>([])
  const [loading, setLoading] = useState(true)
  const [customer, setCustomer] = useState<HttpTypes.StoreCustomer | null>(null)
  const [orderReviewModal, setOrderReviewModal] = useState<{
    isOpen: boolean
    order: HttpTypes.StoreOrder | null
    reviewStatus: OrderReviewStatus | null
  }>({ isOpen: false, order: null, reviewStatus: null })
  const [singleReviewModal, setSingleReviewModal] = useState<{
    isOpen: boolean
    productId: string
    productTitle: string
    thumbnail?: string
    existingReview?: ProductReview
  }>({ isOpen: false, productId: "", productTitle: "" })
  const [activeTab, setActiveTab] = useState<'reviewable' | 'written'>('reviewable')

  useEffect(() => {
    const initializeData = async () => {
      try {
        // Get customer data
        const customerData = await retrieveCustomer()
        setCustomer(customerData)

        // Process orders to find reviewable products
        const reviewableItems: ReviewableProduct[] = []
        const allReviews: ProductReview[] = []

        for (const order of orders) {
          if (!isOrderReviewEligible(order)) continue

          const reviewStatus = await getOrderReviewStatus(order, customerData?.id)
          
          for (const item of order.items || []) {
            if (!item.product_id || !item.product_title) continue

            const productReview = reviewStatus.productReviews.find(
              r => r.product_id === item.product_id
            )

            const reviewableProduct: ReviewableProduct = {
              orderId: order.id,
              orderDate: order.created_at || '',
              orderNumber: order.display_id?.toString() || order.id.slice(0, 8),
              productId: item.product_id,
              productTitle: item.product_title,
              thumbnail: item.thumbnail || undefined,
              quantity: item.quantity || 1,
              hasReview: !!productReview,
              review: productReview
            }

            reviewableItems.push(reviewableProduct)

            if (productReview) {
              allReviews.push(productReview)
            }
          }
        }

        setReviewableProducts(reviewableItems)
        setExistingReviews(allReviews)
      } catch (error) {
        console.error('Error initializing reviews data:', error)
      } finally {
        setLoading(false)
      }
    }

    initializeData()
  }, [orders])

  const handleWriteReviews = async (order: HttpTypes.StoreOrder) => {
    if (!customer) return

    const reviewStatus = await getOrderReviewStatus(order, customer.id)
    setOrderReviewModal({
      isOpen: true,
      order,
      reviewStatus
    })
  }

  const handleEditReview = (product: ReviewableProduct) => {
    if (!customer) return

    setSingleReviewModal({
      isOpen: true,
      productId: product.productId,
      productTitle: product.productTitle,
      thumbnail: product.thumbnail,
      existingReview: product.review
    })
  }

  const handleWriteSingleReview = (product: ReviewableProduct) => {
    if (!customer) return

    setSingleReviewModal({
      isOpen: true,
      productId: product.productId,
      productTitle: product.productTitle,
      thumbnail: product.thumbnail
    })
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'approved':
        return <Check className="text-green-600 w-4 h-4" />
      case 'pending':
        return <Clock className="text-yellow-600 w-4 h-4" />
      case 'rejected':
        return <XMark className="text-red-600 w-4 h-4" />
      default:
        return null
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'approved':
        return 'Published'
      case 'pending':
        return 'Under Review'
      case 'rejected':
        return 'Rejected'
      default:
        return status
    }
  }

  if (loading) {
    return (
      <div className="space-y-4">
        {Array(3).fill(0).map((_, i) => (
          <div key={i} className="animate-pulse bg-gray-100 rounded-lg h-32" />
        ))}
      </div>
    )
  }

  const pendingReviews = reviewableProducts.filter(p => !p.hasReview)
  const writtenReviews = reviewableProducts.filter(p => p.hasReview)

  return (
    <div className="w-full">
      {/* Tab Navigation */}
      <div className="flex border-b border-pharmint-border mb-6">
        <button
          onClick={() => setActiveTab('reviewable')}
          className={`px-4 py-2 font-medium transition-colors duration-200 border-b-2 ${
            activeTab === 'reviewable'
              ? 'border-accent text-accent'
              : 'border-transparent text-pharmint-muted hover:text-pharmint-white'
          }`}
        >
          Pending Reviews ({pendingReviews.length})
        </button>
        <button
          onClick={() => setActiveTab('written')}
          className={`px-4 py-2 font-medium transition-colors duration-200 border-b-2 ${
            activeTab === 'written'
              ? 'border-accent text-accent'
              : 'border-transparent text-pharmint-muted hover:text-pharmint-white'
          }`}
        >
          Written Reviews ({writtenReviews.length})
        </button>
      </div>

      {/* Pending Reviews Tab */}
      {activeTab === 'reviewable' && (
        <div className="space-y-4">
          {pendingReviews.length === 0 ? (
            <div className="text-center py-12">
              <Star className="mx-auto text-pharmint-muted mb-4 w-12 h-12" />
              <Heading level="h3" className="text-pharmint-white mb-2">
                No Products to Review
              </Heading>
              <Text className="text-pharmint-muted">
                You don't have any fulfilled orders with products waiting for reviews.
              </Text>
            </div>
          ) : (
            pendingReviews.map((product) => (
              <div
                key={`${product.orderId}-${product.productId}`}
                className="bg-pharmint-card border border-pharmint-border rounded-lg p-4 hover:border-accent/50 transition-colors duration-200"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 flex-shrink-0">
                      <Thumbnail 
                        thumbnail={product.thumbnail} 
                        images={[]} 
                        size="square"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <Text className="font-semibold text-pharmint-white truncate">
                        {product.productTitle}
                      </Text>
                      <Text className="text-sm text-pharmint-muted">
                        Order #{product.orderNumber} • {formatDate(product.orderDate)}
                      </Text>
                      <Text className="text-sm text-pharmint-muted">
                        Quantity: {product.quantity}
                      </Text>
                    </div>
                  </div>
                  <div className="flex flex-col sm:flex-row gap-2 sm:items-center">
                    <Button
                      onClick={() => handleWriteSingleReview(product)}
                      className="flex items-center gap-2 bg-accent hover:bg-accent-hover"
                    >
                      <Star className="w-4 h-4" />
                      <span className="hidden sm:inline">Write Review</span>
                      <span className="sm:hidden">Review</span>
                    </Button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Written Reviews Tab */}
      {activeTab === 'written' && (
        <div className="space-y-4">
          {writtenReviews.length === 0 ? (
            <div className="text-center py-12">
              <svg className="mx-auto text-pharmint-muted mb-4 w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
              <Heading level="h3" className="text-pharmint-white mb-2">
                No Reviews Written Yet
              </Heading>
              <Text className="text-pharmint-muted">
                You haven't written any reviews yet. Check the "Pending Reviews" tab to get started.
              </Text>
            </div>
          ) : (
            writtenReviews.map((product) => (
              <div
                key={`${product.orderId}-${product.productId}`}
                className="bg-pharmint-card border border-pharmint-border rounded-lg p-4"
              >
                <div className="flex flex-col lg:flex-row gap-4">
                  <div className="flex items-center gap-4 flex-1">
                    <div className="w-16 h-16 flex-shrink-0">
                      <Thumbnail 
                        thumbnail={product.thumbnail} 
                        images={[]} 
                        size="square"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <Text className="font-semibold text-pharmint-white truncate">
                        {product.productTitle}
                      </Text>
                      <Text className="text-sm text-pharmint-muted">
                        Order #{product.orderNumber} • {formatDate(product.orderDate)}
                      </Text>
                      <div className="flex items-center gap-2 mt-1">
                        {getStatusIcon(product.review?.status || '')}
                        <Text className="text-sm text-pharmint-muted">
                          {getStatusText(product.review?.status || '')}
                        </Text>
                      </div>
                    </div>
                  </div>
                  
                  {product.review && (
                    <div className="flex-1 space-y-2">
                      <div className="flex gap-1">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <span key={star} className="text-sm">
                            {star <= product.review!.rating ? '⭐' : '☆'}
                          </span>
                        ))}
                      </div>
                      
                      {product.review.title && (
                        <Text className="font-medium text-pharmint-white text-sm">
                          {product.review.title}
                        </Text>
                      )}
                      
                      <Text className="text-pharmint-muted text-sm line-clamp-2">
                        {product.review.content}
                      </Text>
                      
                      <div className="flex items-center justify-between">
                        <Text className="text-xs text-pharmint-muted">
                          Written on {formatDate(product.review.created_at)}
                        </Text>
                        
                        {product.review.status !== 'rejected' && (
                          <Button
                            onClick={() => handleEditReview(product)}
                            variant="secondary"
                            size="small"
                            className="flex items-center gap-1"
                          >
                            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                            <span className="hidden sm:inline">Edit</span>
                          </Button>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Modals */}
      {orderReviewModal.isOpen && orderReviewModal.order && orderReviewModal.reviewStatus && customer && (
        <OrderReviewModal
          order={orderReviewModal.order}
          customer={customer}
          reviewStatus={orderReviewModal.reviewStatus}
          isOpen={orderReviewModal.isOpen}
          onClose={() => setOrderReviewModal({ isOpen: false, order: null, reviewStatus: null })}
        />
      )}

      {singleReviewModal.isOpen && customer && (
        <SingleItemReviewModal
          productId={singleReviewModal.productId}
          productTitle={singleReviewModal.productTitle}
          thumbnail={singleReviewModal.thumbnail}
          customer={customer}
          existingReview={singleReviewModal.existingReview}
          isOpen={singleReviewModal.isOpen}
          onClose={() => setSingleReviewModal({ 
            isOpen: false, 
            productId: "", 
            productTitle: "",
            thumbnail: undefined,
            existingReview: undefined
          })}
        />
      )}
    </div>
  )
}

export default ReviewsOverview