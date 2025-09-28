import { Suspense } from "react"

import { listRegions } from "@lib/data/regions"
import { StoreRegion } from "@medusajs/types"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import CartButton from "@modules/layout/components/cart-button"
import SideMenu from "@modules/layout/components/side-menu"
import SearchBar from "@modules/layout/components/search-bar"

export default async function Nav() {
  const regions = await listRegions().then((regions: StoreRegion[]) => regions)

  return (
    <div className="sticky top-0 inset-x-0 z-50 group">
      <header className="relative h-16 mx-auto border-b duration-200 bg-background border-pharmint-border backdrop-blur-sm bg-background/95">
        <nav className="content-container txt-xsmall-plus text-pharmint-muted flex items-center justify-between w-full h-full text-small-regular">
          <div className="flex-1 basis-0 h-full flex items-center">
            <div className="h-full">
              <SideMenu regions={regions} />
            </div>
          </div>

          <div className="flex items-center h-full">
            <LocalizedClientLink
              href="/"
              className="hover:text-accent transition-colors duration-200 flex items-center w-fit"
              data-testid="nav-store-link"
            >
              <h1 className="text-base font-medium flex items-center">
                <img 
                  src="/logo-dark.png" 
                  alt="Pharmint Logo" 
                  className="inline mr-2 h-8 w-8 object-contain"
                />
                <span className="font-bold text-white">Pharmint</span>
                <span className="ml-1 text-accent font-medium">.PH</span>
              </h1>
            </LocalizedClientLink>
          </div>

          <div className="flex items-center gap-x-6 h-full flex-1 basis-0 justify-end">
            {/* Mobile Search Icon */}
            <div className="small:hidden">
              <SearchBar />
            </div>
            
            <div className="hidden small:flex items-center gap-x-6 h-full">
              <SearchBar />
              <LocalizedClientLink
                className="hover:text-white text-pharmint-muted"
                href="/account"
                data-testid="nav-account-link"
              >
                Account
              </LocalizedClientLink>
            </div>
            <Suspense
              fallback={
                <LocalizedClientLink
                  className="hover:text-white text-pharmint-muted flex gap-2"
                  href="/cart"
                  data-testid="nav-cart-link"
                >
                  Cart (0)
                </LocalizedClientLink>
              }
            >
              <CartButton />
            </Suspense>
          </div>
        </nav>
      </header>
    </div>
  )
}
