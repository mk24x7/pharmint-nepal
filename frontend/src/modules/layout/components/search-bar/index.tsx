"use client"

import { MagnifyingGlassIcon, XMarkIcon } from "@heroicons/react/24/outline"
import { useState, useEffect, useRef, useCallback } from "react"
import { useRouter, usePathname, useSearchParams } from "next/navigation"
import { createPortal } from "react-dom"
import { HttpTypes } from "@medusajs/types"
import LocalizedClientLink from "@modules/common/components/localized-client-link"

type SearchProduct = {
  id: string
  title: string
  handle: string
  thumbnail?: string
  variants: {
    calculated_price?: {
      calculated_amount: number
      currency_code: string
    }
  }[]
}

const SearchBar = () => {
  const [searchQuery, setSearchQuery] = useState("")
  const [isOpen, setIsOpen] = useState(false)
  const [results, setResults] = useState<SearchProduct[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [selectedIndex, setSelectedIndex] = useState(-1)
  const [isMounted, setIsMounted] = useState(false)
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const searchRef = useRef<HTMLDivElement>(null)
  const modalRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const debounceRef = useRef<NodeJS.Timeout>()
  const resultsRef = useRef<HTMLDivElement>(null)

  const countryCode = pathname.split('/')[1] || 'ph'

  useEffect(() => {
    setIsMounted(true)
  }, [])

  const searchProducts = useCallback(async (query: string) => {
    if (!query.trim()) {
      setResults([])
      return
    }

    setIsLoading(true)
    try {
      const response = await fetch(`/api/search?q=${encodeURIComponent(query)}&limit=8&countryCode=${countryCode}`)
      const data = await response.json()
      setResults(data.products || [])
    } catch (error) {
      console.error('Search error:', error)
      setResults([])
    } finally {
      setIsLoading(false)
    }
  }, [countryCode])

  const debouncedSearch = useCallback((query: string) => {
    if (debounceRef.current) {
      clearTimeout(debounceRef.current)
    }
    debounceRef.current = setTimeout(() => {
      searchProducts(query)
    }, 300)
  }, [searchProducts])

  useEffect(() => {
    if (searchQuery) {
      debouncedSearch(searchQuery)
    } else {
      setResults([])
    }
  }, [searchQuery, debouncedSearch])

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node
      const isInsideSearchButton = searchRef.current && searchRef.current.contains(target)
      const isInsideModal = modalRef.current && modalRef.current.contains(target)
      
      if (!isInsideSearchButton && !isInsideModal) {
        setIsOpen(false)
      }
    }

    const handleKeyboardShortcut = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key === 'k') {
        event.preventDefault()
        setIsOpen(true)
        setTimeout(() => {
          inputRef.current?.focus()
        }, 100)
      } else if (event.key === 'Escape' && isOpen) {
        event.preventDefault()
        setIsOpen(false)
        inputRef.current?.blur()
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    document.addEventListener('keydown', handleKeyboardShortcut)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
      document.removeEventListener('keydown', handleKeyboardShortcut)
    }
  }, [])

  // Close modal when navigating to a new page or search params change
  useEffect(() => {
    setIsOpen(false)
    setSearchQuery("")
  }, [pathname, searchParams])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value)
    setSelectedIndex(-1)
  }

  const scrollToSelectedItem = (index: number) => {
    if (!resultsRef.current) return
    
    const items = resultsRef.current.querySelectorAll('[data-search-item]')
    if (items.length === 0) return
    
    const selectedItem = items[index] as HTMLElement
    if (selectedItem) {
      selectedItem.scrollIntoView({
        behavior: 'smooth',
        block: 'nearest',
        inline: 'nearest'
      })
    }
  }

  const handleFocus = () => {
    setIsOpen(true)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isOpen) return

    if (e.key === 'Escape') {
      setIsOpen(false)
      inputRef.current?.blur()
    } else if (e.key === 'ArrowDown') {
      e.preventDefault()
      setSelectedIndex(prev => {
        const newIndex = Math.min(prev + 1, results.length)
        scrollToSelectedItem(newIndex)
        return newIndex
      })
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setSelectedIndex(prev => {
        const newIndex = Math.max(prev - 1, -1)
        scrollToSelectedItem(newIndex)
        return newIndex
      })
    } else if (e.key === 'Enter') {
      e.preventDefault()
      if (selectedIndex === -1 || selectedIndex === results.length) {
        // Navigate to search page
        if (searchQuery.trim()) {
          router.push(`/${countryCode}/search?q=${encodeURIComponent(searchQuery.trim())}`)
          setIsOpen(false)
        }
      } else if (results[selectedIndex]) {
        // Navigate to selected product
        const product = results[selectedIndex]
        router.push(`/${countryCode}/products/${product.handle}`)
        setIsOpen(false)
      }
    }
  }

  const handleProductClick = (product: SearchProduct) => {
    router.push(`/${countryCode}/products/${product.handle}`)
    setIsOpen(false)
    setSearchQuery("")
  }

  const handleViewAllClick = () => {
    if (searchQuery.trim()) {
      router.push(`/${countryCode}/search?q=${encodeURIComponent(searchQuery.trim())}`)
      setIsOpen(false)
    }
  }

  const clearSearch = () => {
    setSearchQuery("")
    setResults([])
    inputRef.current?.focus()
  }

  const formatPrice = (variant: SearchProduct['variants'][0]) => {
    if (!variant.calculated_price) return ''
    const { calculated_amount, currency_code } = variant.calculated_price
    // Convert from centavos to pesos (multiply by 100 since prices seem to be stored in wrong unit)
    const priceInPesos = calculated_amount * 100
    return new Intl.NumberFormat('en-PH', {
      style: 'currency',
      currency: currency_code.toUpperCase(),
    }).format(priceInPesos)
  }

  const isMac = typeof navigator !== 'undefined' && navigator.platform.includes('Mac')
  
  const searchModal = isOpen && isMounted ? (
    <>
      {/* Full Page Backdrop */}
      <div className="fixed inset-0 bg-black/60 backdrop-blur-md z-[60]" />
      
      {/* Search Modal */}
      <div className="fixed top-20 left-1/2 transform -translate-x-1/2 w-full max-w-2xl z-[70] mx-4">
        <div ref={modalRef} className="bg-background border border-pharmint-border rounded-xl shadow-2xl overflow-hidden">
          {/* Search Input */}
          <div className="flex items-center px-4 py-3 border-b border-pharmint-border">
            <MagnifyingGlassIcon className="h-5 w-5 text-pharmint-muted mr-3" />
            <input
              ref={inputRef}
              type="text"
              value={searchQuery}
              onChange={handleInputChange}
              onKeyDown={handleKeyDown}
              placeholder="Search medicines, vitamins, or health products..."
              className="flex-1 bg-transparent text-pharmint-white placeholder-pharmint-muted focus:outline-none text-lg"
              autoFocus
            />
            {searchQuery && (
              <button
                onClick={clearSearch}
                className="p-1 text-pharmint-muted hover:text-white"
              >
                <XMarkIcon className="h-4 w-4" />
              </button>
            )}
          </div>

          {/* Search Results */}
          <div ref={resultsRef} className="max-h-96 overflow-y-auto">
            {isLoading && (
              <div className="px-4 py-8 text-center text-pharmint-muted">
                Searching...
              </div>
            )}

            {!isLoading && searchQuery && results.length === 0 && (
              <div className="px-4 py-8 text-center text-pharmint-muted">
                No products found for "{searchQuery}"
              </div>
            )}

            {!searchQuery && !isLoading && (
              <div className="px-4 py-6">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-sm font-medium text-pharmint-white">Popular Searches</h3>
                  <div className="text-xs text-pharmint-muted">
                    {isMac ? '⌘K' : 'Ctrl+K'} to search
                  </div>
                </div>
                <div className="flex flex-wrap gap-2">
                  {["paracetamol", "vitamin d", "tablet", "syrup", "antibiotics"].map((term) => (
                    <button
                      key={term}
                      onClick={() => setSearchQuery(term)}
                      className="px-3 py-1 text-sm bg-background-secondary/50 text-pharmint-muted hover:text-accent hover:bg-accent/10 rounded-full transition-colors"
                    >
                      {term}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {results.length > 0 && (
              <>
                {results.map((product, index) => (
                  <button
                    key={product.id}
                    data-search-item
                    onClick={(e) => {
                      e.preventDefault()
                      e.stopPropagation()
                      handleProductClick(product)
                    }}
                    className={`w-full flex items-center px-4 py-3 transition-all duration-200 ${
                      selectedIndex === index 
                        ? 'bg-accent/10 border-l-4 border-accent shadow-lg shadow-accent/20 ring-1 ring-accent/30' 
                        : 'hover:bg-accent/5 hover:border-l-4 hover:border-accent/30 border-l-4 border-transparent hover:shadow-md'
                    }`}
                  >
                    {product.thumbnail && (
                      <img
                        src={product.thumbnail}
                        alt={product.title}
                        className="w-12 h-12 object-cover rounded-lg mr-3"
                      />
                    )}
                    <div className="flex-1 text-left">
                      <p className={`font-medium transition-colors ${
                        selectedIndex === index ? 'text-white' : 'text-pharmint-white'
                      }`}>
                        {product.title}
                      </p>
                      {product.variants[0] && (
                        <p className={`text-sm font-medium transition-colors ${
                          selectedIndex === index ? 'text-accent' : 'text-accent/80'
                        }`}>
                          {formatPrice(product.variants[0])}
                        </p>
                      )}
                    </div>
                  </button>
                ))}

                {/* View All Results */}
                <button
                  data-search-item
                  onClick={(e) => {
                    e.preventDefault()
                    e.stopPropagation()
                    handleViewAllClick()
                  }}
                  className={`w-full px-4 py-3 text-left border-t border-pharmint-border transition-all duration-200 ${
                    selectedIndex === results.length 
                      ? 'bg-accent/10 border-l-4 border-accent shadow-lg shadow-accent/20 ring-1 ring-accent/30' 
                      : 'hover:bg-accent/5 hover:border-l-4 hover:border-accent/30 border-l-4 border-transparent hover:shadow-md'
                  }`}
                >
                  <div className="flex items-center text-accent">
                    <MagnifyingGlassIcon className="h-4 w-4 mr-2" />
                    <span>View all results for "{searchQuery}"</span>
                  </div>
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </>
  ) : null

  return (
    <div ref={searchRef} className="relative flex items-center gap-2">
      <button
        onClick={() => {
          setIsOpen(true)
          setTimeout(() => inputRef.current?.focus(), 100)
        }}
        className="flex items-center justify-center text-pharmint-muted hover:text-white p-2 group"
        title={isMac ? 'Search (⌘K)' : 'Search (Ctrl+K)'}
      >
        <MagnifyingGlassIcon className="h-5 w-5" />
      </button>

      {/* Shortcut Indicator */}
      <div className="hidden small:block text-xs text-pharmint-muted bg-background-secondary/30 border border-pharmint-border rounded px-2 py-1">
        {isMac ? '⌘K' : 'Ctrl+K'}
      </div>

      {/* Render modal using portal */}
      {isMounted && typeof window !== 'undefined' && searchModal && createPortal(searchModal, document.body)}
    </div>
  )
}

export default SearchBar