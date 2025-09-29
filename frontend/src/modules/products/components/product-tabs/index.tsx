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
      label: "उत्पादन जानकारी",
      component: <ProductInfoTab product={product} />,
    },
    {
      label: "ढुवानी र फिर्ता",
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
            <span className="font-semibold text-pharmint-white">सामग्री</span>
            <p className="text-pharmint-muted">{product.material ? product.material : "-"}</p>
          </div>
          <div>
            <span className="font-semibold text-pharmint-white">मूल देश</span>
            <p className="text-pharmint-muted">{product.origin_country ? product.origin_country : "-"}</p>
          </div>
          <div>
            <span className="font-semibold text-pharmint-white">प्रकार</span>
            <p className="text-pharmint-muted">{product.type ? product.type.value : "-"}</p>
          </div>
        </div>
        <div className="flex flex-col gap-y-4">
          <div>
            <span className="font-semibold text-pharmint-white">तौल</span>
            <p className="text-pharmint-muted">{product.weight ? `${product.weight} g` : "-"}</p>
          </div>
          <div>
            <span className="font-semibold text-pharmint-white">आयाम</span>
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
            <span className="font-semibold text-pharmint-white block mb-2">छिटो डेलिभरी</span>
            <p className="max-w-sm text-pharmint-muted leading-relaxed">
              तपाईंका फार्मास्युटिकल उत्पादनहरू ३-५ कार्यदिवसमा तपाईंको
              पिकअप स्थानमा वा घरमा सुरक्षित रूपमा पुग्नेछ।
            </p>
          </div>
        </div>
        <div className="flex items-start gap-x-4">
          <div className="text-accent mt-1">
            <Refresh />
          </div>
          <div>
            <span className="font-semibold text-pharmint-white block mb-2">गुणस्तर नियन्त्रण</span>
            <p className="max-w-sm text-pharmint-muted leading-relaxed">
              हाम्रा सबै फार्मास्युटिकल उत्पादनहरू प्रमाणित
              आपूर्तिकर्ताहरूबाट आउँछन् र पठाउनु अघि कडा गुणस्तर जाँच गरिन्छ।
            </p>
          </div>
        </div>
        <div className="flex items-start gap-x-4">
          <div className="text-accent mt-1">
            <Back />
          </div>
          <div>
            <span className="font-semibold text-pharmint-white block mb-2">सजिलो फिर्ता</span>
            <p className="max-w-sm text-pharmint-muted leading-relaxed">
              नखोलिएका उत्पादनहरू ३० दिनभित्र पूर्ण पैसा फिर्ताका लागि
              फिर्ता गर्न सकिन्छ। हामी तपाईंको सन्तुष्टि र उत्पादन सुरक्षालाई प्राथमिकता दिन्छौं।
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ProductTabs
