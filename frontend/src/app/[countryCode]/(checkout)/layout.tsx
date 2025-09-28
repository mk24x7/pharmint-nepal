import LocalizedClientLink from "@modules/common/components/localized-client-link"
import ChevronDown from "@modules/common/icons/chevron-down"

export default function CheckoutLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="w-full bg-pharmint-black relative small:min-h-screen">
      <div className="h-16 bg-pharmint-black border-b border-pharmint-border">
        <nav className="flex h-full items-center content-container justify-between">
          <LocalizedClientLink
            href="/cart"
            className="text-small-semi text-pharmint-white flex items-center gap-x-2 uppercase flex-1 basis-0 hover:text-accent transition-colors duration-200"
            data-testid="back-to-cart-link"
          >
            <ChevronDown className="rotate-90 text-pharmint-muted" size={16} />
            <span className="mt-px hidden small:block txt-compact-plus text-pharmint-muted hover:text-accent transition-colors duration-200">
              Back to shopping cart
            </span>
            <span className="mt-px block small:hidden txt-compact-plus text-pharmint-muted hover:text-accent transition-colors duration-200">
              Back
            </span>
          </LocalizedClientLink>
          <LocalizedClientLink
            href="/"
            className="txt-compact-xlarge-plus text-pharmint-white hover:text-accent transition-colors duration-200 flex items-center"
            data-testid="store-link"
          >
            <img 
              src="/logo-dark.png" 
              alt="Pharmint Logo" 
              className="inline mr-2 h-6 w-6 object-contain"
            />
            <span className="font-bold">Pharmint</span>
            <span className="ml-1 text-accent font-medium">.PH</span>
          </LocalizedClientLink>
          <div className="flex-1 basis-0" />
        </nav>
      </div>
      <div className="relative" data-testid="checkout-container">{children}</div>
      <div className="py-4 w-full flex items-center justify-center">
        <div className="text-pharmint-muted text-sm">
          © {new Date().getFullYear()}{" "}
          <a 
            href="https://pharmint.ph" 
            target="_blank" 
            rel="noopener noreferrer"
            className="hover:text-accent transition-colors"
          >
            Pharmint.PH
          </a>
          {" "}- Secure Pharmaceutical B2B Platform
        </div>
      </div>
    </div>
  )
}
