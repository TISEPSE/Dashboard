import { NextResponse } from "next/server"
import { google } from "googleapis"
import { getServerSession } from "next-auth"
import { authOptions } from "../../../auth/[...nextauth]/route"

export async function PUT(request, { params }) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.accessToken) {
      return NextResponse.json({ error: "Non authentifié" }, { status: 401 })
    }

    const { eventId } = params
    const body = await request.json()
    const { summary, description, start, end, location, colorId } = body

    // Configuration de l'API Google Calendar
    const oauth2Client = new google.auth.OAuth2(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET
    )

    oauth2Client.setCredentials({
      access_token: session.accessToken
    })

    const calendar = google.calendar({ version: 'v3', auth: oauth2Client })

    // Récupérer l'événement existant
    const existingEvent = await calendar.events.get({
      calendarId: 'primary',
      eventId: eventId,
    })

    // Mettre à jour les champs fournis
    const updatedEvent = {
      ...existingEvent.data,
      summary: summary || existingEvent.data.summary,
      description: description || existingEvent.data.description,
      location: location || existingEvent.data.location,
    }

    // Mettre à jour la couleur si fournie
    if (colorId) {
      updatedEvent.colorId = colorId.toString()
    }

    if (start) {
      updatedEvent.start = {
        dateTime: start,
        timeZone: 'Europe/Paris',
      }
    }

    if (end) {
      updatedEvent.end = {
        dateTime: end,
        timeZone: 'Europe/Paris',
      }
    }

    // Mettre à jour l'événement
    const response = await calendar.events.update({
      calendarId: 'primary',
      eventId: eventId,
      resource: updatedEvent,
    })

    return NextResponse.json({
      event: response.data,
      message: "Événement mis à jour avec succès"
    })

  } catch (error) {
    console.error('Erreur mise à jour événement:', error)
    
    if (error.code === 401) {
      return NextResponse.json({ 
        error: "Token d'accès expiré",
        needsReauth: true 
      }, { status: 401 })
    }

    if (error.code === 404) {
      return NextResponse.json({ 
        error: "Événement non trouvé" 
      }, { status: 404 })
    }

    return NextResponse.json({ 
      error: "Erreur lors de la mise à jour de l'événement",
      details: error.message 
    }, { status: 500 })
  }
}

export async function DELETE(request, { params }) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.accessToken) {
      return NextResponse.json({ error: "Non authentifié" }, { status: 401 })
    }

    const { eventId } = params

    // Configuration de l'API Google Calendar
    const oauth2Client = new google.auth.OAuth2(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET
    )

    oauth2Client.setCredentials({
      access_token: session.accessToken
    })

    const calendar = google.calendar({ version: 'v3', auth: oauth2Client })

    // Supprimer l'événement
    await calendar.events.delete({
      calendarId: 'primary',
      eventId: eventId,
    })

    return NextResponse.json({
      message: "Événement supprimé avec succès"
    })

  } catch (error) {
    console.error('Erreur suppression événement:', error)
    
    if (error.code === 401) {
      return NextResponse.json({ 
        error: "Token d'accès expiré",
        needsReauth: true 
      }, { status: 401 })
    }

    if (error.code === 404 || error.message === 'Resource has been deleted') {
      // L'événement a déjà été supprimé - considérer comme un succès
      return NextResponse.json({
        message: "Événement supprimé avec succès"
      })
    }

    return NextResponse.json({ 
      error: "Erreur lors de la suppression de l'événement",
      details: error.message 
    }, { status: 500 })
  }
}

export async function GET(request, { params }) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.accessToken) {
      return NextResponse.json({ error: "Non authentifié" }, { status: 401 })
    }

    const { eventId } = params

    // Configuration de l'API Google Calendar
    const oauth2Client = new google.auth.OAuth2(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET
    )

    oauth2Client.setCredentials({
      access_token: session.accessToken
    })

    const calendar = google.calendar({ version: 'v3', auth: oauth2Client })

    // Récupérer l'événement
    const response = await calendar.events.get({
      calendarId: 'primary',
      eventId: eventId,
    })

    return NextResponse.json({
      event: response.data
    })

  } catch (error) {
    console.error('Erreur récupération événement:', error)
    
    if (error.code === 401) {
      return NextResponse.json({ 
        error: "Token d'accès expiré",
        needsReauth: true 
      }, { status: 401 })
    }

    if (error.code === 404) {
      return NextResponse.json({ 
        error: "Événement non trouvé" 
      }, { status: 404 })
    }

    return NextResponse.json({ 
      error: "Erreur lors de la récupération de l'événement",
      details: error.message 
    }, { status: 500 })
  }
}