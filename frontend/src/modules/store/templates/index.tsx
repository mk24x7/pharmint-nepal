import { Suspense } from "react"

import SkeletonProductGrid from "@modules/skeletons/templates/skeleton-product-grid"
import RefinementList from "@modules/store/components/refinement-list"
import { SortOptions } from "@modules/store/components/refinement-list/sort-products"

import PaginatedProducts from "./paginated-products"

const StoreTemplate = ({
  sortBy,
  page,
  countryCode,
}: {
  sortBy?: SortOptions
  page?: string
  countryCode: string
}) => {
  const pageNumber = page ? parseInt(page) : 1
  const sort = sortBy || "created_at"

  return (
    <div className="bg-pharmint-black min-h-screen py-12">
      <div
        className="flex flex-col small:flex-row small:items-start content-container gap-8"
        data-testid="category-container"
      >
        <div className="small:w-64 flex-shrink-0">
          <RefinementList sortBy={sort} />
        </div>
        <div className="w-full">
          <div className="mb-8 text-2xl-semi">
            <h1 className="text-pharmint-white" data-testid="store-page-title">All Products</h1>
          </div>
        <Suspense fallback={<SkeletonProductGrid />}>
          <PaginatedProducts
            sortBy={sort}
            page={pageNumber}
            countryCode={countryCode}
          />
        </Suspense>
        </div>
      </div>
    </div>
  )
}

export default StoreTemplate
