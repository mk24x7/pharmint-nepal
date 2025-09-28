import { NextRequest, NextResponse } from "next/server"

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const { searchParams } = new URL(request.url)
  const limit = searchParams.get('limit') || '10'
  const offset = searchParams.get('offset') || '0'
  
  try {
    const response = await fetch(
      `${process.env.MEDUSA_BACKEND_URL}/store/products/${id}/reviews?limit=${limit}&offset=${offset}`,
      {
        headers: {
          'x-publishable-api-key': process.env.MEDUSA_PUBLISHABLE_KEY || '',
          'Content-Type': 'application/json',
        },
      }
    )

    if (!response.ok) {
      throw new Error(`Backend responded with status: ${response.status}`)
    }

    const data = await response.json()
    return NextResponse.json(data)
  } catch (error) {
    console.error('Failed to fetch product reviews:', error)
    return NextResponse.json(
      { error: 'Failed to fetch reviews' },
      { status: 500 }
    )
  }
}