import React, { Suspense } from "react"

import ImageGallery from "@modules/products/components/image-gallery"
import ProductActions from "@modules/products/components/product-actions"
import ProductOnboardingCta from "@modules/products/components/product-onboarding-cta"
import ProductTabs from "@modules/products/components/product-tabs"
import RelatedProducts from "@modules/products/components/related-products"
import ReviewSection from "@modules/products/components/reviews"
import ProductInfo from "@modules/products/templates/product-info"
import SkeletonRelatedProducts from "@modules/skeletons/templates/skeleton-related-products"
import { notFound } from "next/navigation"
import ProductActionsWrapper from "./product-actions-wrapper"
import { HttpTypes } from "@medusajs/types"

type ProductTemplateProps = {
  product: HttpTypes.StoreProduct
  region: HttpTypes.StoreRegion
  countryCode: string
  customer?: HttpTypes.StoreCustomer | null
}

const ProductTemplate: React.FC<ProductTemplateProps> = ({
  product,
  region,
  countryCode,
  customer,
}) => {
  if (!product || !product.id) {
    return notFound()
  }

  return (
    <div className="bg-pharmint-black min-h-screen">
      <div
        className="content-container flex flex-col small:flex-row small:items-start py-12 relative"
        data-testid="product-container"
      >
        <div className="flex flex-col small:sticky small:top-48 small:py-0 small:max-w-[300px] w-full py-8 gap-y-6">
          <div className="bg-background-secondary/50 backdrop-blur-sm border border-pharmint-border rounded-xl p-6">
            <ProductInfo product={product} />
          </div>
          <div className="bg-background-secondary/50 backdrop-blur-sm border border-pharmint-border rounded-xl p-6">
            <ProductTabs product={product} />
          </div>
        </div>
        <div className="block w-full relative">
          <ImageGallery images={product?.images || []} />
        </div>
        <div className="flex flex-col small:sticky small:top-48 small:py-0 small:max-w-[300px] w-full py-8 gap-y-12">
          <ProductOnboardingCta />
          <div className="bg-background-secondary/50 backdrop-blur-sm border border-pharmint-border rounded-xl p-6">
            <Suspense
              fallback={
                <ProductActions
                  disabled={true}
                  product={product}
                  region={region}
                />
              }
            >
              <ProductActionsWrapper id={product.id} region={region} />
            </Suspense>
          </div>
        </div>
      </div>
      <div
        className="content-container my-16 small:my-32"
        data-testid="reviews-container"
      >
        <Suspense fallback={
          <div className="bg-background-secondary/50 backdrop-blur-sm border border-pharmint-border rounded-xl p-6 animate-pulse">
            <div className="h-8 bg-ui-border-base rounded w-48 mb-6" />
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="space-y-4">
                <div className="h-6 bg-ui-border-base rounded w-32" />
                <div className="h-4 bg-ui-border-base rounded w-24" />
              </div>
              <div className="space-y-4">
                <div className="h-6 bg-ui-border-base rounded w-40" />
                <div className="h-10 bg-ui-border-base rounded" />
              </div>
            </div>
          </div>
        }>
          <ReviewSection
            product={product}
            customer={customer}
            countryCode={countryCode}
          />
        </Suspense>
      </div>
      <div
        className="content-container my-16 small:my-32"
        data-testid="related-products-container"
      >
        <Suspense fallback={<SkeletonRelatedProducts />}>
          <RelatedProducts product={product} countryCode={countryCode} />
        </Suspense>
      </div>
    </div>
  )
}

export default ProductTemplate
