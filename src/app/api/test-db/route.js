import { NextResponse } from 'next/server'
import { prisma } from '../../../../lib/prisma'

export async function GET() {
  try {
    
    // Test de connexion simple
    await prisma.$connect()
    
    // Test de création d'une table si elle n'existe pas
    const count = await prisma.cryptoFavorite.count()
    
    return NextResponse.json({ 
      success: true, 
      message: 'Database connection successful',
      count: count 
    })
    
  } catch (error) {
    console.error('Database test failed:', error)
    return NextResponse.json({ 
      success: false, 
      error: error.message,
      code: error.code 
    }, { status: 500 })
  } finally {
    await prisma.$disconnect()
  }
}