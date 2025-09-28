import { clx } from "@medusajs/ui"

import { getProductPrice } from "@lib/util/get-product-price"
import { HttpTypes } from "@medusajs/types"

export default function ProductPrice({
  product,
  variant,
  quantity = 1,
}: {
  product: HttpTypes.StoreProduct
  variant?: HttpTypes.StoreProductVariant
  quantity?: number
}) {
  const { cheapestPrice, variantPrice } = getProductPrice({
    product,
    variantId: variant?.id,
  })

  const selectedPrice = variant ? variantPrice : cheapestPrice

  if (!selectedPrice) {
    return <div className="block w-32 h-9 bg-background-secondary rounded animate-pulse" />
  }

  // Calculate total price for quantity
  const unitPriceNumber = selectedPrice.calculated_price_number
  const totalPriceNumber = unitPriceNumber * quantity
  
  // Format total price using the same currency formatting
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-PH', {
      style: 'currency',
      currency: selectedPrice.currency_code,
    }).format(price)
  }

  const totalPrice = formatPrice(totalPriceNumber)

  return (
    <div className="flex flex-col text-pharmint-white">
      {/* Unit Price */}
      <div className="flex items-center gap-2">
        <span
          className={clx("text-xl-semi font-bold", {
            "text-accent": selectedPrice.price_type === "sale",
          })}
        >
          {!variant && "From "}
          <span
            data-testid="product-price"
            data-value={selectedPrice.calculated_price_number}
          >
            {selectedPrice.calculated_price}
          </span>
        </span>
        <span className="text-pharmint-muted text-sm">each</span>
      </div>

      {/* Total Price (when quantity > 1) */}
      {quantity > 1 && (
        <div className="mt-1">
          <span className="text-pharmint-white font-semibold text-lg">
            {totalPrice} <span className="text-pharmint-muted text-sm font-normal">total</span>
          </span>
        </div>
      )}
      {selectedPrice.price_type === "sale" && (
        <>
          <p className="mt-1">
            <span className="text-pharmint-muted text-sm">Original: </span>
            <span
              className="line-through text-pharmint-muted text-sm"
              data-testid="original-product-price"
              data-value={selectedPrice.original_price_number}
            >
              {selectedPrice.original_price}
            </span>
          </p>
          <span className="text-accent font-semibold text-sm">
            -{selectedPrice.percentage_diff}% OFF
          </span>
        </>
      )}
    </div>
  )
}
