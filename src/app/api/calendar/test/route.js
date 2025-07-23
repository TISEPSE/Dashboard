import { NextResponse } from "next/server"
import { google } from "googleapis"
import { getServerSession } from "next-auth"
import { authOptions } from "../../auth/[...nextauth]/route"

export async function GET(request) {
  try {
    const session = await getServerSession(authOptions)
    
    console.log('🧪 Test de diagnostic Calendar API')
    console.log('Session:', {
      hasSession: !!session,
      hasAccessToken: !!session?.accessToken,
      tokenStart: session?.accessToken?.substring(0, 20) + '...',
      userId: session?.user?.id
    })
    
    if (!session?.accessToken) {
      return NextResponse.json({ 
        error: "Pas de token d'accès",
        hasSession: !!session,
        sessionKeys: session ? Object.keys(session) : []
      }, { status: 401 })
    }

    // Test de l'API Google Calendar
    const oauth2Client = new google.auth.OAuth2(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET
    )

    oauth2Client.setCredentials({
      access_token: session.accessToken
    })

    const calendar = google.calendar({ version: 'v3', auth: oauth2Client })

    // Test simple : récupérer les calendriers de l'utilisateur
    console.log('🗓️ Test : récupération des calendriers...')
    const calendarList = await calendar.calendarList.list()
    
    console.log('✅ Calendriers trouvés:', calendarList.data.items?.length || 0)

    // Test : récupérer quelques événements du calendrier principal
    console.log('📅 Test : récupération des événements...')
    const events = await calendar.events.list({
      calendarId: 'primary',
      timeMin: new Date().toISOString(),
      maxResults: 5,
      singleEvents: true,
      orderBy: 'startTime',
    })

    console.log('✅ Événements trouvés:', events.data.items?.length || 0)

    return NextResponse.json({
      success: true,
      calendars: calendarList.data.items?.length || 0,
      events: events.data.items?.length || 0,
      sampleEvent: events.data.items?.[0]?.summary || 'Aucun événement',
      tokenInfo: {
        hasToken: !!session.accessToken,
        tokenLength: session.accessToken.length
      }
    })

  } catch (error) {
    console.error('❌ Erreur test Calendar API:', error)
    
    return NextResponse.json({ 
      error: "Erreur lors du test",
      details: error.message,
      code: error.code,
      status: error.status
    }, { status: 500 })
  }
}