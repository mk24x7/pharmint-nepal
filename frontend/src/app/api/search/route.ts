import { NextRequest, NextResponse } from "next/server"
import { searchProducts } from "@lib/data/search"

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const query = searchParams.get("q")
  const limit = parseInt(searchParams.get("limit") || "8")
  const countryCode = searchParams.get("countryCode") || "ph"

  if (!query || !query.trim()) {
    return NextResponse.json({ products: [], count: 0 })
  }

  try {
    const { response } = await searchProducts({
      query: query.trim(),
      pageParam: 1,
      countryCode,
      limit,
    })

    return NextResponse.json({
      products: response.products,
      count: response.count,
    })
  } catch (error) {
    console.error("Search API error:", error)
    return NextResponse.json(
      { error: "Search failed" },
      { status: 500 }
    )
  }
}