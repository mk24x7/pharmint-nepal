import { Suspense } from "react"
import { HttpTypes } from "@medusajs/types"
import { searchProducts } from "@lib/data/search"
import { getCategoryIdByHandle, listCategories } from "@lib/data/categories"
import ProductPreview from "@modules/products/components/product-preview"
import { Pagination } from "@modules/store/components/pagination"
import SearchFilters from "@modules/search/components/search-filters"
import SkeletonProductGrid from "@modules/skeletons/templates/skeleton-product-grid"

type SearchTemplateProps = {
  query: string
  page: number
  category?: string
  region: HttpTypes.StoreRegion
  countryCode: string
}

const SearchTemplate = async ({
  query,
  page,
  category,
  region,
  countryCode,
}: SearchTemplateProps) => {
  // Convert category handle to category ID if provided
  const categoryId = category ? await getCategoryIdByHandle(category) : undefined

  // Fetch categories and search results in parallel
  const [
    { response: { products, count } },
    categories
  ] = await Promise.all([
    searchProducts({
      query,
      pageParam: page,
      countryCode,
      categoryId,
      limit: 12,
    }),
    listCategories().catch(() => [])
  ])

  const totalPages = Math.ceil(count / 12)

  return (
    <div className="bg-pharmint-black min-h-screen py-12">
      <div className="content-container">
        {/* Search Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-pharmint-white mb-2">
            Search Results
          </h1>
          <p className="text-pharmint-muted">
            {count > 0 ? (
              <>
                Found <span className="text-accent font-semibold">{count}</span>{" "}
                {count === 1 ? "product" : "products"} for "{query}"
              </>
            ) : (
              <>No products found for "{query}"</>
            )}
          </p>
        </div>

        <div className="flex flex-col small:flex-row small:items-start gap-8">
          {/* Filters Sidebar */}
          <div className="small:w-64 flex-shrink-0">
            <Suspense>
              <SearchFilters 
                currentQuery={query} 
                currentCategory={category}
                countryCode={countryCode}
                categories={categories}
              />
            </Suspense>
          </div>

          {/* Search Results */}
          <div className="w-full">
            {count > 0 ? (
              <>
                {/* Products Grid */}
                <ul
                  className="grid grid-cols-2 small:grid-cols-3 medium:grid-cols-4 gap-x-6 gap-y-8 mb-8"
                  data-testid="search-results-list"
                >
                  {products.map((product) => (
                    <li key={product.id}>
                      <ProductPreview product={product} region={region} />
                    </li>
                  ))}
                </ul>

                {/* Pagination */}
                {totalPages > 1 && (
                  <Pagination
                    data-testid="search-pagination"
                    page={page}
                    totalPages={totalPages}
                  />
                )}
              </>
            ) : (
              /* No Results */
              <div className="text-center py-16">
                <div className="bg-background-secondary/30 backdrop-blur-sm border border-pharmint-border rounded-xl p-8">
                  <h3 className="text-xl font-semibold text-pharmint-white mb-4">
                    No products found
                  </h3>
                  <p className="text-pharmint-muted mb-6">
                    Try adjusting your search terms or browse our categories
                  </p>
                  <div className="space-y-2 text-sm text-pharmint-muted">
                    <p>• Check spelling of product names</p>
                    <p>• Try searching for generic names (e.g., "paracetamol" instead of brand names)</p>
                    <p>• Use broader terms (e.g., "pain" instead of "headache")</p>
                    <p>• Browse categories using the filters</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default SearchTemplate