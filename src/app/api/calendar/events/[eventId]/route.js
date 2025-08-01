import { NextResponse } from "next/server"

// Base de données en mémoire pour les événements (fallback simple)
// Note: Cette approche partage les données avec la route parent
// En production, utiliser une vraie base de données
const getEventsList = () => {
  // Accès aux événements via globalThis pour partager entre routes
  if (!globalThis.eventsList) {
    globalThis.eventsList = []
  }
  return globalThis.eventsList
}

export async function GET(request, { params }) {
  try {
    const { eventId } = params
    const eventsList = getEventsList()
    
    const event = eventsList.find(event => event.id === eventId)
    
    if (!event) {
      return NextResponse.json({ error: 'Événement non trouvé' }, { status: 404 })
    }

    return NextResponse.json({ event })

  } catch (error) {
    console.error('Erreur GET événement:', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}

export async function PUT(request, { params }) {
  try {
    const { eventId } = params
    const eventData = await request.json()
    const eventsList = getEventsList()
    
    console.log('PUT Event - ID recherché:', eventId)
    console.log('PUT Event - IDs disponibles:', eventsList.map(e => e.id))
    console.log('PUT Event - Données reçues:', eventData)
    
    const eventIndex = eventsList.findIndex(event => event.id === eventId)
    
    if (eventIndex === -1) {
      // Si l'événement n'existe pas, le créer
      const newEvent = {
        id: eventId,
        ...eventData,
        created: new Date().toISOString(),
        updated: new Date().toISOString()
      }
      eventsList.push(newEvent)
      
      console.log('PUT Event - Événement créé:', newEvent)
      
      return NextResponse.json({
        event: newEvent,
        message: "Événement créé avec succès"
      })
    }
    
    // Mettre à jour l'événement existant
    eventsList[eventIndex] = {
      ...eventsList[eventIndex],
      ...eventData,
      updated: new Date().toISOString()
    }
    
    console.log('PUT Event - Événement mis à jour:', eventsList[eventIndex])
    
    return NextResponse.json({
      event: eventsList[eventIndex],
      message: "Événement modifié avec succès"
    })

  } catch (error) {
    console.error('Erreur PUT événement:', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}

export async function DELETE(request, { params }) {
  try {
    const { eventId } = params
    const eventsList = getEventsList()

    if (!eventId) {
      return NextResponse.json({ error: "ID d'événement requis" }, { status: 400 })
    }

    const initialLength = eventsList.length
    const newEventsList = eventsList.filter(event => event.id !== eventId)
    
    if (newEventsList.length === initialLength) {
      return NextResponse.json({ error: 'Événement non trouvé' }, { status: 404 })
    }

    // Mettre à jour la liste globale
    globalThis.eventsList = newEventsList

    return NextResponse.json({
      message: "Événement supprimé avec succès",
      eventId
    })

  } catch (error) {
    console.error('Erreur DELETE événement:', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}