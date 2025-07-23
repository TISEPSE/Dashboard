// Service pour gérer le calendrier local (sans connexion Google)

// Couleurs prédéfinies pour les événements
export const EVENT_COLORS = {
  '1': { background: '#1976D2', text: '#ffffff' }, // Bleu vrai
  '2': { background: '#33B679', text: '#ffffff' }, // Sauge
  '3': { background: '#8E24AA', text: '#ffffff' }, // Raisin
  '4': { background: '#E67C73', text: '#ffffff' }, // Fleur
  '5': { background: '#F6BF26', text: '#000000' }, // Banane
  '6': { background: '#F4511E', text: '#ffffff' }, // Tangerine
  '7': { background: '#039BE5', text: '#ffffff' }, // Paon
  '8': { background: '#616161', text: '#ffffff' }, // Graphite
  '9': { background: '#3F51B5', text: '#ffffff' }, // Myrtille
  '10': { background: '#0B8043', text: '#ffffff' }, // Basilic
  '11': { background: '#D50000', text: '#ffffff' }  // Tomate
}

const STORAGE_KEY = 'dashboard_local_events'
const SYNC_STATUS_KEY = 'dashboard_sync_status'
const PENDING_UPDATES_KEY = 'dashboard_pending_updates'

// Générer un ID unique pour les événements locaux
const generateId = () => {
  return 'local_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9)
}

// Obtenir tous les événements locaux
export const getLocalEvents = () => {
  if (typeof window === 'undefined') return []
  
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    return stored ? JSON.parse(stored) : []
  } catch (error) {
    console.error('Erreur lecture événements locaux:', error)
    return []
  }
}

// Sauvegarder les événements locaux
const saveLocalEvents = (events) => {
  if (typeof window === 'undefined') return
  
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(events))
  } catch (error) {
    console.error('Erreur sauvegarde événements locaux:', error)
  }
}

// Ajouter un événement local
export const addLocalEvent = (eventData) => {
  const events = getLocalEvents()
  const newEvent = {
    id: generateId(),
    summary: eventData.summary,
    description: eventData.description || '',
    location: eventData.location || '',
    start: {
      dateTime: eventData.start
    },
    end: {
      dateTime: eventData.end
    },
    colorId: eventData.colorId || '1',
    isLocal: true,
    createdAt: new Date().toISOString()
  }
  
  events.push(newEvent)
  saveLocalEvents(events)
  return newEvent
}

// Modifier un événement local
export const updateLocalEvent = (eventId, eventData) => {
  const events = getLocalEvents()
  const eventIndex = events.findIndex(e => e.id === eventId)
  
  if (eventIndex === -1) {
    throw new Error('Événement non trouvé')
  }
  
  events[eventIndex] = {
    ...events[eventIndex],
    summary: eventData.summary,
    description: eventData.description || '',
    location: eventData.location || '',
    start: {
      dateTime: eventData.start
    },
    end: {
      dateTime: eventData.end
    },
    colorId: eventData.colorId || events[eventIndex].colorId,
    updatedAt: new Date().toISOString()
  }
  
  saveLocalEvents(events)
  return events[eventIndex]
}

// Supprimer un événement local
export const deleteLocalEvent = (eventId) => {
  const events = getLocalEvents()
  const filteredEvents = events.filter(e => e.id !== eventId)
  
  if (filteredEvents.length === events.length) {
    throw new Error('Événement non trouvé')
  }
  
  saveLocalEvents(filteredEvents)
  return true
}

// Obtenir les événements pour une période donnée
export const getLocalEventsForPeriod = (timeMin, timeMax) => {
  const events = getLocalEvents()
  
  return events.filter(event => {
    const eventStart = new Date(event.start.dateTime)
    const eventEnd = new Date(event.end.dateTime)
    
    return (eventStart >= new Date(timeMin) && eventStart <= new Date(timeMax)) ||
           (eventEnd >= new Date(timeMin) && eventEnd <= new Date(timeMax)) ||
           (eventStart <= new Date(timeMin) && eventEnd >= new Date(timeMax))
  })
}

// Marquer les événements comme synchronisés
export const markEventAsSynced = (localId, googleId) => {
  const events = getLocalEvents()
  const eventIndex = events.findIndex(e => e.id === localId)
  
  if (eventIndex !== -1) {
    events[eventIndex].googleId = googleId
    events[eventIndex].synced = true
    saveLocalEvents(events)
  }
}

// Obtenir les événements non synchronisés
export const getUnsyncedEvents = () => {
  const events = getLocalEvents()
  return events.filter(e => !e.synced && e.isLocal)
}

// Effacer tous les événements locaux (après synchronisation complète)
export const clearLocalEvents = () => {
  if (typeof window !== 'undefined') {
    localStorage.removeItem(STORAGE_KEY)
  }
}

// Sauvegarder le statut de synchronisation
export const setSyncStatus = (status) => {
  if (typeof window !== 'undefined') {
    localStorage.setItem(SYNC_STATUS_KEY, JSON.stringify({
      lastSync: new Date().toISOString(),
      status
    }))
  }
}

// Obtenir le statut de synchronisation
export const getSyncStatus = () => {
  if (typeof window === 'undefined') return null
  
  try {
    const stored = localStorage.getItem(SYNC_STATUS_KEY)
    return stored ? JSON.parse(stored) : null
  } catch (error) {
    return null
  }
}

// Système de modifications en attente pour événements Google
// Sauvegarder une modification en attente pour un événement Google
export const addPendingUpdate = (eventId, updates) => {
  if (typeof window === 'undefined') return
  
  try {
    const stored = localStorage.getItem(PENDING_UPDATES_KEY)
    const pendingUpdates = stored ? JSON.parse(stored) : {}
    
    // Fusionner les nouvelles modifications avec les existantes
    if (pendingUpdates[eventId]) {
      pendingUpdates[eventId] = { ...pendingUpdates[eventId], ...updates }
    } else {
      pendingUpdates[eventId] = { 
        ...updates, 
        timestamp: new Date().toISOString() 
      }
    }
    
    localStorage.setItem(PENDING_UPDATES_KEY, JSON.stringify(pendingUpdates))
    console.log('💾 Modification en attente sauvegardée:', { eventId, updates })
  } catch (error) {
    console.error('Erreur sauvegarde modification en attente:', error)
  }
}

// Obtenir toutes les modifications en attente
export const getPendingUpdates = () => {
  if (typeof window === 'undefined') return {}
  
  try {
    const stored = localStorage.getItem(PENDING_UPDATES_KEY)
    return stored ? JSON.parse(stored) : {}
  } catch (error) {
    console.error('Erreur lecture modifications en attente:', error)
    return {}
  }
}

// Marquer une modification comme synchronisée
export const removePendingUpdate = (eventId) => {
  if (typeof window === 'undefined') return
  
  try {
    const stored = localStorage.getItem(PENDING_UPDATES_KEY)
    const pendingUpdates = stored ? JSON.parse(stored) : {}
    
    delete pendingUpdates[eventId]
    localStorage.setItem(PENDING_UPDATES_KEY, JSON.stringify(pendingUpdates))
    console.log('✅ Modification synchronisée:', eventId)
  } catch (error) {
    console.error('Erreur suppression modification en attente:', error)
  }
}

// Effacer toutes les modifications en attente
export const clearPendingUpdates = () => {
  if (typeof window !== 'undefined') {
    localStorage.removeItem(PENDING_UPDATES_KEY)
  }
}