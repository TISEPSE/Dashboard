import { NextResponse } from 'next/server'
import { prisma } from '../../../../lib/prisma'

export async function GET() {
  try {
    console.log('Testing database connection...')
    
    // Test de connexion simple
    await prisma.$connect()
    console.log('Database connection successful')
    
    // Test de création d'une table si elle n'existe pas
    const count = await prisma.cryptoFavorite.count()
    console.log('CryptoFavorite table exists, count:', count)
    
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