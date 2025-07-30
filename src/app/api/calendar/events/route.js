import { NextResponse } from "next/server"
import { google } from "googleapis"
import { getServerSession } from "next-auth"
import { authOptions } from "../../auth/[...nextauth]/route"

export async function GET(request) {
  try {
    const session = await getServerSession(authOptions)
    
    
    if (!session?.accessToken || session?.error === "RefreshAccessTokenError") {
      return NextResponse.json({ 
        error: "Session expirée - reconnectez-vous", 
        needsReauth: true 
      }, { status: 401 })
    }

    // Configuration de l'API Google Calendar
    const oauth2Client = new google.auth.OAuth2(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET
    )

    // Configuration des credentials avec refresh token si disponible
    const credentials = {
      access_token: session.accessToken
    }
    
    if (session.refreshToken) {
      credentials.refresh_token = session.refreshToken
    }
    
    oauth2Client.setCredentials(credentials)
    

    const calendar = google.calendar({ version: 'v3', auth: oauth2Client })

    // Paramètres de requête
    const url = new URL(request.url)
    const timeMin = url.searchParams.get('timeMin') || new Date().toISOString()
    const timeMax = url.searchParams.get('timeMax') || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
    const maxResults = parseInt(url.searchParams.get('maxResults')) || 100

    // Récupérer les événements
    
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

    return NextResponse.json({
      events,
      nextPageToken: response.data.nextPageToken,
      timeRange: { timeMin, timeMax },
      totalFound: events.length
    })

  } catch (error) {
    console.error('❌ Erreur API Calendar:', {
      message: error.message,
      code: error.code,
      status: error.status,
      details: error.response?.data || error.details
    })
    
    // Gestion spécifique des erreurs d'authentification
    if (error.code === 401 || error.status === 401 || error.message?.includes('authentication')) {
      return NextResponse.json({ 
        error: "Session Google expirée - reconnectez-vous",
        needsReauth: true,
        authError: true
      }, { status: 401 })
    }

    // Gestion des erreurs de permissions
    if (error.code === 403 || error.status === 403) {
      return NextResponse.json({ 
        error: "Permissions insuffisantes pour accéder à Google Calendar",
        needsReauth: true 
      }, { status: 403 })
    }

    // Autres erreurs
    return NextResponse.json({ 
      error: "Erreur lors de la récupération des événements",
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
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
    const { summary, description, start, end, location, colorId } = body

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

    // Ajouter la couleur si spécifiée
    if (colorId) {
      event.colorId = colorId.toString()
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
    console.error('❌ Erreur création événement:', {
      message: error.message,
      code: error.code,
      status: error.status
    })
    
    if (error.code === 401 || error.status === 401 || error.message?.includes('authentication')) {
      return NextResponse.json({ 
        error: "Session Google expirée - reconnectez-vous",
        needsReauth: true,
        authError: true
      }, { status: 401 })
    }

    return NextResponse.json({ 
      error: "Erreur lors de la création de l'événement",
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    }, { status: 500 })
  }
}

export async function PUT(request) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.accessToken) {
      return NextResponse.json({ error: "Non authentifié" }, { status: 401 })
    }

    const body = await request.json()
    const { id, summary, description, start, end, location, colorId } = body

    // Validation des données requises
    if (!id || !summary || !start || !end) {
      return NextResponse.json({ 
        error: "Données manquantes (id, summary, start, end requis)" 
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

    // Modifier l'événement
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

    // Ajouter la couleur si spécifiée
    if (colorId) {
      event.colorId = colorId.toString()
    }

    const response = await calendar.events.update({
      calendarId: 'primary',
      eventId: id,
      resource: event,
    })

    return NextResponse.json({
      event: response.data,
      message: "Événement modifié avec succès"
    })

  } catch (error) {
    console.error('❌ Erreur modification événement:', {
      message: error.message,
      code: error.code,
      status: error.status
    })
    
    if (error.code === 401 || error.status === 401 || error.message?.includes('authentication')) {
      return NextResponse.json({ 
        error: "Session Google expirée - reconnectez-vous",
        needsReauth: true,
        authError: true
      }, { status: 401 })
    }

    return NextResponse.json({ 
      error: "Erreur lors de la modification de l'événement",
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    }, { status: 500 })
  }
}