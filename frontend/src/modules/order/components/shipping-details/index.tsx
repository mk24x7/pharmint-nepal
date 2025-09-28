import { convertToLocale } from "@lib/util/money"
import { HttpTypes } from "@medusajs/types"
import { Heading, Text } from "@medusajs/ui"

import Divider from "@modules/common/components/divider"

type ShippingDetailsProps = {
  order: HttpTypes.StoreOrder
}

const ShippingDetails = ({ order }: ShippingDetailsProps) => {
  return (
    <div>
      <Heading level="h2" className="flex flex-row text-3xl-regular my-6 text-pharmint-white">
        Delivery
      </Heading>
      <div className="flex items-start gap-x-8">
        <div
          className="flex flex-col w-1/3"
          data-testid="shipping-address-summary"
        >
          <Text className="txt-medium-plus text-pharmint-white mb-1">
            Shipping Address
          </Text>
          <Text className="txt-medium text-pharmint-muted">
            {order.shipping_address?.first_name}{" "}
            {order.shipping_address?.last_name}
          </Text>
          <Text className="txt-medium text-pharmint-muted">
            {order.shipping_address?.address_1}{" "}
            {order.shipping_address?.address_2}
          </Text>
          <Text className="txt-medium text-pharmint-muted">
            {order.shipping_address?.postal_code},{" "}
            {order.shipping_address?.city}
          </Text>
          <Text className="txt-medium text-pharmint-muted">
            {order.shipping_address?.country_code?.toUpperCase()}
          </Text>
        </div>

        <div
          className="flex flex-col w-1/3 "
          data-testid="shipping-contact-summary"
        >
          <Text className="txt-medium-plus text-pharmint-white mb-1">Contact</Text>
          <Text className="txt-medium text-pharmint-muted">
            {order.shipping_address?.phone}
          </Text>
          <Text className="txt-medium text-pharmint-muted">{order.email}</Text>
        </div>

        <div
          className="flex flex-col w-1/3"
          data-testid="shipping-method-summary"
        >
          <Text className="txt-medium-plus text-pharmint-white mb-1">Method</Text>
          <Text className="txt-medium text-pharmint-muted">
            {(order as any).shipping_methods[0]?.name} (
            <span className="text-accent font-semibold">
              {convertToLocale({
                amount: order.shipping_methods?.[0].total ?? 0,
                currency_code: order.currency_code,
              })}
            </span>
            )
          </Text>
        </div>
      </div>
      <Divider className="mt-8" />
    </div>
  )
}

export default ShippingDetails
