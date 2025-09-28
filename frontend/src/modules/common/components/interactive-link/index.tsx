import { ArrowUpRightMini } from "@medusajs/icons"
import { clx } from "@medusajs/ui"
import LocalizedClientLink from "../localized-client-link"

type InteractiveLinkProps = {
  href: string
  children?: React.ReactNode
  onClick?: () => void
  className?: string
}

const InteractiveLink = ({
  href,
  children,
  onClick,
  className,
  ...props
}: InteractiveLinkProps) => {
  return (
    <LocalizedClientLink
      className={clx(
        "flex gap-x-1 items-center group whitespace-nowrap",
        className
      )}
      href={href}
      onClick={onClick}
      {...props}
    >
      <span>{children}</span>
      <ArrowUpRightMini
        className="group-hover:rotate-45 transition-transform duration-150 ease-in-out flex-shrink-0"
        color="currentColor"
        size={16}
      />
    </LocalizedClientLink>
  )
}

export default InteractiveLink
