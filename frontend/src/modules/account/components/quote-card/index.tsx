import { convertToLocale } from "@lib/util/money"
import { Container } from "@medusajs/ui"
import { StoreQuoteResponse } from "@/types/quote"
import LocalizedClientLink from "@modules/common/components/localized-client-link"

interface QuoteCardProps {
  quote: StoreQuoteResponse["quote"]
}

const QuoteCard = ({ quote }: QuoteCardProps) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending_merchant":
        return "text-yellow-500"
      case "pending_customer":
        return "text-blue-400"
      case "accepted":
        return "text-green-400"
      case "customer_rejected":
      case "merchant_rejected":
        return "text-red-400"
      default:
        return "text-pharmint-muted"
    }
  }

  const formatStatus = (status: string) => {
    return status.replace(/_/g, " ").replace(/\b\w/g, l => l.toUpperCase())
  }

  const formatDate = (dateString: string | null) => {
    if (!dateString) return "Date not available"
    try {
      const date = new Date(dateString)
      if (isNaN(date.getTime())) return "Date not available"
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      })
    } catch {
      return "Date not available"
    }
  }

  const getRelativeTime = (dateString: string | null) => {
    if (!dateString) return ""
    try {
      const date = new Date(dateString)
      if (isNaN(date.getTime())) return ""

      const now = new Date()
      const diffInMs = now.getTime() - date.getTime()
      const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24))
      const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60))
      const diffInMinutes = Math.floor(diffInMs / (1000 * 60))

      if (diffInDays > 0) {
        return `${diffInDays} day${diffInDays === 1 ? '' : 's'} ago`
      } else if (diffInHours > 0) {
        return `${diffInHours} hour${diffInHours === 1 ? '' : 's'} ago`
      } else if (diffInMinutes > 0) {
        return `${diffInMinutes} minute${diffInMinutes === 1 ? '' : 's'} ago`
      } else {
        return "Just now"
      }
    } catch {
      return ""
    }
  }


  return (
    <Container className="p-6 border border-pharmint-border bg-background-secondary/30 rounded-xl hover:bg-background-secondary/50 transition-all duration-200">
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="text-lg font-semibold text-pharmint-white">
            Quote #{quote.draft_order?.display_id || quote.id.slice(-6)}
          </h3>
          <div className="space-y-1">
            <p className="text-sm text-pharmint-muted">
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
            </p>
            {getRelativeTime(quote.created_at || quote.draft_order?.created_at) && (
              <p className="text-xs text-accent font-medium">
                {getRelativeTime(quote.created_at || quote.draft_order?.created_at)}
              </p>
            )}
          </div>
        </div>
        <span className={`text-sm font-medium px-3 py-1 rounded-full border ${getStatusColor(quote.status)} border-current`}>
          {formatStatus(quote.status)}
        </span>
      </div>

      <div className="mb-4">
        <div className="flex items-center gap-2 mb-2">
          <p className="text-sm text-pharmint-muted">
            {quote.draft_order?.items?.length || 0} items
          </p>
          {quote.draft_order?.items && quote.draft_order.items.length > 0 && (
            <div className="flex items-center gap-1 text-xs text-pharmint-muted">
              <span>•</span>
              <span className="truncate max-w-32">
                {quote.draft_order.items[0]?.title || quote.draft_order.items[0]?.variant_sku || 'Product'}
              </span>
              {quote.draft_order.items.length > 1 && (
                <span className="text-accent">+{quote.draft_order.items.length - 1} more</span>
              )}
            </div>
          )}
        </div>
        <div className="flex items-center justify-between">
          <p className="text-lg font-semibold text-pharmint-white">
            {convertToLocale({
              amount: (quote.draft_order?.total || 0) / 100,
              currency_code: quote.draft_order?.currency_code || "USD"
            })}
          </p>
          {(quote.status === "pending_customer" || quote.status === "accepted") && (
            <span className="text-xs bg-accent/10 text-accent px-2 py-1 rounded-full font-medium">
              Quote Modified
            </span>
          )}
        </div>
      </div>

      <LocalizedClientLink
        href={`/account/quotes/details/${quote.id}`}
        className="text-sm text-accent hover:text-accent-hover underline transition-colors duration-200"
      >
        View Details →
      </LocalizedClientLink>
    </Container>
  )
}

export default QuoteCard