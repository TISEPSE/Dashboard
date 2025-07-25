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
  setSyncStatus,
  addPendingUpdate,
  getPendingUpdates,
  removePendingUpdate
} from '../services/localCalendar'

export const useCalendar = () => {
  const [events, setEvents] = useState([])
  const [loadingEvents, setLoadingEvents] = useState(false)
  const [syncStatus, setSyncStatusState] = useState(null)
  const [lastTimeRange, setLastTimeRange] = useState({ timeMin: null, timeMax: null })
  const [notification, setNotification] = useState(null)
  const { data: session } = useSession()

  // Fonction pour afficher une notification
  const showNotification = useCallback((message, type = 'success') => {
    setNotification({ message, type, id: Date.now() })
    // Auto-hide après 3 secondes
    setTimeout(() => setNotification(null), 3000)
  }, [])

  // Charger les événements (Google + locaux)
  const loadEvents = useCallback(async (timeMin, timeMax, forceRefresh = false) => {
    // Utiliser les dernières valeurs si pas de paramètres fournis
    const finalTimeMin = timeMin || lastTimeRange.timeMin
    const finalTimeMax = timeMax || lastTimeRange.timeMax
    
    // Si pas de paramètres et pas de dernière plage, ne rien faire
    if (!finalTimeMin || !finalTimeMax) {
      return
    }

    // Sauvegarder la plage pour les prochains appels sans paramètres
    setLastTimeRange({ timeMin: finalTimeMin, timeMax: finalTimeMax })
    setLoadingEvents(true)
    
    try {
      let allEvents = []
      
      // Charger les événements Google si connecté
      if (session?.accessToken) {
        try {
          const params = new URLSearchParams({
            timeMin: finalTimeMin,
            timeMax: finalTimeMax,
            maxResults: '500'
          })
          
          // Ajouter un timestamp pour éviter le cache lors du force refresh
          if (forceRefresh) {
            params.append('_t', Date.now().toString())
          }

          const response = await fetch(`/api/calendar/events?${params}`, {
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${session.accessToken}`,
              'Cache-Control': forceRefresh ? 'no-cache, no-store, must-revalidate' : 'no-cache',
              'Pragma': forceRefresh ? 'no-cache' : undefined,
              'Expires': forceRefresh ? '0' : undefined
            }
          })
          
          if (response.ok) {
            const data = await response.json()
            allEvents = data.events || []
          } else {
            const errorData = await response.json().catch(() => ({}))
            
            // Si c'est une erreur d'authentification, on continue avec les événements locaux seulement
            if (errorData.needsReauth || response.status === 401) {
              // Optionnel: notifier l'utilisateur qu'il doit se reconnecter
              if (showNotification) {
                showNotification('Session Google expirée. Reconnectez-vous pour synchroniser avec Google Calendar.', 'warning')
              }
            }
          }
        } catch (error) {
          console.error('❌ Erreur API Google:', error)
        }
      }
      
      // Charger les événements locaux
      const localEvents = getLocalEventsForPeriod(finalTimeMin, finalTimeMax)
      
      // Appliquer les modifications en attente aux événements Google
      const pendingUpdates = getPendingUpdates()
      const modifiedGoogleEvents = allEvents.map(event => {
        if (pendingUpdates[event.id]) {
          return { ...event, ...pendingUpdates[event.id] }
        }
        return event
      })
      
      // Combiner les événements (éviter les doublons si déjà synchronisés)
      const combinedEvents = [...modifiedGoogleEvents]
      localEvents.forEach(localEvent => {
        // Ajouter seulement les événements locaux non synchronisés
        if (!localEvent.synced) {
          combinedEvents.push(localEvent)
        }
      })
      
      setEvents(combinedEvents)
      
    } catch (error) {
      console.warn('⚠️ Erreur chargement événements Google (fallback sur événements locaux):', error.message)
      // En cas d'erreur, charger au moins les événements locaux
      try {
        const localEvents = getLocalEventsForPeriod(finalTimeMin, finalTimeMax)
        setEvents(localEvents)
      } catch (localError) {
        console.error('❌ Erreur critique - impossible de charger les événements locaux:', localError)
        setEvents([])
      }
    } finally {
      setLoadingEvents(false)
    }
  }, [session?.accessToken, lastTimeRange.timeMin, lastTimeRange.timeMax])

  // Fonction pour recharger avec la dernière plage connue
  const reloadCurrentEvents = useCallback(async (forceRefresh = false) => {
    if (lastTimeRange.timeMin && lastTimeRange.timeMax) {
      if (forceRefresh) {
        // Vider les événements en cours pour forcer un rechargement complet
        setEvents([])
      }
      await loadEvents(lastTimeRange.timeMin, lastTimeRange.timeMax, forceRefresh)
    } else {
    }
  }, [loadEvents, lastTimeRange.timeMin, lastTimeRange.timeMax])

  // Ajouter un événement
  const addEvent = useCallback(async (eventData) => {
    try {
      if (session?.accessToken) {
        // Ajouter à Google Calendar
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
          // Recharger les événements pour mettre à jour l'affichage
          setTimeout(() => reloadCurrentEvents(true), 50)
          return data.event
        } else {
          throw new Error('Erreur API Google')
        }
      } else {
        // Ajouter localement
        const localEvent = addLocalEvent(eventData)
        // Recharger les événements pour mettre à jour l'affichage
        setTimeout(() => reloadCurrentEvents(true), 50)
        return localEvent
      }
    } catch (error) {
      console.error('❌ Erreur ajout événement:', error)
      // Fallback: sauvegarder localement même si connecté
      if (session?.accessToken) {
        const localEvent = addLocalEvent(eventData)
        // Recharger les événements pour mettre à jour l'affichage
        setTimeout(() => reloadCurrentEvents(true), 50)
        return localEvent
      }
      throw error
    }
  }, [session?.accessToken])

  // Modifier un événement
  const updateEvent = useCallback(async (eventData) => {
    try {
      const isLocalEvent = eventData.id.startsWith('local_')
      
      if (isLocalEvent) {
        // Modifier événement local
        const updatedEvent = updateLocalEvent(eventData.id, eventData)
        showNotification('💾 Modification sauvegardée localement', 'success')
        // Recharger les événements pour mettre à jour l'affichage
        setTimeout(() => reloadCurrentEvents(true), 50)
        return updatedEvent
      } else {
        // Événement Google à modifier
        if (session?.accessToken) {
          try {
            // Essayer de modifier directement sur Google Calendar
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
              showNotification('Événement synchronisé avec Google Calendar', 'success')
              // Recharger les événements pour mettre à jour l'affichage
              setTimeout(() => reloadCurrentEvents(true), 50)
              return data.event
            } else {
              throw new Error('Erreur API Google')
            }
          } catch (error) {
            // Fallback: sauvegarder la modification en attente
            addPendingUpdate(eventData.id, eventData)
            showNotification('Modification sauvegardée - sera synchronisée plus tard', 'warning')
            setTimeout(() => reloadCurrentEvents(true), 50) // Recharger pour appliquer visuellement
            return eventData
          }
        } else {
          // Pas connecté : sauvegarder modification en attente
          addPendingUpdate(eventData.id, eventData)
          showNotification('Mode hors ligne - modification sera synchronisée à la connexion', 'info')
          setTimeout(() => reloadCurrentEvents(true), 50) // Recharger pour appliquer visuellement
          return eventData
        }
      }
    } catch (error) {
      console.error('❌ Erreur modification événement:', error)
      throw error
    }
  }, [session, reloadCurrentEvents, showNotification])

  // Supprimer un événement
  const deleteEvent = useCallback(async (eventId) => {
    try {
      const isLocalEvent = eventId.startsWith('local_')
      
      if (isLocalEvent) {
        // Supprimer événement local
        deleteLocalEvent(eventId)
        // Recharger les événements pour mettre à jour l'affichage
        setTimeout(() => reloadCurrentEvents(true), 50)
        return true
      } else if (session?.accessToken) {
        // Supprimer événement Google
        const response = await fetch(`/api/calendar/events/${eventId}`, {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${session.accessToken}`
          }
        })

        if (response.ok) {
          // Recharger les événements pour mettre à jour l'affichage
          setTimeout(() => reloadCurrentEvents(true), 50)
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
  }, [session?.accessToken])

  // Synchroniser les événements locaux avec Google
  const syncWithGoogle = useCallback(async (showNotifications = true) => {
    if (!session?.accessToken) {
      if (showNotifications) {
        showNotification('Veuillez vous connecter à Google Calendar pour synchroniser', 'warning')
      }
      return
    }

    // Fast refresh immédiat - montrer le loading
    setLoadingEvents(true)
    
    try {
      
      // 1. Forcer le rechargement immédiat des événements Google
      if (showNotifications) {
        showNotification('Synchronisation en cours...', 'info')
      }
      
      // Recharger immédiatement les événements pour avoir la version la plus récente
      await reloadCurrentEvents(true)
      
      // 2. Maintenant traiter les événements locaux non synchronisés
      const unsyncedEvents = getUnsyncedEvents()
      const pendingUpdates = getPendingUpdates()
      
      if (unsyncedEvents.length === 0 && Object.keys(pendingUpdates).length === 0) {
        setLoadingEvents(false)
        // Plus de notification quand il n'y a rien à synchroniser - juste le fast refresh
        return
      }

      
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
          } else {
            console.error(`❌ Erreur sync: ${localEvent.summary}`)
          }
        } catch (error) {
          console.error(`❌ Erreur sync événement ${localEvent.id}:`, error)
        }
      }
      
      // Synchroniser les modifications en attente
      for (const [eventId, updates] of Object.entries(pendingUpdates)) {
        try {
          const response = await fetch('/api/calendar/events', {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${session.accessToken}`
            },
            body: JSON.stringify({
              id: eventId,
              ...updates
            })
          })
          

          if (response.ok) {
            removePendingUpdate(eventId)
          } else {
            console.error(`❌ Erreur sync modification: ${eventId}`)
          }
        } catch (error) {
          console.error(`❌ Erreur sync modification ${eventId}:`, error)
        }
      }
      
      setSyncStatus('success')
      setSyncStatusState('success')
      
      const totalSynced = unsyncedEvents.length + Object.keys(pendingUpdates).length
      if (totalSynced > 0 && showNotifications) {
        showNotification(`${totalSynced} élément(s) synchronisé(s) avec Google Calendar`, 'success')
      }
      
      // Recharger les événements après synchronisation pour s'assurer d'avoir les dernières données
      await reloadCurrentEvents(true)
      
    } catch (error) {
      console.error('❌ Erreur synchronisation:', error)
      setSyncStatus('error')
      setSyncStatusState('error')
      if (showNotifications) {
        showNotification('Erreur lors de la synchronisation', 'error')
      }
    } finally {
      // S'assurer que le loading est désactivé même en cas d'erreur
      setLoadingEvents(false)
    }
  }, [session?.accessToken, showNotification, reloadCurrentEvents])

  // Auto-sync quand l'utilisateur se connecte
  useEffect(() => {
    if (session?.accessToken && !syncStatus) {
      const timer = setTimeout(() => {
        syncWithGoogle(false) // Garder la sync auto mais sans les notifications de résultat
      }, 500) // Attendre 0.5s après la connexion
      
      return () => clearTimeout(timer)
    }
  }, [session?.accessToken, syncStatus]) // Retiré syncWithGoogle et showNotification pour éviter les re-renders

  return {
    events,
    loadingEvents,
    syncStatus,
    notification,
    loadEvents,
    addEvent,
    updateEvent,
    deleteEvent,
    syncWithGoogle
  }
}