import { useState, useEffect, useCallback } from 'react'
import { useAuth } from '../context/AuthContext'
import { getDatabaseAdapter } from '../lib/database-adapter'

// Couleurs inspirées de Samsung Calendar (OneUI Design System)
const COLORS = {
  '1': { bg: 'bg-[#1E40AF]', text: 'text-white', border: 'border-[#1E40AF]', background: '#1E40AF' }, // Bleu roi
  '2': { bg: 'bg-[#4CAF50]', text: 'text-white', border: 'border-[#4CAF50]', background: '#4CAF50' }, // Vert nature
  '3': { bg: 'bg-[#FF6B35]', text: 'text-white', border: 'border-[#FF6B35]', background: '#FF6B35' }, // Orange vif
  '4': { bg: 'bg-[#E91E63]', text: 'text-white', border: 'border-[#E91E63]', background: '#E91E63' }, // Rose vif
  '5': { bg: 'bg-[#9C27B0]', text: 'text-white', border: 'border-[#9C27B0]', background: '#9C27B0' }, // Violet
  '6': { bg: 'bg-[#F44336]', text: 'text-white', border: 'border-[#F44336]', background: '#F44336' }, // Rouge
  '7': { bg: 'bg-[#FF9800]', text: 'text-white', border: 'border-[#FF9800]', background: '#FF9800' }, // Orange
  '8': { bg: 'bg-[#795548]', text: 'text-white', border: 'border-[#795548]', background: '#795548' }, // Marron
  '9': { bg: 'bg-[#607D8B]', text: 'text-white', border: 'border-[#607D8B]', background: '#607D8B' }, // Bleu-gris
  '10': { bg: 'bg-[#009688]', text: 'text-white', border: 'border-[#009688]', background: '#009688' }, // Teal
  '11': { bg: 'bg-[#8BC34A]', text: 'text-white', border: 'border-[#8BC34A]', background: '#8BC34A' }, // Vert clair
  '12': { bg: 'bg-[#CDDC39]', text: 'text-white', border: 'border-[#CDDC39]', background: '#CDDC39' }, // Lime
  '13': { bg: 'bg-[#FFEB3B]', text: 'text-white', border: 'border-[#FFEB3B]', background: '#FFEB3B' }, // Jaune
  '14': { bg: 'bg-[#FFC107]', text: 'text-white', border: 'border-[#FFC107]', background: '#FFC107' }, // Ambre
  '15': { bg: 'bg-[#FF5722]', text: 'text-white', border: 'border-[#FF5722]', background: '#FF5722' }, // Deep Orange
  '16': { bg: 'bg-[#3F51B5]', text: 'text-white', border: 'border-[#3F51B5]', background: '#3F51B5' }, // Indigo
  '17': { bg: 'bg-[#2196F3]', text: 'text-white', border: 'border-[#2196F3]', background: '#2196F3' }, // Bleu
  '18': { bg: 'bg-[#03A9F4]', text: 'text-white', border: 'border-[#03A9F4]', background: '#03A9F4' }, // Bleu clair
  '19': { bg: 'bg-[#00BCD4]', text: 'text-white', border: 'border-[#00BCD4]', background: '#00BCD4' }, // Cyan
  '20': { bg: 'bg-[#4DD0E1]', text: 'text-white', border: 'border-[#4DD0E1]', background: '#4DD0E1' }, // Cyan clair
  '21': { bg: 'bg-[#81C784]', text: 'text-white', border: 'border-[#81C784]', background: '#81C784' }, // Vert pastel
  '22': { bg: 'bg-[#AED581]', text: 'text-white', border: 'border-[#AED581]', background: '#AED581' }, // Vert lime clair
  '23': { bg: 'bg-[#FFB74D]', text: 'text-white', border: 'border-[#FFB74D]', background: '#FFB74D' }, // Orange clair
  '24': { bg: 'bg-[#F06292]', text: 'text-white', border: 'border-[#F06292]', background: '#F06292' }  // Rose clair
}

export const useCalendar = () => {
  const [events, setEvents] = useState([])
  const [loadingEvents, setLoadingEvents] = useState(false)
  const [syncStatus, setSyncStatus] = useState('idle') // 'idle', 'syncing', 'success', 'error'
  const [notification, setNotification] = useState(null)
  const { user, authenticated, accessToken } = useAuth()
  const db = getDatabaseAdapter()

  // Mettre à jour le token d'accès dans l'adaptateur quand il change
  useEffect(() => {
    if (db.isElectronApp() && accessToken) {
      db.setAccessToken(accessToken)
    }
  }, [accessToken, db])

  // Fonction pour afficher une notification
  const showNotification = useCallback((message, type = 'success') => {
    setNotification({ message, type, id: Date.now() })
    setTimeout(() => setNotification(null), 5000)
  }, [])

  // Fonction pour fermer manuellement la notification
  const closeNotification = useCallback(() => {
    setNotification(null)
  }, [])

  // Charger les événements depuis la base de données (SQLite local ou API)
  const loadEvents = useCallback(async (timeMin, timeMax) => {
    console.log('🔄 [CLIENT] Chargement des événements...', { timeMin, timeMax, authenticated, isElectron: db.isElectronApp() })
    setLoadingEvents(true)
    
    try {
      const events = await db.getCalendarEvents(timeMin, timeMax)
      console.log('📅 [CLIENT] Événements reçus:', events?.length || 0)
      
      // Validation et nettoyage des événements
      const validEvents = (events || []).filter(event => {
        return event && event.id && event.summary && (event.start || event.end)
      })
      
      if (validEvents.length !== (events?.length || 0)) {
        console.warn('⚠️ [CLIENT] Certains événements ignorés (données invalides)')
      }
      
      // Trier les événements par date
      const sortedEvents = validEvents.sort((a, b) => {
        const dateA = new Date(a.start?.dateTime || a.start?.date)
        const dateB = new Date(b.start?.dateTime || b.start?.date)
        return dateA - dateB
      })
      
      setEvents(sortedEvents)
      console.log('✅ [CLIENT] Événements triés et mis à jour:', sortedEvents.length)
      
      // Statistiques en mode Electron
      if (db.isElectronApp() && sortedEvents.length > 0) {
        const googleEvents = sortedEvents.filter(e => e.source === 'google' || e.google_id).length
        const localEvents = sortedEvents.length - googleEvents
        console.log(`📊 [CLIENT] Google: ${googleEvents}, Local: ${localEvents}`)
      }
      
      // Notification silencieuse - pas de message si pas d'événements en mode Electron
      if (sortedEvents.length === 0 && !db.isElectronApp()) {
        showNotification('Aucun événement trouvé. Connectez-vous à Google pour synchroniser vos événements.', 'info')
      }
      
    } catch (error) {
      console.error('❌ [CLIENT] Erreur lors du chargement des événements:', error)
      
      // Gestion d'erreur plus robuste
      if (db.isElectronApp()) {
        // En mode Electron, les erreurs sont moins critiques car on a SQLite comme fallback
        console.log('📴 [CLIENT] Mode Electron - continuera avec les événements locaux')
        // Ne pas afficher d'erreur intrusive, juste un warning en console
      } else {
        // En mode web, afficher les erreurs appropriées
        if (error.message?.includes('Session expirée') || error.message?.includes('needsReauth')) {
          showNotification('Session Google expirée. Reconnectez-vous pour voir vos événements.', 'warning')
        } else if (error.message?.includes('fetch')) {
          showNotification('Problème de connexion. Vérifiez votre réseau.', 'warning')
        } else {
          showNotification('Erreur lors du chargement des événements', 'error')
        }
      }
      
      // En cas d'erreur, conserver les événements existants ou vider si nécessaire
      if (!db.isElectronApp()) {
        setEvents([])
      }
    } finally {
      setLoadingEvents(false)
    }
  }, [db, showNotification, user, authenticated])

  // Écouter les événements de rechargement depuis le debug
  useEffect(() => {
    const handleCalendarRefresh = () => {
      console.log('🔄 [CLIENT] Rechargement déclenché par debug')
      // Recharger avec une plage très large pour inclure tous les événements
      const now = new Date()
      const oneYearAgo = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000)
      const oneYearLater = new Date(now.getTime() + 365 * 24 * 60 * 60 * 1000)
      loadEvents(oneYearAgo.toISOString(), oneYearLater.toISOString())
    }

    if (typeof window !== 'undefined') {
      window.addEventListener('calendar-refresh', handleCalendarRefresh)
      return () => window.removeEventListener('calendar-refresh', handleCalendarRefresh)
    }
  }, [loadEvents])

  // Ajouter un événement
  const addEvent = useCallback(async (eventData) => {
    try {
      const newEvent = await db.addCalendarEvent({
        ...eventData,
        userId: user?.id || 'anonymous'
      })
      
      console.log('✅ [CLIENT] Événement ajouté:', newEvent)
      
      // Forcer le rechargement des événements depuis la base pour s'assurer que tout est synchronisé
      if (db.isElectronApp()) {
        try {
          // En mode Electron, recharger depuis SQLite pour obtenir la version complète avec l'ID correct
          const now = new Date()
          const oneYearAgo = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000)
          const oneYearLater = new Date(now.getTime() + 365 * 24 * 60 * 60 * 1000)
          
          console.log('🔄 [CLIENT] Rechargement événements après ajout - plage étendue:', {
            from: oneYearAgo.toISOString(),
            to: oneYearLater.toISOString()
          })
          
          // Vider le cache pour forcer le rechargement
          db.clearCache('calendar_events')
          
          // Recharger les événements avec une plage plus large
          const refreshedEvents = await db.getCalendarEvents(oneYearAgo.toISOString(), oneYearLater.toISOString())
          
          const validEvents = (refreshedEvents || []).filter(event => {
            return event && event.id && event.summary && (event.start || event.end)
          })
          
          const sortedEvents = validEvents.sort((a, b) => {
            const dateA = new Date(a.start?.dateTime || a.start?.date)
            const dateB = new Date(b.start?.dateTime || b.start?.date)
            return dateA - dateB
          })
          
          setEvents(sortedEvents)
          console.log('🔄 [CLIENT] Événements rechargés après ajout:', sortedEvents.length)
        } catch (refreshError) {
          console.warn('⚠️ [CLIENT] Erreur rechargement, mise à jour état local uniquement:', refreshError)
          // Fallback: mise à jour de l'état local uniquement
          setEvents(prev => [...prev, newEvent].sort((a, b) => 
            new Date(a.start?.dateTime || a.start?.date) - new Date(b.start?.dateTime || b.start?.date)
          ))
        }
      } else {
        // Mode web: mise à jour de l'état local
        setEvents(prev => [...prev, newEvent].sort((a, b) => 
          new Date(a.start?.dateTime || a.start?.date) - new Date(b.start?.dateTime || b.start?.date)
        ))
      }
      
      const contextMessage = db.isElectronApp() ? 'localement' : 'avec succès'
      showNotification(`Événement ajouté ${contextMessage}`, 'success')
      return newEvent
    } catch (error) {
      console.error('❌ [CLIENT] Erreur lors de l\'ajout de l\'événement:', error)
      showNotification('Erreur lors de l\'ajout de l\'événement', 'error')
      throw error
    }
  }, [db, user, showNotification])

  // Mettre à jour un événement
  const updateEvent = useCallback(async (eventId, eventData) => {
    try {
      const success = await db.updateCalendarEvent(eventId, {
        ...eventData,
        userId: user?.id || 'anonymous'
      })
      
      if (success) {
        // Mettre à jour l'état local
        const updatedEvent = { ...eventData, id: eventId, updated: new Date().toISOString() }
        setEvents(prev => prev.map(event => 
          event.id === eventId ? updatedEvent : event
        ).sort((a, b) => 
          new Date(a.start?.dateTime || a.start?.date) - new Date(b.start?.dateTime || b.start?.date)
        ))
        
        const contextMessage = db.isElectronApp() ? 'localement' : 'avec succès'
        showNotification(`Événement modifié ${contextMessage}`, 'success')
        return updatedEvent
      } else {
        throw new Error('Échec de la mise à jour')
      }
    } catch (error) {
      console.error('Erreur lors de la modification de l\'événement:', error)
      showNotification('Erreur lors de la modification de l\'événement', 'error')
      throw error
    }
  }, [db, user, showNotification])

  // Supprimer un événement
  const deleteEvent = useCallback(async (eventId) => {
    try {
      const success = await db.deleteCalendarEvent(eventId)
      
      if (success) {
        // Mettre à jour l'état local
        setEvents(prev => prev.filter(event => event.id !== eventId))
        showNotification('Événement supprimé avec succès', 'success')
      } else {
        throw new Error('Échec de la suppression')
      }
    } catch (error) {
      console.error('Erreur lors de la suppression de l\'événement:', error)
      showNotification('Erreur lors de la suppression de l\'événement', 'error')
      throw error
    }
  }, [db, showNotification])

  // Synchroniser avec Google Calendar (mode web uniquement)
  const syncWithGoogle = useCallback(async () => {
    if (db.isElectronApp()) {
      showNotification('Synchronisation Google non disponible en mode local', 'info')
      return
    }

    if (!authenticated) {
      showNotification('Connexion Google requise pour la synchronisation', 'warning')
      return
    }

    setSyncStatus('syncing')
    try {
      // Utiliser la synchronisation du database adapter
      await db.syncWithGoogle()
      
      // Recharger les événements après synchronisation
      // Note: ici on ne peut pas passer timeMin/timeMax car on ne les a pas stockés
      // Dans une version future, on pourrait les stocker dans le state
      
      setSyncStatus('success')
      // Notification supprimée - synchronisation silencieuse
    } catch (error) {
      console.error('Erreur synchronisation:', error)
      setSyncStatus('error')
      showNotification('Erreur lors de la synchronisation', 'error')
    }
  }, [db, user, showNotification])

  // Obtenir la couleur d'un événement
  const getEventColor = useCallback((colorId) => {
    return COLORS[colorId] || COLORS['1']
  }, [])

  return {
    events,
    loadingEvents,
    syncStatus,
    notification,
    closeNotification,
    loadEvents,
    addEvent,
    updateEvent,
    deleteEvent,
    syncWithGoogle,
    getEventColor,
    // Nouvelles propriétés pour identifier le contexte
    isElectronMode: db.isElectronApp(),
    databaseType: db.isElectronApp() ? 'sqlite-local' : 'api-rest'
  }
}