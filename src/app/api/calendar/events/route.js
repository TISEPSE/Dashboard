import { NextResponse } from "next/server"
import { getServerSession } from 'next-auth/next'
import { authOptions } from '../../auth/[...nextauth]/route'
import { google } from 'googleapis'

// Base de données en mémoire pour les événements locaux (fallback)
const getEventsList = () => {
  if (!globalThis.eventsList) {
    globalThis.eventsList = []
  }
  return globalThis.eventsList
}

// Fonction pour récupérer les événements Google Calendar
async function getGoogleCalendarEvents(session, timeMin, timeMax) {
  console.log('🔍 [SERVER] Session Google Calendar:', { 
    hasToken: !!session?.accessToken, 
    hasError: !!session?.error,
    error: session?.error
  })
  
  if (!session?.accessToken || session?.error === "RefreshAccessTokenError") {
    console.log('❌ [SERVER] Pas de session Google Calendar valide')
    return []
  }

  try {
    const oauth2Client = new google.auth.OAuth2(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET
    )
    
    oauth2Client.setCredentials({
      access_token: session.accessToken
    })
    
    const calendar = google.calendar({ version: 'v3', auth: oauth2Client })
    
    console.log('🔄 Récupération des événements Google Calendar...', { timeMin, timeMax })
    
    const response = await calendar.events.list({
      calendarId: 'primary',
      timeMin: timeMin || new Date().toISOString(),
      timeMax: timeMax || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      maxResults: 2500,
      singleEvents: true,
      orderBy: 'startTime'
    })
    
    const events = response.data.items || []
    console.log(`✅ ${events.length} événements récupérés depuis Google Calendar`)
    
    return events.map(event => ({
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
  } catch (error) {
    console.error('❌ Erreur récupération Google Calendar:', error)
    return []
  }
}

export async function GET(request) {
  try {
    const url = new URL(request.url)
    const timeMin = url.searchParams.get('timeMin')
    const timeMax = url.searchParams.get('timeMax')
    
    // Récupérer la session pour Google Calendar
    const session = await getServerSession(authOptions)
    
    // Récupérer les événements Google Calendar
    const googleEvents = await getGoogleCalendarEvents(session, timeMin, timeMax)
    
    // Récupérer les événements locaux
    const localEvents = getEventsList()
    let filteredLocalEvents = localEvents
    
    // Filtrer les événements locaux par date si spécifié
    if (timeMin || timeMax) {
      filteredLocalEvents = localEvents.filter(event => {
        const eventDate = new Date(event.start?.dateTime || event.start?.date)
        
        if (timeMin && eventDate < new Date(timeMin)) return false
        if (timeMax && eventDate > new Date(timeMax)) return false
        
        return true
      })
    }
    
    // Combiner les événements Google et locaux
    const allEvents = [...googleEvents, ...filteredLocalEvents]
    
    // Trier par date
    allEvents.sort((a, b) => {
      const dateA = new Date(a.start?.dateTime || a.start?.date)
      const dateB = new Date(b.start?.dateTime || b.start?.date)
      return dateA - dateB
    })
    
    console.log(`📊 Total événements retournés: ${allEvents.length} (Google: ${googleEvents.length}, Local: ${filteredLocalEvents.length})`)
    
    return NextResponse.json({
      events: allEvents,
      timeRange: { timeMin, timeMax },
      totalFound: allEvents.length,
      sources: {
        google: googleEvents.length,
        local: filteredLocalEvents.length
      }
    })

  } catch (error) {
    console.error('❌ Erreur GET événements:', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}

export async function POST(request) {
  try {
    const eventData = await request.json()
    const eventsList = getEventsList()
    
    const newEvent = {
      id: `web_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      summary: eventData.summary,
      description: eventData.description,
      location: eventData.location,
      start: eventData.start,
      end: eventData.end,
      colorId: eventData.colorId || '1',
      attendees: eventData.attendees,
      created: new Date().toISOString(),
      updated: new Date().toISOString()
    }
    
    eventsList.push(newEvent)
    globalThis.eventsList = eventsList
    
    return NextResponse.json({
      event: newEvent,
      message: "Événement créé avec succès"
    })

  } catch (error) {
    console.error('Erreur POST événement:', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}

export async function PUT(request) {
  try {
    const eventData = await request.json()
    const { id } = eventData
    const eventsList = getEventsList()
    
    if (!id) {
      return NextResponse.json({ error: 'ID requis' }, { status: 400 })
    }
    
    const eventIndex = eventsList.findIndex(event => event.id === id)
    
    if (eventIndex === -1) {
      return NextResponse.json({ error: 'Événement non trouvé' }, { status: 404 })
    }
    
    // Mettre à jour l'événement
    eventsList[eventIndex] = {
      ...eventsList[eventIndex],
      ...eventData,
      updated: new Date().toISOString()
    }
    
    globalThis.eventsList = eventsList
    
    return NextResponse.json({
      event: eventsList[eventIndex],
      message: "Événement modifié avec succès"
    })

  } catch (error) {
    console.error('Erreur PUT événement:', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}