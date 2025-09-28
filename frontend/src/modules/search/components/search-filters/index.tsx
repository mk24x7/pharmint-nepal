"use client"

import { usePathname, useRouter, useSearchParams } from "next/navigation"
import { useCallback, useState, useEffect } from "react"
import { HttpTypes } from "@medusajs/types"

type SearchFiltersProps = {
  currentQuery: string
  currentCategory?: string
  countryCode: string
  categories: HttpTypes.StoreProductCategory[]
}

const SearchFilters = ({ currentQuery, currentCategory, countryCode, categories }: SearchFiltersProps) => {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const createQueryString = useCallback(
    (name: string, value: string | null) => {
      const params = new URLSearchParams(searchParams)
      
      if (value) {
        params.set(name, value)
      } else {
        params.delete(name)
      }
      
      // Reset to page 1 when filtering
      params.delete('page')
      
      return params.toString()
    },
    [searchParams]
  )

  const handleCategoryFilter = (categoryHandle: string | null) => {
    const queryString = createQueryString('category', categoryHandle)
    router.push(`${pathname}?${queryString}`)
  }

  const clearFilters = () => {
    router.push(`${pathname}?q=${encodeURIComponent(currentQuery)}`)
  }

  return (
    <div className="bg-background-secondary/50 backdrop-blur-sm border border-pharmint-border rounded-xl p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="font-semibold text-pharmint-white">Filters</h3>
        {currentCategory && (
          <button
            onClick={clearFilters}
            className="text-sm text-accent hover:text-accent-hover transition-colors"
          >
            Clear all
          </button>
        )}
      </div>

      {/* Categories Filter */}
      <div className="space-y-4">
        <h4 className="font-medium text-pharmint-white text-sm">Categories</h4>
        <div className="space-y-2">
          <button
            onClick={() => handleCategoryFilter(null)}
            className={`block w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
              !currentCategory
                ? "bg-accent/20 text-accent border border-accent/30"
                : "text-pharmint-muted hover:text-pharmint-white hover:bg-background-secondary/30"
            }`}
          >
            All Categories
          </button>
          
          {(categories || []).map((category) => (
            <button
              key={category.id}
              onClick={() => handleCategoryFilter(category.handle)}
              className={`block w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
                currentCategory === category.handle
                  ? "bg-accent/20 text-accent border border-accent/30"
                  : "text-pharmint-muted hover:text-pharmint-white hover:bg-background-secondary/30"
              }`}
            >
              {category.name}
            </button>
          ))}
        </div>
      </div>

      {/* Quick Search Suggestions */}
      <div className="mt-8 pt-6 border-t border-pharmint-border">
        <h4 className="font-medium text-pharmint-white text-sm mb-3">Popular Searches</h4>
        <div className="flex flex-wrap gap-2">
          {["paracetamol", "vitamin", "tablet", "syrup", "pain relief"].map((term) => (
            <button
              key={term}
              onClick={() => router.push(`${pathname}?q=${encodeURIComponent(term)}`)}
              className="px-3 py-1 text-xs bg-background-secondary/50 text-pharmint-muted hover:text-accent hover:bg-accent/10 rounded-full transition-colors"
            >
              {term}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}

export default SearchFilters