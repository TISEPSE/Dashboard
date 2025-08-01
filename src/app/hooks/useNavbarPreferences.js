"use client"

import { useState, useEffect } from "react"

const DEFAULT_NAVBAR_PREFERENCES = {
  home: true,
  crypto: true,
  message: true,
  meteo: true,
  sante: true,
  finances: true,
  calendrier: true,
  profile: true,
  parametres: true
}

const DEFAULT_NAVBAR_ORDER = [
  'home',
  'crypto', 
  'message',
  'meteo',
  'sante',
  'finances',
  'calendrier'
]

export function useNavbarPreferences() {
  const [preferences, setPreferences] = useState(DEFAULT_NAVBAR_PREFERENCES)
  const [navbarOrder, setNavbarOrder] = useState(DEFAULT_NAVBAR_ORDER)
  const [isLoaded, setIsLoaded] = useState(false)
  const [updateTrigger, setUpdateTrigger] = useState(0)

  // Charger les préférences depuis le localStorage au montage et à chaque mise à jour
  useEffect(() => {
    try {
      const savedPreferences = localStorage.getItem('navbarPreferences')
      if (savedPreferences) {
        const parsed = JSON.parse(savedPreferences)
        setPreferences({ ...DEFAULT_NAVBAR_PREFERENCES, ...parsed })
      }
      
      const savedOrder = localStorage.getItem('navbarOrder')
      if (savedOrder) {
        const parsedOrder = JSON.parse(savedOrder)
        setNavbarOrder(parsedOrder)
      }
    } catch (error) {
      console.error('Erreur lors du chargement des préférences navbar:', error)
    } finally {
      setIsLoaded(true)
    }
  }, [updateTrigger])

  // Écouter les changements depuis d'autres instances du hook
  useEffect(() => {
    const handlePreferencesChange = () => {
      setUpdateTrigger(prev => prev + 1)
    }

    window.addEventListener('navbarPreferencesChanged', handlePreferencesChange)
    
    return () => {
      window.removeEventListener('navbarPreferencesChanged', handlePreferencesChange)
    }
  }, [])

  // Sauvegarder les préférences dans le localStorage
  const savePreferences = (newPreferences) => {
    try {
      setPreferences(newPreferences)
      localStorage.setItem('navbarPreferences', JSON.stringify(newPreferences))
    } catch (error) {
      console.error('Erreur lors de la sauvegarde des préférences navbar:', error)
    }
  }

  // Toggle une préférence spécifique
  const togglePreference = (key) => {
    const newPreferences = {
      ...preferences,
      [key]: !preferences[key]
    }
    
    // Mettre à jour l'état local immédiatement
    setPreferences(newPreferences)
    
    // Sauvegarder dans localStorage
    savePreferences(newPreferences)
    
    // Déclencher un événement pour notifier les autres instances du hook
    const event = new CustomEvent('navbarPreferencesChanged', {
      detail: { preferences: newPreferences }
    })
    window.dispatchEvent(event)
  }

  // Réinitialiser aux valeurs par défaut
  const resetToDefault = () => {
    // Mettre à jour l'état local immédiatement - préférences ET ordre
    setPreferences(DEFAULT_NAVBAR_PREFERENCES)
    setNavbarOrder(DEFAULT_NAVBAR_ORDER)
    
    // Sauvegarder dans localStorage
    try {
      localStorage.setItem('navbarPreferences', JSON.stringify(DEFAULT_NAVBAR_PREFERENCES))
      localStorage.setItem('navbarOrder', JSON.stringify(DEFAULT_NAVBAR_ORDER))
    } catch (error) {
      console.error('Erreur lors de la réinitialisation:', error)
    }
    
    // Déclencher un événement pour notifier les autres instances du hook
    const event = new CustomEvent('navbarPreferencesChanged', {
      detail: { 
        preferences: DEFAULT_NAVBAR_PREFERENCES,
        order: DEFAULT_NAVBAR_ORDER
      }
    })
    window.dispatchEvent(event)
  }

  // Sauvegarder l'ordre de la navbar
  const saveNavbarOrder = (newOrder) => {
    try {
      setNavbarOrder(newOrder)
      localStorage.setItem('navbarOrder', JSON.stringify(newOrder))
      
      // Déclencher un événement pour notifier les autres instances du hook
      const event = new CustomEvent('navbarPreferencesChanged', {
        detail: { order: newOrder }
      })
      window.dispatchEvent(event)
    } catch (error) {
      console.error('Erreur lors de la sauvegarde de l\'ordre navbar:', error)
    }
  }

  // Obtenir les éléments de navigation filtrés et ordonnés selon les préférences
  const getFilteredNavItems = (allNavItems) => {
    // Créer un mapping href -> item pour un accès rapide
    const itemMap = {}
    allNavItems.forEach(item => {
      const prefKey = getPreferenceKey(item.href)
      itemMap[prefKey] = item
    })

    // Ordonner selon navbarOrder puis filtrer selon preferences
    const orderedItems = []
    navbarOrder.forEach(key => {
      if (itemMap[key] && preferences[key] !== false) {
        orderedItems.push(itemMap[key])
      }
    })

    // Ajouter les éléments qui ne sont pas dans l'ordre défini mais sont activés
    allNavItems.forEach(item => {
      const prefKey = getPreferenceKey(item.href)
      if (!navbarOrder.includes(prefKey) && preferences[prefKey] !== false) {
        orderedItems.push(item)
      }
    })

    return orderedItems
  }

  // Mapper un href vers une clé de préférence
  const getPreferenceKey = (href) => {
    const mapping = {
      '/': 'home',
      '/Dashboard/Crypto': 'crypto',
      '/Dashboard/Message': 'message',
      '/Dashboard/Meteo': 'meteo',
      '/Dashboard/Sante': 'sante',
      '/Dashboard/Finances': 'finances',
      '/Dashboard/Calendrier': 'calendrier',
      '/Dashboard/Profile': 'profile',
      '/Dashboard/Parametres': 'parametres'
    }
    return mapping[href] || 'unknown'
  }

  return {
    preferences,
    navbarOrder,
    isLoaded,
    togglePreference,
    resetToDefault,
    saveNavbarOrder,
    getFilteredNavItems,
    getPreferenceKey
  }
}