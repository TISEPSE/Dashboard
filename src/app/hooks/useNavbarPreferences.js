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

export function useNavbarPreferences() {
  const [preferences, setPreferences] = useState(DEFAULT_NAVBAR_PREFERENCES)
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
    // Mettre à jour l'état local immédiatement
    setPreferences(DEFAULT_NAVBAR_PREFERENCES)
    
    // Sauvegarder dans localStorage
    savePreferences(DEFAULT_NAVBAR_PREFERENCES)
    
    // Déclencher un événement pour notifier les autres instances du hook
    const event = new CustomEvent('navbarPreferencesChanged', {
      detail: { preferences: DEFAULT_NAVBAR_PREFERENCES }
    })
    window.dispatchEvent(event)
  }

  // Obtenir les éléments de navigation filtrés selon les préférences
  const getFilteredNavItems = (allNavItems) => {
    return allNavItems.filter(item => {
      // Mapper les hrefs aux clés de préférences
      const prefKey = getPreferenceKey(item.href)
      return preferences[prefKey] !== false
    })
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
    isLoaded,
    togglePreference,
    resetToDefault,
    getFilteredNavItems,
    getPreferenceKey
  }
}