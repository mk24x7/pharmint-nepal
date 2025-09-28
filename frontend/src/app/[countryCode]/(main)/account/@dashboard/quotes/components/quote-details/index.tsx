"use client"

import { acceptQuote, rejectQuote } from "@lib/data/quotes"
import { convertToLocale } from "@lib/util/money"
import { Button } from "@medusajs/ui"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import { PromptModal } from "@modules/quotes/components/prompt-modal"
import { B2BCustomer } from "@/types/global"
import { StoreQuoteResponse } from "@/types/quote"
import { ArrowUturnLeft, CheckCircleSolid } from "@medusajs/icons"
import { AdminOrderLineItem, AdminOrderPreview } from "@medusajs/types"
import { Container, Heading, Text, toast } from "@medusajs/ui"
import { useRouter } from "next/navigation"
import React, { useMemo, useState } from "react"
import QuoteMessages from "../quote-messages"
import QuoteStatusBadge from "../quote-status-badge"
import { QuoteTableItem } from "../quote-table"

type QuoteDetailsProps = {
  quote: StoreQuoteResponse["quote"] & {
    customer: B2BCustomer
  }
  preview: AdminOrderPreview
  countryCode: string
}

const QuoteDetails: React.FC<QuoteDetailsProps> = ({
  quote,
  preview,
  countryCode,
}) => {
  const order = quote.draft_order
  const originalItemsMap = useMemo(() => {
    return new Map<string, AdminOrderLineItem>(
      order.items?.map((item: AdminOrderLineItem) => [item.id, item])
    )
  }, [order])
  const router = useRouter()
  const [isAccepting, setIsAccepting] = useState(false)
  const [isRejecting, setIsRejecting] = useState(false)

  // Frontend validation for pricing data integrity
  const quoteTotal = preview.summary?.current_order_total || preview.total
  const originalTotal = order.total

  useMemo(() => {
    // Log suspicious pricing patterns for debugging
    if (process.env.NODE_ENV === 'development') {
      if (quoteTotal && quoteTotal < 1 && originalTotal && originalTotal > 100) {
        console.warn('⚠️ Potential pricing corruption detected:', {
          originalTotal,
          quoteTotal,
          ratio: originalTotal / quoteTotal,
          quote_id: quote.id
        })
      }
    }
  }, [quoteTotal, originalTotal, quote.id])

  return (
    <div className="flex flex-col gap-y-6 p-0">
      <div className="flex gap-2 justify-between items-center mb-6">
        <LocalizedClientLink
          href="/account/quotes"
          className="flex gap-2 items-center text-pharmint-muted hover:text-accent transition-colors duration-200"
          data-testid="back-to-overview-button"
        >
          <ArrowUturnLeft size={16} />
          <span className="text-sm">Back to Quotes</span>
        </LocalizedClientLink>
      </div>

      {/* Single Column Layout */}
      <div className="flex flex-col gap-y-6">
        {quote.status === "accepted" && (
          <Container className="bg-background-secondary/50 backdrop-blur-sm border border-pharmint-border rounded-xl p-6">
            <div className="flex items-center justify-between">
              <Text className="text-pharmint-white text-sm">
                <CheckCircleSolid className="inline-block mr-2 text-green-400 text-lg" />
                Quote accepted by customer. Order is ready for processing.
              </Text>

              <Button
                size="small"
                onClick={() =>
                  router.push(
                    `/${countryCode}/account/orders/details/${quote.draft_order_id}`
                  )
                }
                className="bg-accent hover:bg-accent-hover text-white"
              >
                View Order
              </Button>
            </div>
          </Container>
        )}

        {/* 1. Quote ID and Status Card */}
        <Container className="bg-background-secondary/50 backdrop-blur-sm border border-pharmint-border rounded-xl p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-6">
              <div>
                <span className="text-sm text-pharmint-muted font-medium">Quote ID</span>
                <div className="text-xl font-bold text-pharmint-white">#{quote.draft_order.display_id}</div>
              </div>
              <div>
                <span className="text-sm text-pharmint-muted font-medium">Created</span>
                <div className="text-sm text-pharmint-white">
                  {(() => {
                    try {
                      const dateValue = quote.created_at || quote.draft_order?.created_at || new Date();
                      const date = new Date(dateValue);
                      if (isNaN(date.getTime())) {
                        return "Date not available";
                      }
                      return date.toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      });
                    } catch {
                      return "Date not available";
                    }
                  })()}
                </div>
              </div>
            </div>
            <QuoteStatusBadge status={quote.status} />
          </div>
        </Container>

        {/* 2. Customer Information Card with Edit Option */}
        <Container className="bg-background-secondary/50 backdrop-blur-sm border border-pharmint-border rounded-xl p-6">
          <div className="flex items-center justify-between mb-4">
            <Heading level="h4" className="text-pharmint-white">
              Customer Information
            </Heading>
            <LocalizedClientLink href="/account/profile">
              <Button
                size="small"
                variant="secondary"
                className="bg-background-secondary/50 border border-pharmint-border text-pharmint-white hover:bg-background-secondary/70 hover:text-accent transition-all duration-200"
              >
                Edit Profile
              </Button>
            </LocalizedClientLink>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
            <div>
              <span className="text-sm text-pharmint-muted font-medium block">Full Name</span>
              <span className="text-sm text-pharmint-white">
                {quote.customer?.first_name && quote.customer?.last_name
                  ? `${quote.customer.first_name} ${quote.customer.last_name}`
                  : quote.customer?.first_name || quote.customer?.last_name || "-"}
              </span>
            </div>

            <div>
              <span className="text-sm text-pharmint-muted font-medium block">Email</span>
              <span className="text-sm text-pharmint-white break-all">{quote.customer?.email || "-"}</span>
            </div>

            <div>
              <span className="text-sm text-pharmint-muted font-medium block">Phone</span>
              <span className="text-sm text-pharmint-white">{quote.customer?.phone || "-"}</span>
            </div>

            {quote.customer?.employee?.spending_limit && (
              <div>
                <span className="text-sm text-pharmint-muted font-medium block">Spending Limit</span>
                <span className="text-sm text-accent font-medium">
                  {convertToLocale({
                    amount: quote.customer.employee.spending_limit ?? 0,
                    currency_code: order.currency_code
                  })}
                </span>
              </div>
            )}

            {quote.customer?.employee?.company && (
              <>
                <div>
                  <span className="text-sm text-pharmint-muted font-medium block">Company</span>
                  <span className="text-sm text-pharmint-white font-medium">
                    {quote.customer.employee.company.name}
                  </span>
                </div>

                <div>
                  <span className="text-sm text-pharmint-muted font-medium block">Role</span>
                  <span className="text-sm text-pharmint-white">
                    {quote.customer.employee.is_admin ? "Administrator" : "Employee"}
                  </span>
                </div>
              </>
            )}
          </div>
        </Container>

        {/* 3. Quote Items */}
        <div>
          <Heading level="h4" className="text-pharmint-white mb-4">Quote Items</Heading>
          <div className="space-y-4">
            {preview.items?.map((item) => (
              <Container key={item.id} className="bg-background-secondary/50 backdrop-blur-sm border border-pharmint-border rounded-xl p-6">
                <QuoteTableItem
                  key={item.id}
                  item={item}
                  originalItem={originalItemsMap.get(item.id)}
                  currencyCode={order.currency_code}
                />
              </Container>
            ))}
          </div>
        </div>

        {/* 4. Quote Summary */}
        <Container className="bg-background-secondary/50 backdrop-blur-sm border border-pharmint-border rounded-xl p-6">
          <Heading level="h4" className="text-pharmint-white mb-4">Quote Summary</Heading>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-pharmint-muted font-medium">
                Original Total
              </span>
              <span className="text-base text-pharmint-white font-medium">
                {convertToLocale({
                  amount: originalTotal ?? 0,
                  currency_code: order.currency_code
                })}
              </span>
            </div>

            <div className="flex items-center justify-between border-t border-pharmint-border pt-4">
              <span className="text-base text-pharmint-white font-semibold">
                Quote Total
              </span>
              <span className="text-xl text-accent font-bold">
                {convertToLocale({
                  amount: quoteTotal ?? 0,
                  currency_code: order.currency_code
                })}
              </span>
            </div>

          </div>
        </Container>

        {quote.status === "pending_customer" && (
          <div className="flex gap-x-3 justify-end my-4">
            <PromptModal
              title="Reject Quote?"
              description="Are you sure you want to reject quote? This action is irreversible."
              handleAction={() => {
                setIsRejecting(true)

                rejectQuote(quote.id)
                  .catch((e) => toast.error(e.message))
                  .finally(() => setIsRejecting(false))
              }}
              isLoading={isRejecting}
            >
              <Button size="small" variant="secondary">
                Reject Quote
              </Button>
            </PromptModal>

            <PromptModal
              title="Accept Quote?"
              description="Are you sure you want to accept quote? This action is irreversible."
              handleAction={() => {
                setIsAccepting(true)

                acceptQuote(quote.id)
                  .catch((e) => toast.error(e.message))
                  .finally(() => setIsAccepting(false))
              }}
              isLoading={isAccepting}
            >
              <Button size="small" variant="primary">
                Accept Quote
              </Button>
            </PromptModal>
          </div>
        )}

        {/* 5. Messages Module */}
        <QuoteMessages quote={quote} preview={preview} />
      </div>
    </div>
  )
}

export default QuoteDetails
