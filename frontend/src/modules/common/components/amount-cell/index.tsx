import { convertToLocale } from "@lib/util/money"
import { clx } from "@medusajs/ui"

interface AmountCellProps {
  amount: number
  originalAmount?: number
  currencyCode: string
  className?: string
}

export const AmountCell = ({
  amount,
  originalAmount,
  currencyCode,
  className
}: AmountCellProps) => {
  const hasChanged = originalAmount !== undefined && originalAmount !== amount

  return (
    <div className={clx("flex flex-col items-end", className)}>
      <span className={clx("text-sm", {
        "text-red-500": hasChanged && amount < originalAmount,
        "text-green-500": hasChanged && amount > originalAmount,
      })}>
        {convertToLocale({
          amount: amount ?? 0,
          currency_code: currencyCode
        })}
      </span>
      {hasChanged && (
        <span className="text-xs text-ui-fg-muted line-through">
          {convertToLocale({
            amount: originalAmount ?? 0,
            currency_code: currencyCode
          })}
        </span>
      )}
    </div>
  )
}