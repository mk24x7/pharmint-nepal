import { Heading, Text } from "@medusajs/ui"

import InteractiveLink from "@modules/common/components/interactive-link"

const EmptyCartMessage = () => {
  return (
    <div className="py-48 px-6 flex flex-col justify-center items-center text-center" data-testid="empty-cart-message">
      <Heading
        level="h1"
        className="flex flex-row text-3xl-regular gap-x-2 items-baseline text-pharmint-white mb-4"
      >
        Your Cart is Empty
      </Heading>
      <Text className="text-base-regular text-pharmint-muted mt-4 mb-8 max-w-[32rem]">
        You don&apos;t have anything in your cart. Let&apos;s change that - explore our wide selection of pharmaceutical products.
      </Text>
      <div>
        <InteractiveLink href="/store" className="bg-accent hover:bg-accent-hover text-white px-6 py-3 rounded-full font-semibold transition-colors duration-200">
          Explore Products
        </InteractiveLink>
      </div>
    </div>
  )
}

export default EmptyCartMessage
