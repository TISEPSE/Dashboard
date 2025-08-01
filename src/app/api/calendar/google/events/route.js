import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '../../../auth/[...nextauth]/route'
import { google } from 'googleapis'

export async function GET(request) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.accessToken || session?.error === "RefreshAccessTokenError") {
      return NextResponse.json({ 
        error: "Session expirée - reconnectez-vous", 
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
      access_token: session.accessToken
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