"use client"

import { Button, Heading } from "@medusajs/ui"

import CartTotals from "@modules/common/components/cart-totals"
import Divider from "@modules/common/components/divider"
import DiscountCode from "@modules/checkout/components/discount-code"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import { RequestQuoteConfirmation } from "@modules/quotes/components/request-quote-confirmation"
import { RequestQuotePrompt } from "@modules/quotes/components/request-quote-prompt"
import { HttpTypes } from "@medusajs/types"

type SummaryProps = {
  cart: HttpTypes.StoreCart & {
    promotions: HttpTypes.StorePromotion[]
  }
  customer?: HttpTypes.StoreCustomer | null
}

function getCheckoutStep(cart: HttpTypes.StoreCart) {
  if (!cart?.shipping_address?.address_1 || !cart.email) {
    return "address"
  } else if (cart?.shipping_methods?.length === 0) {
    return "delivery"
  } else {
    return "payment"
  }
}

const Summary = ({ cart, customer }: SummaryProps) => {
  const step = getCheckoutStep(cart)
  const checkoutButtonLink = "/checkout?step=" + step

  return (
    <div className="flex flex-col gap-y-4">
      <Heading level="h2" className="text-[2rem] leading-[2.75rem] text-pharmint-white">
        अर्डर सारांश
      </Heading>
      <DiscountCode cart={cart} />
      <Divider />
      <CartTotals totals={cart} />
      <LocalizedClientLink
        href={checkoutButtonLink}
        data-testid="checkout-button"
      >
        <Button className="w-full h-10 bg-accent hover:bg-accent-hover text-white border-accent font-semibold">
          चेकआउटमा जानुहोस्
        </Button>
      </LocalizedClientLink>
      {!!customer && (
        <RequestQuoteConfirmation>
          <Button
            className="w-full h-10 bg-secondary hover:bg-secondary/80 text-white border-secondary font-semibold"
            variant="secondary"
          >
            मूल्य निर्धारण अनुरोध
          </Button>
        </RequestQuoteConfirmation>
      )}
      {!customer && (
        <RequestQuotePrompt>
          <Button
            className="w-full h-10 bg-secondary hover:bg-secondary/80 text-white border-secondary font-semibold"
            variant="secondary"
          >
            मूल्य निर्धारण अनुरोध
          </Button>
        </RequestQuotePrompt>
      )}
    </div>
  )
}

export default Summary
