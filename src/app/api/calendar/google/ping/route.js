import { NextResponse } from 'next/server'

export async function GET(request) {
  try {
    // Détecter si la requête vient d'Electron
    const userAgent = request.headers.get('user-agent') || ''
    const isElectron = userAgent.includes('Electron') || request.headers.get('x-electron-app') === 'true'
    
    console.log('🔍 [PING-API] Requête reçue:', { 
      isElectron, 
      userAgent: userAgent.substring(0, 100),
      headers: Object.fromEntries(request.headers.entries())
    })

    // Vérifier l'authentification via le cookie custom
    const authCookie = request.cookies.get('auth-session')
    let sessionData = null
    
    if (authCookie) {
      try {
        sessionData = JSON.parse(decodeURIComponent(authCookie.value))
        console.log('🔍 [PING-API] Session custom:', { 
          hasSession: !!sessionData, 
          hasAccessToken: !!sessionData?.accessToken,
          user: sessionData?.user?.email,
          expiresAt: sessionData?.expiresAt,
          isExpired: sessionData?.expiresAt ? Date.now() > sessionData.expiresAt : true
        })
      } catch (parseError) {
        console.error('❌ [PING-API] Erreur parsing session:', parseError)
      }
    }
    
    // Vérifier si la session existe et n'est pas expirée
    if (!sessionData || !sessionData.accessToken || Date.now() > sessionData.expiresAt) {
      console.warn('⚠️ [PING-API] Session invalide ou expirée')
      
      // En mode Electron, fournir plus d'informations de debug
      if (isElectron) {
        return NextResponse.json({ 
          error: "Session Google invalide en mode Electron",
          needsReauth: true,
          connected: false,
          debug: {
            hasSession: !!sessionData,
            hasAccessToken: !!sessionData?.accessToken,
            isExpired: sessionData?.expiresAt ? Date.now() > sessionData.expiresAt : true,
            userAgent,
            isElectron: true
          }
        }, { status: 401 })
      }
      
      return NextResponse.json({ 
        error: "Session expirée - reconnectez-vous", 
        needsReauth: true,
        connected: false
      }, { status: 401 })
    }

    console.log('✅ [PING-API] Session valide')
    
    // Simple vérification de session
    return NextResponse.json({
      connected: true,
      message: "Connexion Google Calendar disponible",
      debug: isElectron ? {
        isElectron: true,
        user: sessionData.user?.email,
        hasAccessToken: !!sessionData.accessToken
      } : undefined
    })

  } catch (error) {
    console.error('❌ Erreur ping Google Calendar:', error)
    
    return NextResponse.json({ 
      error: error.message || 'Erreur de connectivité',
      connected: false
    }, { status: 500 })
  }
}