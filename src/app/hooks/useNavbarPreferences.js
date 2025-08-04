"use client"

import { useState, useEffect } from "react"
import { getDatabaseAdapter } from '../lib/database-adapter'

export function useNavbarPreferences() {
  const db = getDatabaseAdapter()
  const [preferences, setPreferences] = useState({})
  const [navbarOrder, setNavbarOrder] = useState([])
  const [isLoaded, setIsLoaded] = useState(false)
  const [updateTrigger, setUpdateTrigger] = useState(0)

  // Charger les préférences depuis l'adaptateur de base de données
  useEffect(() => {
    const loadPreferences = async () => {
      try {
        console.log('🔍 [NAVBAR-PREFS] Chargement des préférences...')
        
        const [loadedPreferences, loadedOrder] = await Promise.all([
          db.getNavbarPreferences(),
          db.getNavbarOrder()
        ])
        
        console.log('✅ [NAVBAR-PREFS] Préférences chargées:', loadedPreferences)
        console.log('✅ [NAVBAR-PREFS] Ordre chargé:', loadedOrder)
        
        setPreferences(loadedPreferences)
        setNavbarOrder(loadedOrder)
      } catch (error) {
        console.error('❌ [NAVBAR-PREFS] Erreur lors du chargement:', error)
        // Utiliser les valeurs par défaut en cas d'erreur
        setPreferences(db.getDefaultNavbarPreferences())
        setNavbarOrder(db.getDefaultNavbarOrder())
      } finally {
        setIsLoaded(true)
      }
    }

    loadPreferences()
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

  // Toggle une préférence spécifique
  const togglePreference = async (key) => {
    const newPreferences = {
      ...preferences,
      [key]: !preferences[key]
    }
    
    try {
      console.log('🔄 [NAVBAR-PREFS] Toggle préférence:', key, '→', newPreferences[key])
      
      // Mettre à jour l'état local immédiatement
      setPreferences(newPreferences)
      
      // Sauvegarder via l'adaptateur
      await db.saveNavbarPreferences(newPreferences)
      
      // Déclencher un événement pour notifier les autres instances du hook
      const event = new CustomEvent('navbarPreferencesChanged', {
        detail: { preferences: newPreferences }
      })
      window.dispatchEvent(event)
    } catch (error) {
      console.error('❌ [NAVBAR-PREFS] Erreur toggle préférence:', error)
      // Restaurer l'état précédent en cas d'erreur
      setPreferences(preferences)
    }
  }

  // Réinitialiser aux valeurs par défaut
  const resetToDefault = async () => {
    try {
      console.log('🔄 [NAVBAR-PREFS] Réinitialisation aux valeurs par défaut...')
      
      const defaultPreferences = db.getDefaultNavbarPreferences()
      const defaultOrder = db.getDefaultNavbarOrder()
      
      // Mettre à jour l'état local immédiatement
      setPreferences(defaultPreferences)
      setNavbarOrder(defaultOrder)
      
      // Sauvegarder via l'adaptateur
      await Promise.all([
        db.saveNavbarPreferences(defaultPreferences),
        db.saveNavbarOrder(defaultOrder)
      ])
      
      // Déclencher un événement pour notifier les autres instances du hook
      const event = new CustomEvent('navbarPreferencesChanged', {
        detail: { 
          preferences: defaultPreferences,
          order: defaultOrder
        }
      })
      window.dispatchEvent(event)
      
      console.log('✅ [NAVBAR-PREFS] Réinitialisation terminée')
    } catch (error) {
      console.error('❌ [NAVBAR-PREFS] Erreur lors de la réinitialisation:', error)
    }
  }

  // Sauvegarder l'ordre de la navbar
  const saveNavbarOrder = async (newOrder) => {
    try {
      console.log('🔄 [NAVBAR-PREFS] Sauvegarde nouvel ordre:', newOrder)
      
      // Mettre à jour l'état local immédiatement
      setNavbarOrder(newOrder)
      
      // Sauvegarder via l'adaptateur
      await db.saveNavbarOrder(newOrder)
      
      // Déclencher un événement pour notifier les autres instances du hook
      const event = new CustomEvent('navbarPreferencesChanged', {
        detail: { order: newOrder }
      })
      window.dispatchEvent(event)
      
      console.log('✅ [NAVBAR-PREFS] Ordre sauvegardé avec succès')
    } catch (error) {
      console.error('❌ [NAVBAR-PREFS] Erreur sauvegarde ordre:', error)
      // Restaurer l'état précédent en cas d'erreur
      setNavbarOrder(navbarOrder)
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