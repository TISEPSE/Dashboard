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

  // Ajouter un événement avec feedback visuel instantané
  const addEvent = useCallback(async (eventData) => {
    // Créer un événement temporaire avec feedback visuel
    const tempId = `temp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    const tempEvent = {
      ...eventData,
      id: tempId,
      _isTemporary: true,
      _isUpdating: true,
      _syncStatus: 'creating',
      _lastModified: Date.now()
    }

    try {
      // 🎯 AJOUT INSTANTANÉ - L'événement apparaît immédiatement avec sa couleur
      setEvents(prevEvents => [...prevEvents, tempEvent])
      showNotification('✨ Événement créé', 'success')

      let finalEvent
      if (session?.accessToken) {
        // 🚀 Synchronisation Google en arrière-plan
        setTimeout(async () => {
          try {
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
              // Remplacer par l'événement Google avec statut de synchronisation
              setEvents(prevEvents => 
                prevEvents.map(event => 
                  event.id === tempId ? { 
                    ...data.event, 
                    _syncStatus: 'synced',
                    _isUpdating: false 
                  } : event
                )
              )
            } else {
              throw new Error('Erreur API Google')
            }
          } catch (error) {
            console.error('❌ Erreur API Google, fallback local:', error)
            // Fallback: sauvegarder localement
            const localEvent = addLocalEvent(eventData)
            setEvents(prevEvents => 
              prevEvents.map(event => 
                event.id === tempId ? { 
                  ...localEvent, 
                  _syncStatus: 'local',
                  _isUpdating: false 
                } : event
              )
            )
          }
        }, 100)
        
        // Mettre à jour le statut de synchronisation
        setEvents(prevEvents => 
          prevEvents.map(event => 
            event.id === tempId ? { 
              ...event, 
              _syncStatus: 'syncing' 
            } : event
          )
        )
        
      } else {
        // Ajouter localement avec feedback immédiat
        finalEvent = addLocalEvent(eventData)
        setEvents(prevEvents => 
          prevEvents.map(event => 
            event.id === tempId ? { 
              ...finalEvent, 
              _syncStatus: 'local',
              _isUpdating: false 
            } : event
          )
        )
      }

      // Retourner l'événement temporaire pour une réponse immédiate
      return { ...tempEvent, _syncStatus: session?.accessToken ? 'syncing' : 'local' }
    } catch (error) {
      console.error('❌ Erreur ajout événement:', error)
      // Supprimer l'événement temporaire en cas d'erreur
      setEvents(prevEvents => 
        prevEvents.filter(event => event.id !== tempId)
      )
      showNotification('⚠️ Erreur lors de l\'ajout', 'error')
      throw error
    }
  }, [session?.accessToken, showNotification])

  // Modifier un événement avec feedback visuel instantané
  const updateEvent = useCallback(async (eventData) => {
    // Marquer l'événement comme en cours de modification pour le feedback visuel
    const eventWithStatus = { 
      ...eventData, 
      _isUpdating: true,
      _lastModified: Date.now() 
    }
    
    try {
      // 🎯 MISE À JOUR INSTANTANÉE - L'utilisateur voit le changement immédiatement
      setEvents(prevEvents => 
        prevEvents.map(event => 
          event.id === eventData.id ? eventWithStatus : event
        )
      )
      
      // Feedback visuel immédiat avec notification discrète
      showNotification('✨ Modification appliquée', 'success')
      
      const isLocalEvent = eventData.id.startsWith('local_')
      
      if (isLocalEvent) {
        // Modifier événement local instantanément
        const updatedEvent = updateLocalEvent(eventData.id, eventData)
        
        // Mettre à jour avec l'événement final (sans status de modification)
        setEvents(prevEvents => 
          prevEvents.map(event => 
            event.id === eventData.id ? { ...updatedEvent, _syncStatus: 'local' } : event
          )
        )
        
        return updatedEvent
      } else {
        // 🚀 Événement Google - Synchronisation en arrière-plan
        if (session?.accessToken) {
          // Lancer la synchronisation en arrière-plan sans bloquer l'UI
          setTimeout(async () => {
            try {
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
                // Mise à jour discrète du statut de synchronisation
                setEvents(prevEvents => 
                  prevEvents.map(event => 
                    event.id === eventData.id ? { 
                      ...data.event, 
                      _syncStatus: 'synced',
                      _isUpdating: false 
                    } : event
                  )
                )
              } else {
                throw new Error('Erreur API Google')
              }
            } catch (error) {
              // Fallback silencieux : marquer comme à synchroniser
              addPendingUpdate(eventData.id, eventData)
              setEvents(prevEvents => 
                prevEvents.map(event => 
                  event.id === eventData.id ? { 
                    ...event, 
                    _syncStatus: 'pending',
                    _isUpdating: false 
                  } : event
                )
              )
            }
          }, 100) // Petite délai pour une UX fluide
          
          // Retourner immédiatement l'événement modifié
          const immediateUpdate = { ...eventData, _syncStatus: 'syncing' }
          setEvents(prevEvents => 
            prevEvents.map(event => 
              event.id === eventData.id ? immediateUpdate : event
            )
          )
          return immediateUpdate
          
        } else {
          // Pas connecté : marquer comme à synchroniser
          addPendingUpdate(eventData.id, eventData)
          const offlineUpdate = { ...eventData, _syncStatus: 'offline', _isUpdating: false }
          setEvents(prevEvents => 
            prevEvents.map(event => 
              event.id === eventData.id ? offlineUpdate : event
            )
          )
          return offlineUpdate
        }
      }
    } catch (error) {
      console.error('❌ Erreur modification événement:', error)
      // En cas d'erreur critique, restaurer l'état original
      setEvents(prevEvents => 
        prevEvents.map(event => 
          event.id === eventData.id ? { 
            ...event, 
            _isUpdating: false, 
            _syncStatus: 'error' 
          } : event
        )
      )
      showNotification('⚠️ Erreur lors de la modification', 'error')
      throw error
    }
  }, [session?.accessToken, showNotification])

  // Supprimer un événement (optimiste)
  const deleteEvent = useCallback(async (eventId) => {
    try {
      const isLocalEvent = eventId.startsWith('local_')
      
      // Suppression optimiste : mettre à jour l'interface immédiatement
      setEvents(prevEvents => prevEvents.filter(event => event.id !== eventId))
      showNotification('Événement supprimé', 'success')
      
      if (isLocalEvent) {
        // Supprimer événement local
        deleteLocalEvent(eventId)
        return true
      } else if (session?.accessToken) {
        // Supprimer événement Google en arrière-plan
        try {
          const response = await fetch(`/api/calendar/events/${eventId}`, {
            method: 'DELETE',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${session.accessToken}`
            }
          })

          if (!response.ok) {
            // En cas d'erreur, recharger pour restaurer l'état correct
            const error = await response.json()
            showNotification('Erreur lors de la suppression, événement restauré', 'error')
            setTimeout(() => reloadCurrentEvents(true), 100)
            throw new Error(error.error || 'Erreur lors de la suppression')
          }
          return true
        } catch (error) {
          // En cas d'erreur réseau, recharger pour restaurer l'état
          showNotification('Erreur réseau, événement restauré', 'error')
          setTimeout(() => reloadCurrentEvents(true), 100)
          throw error
        }
      } else {
        // Pas de session, restaurer l'événement
        setTimeout(() => reloadCurrentEvents(true), 100)
        throw new Error('Non connecté et événement non local')
      }
    } catch (error) {
      throw error
    }
  }, [session?.accessToken, showNotification, reloadCurrentEvents])

  // Synchroniser avec Google Calendar de manière optimisée
  const syncWithGoogle = useCallback(async (showNotifications = true) => {
    if (!session?.accessToken) {
      if (showNotifications) {
        showNotification('Veuillez vous connecter à Google Calendar pour synchroniser', 'warning')
      }
      return
    }

    // 🚀 Synchronisation rapide et non-bloquante
    setLoadingEvents(true)
    
    try {
      // 1. Refresh instantané des événements Google
      if (showNotifications) {
        showNotification('🔄 Synchronisation...', 'info')
      }
      
      // Recharger immédiatement pour avoir les dernières données
      await reloadCurrentEvents(true)
      
      // 2. Traiter les événements avec statuts de synchronisation
      const unsyncedEvents = getUnsyncedEvents()
      const pendingUpdates = getPendingUpdates()
      
      // Mettre à jour visuellement les événements en cours de sync
      setEvents(prevEvents => 
        prevEvents.map(event => {
          if (unsyncedEvents.some(unsynced => unsynced.id === event.id) || 
              pendingUpdates[event.id]) {
            return { ...event, _syncStatus: 'syncing' }
          }
          return event
        })
      )
      
      if (unsyncedEvents.length === 0 && Object.keys(pendingUpdates).length === 0) {
        setLoadingEvents(false)
        // Mettre à jour les statuts de synchronisation pour les événements déjà synchronisés
        setEvents(prevEvents => 
          prevEvents.map(event => ({
            ...event,
            _syncStatus: event._syncStatus === 'syncing' ? 'synced' : event._syncStatus
          }))
        )
        return
      }

      // 3. Synchroniser en arrière-plan de manière parallèle
      const syncPromises = []
      
      // Synchroniser les nouveaux événements locaux
      for (const localEvent of unsyncedEvents) {
        const syncPromise = fetch('/api/calendar/events', {
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
        }).then(async (response) => {
          if (response.ok) {
            const data = await response.json()
            markEventAsSynced(localEvent.id, data.event.id)
            // Mettre à jour le statut visuel
            setEvents(prevEvents => 
              prevEvents.map(event => 
                event.id === localEvent.id ? { 
                  ...data.event, 
                  _syncStatus: 'synced' 
                } : event
              )
            )
            return { success: true, type: 'create', id: localEvent.id }
          } else {
            // Marquer comme erreur de synchronisation
            setEvents(prevEvents => 
              prevEvents.map(event => 
                event.id === localEvent.id ? { 
                  ...event, 
                  _syncStatus: 'error' 
                } : event
              )
            )
            return { success: false, type: 'create', id: localEvent.id }
          }
        }).catch(() => {
          setEvents(prevEvents => 
            prevEvents.map(event => 
              event.id === localEvent.id ? { 
                ...event, 
                _syncStatus: 'error' 
              } : event
            )
          )
          return { success: false, type: 'create', id: localEvent.id }
        })
        
        syncPromises.push(syncPromise)
      }
      
      // Synchroniser les modifications en attente
      for (const [eventId, updates] of Object.entries(pendingUpdates)) {
        const syncPromise = fetch('/api/calendar/events', {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${session.accessToken}`
          },
          body: JSON.stringify({
            id: eventId,
            ...updates
          })
        }).then(async (response) => {
          if (response.ok) {
            removePendingUpdate(eventId)
            // Mettre à jour le statut visuel
            setEvents(prevEvents => 
              prevEvents.map(event => 
                event.id === eventId ? { 
                  ...event, 
                  _syncStatus: 'synced' 
                } : event
              )
            )
            return { success: true, type: 'update', id: eventId }
          } else {
            setEvents(prevEvents => 
              prevEvents.map(event => 
                event.id === eventId ? { 
                  ...event, 
                  _syncStatus: 'error' 
                } : event
              )
            )
            return { success: false, type: 'update', id: eventId }
          }
        }).catch(() => {
          setEvents(prevEvents => 
            prevEvents.map(event => 
              event.id === eventId ? { 
                ...event, 
                _syncStatus: 'error' 
              } : event
            )
          )
          return { success: false, type: 'update', id: eventId }
        })
        
        syncPromises.push(syncPromise)
      }
      
      // Attendre que toutes les synchronisations se terminent
      const results = await Promise.all(syncPromises)
      const successCount = results.filter(r => r.success).length
      const errorCount = results.filter(r => !r.success).length
      
      setSyncStatus(errorCount === 0 ? 'success' : 'partial')
      setSyncStatusState(errorCount === 0 ? 'success' : 'partial')
      
      if (showNotifications && successCount > 0) {
        if (errorCount === 0) {
          showNotification(`✅ ${successCount} élément(s) synchronisé(s)`, 'success')
        } else {
          showNotification(`⚠️ ${successCount} synchronisé(s), ${errorCount} erreur(s)`, 'warning')
        }
      }
      
      // Refresh final pour s'assurer de la cohérence
      setTimeout(() => reloadCurrentEvents(true), 500)
      
    } catch (error) {
      console.error('❌ Erreur synchronisation:', error)
      setSyncStatus('error')
      setSyncStatusState('error')
      
      // Marquer tous les événements en cours de sync comme en erreur
      setEvents(prevEvents => 
        prevEvents.map(event => 
          event._syncStatus === 'syncing' ? { 
            ...event, 
            _syncStatus: 'error' 
          } : event
        )
      )
      
      if (showNotifications) {
        showNotification('❌ Erreur lors de la synchronisation', 'error')
      }
    } finally {
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
    syncWithGoogle,
    // Fonction utilitaire pour vérifier les statuts de synchronisation
    getSyncStatusInfo: () => {
      const total = events.length
      const synced = events.filter(e => e._syncStatus === 'synced' || !e._syncStatus).length
      const syncing = events.filter(e => e._syncStatus === 'syncing' || e._syncStatus === 'creating').length
      const pending = events.filter(e => e._syncStatus === 'pending' || e._syncStatus === 'offline').length
      const errors = events.filter(e => e._syncStatus === 'error').length
      const local = events.filter(e => e._syncStatus === 'local').length
      
      return { total, synced, syncing, pending, errors, local }
    }
  }
}