"use client"

import { useState, useEffect, useMemo, useCallback, useRef } from "react"
import { getDatabaseAdapter } from '../lib/database-adapter'

// Cache singleton pour éviter les rechargements multiples
let globalCache = null
let globalCacheTime = 0
const CACHE_DURATION = 5000 // 5 secondes

export function useNavbarPreferences() {
  const db = useMemo(() => getDatabaseAdapter(), [])
  const [preferences, setPreferences] = useState({})
  const [navbarOrder, setNavbarOrder] = useState([])
  const [isLoaded, setIsLoaded] = useState(false)
  const loadingRef = useRef(false)
  const isMountedRef = useRef(true)

  // Vérifier si on peut utiliser le cache global
  const canUseCache = () => {
    return globalCache && (Date.now() - globalCacheTime) < CACHE_DURATION
  }

  // Charger les préférences avec cache global
  useEffect(() => {
    const loadPreferences = async () => {
      if (loadingRef.current) return
      loadingRef.current = true

      try {
        // Utiliser le cache global si disponible
        if (canUseCache() && isMountedRef.current) {
          setPreferences(globalCache.preferences)
          setNavbarOrder(globalCache.navbarOrder)
          setIsLoaded(true)
          return
        }

        const [loadedPreferences, loadedOrder] = await Promise.all([
          db.getNavbarPreferences(),
          db.getNavbarOrder()
        ])
        
        if (isMountedRef.current) {
          // Mettre à jour le cache global
          globalCache = {
            preferences: loadedPreferences,
            navbarOrder: loadedOrder
          }
          globalCacheTime = Date.now()

          setPreferences(loadedPreferences)
          setNavbarOrder(loadedOrder)
          setIsLoaded(true)
        }
      } catch (error) {
        if (isMountedRef.current) {
          // Utiliser les valeurs par défaut en cas d'erreur
          const defaultPrefs = db.getDefaultNavbarPreferences()
          const defaultOrder = db.getDefaultNavbarOrder()
          
          setPreferences(defaultPrefs)
          setNavbarOrder(defaultOrder)
          setIsLoaded(true)
        }
      } finally {
        loadingRef.current = false
      }
    }

    loadPreferences()

    // Cleanup
    return () => {
      isMountedRef.current = false
    }
  }, [db])

  // Écouter les changements depuis d'autres instances du hook
  useEffect(() => {
    const handlePreferencesChange = (event) => {
      if (!isMountedRef.current) return
      
      const { preferences: newPrefs, order: newOrder } = event.detail
      
      if (newPrefs) {
        setPreferences(newPrefs)
        if (globalCache) globalCache.preferences = newPrefs
      }
      if (newOrder) {
        setNavbarOrder(newOrder)
        if (globalCache) globalCache.navbarOrder = newOrder
      }
      
      globalCacheTime = Date.now()
    }

    window.addEventListener('navbarPreferencesChanged', handlePreferencesChange)
    return () => {
      window.removeEventListener('navbarPreferencesChanged', handlePreferencesChange)
    }
  }, [])

  // Toggle une préférence spécifique
  const togglePreference = useCallback(async (key) => {
    const newPreferences = {
      ...preferences,
      [key]: !preferences[key]
    }
    
    try {
      // Mettre à jour l'état local immédiatement
      setPreferences(newPreferences)
      if (globalCache) globalCache.preferences = newPreferences
      
      // Sauvegarder via l'adaptateur
      await db.saveNavbarPreferences(newPreferences)
      
      // Déclencher un événement pour notifier les autres instances du hook
      const event = new CustomEvent('navbarPreferencesChanged', {
        detail: { preferences: newPreferences }
      })
      window.dispatchEvent(event)
    } catch (error) {
      // Restaurer l'état précédent en cas d'erreur
      setPreferences(preferences)
      if (globalCache) globalCache.preferences = preferences
    }
  }, [preferences, db])

  // Réinitialiser aux valeurs par défaut
  const resetToDefault = useCallback(async () => {
    try {
      const defaultPreferences = db.getDefaultNavbarPreferences()
      const defaultOrder = db.getDefaultNavbarOrder()
      
      // Mettre à jour l'état local immédiatement
      setPreferences(defaultPreferences)
      setNavbarOrder(defaultOrder)
      
      // Mettre à jour le cache global
      globalCache = {
        preferences: defaultPreferences,
        navbarOrder: defaultOrder
      }
      globalCacheTime = Date.now()
      
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
    } catch (error) {
      // Erreur lors de la réinitialisation
    }
  }, [db])

  // Sauvegarder l'ordre de la navbar
  const saveNavbarOrder = useCallback(async (newOrder) => {
    try {
      // Mettre à jour l'état local immédiatement
      setNavbarOrder(newOrder)
      if (globalCache) globalCache.navbarOrder = newOrder
      
      // Sauvegarder via l'adaptateur
      await db.saveNavbarOrder(newOrder)
      
      // Déclencher un événement pour notifier les autres instances du hook
      const event = new CustomEvent('navbarPreferencesChanged', {
        detail: { order: newOrder }
      })
      window.dispatchEvent(event)
    } catch (error) {
      // Restaurer l'état précédent en cas d'erreur
      setNavbarOrder(navbarOrder)
      if (globalCache) globalCache.navbarOrder = navbarOrder
    }
  }, [navbarOrder, db])

  // Obtenir les éléments de navigation filtrés et ordonnés selon les préférences
  const getFilteredNavItems = useCallback((allNavItems) => {
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
  }, [navbarOrder, preferences])

  // Mapper un href vers une clé de préférence
  const getPreferenceKey = useCallback((href) => {
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
  }, [])

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