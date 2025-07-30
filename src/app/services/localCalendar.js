// Service pour gérer le calendrier local (sans connexion Google)

// Couleurs prédéfinies pour les événements (structure identique à la couleur verte fonctionnelle)
export const EVENT_COLORS = {
  '1': { background: '#039BE6', text: '#ffffff', name: 'Bleu' }, // Couleur principale - première dans la palette
  '2': { background: '#33B679', text: '#ffffff', name: 'Sauge' }, // Couleur verte fonctionnelle - modèle de référence
  '3': { background: '#8E24AA', text: '#ffffff', name: 'Raisin' },
  '4': { background: '#E67C73', text: '#ffffff', name: 'Fleur' },
  '5': { background: '#F6BF26', text: '#000000', name: 'Banane' },
  '6': { background: '#F4511E', text: '#ffffff', name: 'Tangerine' },
  '7': { background: '#1976D2', text: '#ffffff', name: 'Paon' },
  '8': { background: '#3F51B5', text: '#ffffff', name: 'Myrtille' },
  '9': { background: '#0B8043', text: '#ffffff', name: 'Basilic' }, // Autre couleur verte
  '10': { background: '#D50000', text: '#ffffff', name: 'Tomate' }
}

// Récupérer les couleurs Google Calendar réelles
export const fetchGoogleColors = async (accessToken) => {
  if (!accessToken) return null
  
  try {
    const response = await fetch('/api/calendar/colors', {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      }
    })
    
    if (response.ok) {
      const data = await response.json()
      return data.event || null
    }
  } catch (error) {
    console.error('❌ Erreur récupération couleurs Google:', error)
  }
  
  return null
}

// Convertir les couleurs Google en format utilisable (structure identique à la couleur verte)
export const convertGoogleColors = (googleColors) => {
  if (!googleColors || !googleColors.event) return EVENT_COLORS
  
  const convertedColors = {}
  
  // Utiliser UNIQUEMENT les couleurs Google Calendar réelles
  Object.entries(googleColors.event).forEach(([colorId, colorData]) => {
    convertedColors[colorId] = {
      background: colorData.background,
      text: colorData.foreground || '#ffffff',
      name: `Couleur ${colorId}`,
      googleOriginal: true
    }
    
  })
  
  return convertedColors
}

// Calculer la couleur de texte optimale (blanc ou noir) selon la luminosité du background
const getContrastColor = (backgroundColor) => {
  // Convertir hex en RGB
  const hex = backgroundColor.replace('#', '')
  const r = parseInt(hex.substr(0, 2), 16)
  const g = parseInt(hex.substr(2, 2), 16)
  const b = parseInt(hex.substr(4, 2), 16)
  
  // Calculer la luminosité
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255
  
  // Retourner blanc ou noir selon la luminosité
  return luminance > 0.5 ? '#000000' : '#ffffff'
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