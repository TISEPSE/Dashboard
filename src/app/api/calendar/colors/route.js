import { NextResponse } from 'next/server'
import { google } from 'googleapis'

export async function GET(request) {
  try {
    // Vérifier l'authentification via le cookie custom
    const authCookie = request.cookies.get('auth-session')
    let sessionData = null
    
    if (authCookie) {
      try {
        sessionData = JSON.parse(decodeURIComponent(authCookie.value))
      } catch (parseError) {
      }
    }
    
    if (!sessionData || !sessionData.accessToken || Date.now() > sessionData.expiresAt) {
      return NextResponse.json({ error: "Session expirée - reconnectez-vous", needsReauth: true }, { status: 401 })
    }

    
    const response = await fetch('https://www.googleapis.com/calendar/v3/colors', {
      headers: {
        'Authorization': `Bearer ${sessionData.accessToken}`,
        'Content-Type': 'application/json'
      }
    })

    if (!response.ok) {
      const errorText = await response.text()
      
      // Gestion spécifique des erreurs d'authentification
      if (response.status === 401) {
        return NextResponse.json({ 
          error: "Session expirée - reconnectez-vous", 
          needsReauth: true 
        }, { status: 401 })
      }
      
      throw new Error(`Erreur API Google: ${response.status} - ${errorText}`)
    }

    const colors = await response.json()
    
    // Récupérer aussi les couleurs personnalisées depuis les événements existants
    try {
      
      const oauth2Client = new google.auth.OAuth2(
        process.env.GOOGLE_CLIENT_ID,
        process.env.GOOGLE_CLIENT_SECRET
      )
      
      oauth2Client.setCredentials({
        access_token: sessionData.accessToken
      })
      
      const calendar = google.calendar({ version: 'v3', auth: oauth2Client })
      
      // Récupérer les événements récents pour extraire les couleurs
      const now = new Date()
      const sixMonthsAgo = new Date(now.getTime() - 6 * 30 * 24 * 60 * 60 * 1000)
      
      const eventsResponse = await calendar.events.list({
        calendarId: 'primary',
        timeMin: sixMonthsAgo.toISOString(),
        timeMax: now.toISOString(),
        maxResults: 2500,
        singleEvents: true,
        orderBy: 'startTime'
      })
      
      const events = eventsResponse.data.items || []
      const customColors = new Set()
      
      // Extraire les couleurs personnalisées
      events.forEach(event => {
        if (event.colorId && !colors.event[event.colorId]) {
          customColors.add(event.colorId)
        }
      })
      
      
      // Ajouter les couleurs personnalisées avec une couleur par défaut
      customColors.forEach(colorId => {
        if (!colors.event[colorId]) {
          colors.event[colorId] = {
            background: '#8E24AA', // Couleur violet par défaut pour les couleurs inconnues
            foreground: '#FFFFFF'
          }
        }
      })
      
    } catch (eventError) {
      // Continuer même si on ne peut pas récupérer les couleurs personnalisées
    }
    
    return NextResponse.json(colors)
  } catch (error) {
    return NextResponse.json({ 
      error: error.message,
      fallback: true 
    }, { status: 500 })
  }
}