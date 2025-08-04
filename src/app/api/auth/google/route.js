// Nouvel système d'authentification Google simple
import { NextResponse } from 'next/server'

export async function GET(request) {
  const { searchParams } = new URL(request.url)
  const code = searchParams.get('code')
  
  if (!code) {
    // Redirection vers Google OAuth
    const googleAuthUrl = new URL('https://accounts.google.com/o/oauth2/v2/auth')
    googleAuthUrl.searchParams.set('client_id', process.env.GOOGLE_CLIENT_ID)
    googleAuthUrl.searchParams.set('redirect_uri', `${process.env.NEXTAUTH_URL}/api/auth/google`)
    googleAuthUrl.searchParams.set('response_type', 'code')
    googleAuthUrl.searchParams.set('scope', 'openid email profile https://www.googleapis.com/auth/calendar https://www.googleapis.com/auth/fitness.activity.read https://www.googleapis.com/auth/fitness.body.read https://www.googleapis.com/auth/fitness.heart_rate.read https://www.googleapis.com/auth/fitness.sleep.read https://www.googleapis.com/auth/fitness.body.write https://www.googleapis.com/auth/fitness.activity.write')
    googleAuthUrl.searchParams.set('access_type', 'offline')
    googleAuthUrl.searchParams.set('prompt', 'consent')
    
    return NextResponse.redirect(googleAuthUrl.toString())
  }
  
  try {
    // Échanger le code contre des tokens
    const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        client_id: process.env.GOOGLE_CLIENT_ID,
        client_secret: process.env.GOOGLE_CLIENT_SECRET,
        code,
        grant_type: 'authorization_code',
        redirect_uri: `${process.env.NEXTAUTH_URL}/api/auth/google`,
      }),
    })
    
    const tokens = await tokenResponse.json()
    
    if (!tokenResponse.ok) {
      throw new Error('Failed to get tokens')
    }
    
    // Récupérer les informations utilisateur
    const userResponse = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
      headers: {
        Authorization: `Bearer ${tokens.access_token}`,
      },
    })
    
    const user = await userResponse.json()
    
    // Créer la session
    const sessionData = {
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        image: user.picture,
      },
      accessToken: tokens.access_token,
      refreshToken: tokens.refresh_token,
      expiresAt: Date.now() + tokens.expires_in * 1000,
    }
    
    // Rediriger vers le profil avec la session
    const response = NextResponse.redirect(`${process.env.NEXTAUTH_URL}/Dashboard/Profile`)
    
    // Stocker la session dans un cookie
    response.cookies.set('auth-session', JSON.stringify(sessionData), {
      httpOnly: false, // Permet l'accès côté client
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 30 * 24 * 60 * 60, // 30 jours
      path: '/',
    })
    
    return response
  } catch (error) {
    console.error('❌ Erreur authentification:', error)
    return NextResponse.redirect(`${process.env.NEXTAUTH_URL}/Dashboard/Profile?error=auth_failed`)
  }
}