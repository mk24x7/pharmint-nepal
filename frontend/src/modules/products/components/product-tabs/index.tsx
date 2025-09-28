"use client"

import Back from "@modules/common/icons/back"
import FastDelivery from "@modules/common/icons/fast-delivery"
import Refresh from "@modules/common/icons/refresh"

import Accordion from "./accordion"
import { HttpTypes } from "@medusajs/types"

type ProductTabsProps = {
  product: HttpTypes.StoreProduct
}

const ProductTabs = ({ product }: ProductTabsProps) => {
  const tabs = [
    {
      label: "Product Information",
      component: <ProductInfoTab product={product} />,
    },
    {
      label: "Shipping & Returns",
      component: <ShippingInfoTab />,
    },
  ]

  return (
    <div className="w-full">
      <Accordion type="multiple">
        {tabs.map((tab, i) => (
          <Accordion.Item
            key={i}
            title={tab.label}
            headingSize="medium"
            value={tab.label}
          >
            {tab.component}
          </Accordion.Item>
        ))}
      </Accordion>
    </div>
  )
}

const ProductInfoTab = ({ product }: ProductTabsProps) => {
  return (
    <div className="text-small-regular py-8">
      <div className="grid grid-cols-2 gap-x-8">
        <div className="flex flex-col gap-y-4">
          <div>
            <span className="font-semibold text-pharmint-white">Material</span>
            <p className="text-pharmint-muted">{product.material ? product.material : "-"}</p>
          </div>
          <div>
            <span className="font-semibold text-pharmint-white">Country of origin</span>
            <p className="text-pharmint-muted">{product.origin_country ? product.origin_country : "-"}</p>
          </div>
          <div>
            <span className="font-semibold text-pharmint-white">Type</span>
            <p className="text-pharmint-muted">{product.type ? product.type.value : "-"}</p>
          </div>
        </div>
        <div className="flex flex-col gap-y-4">
          <div>
            <span className="font-semibold text-pharmint-white">Weight</span>
            <p className="text-pharmint-muted">{product.weight ? `${product.weight} g` : "-"}</p>
          </div>
          <div>
            <span className="font-semibold text-pharmint-white">Dimensions</span>
            <p className="text-pharmint-muted">
              {product.length && product.width && product.height
                ? `${product.length}L x ${product.width}W x ${product.height}H`
                : "-"}
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

const ShippingInfoTab = () => {
  return (
    <div className="text-small-regular py-8">
      <div className="grid grid-cols-1 gap-y-8">
        <div className="flex items-start gap-x-4">
          <div className="text-accent mt-1">
            <FastDelivery />
          </div>
          <div>
            <span className="font-semibold text-pharmint-white block mb-2">Fast delivery</span>
            <p className="max-w-sm text-pharmint-muted leading-relaxed">
              Your pharmaceutical products will arrive in 3-5 business days at your pick up
              location or safely delivered to your home.
            </p>
          </div>
        </div>
        <div className="flex items-start gap-x-4">
          <div className="text-accent mt-1">
            <Refresh />
          </div>
          <div>
            <span className="font-semibold text-pharmint-white block mb-2">Quality assurance</span>
            <p className="max-w-sm text-pharmint-muted leading-relaxed">
              All our pharmaceutical products are sourced from certified suppliers
              and undergo strict quality checks before dispatch.
            </p>
          </div>
        </div>
        <div className="flex items-start gap-x-4">
          <div className="text-accent mt-1">
            <Back />
          </div>
          <div>
            <span className="font-semibold text-pharmint-white block mb-2">Easy returns</span>
            <p className="max-w-sm text-pharmint-muted leading-relaxed">
              Unopened products can be returned within 30 days for a full refund.
              We prioritize your satisfaction and product safety.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ProductTabs
