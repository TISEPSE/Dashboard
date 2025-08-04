// API pour récupérer la session utilisateur
import { NextResponse } from 'next/server'

export async function GET(request) {
  try {
    const cookieHeader = request.headers.get('cookie')
    let sessionCookie = null
    
    if (cookieHeader) {
      const cookies = cookieHeader.split(';').reduce((acc, cookie) => {
        const [key, value] = cookie.trim().split('=')
        acc[key] = value
        return acc
      }, {})
      sessionCookie = cookies['auth-session'] ? { value: cookies['auth-session'] } : null
    }
    
    if (!sessionCookie) {
      return NextResponse.json({ user: null, authenticated: false })
    }
    
    const sessionData = JSON.parse(sessionCookie.value)
    
    // Vérifier si le token n'est pas expiré
    if (Date.now() > sessionData.expiresAt) {
      // Token expiré, essayer de le rafraîchir si refresh_token disponible
      if (sessionData.refreshToken) {
        try {
          const refreshResponse = await fetch('https://oauth2.googleapis.com/token', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: new URLSearchParams({
              client_id: process.env.GOOGLE_CLIENT_ID,
              client_secret: process.env.GOOGLE_CLIENT_SECRET,
              refresh_token: sessionData.refreshToken,
              grant_type: 'refresh_token',
            }),
          })
          
          const newTokens = await refreshResponse.json()
          
          if (refreshResponse.ok) {
            // Mettre à jour la session
            const updatedSession = {
              ...sessionData,
              accessToken: newTokens.access_token,
              expiresAt: Date.now() + newTokens.expires_in * 1000,
            }
            
            const response = NextResponse.json({ 
              user: updatedSession.user, 
              authenticated: true,
              accessToken: updatedSession.accessToken 
            })
            
            response.cookies.set('auth-session', JSON.stringify(updatedSession), {
              httpOnly: true,
              secure: process.env.NODE_ENV === 'production',
              sameSite: 'lax',
              maxAge: 30 * 24 * 60 * 60,
            })
            
            return response
          }
        } catch (error) {
          console.error('❌ Erreur refresh token:', error)
        }
      }
      
      // Token expiré et refresh impossible
      const response = NextResponse.json({ user: null, authenticated: false })
      response.cookies.delete('auth-session')
      return response
    }
    
    // Session valide
    return NextResponse.json({ 
      user: sessionData.user, 
      authenticated: true,
      accessToken: sessionData.accessToken 
    })
  } catch (error) {
    console.error('❌ Erreur récupération session:', error)
    return NextResponse.json({ user: null, authenticated: false })
  }
}