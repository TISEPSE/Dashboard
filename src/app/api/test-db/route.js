import { NextResponse } from 'next/server'
import { getDatabaseAdapter } from '../../lib/database-adapter.js'

export async function GET() {
  try {
    const dbAdapter = getDatabaseAdapter()
    
    // Test de récupération des favoris crypto (test de connexion)
    const favorites = await dbAdapter.getCryptoFavorites()
    
    return NextResponse.json({ 
      success: true, 
      message: 'Database connection successful',
      favoritesCount: favorites.length,
      isElectron: dbAdapter.isElectronApp()
    })
    
  } catch (error) {
    console.error('Database test failed:', error)
    return NextResponse.json({ 
      success: false, 
      error: error.message,
      stack: error.stack 
    }, { status: 500 })
  }
}