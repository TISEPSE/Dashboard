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
  const loadEvents = useCallback(async (timeMin, timeMax) => {
    // Utiliser les dernières valeurs si pas de paramètres fournis
    const finalTimeMin = timeMin || lastTimeRange.timeMin
    const finalTimeMax = timeMax || lastTimeRange.timeMax
    
    // Si pas de paramètres et pas de dernière plage, ne rien faire
    if (!finalTimeMin || !finalTimeMax) {
      console.log('⚠️ Aucune plage de temps disponible pour loadEvents')
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
          console.log('🔄 Chargement des événements Google...')
          const params = new URLSearchParams({
            timeMin: finalTimeMin,
            timeMax: finalTimeMax,
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
            const errorData = await response.json().catch(() => ({}))
            console.warn('⚠️ Erreur chargement événements Google:', {
              status: response.status,
              error: errorData.error,
              needsReauth: errorData.needsReauth
            })
            
            // Si c'est une erreur d'authentification, on continue avec les événements locaux seulement
            if (errorData.needsReauth || response.status === 401) {
              console.log('🔄 Session expirée, utilisation des événements locaux seulement')
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
      console.log(`📱 ${localEvents.length} événements locaux chargés`)
      
      // Appliquer les modifications en attente aux événements Google
      const pendingUpdates = getPendingUpdates()
      const modifiedGoogleEvents = allEvents.map(event => {
        if (pendingUpdates[event.id]) {
          console.log(`🎨 Application modification en attente pour ${event.id}:`, pendingUpdates[event.id])
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
      console.log(`🎯 Total: ${combinedEvents.length} événements`)
      
    } catch (error) {
      console.warn('⚠️ Erreur chargement événements Google (fallback sur événements locaux):', error.message)
      // En cas d'erreur, charger au moins les événements locaux
      try {
        const localEvents = getLocalEventsForPeriod(finalTimeMin, finalTimeMax)
        setEvents(localEvents)
        console.log('✅ Événements locaux chargés en fallback:', localEvents.length)
      } catch (localError) {
        console.error('❌ Erreur critique - impossible de charger les événements locaux:', localError)
        setEvents([])
      }
    } finally {
      setLoadingEvents(false)
    }
  }, [session, lastTimeRange.timeMin, lastTimeRange.timeMax])

  // Fonction pour recharger avec la dernière plage connue
  const reloadCurrentEvents = useCallback((forceRefresh = false) => {
    if (lastTimeRange.timeMin && lastTimeRange.timeMax) {
      console.log('🔄 Rechargement avec plage existante:', lastTimeRange)
      if (forceRefresh) {
        // Vider les événements en cours pour forcer un rechargement complet
        setEvents([])
      }
      loadEvents(lastTimeRange.timeMin, lastTimeRange.timeMax)
    } else {
      console.log('⚠️ Aucune plage de temps disponible pour le rechargement')
    }
  }, [loadEvents, lastTimeRange.timeMin, lastTimeRange.timeMax])

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
          // Recharger les événements pour mettre à jour l'affichage
          setTimeout(() => reloadCurrentEvents(true), 200)
          return data.event
        } else {
          throw new Error('Erreur API Google')
        }
      } else {
        // Ajouter localement
        console.log('📱 Ajout événement local...')
        const localEvent = addLocalEvent(eventData)
        console.log('✅ Événement local créé:', localEvent.summary)
        // Recharger les événements pour mettre à jour l'affichage
        setTimeout(() => reloadCurrentEvents(true), 200)
        return localEvent
      }
    } catch (error) {
      console.error('❌ Erreur ajout événement:', error)
      // Fallback: sauvegarder localement même si connecté
      if (session?.accessToken) {
        console.log('🔄 Fallback: sauvegarde locale...')
        const localEvent = addLocalEvent(eventData)
        // Recharger les événements pour mettre à jour l'affichage
        setTimeout(() => reloadCurrentEvents(true), 200)
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
        showNotification('💾 Modification sauvegardée localement', 'success')
        // Recharger les événements pour mettre à jour l'affichage
        setTimeout(() => reloadCurrentEvents(true), 200)
        return updatedEvent
      } else {
        // Événement Google à modifier
        if (session?.accessToken) {
          try {
            // Essayer de modifier directement sur Google Calendar
            console.log('📅 Modification événement Google...')
            const response = await fetch('/api/calendar/events', {
              method: 'PUT',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${session.accessToken}`
              },
              body: JSON.stringify(eventData)
          })
          
          console.log('🎨 Requête de modification envoyée:', {
            eventId: eventData.id,
            colorId: eventData.colorId,
            summary: eventData.summary
          })

            if (response.ok) {
              const data = await response.json()
              console.log('✅ Événement Google modifié')
              showNotification('Événement synchronisé avec Google Calendar', 'success')
              // Recharger les événements pour mettre à jour l'affichage
              setTimeout(() => reloadCurrentEvents(true), 200)
              return data.event
            } else {
              throw new Error('Erreur API Google')
            }
          } catch (error) {
            console.log('⚠️ Échec modification Google, sauvegarde en attente...', error)
            // Fallback: sauvegarder la modification en attente
            console.log('🎨 Sauvegarde modification en attente (couleur incluse):', {
              eventId: eventData.id,
              colorId: eventData.colorId
            })
            addPendingUpdate(eventData.id, eventData)
            showNotification('Modification sauvegardée - sera synchronisée plus tard', 'warning')
            setTimeout(() => reloadCurrentEvents(true), 200) // Recharger pour appliquer visuellement
            return eventData
          }
        } else {
          // Pas connecté : sauvegarder modification en attente
          console.log('📴 Hors ligne: sauvegarde modification en attente...')
          addPendingUpdate(eventData.id, eventData)
          showNotification('Mode hors ligne - modification sera synchronisée à la connexion', 'info')
          setTimeout(() => reloadCurrentEvents(true), 200) // Recharger pour appliquer visuellement
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
        console.log('🗑️ Suppression événement local...')
        deleteLocalEvent(eventId)
        console.log('✅ Événement local supprimé')
        // Recharger les événements pour mettre à jour l'affichage
        setTimeout(() => reloadCurrentEvents(true), 200)
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
          // Recharger les événements pour mettre à jour l'affichage
          setTimeout(() => reloadCurrentEvents(true), 200)
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
  const syncWithGoogle = useCallback(async (showNotifications = true) => {
    if (!session?.accessToken) {
      console.log('❌ Pas de session Google pour la synchronisation')
      return
    }

    try {
      console.log('🔄 Début de la synchronisation...')
      const unsyncedEvents = getUnsyncedEvents()
      const pendingUpdates = getPendingUpdates()
      
      if (unsyncedEvents.length === 0 && Object.keys(pendingUpdates).length === 0) {
        console.log('✅ Aucun événement à synchroniser')
        if (showNotifications) {
          showNotification('Aucun élément à synchroniser', 'info')
        }
        return
      }

      console.log(`📤 Synchronisation de ${unsyncedEvents.length} nouveaux événements et ${Object.keys(pendingUpdates).length} modifications...`)
      
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
      
      // Synchroniser les modifications en attente
      for (const [eventId, updates] of Object.entries(pendingUpdates)) {
        try {
          console.log(`🎨 Synchronisation modification couleur pour ${eventId}...`)
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
          
          console.log('🎨 Synchronisation modification avec colorId:', {
            eventId,
            colorId: updates.colorId,
            allUpdates: updates
          })

          if (response.ok) {
            removePendingUpdate(eventId)
            console.log(`✅ Modification synchronisée: ${eventId}`)
          } else {
            console.error(`❌ Erreur sync modification: ${eventId}`)
          }
        } catch (error) {
          console.error(`❌ Erreur sync modification ${eventId}:`, error)
        }
      }
      
      setSyncStatus('success')
      setSyncStatusState('success')
      console.log('✅ Synchronisation terminée')
      
      const totalSynced = unsyncedEvents.length + Object.keys(pendingUpdates).length
      if (totalSynced > 0 && showNotifications) {
        showNotification(`${totalSynced} élément(s) synchronisé(s) - Page rechargée pour les couleurs...`, 'success')
      }
      
      // Recharger les événements après synchronisation
      reloadCurrentEvents()
      
      // Recharger la page pour garantir la synchronisation des couleurs
      if (totalSynced > 0) {
        setTimeout(() => {
          console.log('🔄 Rechargement de page pour synchroniser les couleurs...')
          window.location.reload()
        }, 1500)
      }
      
    } catch (error) {
      console.error('❌ Erreur synchronisation:', error)
      setSyncStatus('error')
      setSyncStatusState('error')
    }
  }, [session, showNotification, reloadCurrentEvents])

  // Auto-sync quand l'utilisateur se connecte
  useEffect(() => {
    if (session?.accessToken && !syncStatus) {
      const timer = setTimeout(() => {
        console.log('🔄 Auto-synchronisation lors de la connexion Google...')
        syncWithGoogle(false) // Garder la sync auto mais sans les notifications de résultat
      }, 1000) // Attendre 1s après la connexion
      
      return () => clearTimeout(timer)
    }
  }, [session, syncStatus, syncWithGoogle, showNotification])

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