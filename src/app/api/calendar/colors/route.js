import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '../../auth/[...nextauth]/route'

export async function GET(request) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.accessToken) {
      console.log('❌ Pas de token d\'accès pour les couleurs')
      return NextResponse.json({ error: "Non authentifié" }, { status: 401 })
    }

    console.log('🎨 Récupération des couleurs Google Calendar...')
    
    const response = await fetch('https://www.googleapis.com/calendar/v3/colors', {
      headers: {
        'Authorization': `Bearer ${session.accessToken}`,
        'Content-Type': 'application/json'
      }
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error('❌ Erreur API Google Colors:', response.status, errorText)
      throw new Error(`Erreur API Google: ${response.status} - ${errorText}`)
    }

    const colors = await response.json()
    console.log('✅ Couleurs Google récupérées:', {
      totalColors: Object.keys(colors.event || {}).length,
      colorIds: Object.keys(colors.event || {}),
      sampleColor: colors.event?.['1']
    })
    
    return NextResponse.json(colors)
  } catch (error) {
    console.error('❌ Erreur récupération couleurs Google:', error)
    return NextResponse.json({ 
      error: error.message,
      fallback: true 
    }, { status: 500 })
  }
}