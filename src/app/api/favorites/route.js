import { NextResponse } from 'next/server'
import { prisma } from '../../../../lib/prisma'

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId') || 'anonymous'

    const favorites = await prisma.cryptoFavorite.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' }
    })

    return NextResponse.json(favorites)
  } catch (error) {
    console.error('Error fetching favorites:', error)
    
    // Si la table n'existe pas (PostgreSQL)
    if (error.code === 'P2021' || error.code === '42P01') {
      return NextResponse.json({ error: 'Database table does not exist. Run: npx prisma db push' }, { status: 503 })
    }
    
    // Gérer les erreurs de base de données spécifiques
    if (error.code === 'P1001' || error.code === 'P1012') {
      return NextResponse.json({ error: 'Database connection failed' }, { status: 503 })
    }
    
    return NextResponse.json({ 
      error: 'Failed to fetch favorites', 
      details: error.message,
      code: error.code 
    }, { status: 500 })
  }
}

export async function POST(request) {
  try {
    const { symbol, name, userId = 'anonymous' } = await request.json()

    if (!symbol || !name) {
      return NextResponse.json({ error: 'Symbol and name are required' }, { status: 400 })
    }

    const favorite = await prisma.cryptoFavorite.create({
      data: {
        symbol,
        name,
        userId
      }
    })

    return NextResponse.json(favorite)
  } catch (error) {
    if (error.code === 'P2002') {
      return NextResponse.json({ error: 'This crypto is already in favorites' }, { status: 409 })
    }
    console.error('Error adding favorite:', error)
    return NextResponse.json({ error: 'Failed to add favorite' }, { status: 500 })
  }
}

export async function DELETE(request) {
  try {
    const { searchParams } = new URL(request.url)
    const symbol = searchParams.get('symbol')
    const userId = searchParams.get('userId') || 'anonymous'

    if (!symbol) {
      return NextResponse.json({ error: 'Symbol is required' }, { status: 400 })
    }

    await prisma.cryptoFavorite.deleteMany({
      where: {
        symbol,
        userId
      }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error removing favorite:', error)
    return NextResponse.json({ error: 'Failed to remove favorite' }, { status: 500 })
  }
}