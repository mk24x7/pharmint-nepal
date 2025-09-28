import React from "react"

import UnderlineLink from "@modules/common/components/interactive-link"

import AccountNav from "../components/account-nav"
import { HttpTypes } from "@medusajs/types"

interface AccountLayoutProps {
  customer: HttpTypes.StoreCustomer | null
  children: React.ReactNode
}

const AccountLayout: React.FC<AccountLayoutProps> = ({
  customer,
  children,
}) => {
  // If no customer, render children (login template) with simple background
  if (!customer) {
    return (
      <div className="bg-pharmint-black">
        {children}
      </div>
    )
  }

  // If customer exists, render the full account dashboard layout
  return (
    <div className="flex-1 small:py-12 bg-pharmint-black min-h-screen" data-testid="account-page">
      <div className="flex-1 content-container h-full max-w-5xl mx-auto bg-background-secondary/50 backdrop-blur-sm border border-pharmint-border rounded-xl flex flex-col">
        <div className="grid grid-cols-1 small:grid-cols-[240px_1fr] py-12">
          <div className="pr-8 border-r border-pharmint-border"><AccountNav customer={customer} /></div>
          <div className="flex-1 pl-8">{children}</div>
        </div>
        <div className="flex flex-col small:flex-row items-end justify-between small:border-t border-pharmint-border py-12 gap-8">
          <div>
            <h3 className="text-xl-semi mb-4 text-pharmint-white">Need Help?</h3>
            <span className="txt-medium text-pharmint-muted">
              You can find frequently asked questions and answers on our
              customer service page or contact our support team.
            </span>
          </div>
          <div>
            <UnderlineLink href="/customer-service" className="!text-accent hover:!text-accent-hover">
              Customer Service
            </UnderlineLink>
          </div>
        </div>
      </div>
    </div>
  )
}

export default AccountLayout
