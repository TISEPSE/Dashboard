import { NextResponse } from 'next/server'

export async function GET() {
  return NextResponse.json(
    { error: 'Gmail API is not available' },
    { status: 503 }
  )
}