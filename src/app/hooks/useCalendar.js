import { useState, useEffect, useCallback } from 'react'
import { useSession } from 'next-auth/react'
import { 
  getLocalEvents, 
  addLocalEvent, 
  updateLocalEvent, 
  deleteLocalEvent,
  getLocalEventsForPeriod,
  markEventAsSynced,
  getUnsyncedEvents,
  setSyncStatus
} from '../services/localCalendar'

export const useCalendar = () => {
  const [events, setEvents] = useState([])
  const [loadingEvents, setLoadingEvents] = useState(false)
  const [syncStatus, setSyncStatusState] = useState(null)
  const { data: session } = useSession()

  // Charger les événements (Google + locaux)
  const loadEvents = useCallback(async (timeMin, timeMax) => {
    setLoadingEvents(true)
    
    try {
      let allEvents = []
      
      // Charger les événements Google si connecté
      if (session?.accessToken) {
        try {
          console.log('🔄 Chargement des événements Google...')
          const params = new URLSearchParams({
            timeMin,
            timeMax,
            maxResults: '500'
          })

          const response = await fetch(`/api/calendar/events?${params}`, {
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${session.accessToken}`,
              'Cache-Control': 'no-cache'
            }
          })
          
          if (response.ok) {
            const data = await response.json()
            allEvents = data.events || []
            console.log(`✅ ${allEvents.length} événements Google chargés`)
          } else {
            console.error('❌ Erreur chargement événements Google')
          }
        } catch (error) {
          console.error('❌ Erreur API Google:', error)
        }
      }
      
      // Charger les événements locaux
      const localEvents = getLocalEventsForPeriod(timeMin, timeMax)
      console.log(`📱 ${localEvents.length} événements locaux chargés`)
      
      // Combiner les événements (éviter les doublons si déjà synchronisés)
      const combinedEvents = [...allEvents]
      localEvents.forEach(localEvent => {
        // Ajouter seulement les événements locaux non synchronisés
        if (!localEvent.synced) {
          combinedEvents.push(localEvent)
        }
      })
      
      setEvents(combinedEvents)
      console.log(`🎯 Total: ${combinedEvents.length} événements`)
      
    } catch (error) {
      console.error('❌ Erreur chargement événements:', error)
      // En cas d'erreur, charger au moins les événements locaux
      const localEvents = getLocalEventsForPeriod(timeMin, timeMax)
      setEvents(localEvents)
    } finally {
      setLoadingEvents(false)
    }
  }, [session])

  // Ajouter un événement
  const addEvent = useCallback(async (eventData) => {
    try {
      if (session?.accessToken) {
        // Ajouter à Google Calendar
        console.log('📅 Ajout événement Google...')
        const response = await fetch('/api/calendar/events', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${session.accessToken}`
          },
          body: JSON.stringify(eventData)
        })

        if (response.ok) {
          const data = await response.json()
          console.log('✅ Événement Google créé:', data.event.summary)
          return data.event
        } else {
          throw new Error('Erreur API Google')
        }
      } else {
        // Ajouter localement
        console.log('📱 Ajout événement local...')
        const localEvent = addLocalEvent(eventData)
        console.log('✅ Événement local créé:', localEvent.summary)
        return localEvent
      }
    } catch (error) {
      console.error('❌ Erreur ajout événement:', error)
      // Fallback: sauvegarder localement même si connecté
      if (session?.accessToken) {
        console.log('🔄 Fallback: sauvegarde locale...')
        const localEvent = addLocalEvent(eventData)
        return localEvent
      }
      throw error
    }
  }, [session])

  // Modifier un événement
  const updateEvent = useCallback(async (eventData) => {
    try {
      const isLocalEvent = eventData.id.startsWith('local_')
      
      if (isLocalEvent) {
        // Modifier événement local
        console.log('📱 Modification événement local...')
        const updatedEvent = updateLocalEvent(eventData.id, eventData)
        console.log('✅ Événement local modifié')
        return updatedEvent
      } else if (session?.accessToken) {
        // Modifier événement Google
        console.log('📅 Modification événement Google...')
        const response = await fetch('/api/calendar/events', {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${session.accessToken}`
          },
          body: JSON.stringify(eventData)
        })

        if (response.ok) {
          const data = await response.json()
          console.log('✅ Événement Google modifié')
          return data.event
        } else {
          throw new Error('Erreur API Google')
        }
      } else {
        throw new Error('Non connecté et événement non local')
      }
    } catch (error) {
      console.error('❌ Erreur modification événement:', error)
      throw error
    }
  }, [session])

  // Supprimer un événement
  const deleteEvent = useCallback(async (eventId) => {
    try {
      const isLocalEvent = eventId.startsWith('local_')
      
      if (isLocalEvent) {
        // Supprimer événement local
        console.log('🗑️ Suppression événement local...')
        deleteLocalEvent(eventId)
        console.log('✅ Événement local supprimé')
        return true
      } else if (session?.accessToken) {
        // Supprimer événement Google
        console.log('🗑️ Suppression événement Google...')
        const response = await fetch(`/api/calendar/events/${eventId}`, {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${session.accessToken}`
          }
        })

        if (response.ok) {
          console.log('✅ Événement Google supprimé')
          return true
        } else {
          const error = await response.json()
          console.error('❌ Erreur API suppression:', error)
          throw new Error(error.error || 'Erreur lors de la suppression')
        }
      } else {
        throw new Error('Non connecté et événement non local')
      }
    } catch (error) {
      console.error('❌ Erreur suppression événement:', error)
      throw error
    }
  }, [session])

  // Synchroniser les événements locaux avec Google
  const syncWithGoogle = useCallback(async () => {
    if (!session?.accessToken) {
      console.log('❌ Pas de session Google pour la synchronisation')
      return
    }

    try {
      console.log('🔄 Début de la synchronisation...')
      const unsyncedEvents = getUnsyncedEvents()
      
      if (unsyncedEvents.length === 0) {
        console.log('✅ Aucun événement à synchroniser')
        return
      }

      console.log(`📤 Synchronisation de ${unsyncedEvents.length} événements...`)
      
      for (const localEvent of unsyncedEvents) {
        try {
          const response = await fetch('/api/calendar/events', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${session.accessToken}`
            },
            body: JSON.stringify({
              summary: localEvent.summary,
              description: localEvent.description,
              location: localEvent.location,
              start: localEvent.start.dateTime,
              end: localEvent.end.dateTime,
              colorId: localEvent.colorId
            })
          })

          if (response.ok) {
            const data = await response.json()
            markEventAsSynced(localEvent.id, data.event.id)
            console.log(`✅ Synchronisé: ${localEvent.summary}`)
          } else {
            console.error(`❌ Erreur sync: ${localEvent.summary}`)
          }
        } catch (error) {
          console.error(`❌ Erreur sync événement ${localEvent.id}:`, error)
        }
      }
      
      setSyncStatus('success')
      setSyncStatusState('success')
      console.log('✅ Synchronisation terminée')
      
    } catch (error) {
      console.error('❌ Erreur synchronisation:', error)
      setSyncStatus('error')
      setSyncStatusState('error')
    }
  }, [session])

  // Auto-sync quand l'utilisateur se connecte
  useEffect(() => {
    if (session?.accessToken && !syncStatus) {
      const timer = setTimeout(() => {
        syncWithGoogle()
      }, 2000) // Attendre 2s après la connexion
      
      return () => clearTimeout(timer)
    }
  }, [session, syncStatus, syncWithGoogle])

  return {
    events,
    loadingEvents,
    syncStatus,
    loadEvents,
    addEvent,
    updateEvent,
    deleteEvent,
    syncWithGoogle
  }
}