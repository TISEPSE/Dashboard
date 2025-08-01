import { NextResponse } from 'next/server'

// Base de données en mémoire pour le mode web (fallback simple)
let favoritesList = []

export async function GET() {
  try {
    return NextResponse.json(favoritesList)
  } catch (error) {
    console.error('Erreur GET favorites:', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}

export async function POST(request) {
  try {
    const crypto = await request.json()
    
    // Vérifier si le crypto existe déjà
    const exists = favoritesList.find(fav => fav.symbol === crypto.symbol)
    if (exists) {
      return NextResponse.json({ error: 'Ce crypto est déjà dans vos favoris' }, { status: 400 })
    }
    
    const newFavorite = {
      id: `web_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      symbol: crypto.symbol,
      name: crypto.name,
      userId: 'web_user',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
    
    favoritesList.push(newFavorite)
    
    return NextResponse.json(newFavorite)
  } catch (error) {
    console.error('Erreur POST favorites:', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}

export async function DELETE(request) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')
    
    if (!id) {
      return NextResponse.json({ error: 'ID requis' }, { status: 400 })
    }
    
    const initialLength = favoritesList.length
    favoritesList = favoritesList.filter(fav => fav.id !== id)
    
    if (favoritesList.length === initialLength) {
      return NextResponse.json({ error: 'Favori non trouvé' }, { status: 404 })
    }
    
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Erreur DELETE favorites:', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}