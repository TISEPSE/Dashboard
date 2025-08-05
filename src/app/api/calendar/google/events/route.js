import { NextResponse } from 'next/server'
import { google } from 'googleapis'

export async function GET(request) {
  try {
    // Détecter si la requête vient d'Electron
    const userAgent = request.headers.get('user-agent') || ''
    const isElectron = userAgent.includes('Electron') || request.headers.get('x-electron-app') === 'true'
    const electronToken = request.headers.get('x-access-token')
    
    console.log('🔍 [GOOGLE-EVENTS-API] Requête reçue:', { 
      isElectron, 
      hasElectronToken: !!electronToken,
      userAgent: userAgent.substring(0, 100)
    })
    
    let accessToken = null
    
    if (isElectron && electronToken) {
      // En mode Electron avec token personnalisé
      console.log('🔑 [GOOGLE-EVENTS-API] Utilisation du token Electron')
      accessToken = electronToken
    } else {
      // Mode standard avec session custom
      const authCookie = request.cookies.get('auth-session')
      let sessionData = null
      
      if (authCookie) {
        try {
          sessionData = JSON.parse(decodeURIComponent(authCookie.value))
          console.log('🔍 [GOOGLE-EVENTS-API] Session custom:', { 
            hasSession: !!sessionData, 
            hasAccessToken: !!sessionData?.accessToken,
            user: sessionData?.user?.email,
            isExpired: sessionData?.expiresAt ? Date.now() > sessionData.expiresAt : true
          })
        } catch (parseError) {
          console.error('❌ [GOOGLE-EVENTS-API] Erreur parsing session:', parseError)
        }
      }
      
      if (!sessionData || !sessionData.accessToken || Date.now() > sessionData.expiresAt) {
        return NextResponse.json({ 
          error: "Session expirée - reconnectez-vous", 
          needsReauth: true,
          events: []
        }, { status: 401 })
      }
      
      accessToken = sessionData.accessToken
    }
    
    if (!accessToken) {
      console.warn('⚠️ [GOOGLE-EVENTS-API] Aucun token d\'accès disponible')
      return NextResponse.json({ 
        error: "Token d'accès manquant", 
        needsReauth: true,
        events: []
      }, { status: 401 })
    }

    // Configurer l'authentification Google
    const oauth2Client = new google.auth.OAuth2(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET
    )
    
    oauth2Client.setCredentials({
      access_token: accessToken
    })
    
    const calendar = google.calendar({ version: 'v3', auth: oauth2Client })
    
    // Récupérer les paramètres de requête
    const url = new URL(request.url)
    const timeMin = url.searchParams.get('timeMin') || new Date().toISOString()
    const timeMax = url.searchParams.get('timeMax') || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
    
    console.log('🔄 Récupération des événements Google Calendar...', { timeMin, timeMax })
    
    // Récupérer les événements depuis Google Calendar
    const response = await calendar.events.list({
      calendarId: 'primary',
      timeMin: timeMin,
      timeMax: timeMax,
      maxResults: 2500,
      singleEvents: true,
      orderBy: 'startTime'
    })
    
    const events = response.data.items || []
    
    console.log(`✅ ${events.length} événements récupérés depuis Google Calendar`)
    
    // Formater les événements pour correspondre au format attendu
    const formattedEvents = events.map(event => ({
      id: event.id,
      googleId: event.id,
      summary: event.summary || 'Sans titre',
      description: event.description || '',
      location: event.location || '',
      colorId: event.colorId || '1',
      start: {
        dateTime: event.start.dateTime,
        date: event.start.date
      },
      end: {
        dateTime: event.end.dateTime,
        date: event.end.date
      },
      attendees: event.attendees || [],
      created: event.created,
      updated: event.updated,
      source: 'google'
    }))
    
    return NextResponse.json({
      events: formattedEvents,
      timeRange: { timeMin, timeMax },
      totalFound: formattedEvents.length,
      source: 'google-calendar'
    })

  } catch (error) {
    console.error('❌ Erreur récupération événements Google Calendar:', error)
    
    // Gérer les erreurs d'authentification
    if (error.code === 401 || error.status === 401) {
      return NextResponse.json({ 
        error: "Session expirée - reconnectez-vous", 
        needsReauth: true,
        events: []
      }, { status: 401 })
    }
    
    return NextResponse.json({ 
      error: error.message || 'Erreur lors de la récupération des événements',
      events: []
    }, { status: 500 })
  }
}