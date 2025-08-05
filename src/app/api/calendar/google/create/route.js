import { NextResponse } from 'next/server'
import { google } from 'googleapis'

export async function POST(request) {
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
      return NextResponse.json({ 
        error: "Session expirée - reconnectez-vous", 
        needsReauth: true
      }, { status: 401 })
    }

    const eventData = await request.json()

    // Configurer l'authentification Google
    const oauth2Client = new google.auth.OAuth2(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET
    )
    
    oauth2Client.setCredentials({
      access_token: sessionData.accessToken
    })
    
    const calendar = google.calendar({ version: 'v3', auth: oauth2Client })
    
    // Préparer l'événement pour Google Calendar
    const googleEvent = {
      summary: eventData.summary || 'Sans titre',
      description: eventData.description || '',
      location: eventData.location || '',
      colorId: eventData.colorId || '1',
      start: eventData.start,
      end: eventData.end,
      attendees: eventData.attendees || []
    }
    
    
    // Créer l'événement dans Google Calendar
    const response = await calendar.events.insert({
      calendarId: 'primary',
      resource: googleEvent
    })
    
    const createdEvent = response.data
    
    
    // Formater la réponse
    const formattedEvent = {
      id: createdEvent.id,
      googleId: createdEvent.id,
      summary: createdEvent.summary || 'Sans titre',
      description: createdEvent.description || '',
      location: createdEvent.location || '',
      colorId: createdEvent.colorId || '1',
      start: {
        dateTime: createdEvent.start.dateTime,
        date: createdEvent.start.date
      },
      end: {
        dateTime: createdEvent.end.dateTime,
        date: createdEvent.end.date
      },
      attendees: createdEvent.attendees || [],
      created: createdEvent.created,
      updated: createdEvent.updated,
      source: 'google'
    }
    
    return NextResponse.json({
      event: formattedEvent,
      message: "Événement créé dans Google Calendar avec succès"
    })

  } catch (error) {
    
    // Gérer les erreurs d'authentification
    if (error.code === 401 || error.status === 401) {
      return NextResponse.json({ 
        error: "Session expirée - reconnectez-vous", 
        needsReauth: true 
      }, { status: 401 })
    }
    
    return NextResponse.json({ 
      error: error.message || 'Erreur lors de la création de l\'événement',
      details: error.response?.data || error.toString()
    }, { status: 500 })
  }
}