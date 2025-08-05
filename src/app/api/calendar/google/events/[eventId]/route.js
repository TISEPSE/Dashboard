import { NextResponse } from 'next/server'
import { google } from 'googleapis'

export async function PUT(request, { params }) {
  try {
    // Vérifier l'authentification via le cookie custom
    const authCookie = request.cookies.get('auth-session')
    let sessionData = null
    
    if (authCookie) {
      try {
        sessionData = JSON.parse(decodeURIComponent(authCookie.value))
      } catch (parseError) {
        console.error('❌ [PUT-API] Erreur parsing session:', parseError)
      }
    }
    
    if (!sessionData || !sessionData.accessToken || Date.now() > sessionData.expiresAt) {
      return NextResponse.json({ 
        error: "Session expirée - reconnectez-vous", 
        needsReauth: true
      }, { status: 401 })
    }

    const { eventId } = params
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
    
    console.log('🔄 Mise à jour événement dans Google Calendar...', eventId, googleEvent.summary)
    
    // Mettre à jour l'événement dans Google Calendar
    const response = await calendar.events.update({
      calendarId: 'primary',
      eventId: eventId,
      resource: googleEvent
    })
    
    const updatedEvent = response.data
    
    console.log('✅ Événement mis à jour dans Google Calendar:', updatedEvent.id)
    
    // Formater la réponse
    const formattedEvent = {
      id: updatedEvent.id,
      googleId: updatedEvent.id,
      summary: updatedEvent.summary || 'Sans titre',
      description: updatedEvent.description || '',
      location: updatedEvent.location || '',
      colorId: updatedEvent.colorId || '1',
      start: {
        dateTime: updatedEvent.start.dateTime,
        date: updatedEvent.start.date
      },
      end: {
        dateTime: updatedEvent.end.dateTime,
        date: updatedEvent.end.date
      },
      attendees: updatedEvent.attendees || [],
      created: updatedEvent.created,
      updated: updatedEvent.updated,
      source: 'google'
    }
    
    return NextResponse.json({
      event: formattedEvent,
      message: "Événement mis à jour dans Google Calendar avec succès"
    })

  } catch (error) {
    console.error('❌ Erreur mise à jour événement Google Calendar:', error)
    
    // Gérer les erreurs d'authentification
    if (error.code === 401 || error.status === 401) {
      return NextResponse.json({ 
        error: "Session expirée - reconnectez-vous", 
        needsReauth: true 
      }, { status: 401 })
    }
    
    // Gérer l'événement non trouvé
    if (error.code === 404 || error.status === 404) {
      return NextResponse.json({ 
        error: "Événement non trouvé dans Google Calendar"
      }, { status: 404 })
    }
    
    return NextResponse.json({ 
      error: error.message || 'Erreur lors de la mise à jour de l\'événement'
    }, { status: 500 })
  }
}

export async function DELETE(request, { params }) {
  try {
    // Vérifier l'authentification via le cookie custom
    const authCookie = request.cookies.get('auth-session')
    let sessionData = null
    
    if (authCookie) {
      try {
        sessionData = JSON.parse(decodeURIComponent(authCookie.value))
      } catch (parseError) {
        console.error('❌ [DELETE-API] Erreur parsing session:', parseError)
      }
    }
    
    if (!sessionData || !sessionData.accessToken || Date.now() > sessionData.expiresAt) {
      return NextResponse.json({ 
        error: "Session expirée - reconnectez-vous", 
        needsReauth: true
      }, { status: 401 })
    }

    const { eventId } = params

    // Configurer l'authentification Google
    const oauth2Client = new google.auth.OAuth2(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET
    )
    
    oauth2Client.setCredentials({
      access_token: sessionData.accessToken
    })
    
    const calendar = google.calendar({ version: 'v3', auth: oauth2Client })
    
    console.log('🗑️ Suppression événement dans Google Calendar...', eventId)
    
    // Supprimer l'événement dans Google Calendar
    await calendar.events.delete({
      calendarId: 'primary',
      eventId: eventId
    })
    
    console.log('✅ Événement supprimé dans Google Calendar:', eventId)
    
    return NextResponse.json({
      message: "Événement supprimé dans Google Calendar avec succès",
      deletedId: eventId
    })

  } catch (error) {
    console.error('❌ Erreur suppression événement Google Calendar:', error)
    
    // Gérer les erreurs d'authentification
    if (error.code === 401 || error.status === 401) {
      return NextResponse.json({ 
        error: "Session expirée - reconnectez-vous", 
        needsReauth: true 
      }, { status: 401 })
    }
    
    // Gérer l'événement non trouvé (déjà supprimé)
    if (error.code === 404 || error.status === 404) {
      return NextResponse.json({
        message: "Événement déjà supprimé ou non trouvé",
        deletedId: params.eventId
      })
    }
    
    return NextResponse.json({ 
      error: error.message || 'Erreur lors de la suppression de l\'événement'
    }, { status: 500 })
  }
}