import { NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    const response = await fetch(
      `${process.env.MEDUSA_BACKEND_URL}/store/reviews`,
      {
        method: 'POST',
        headers: {
          'x-publishable-api-key': process.env.MEDUSA_PUBLISHABLE_KEY || '',
          'Content-Type': 'application/json',
          // Forward authentication headers from the request
          ...Object.fromEntries(
            Array.from(request.headers.entries()).filter(([key]) => 
              key.toLowerCase().includes('auth') || 
              key.toLowerCase().includes('session') ||
              key.toLowerCase().includes('bearer')
            )
          ),
        },
        body: JSON.stringify(body)
      }
    )

    const data = await response.json()
    
    if (!response.ok) {
      return NextResponse.json(data, { status: response.status })
    }

    return NextResponse.json(data)
  } catch (error) {
    console.error('Failed to create review:', error)
    return NextResponse.json(
      { error: 'Failed to create review' },
      { status: 500 }
    )
  }
}