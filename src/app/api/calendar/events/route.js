import { NextResponse } from "next/server"
import { google } from "googleapis"
import { getServerSession } from "next-auth"
import { authOptions } from "../../auth/[...nextauth]/route"

export async function GET(request) {
  try {
    const session = await getServerSession(authOptions)
    
    console.log('🔍 Vérification session:', {
      hasSession: !!session,
      hasAccessToken: !!session?.accessToken,
      userId: session?.user?.id,
      tokenLength: session?.accessToken?.length
    })
    
    if (!session?.accessToken) {
      console.log('❌ Pas de token d\'accès')
      return NextResponse.json({ 
        error: "Token d'accès manquant - reconnectez-vous", 
        needsReauth: true 
      }, { status: 401 })
    }

    // Configuration de l'API Google Calendar
    const oauth2Client = new google.auth.OAuth2(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET
    )

    oauth2Client.setCredentials({
      access_token: session.accessToken
    })

    const calendar = google.calendar({ version: 'v3', auth: oauth2Client })

    // Paramètres de requête
    const url = new URL(request.url)
    const timeMin = url.searchParams.get('timeMin') || new Date().toISOString()
    const timeMax = url.searchParams.get('timeMax') || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
    const maxResults = parseInt(url.searchParams.get('maxResults')) || 100

    // Récupérer les événements
    console.log('🗓️ Récupération événements:', { timeMin, timeMax, maxResults })
    
    const response = await calendar.events.list({
      calendarId: 'primary',
      timeMin,
      timeMax,
      maxResults,
      singleEvents: true,
      orderBy: 'startTime',
      showDeleted: false, // Exclure les événements supprimés
    })

    const events = response.data.items || []
    console.log(`📅 ${events.length} événements récupérés`)

    return NextResponse.json({
      events,
      nextPageToken: response.data.nextPageToken,
      timeRange: { timeMin, timeMax },
      totalFound: events.length
    })

  } catch (error) {
    console.error('Erreur API Calendar:', error)
    
    if (error.code === 401) {
      return NextResponse.json({ 
        error: "Token d'accès expiré",
        needsReauth: true 
      }, { status: 401 })
    }

    return NextResponse.json({ 
      error: "Erreur lors de la récupération des événements",
      details: error.message 
    }, { status: 500 })
  }
}

export async function POST(request) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.accessToken) {
      return NextResponse.json({ error: "Non authentifié" }, { status: 401 })
    }

    const body = await request.json()
    const { summary, description, start, end, location } = body

    // Validation des données requises
    if (!summary || !start || !end) {
      return NextResponse.json({ 
        error: "Données manquantes (summary, start, end requis)" 
      }, { status: 400 })
    }

    // Configuration de l'API Google Calendar
    const oauth2Client = new google.auth.OAuth2(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET
    )

    oauth2Client.setCredentials({
      access_token: session.accessToken
    })

    const calendar = google.calendar({ version: 'v3', auth: oauth2Client })

    // Créer l'événement
    const event = {
      summary,
      description,
      location,
      start: {
        dateTime: start,
        timeZone: 'Europe/Paris',
      },
      end: {
        dateTime: end,
        timeZone: 'Europe/Paris',
      },
    }

    const response = await calendar.events.insert({
      calendarId: 'primary',
      resource: event,
    })

    return NextResponse.json({
      event: response.data,
      message: "Événement créé avec succès"
    })

  } catch (error) {
    console.error('Erreur création événement:', error)
    
    if (error.code === 401) {
      return NextResponse.json({ 
        error: "Token d'accès expiré",
        needsReauth: true 
      }, { status: 401 })
    }

    return NextResponse.json({ 
      error: "Erreur lors de la création de l'événement",
      details: error.message 
    }, { status: 500 })
  }
}