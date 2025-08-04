import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '../../../auth/[...nextauth]/route'

export async function GET(request) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.accessToken || session?.error === "RefreshAccessTokenError") {
      return NextResponse.json({ 
        error: "Session expirée - reconnectez-vous", 
        needsReauth: true,
        connected: false
      }, { status: 401 })
    }

    // Simple vérification de session
    return NextResponse.json({
      connected: true,
      message: "Connexion Google Calendar disponible"
    })

  } catch (error) {
    console.error('❌ Erreur ping Google Calendar:', error)
    
    return NextResponse.json({ 
      error: error.message || 'Erreur de connectivité',
      connected: false
    }, { status: 500 })
  }
}