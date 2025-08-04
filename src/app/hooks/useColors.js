import { useState, useEffect, useCallback } from 'react'
import { useAuth } from '../context/AuthContext'
import { EVENT_COLORS, fetchGoogleColors, convertGoogleColors } from '../services/localCalendar'

export const useColors = () => {
  const [colors, setColors] = useState(EVENT_COLORS)
  const [googleColors, setGoogleColors] = useState(null)
  const [loading, setLoading] = useState(false)
  const [isGoogleConnected, setIsGoogleConnected] = useState(false)
  const { user, authenticated } = useAuth()

  // Récupérer les couleurs Google quand l'utilisateur est connecté
  const loadGoogleColors = useCallback(async () => {
    if (!authenticated) {
      setIsGoogleConnected(false)
      setColors(EVENT_COLORS)
      return
    }

    setLoading(true)
    try {
      const googleColorData = await fetchGoogleColors(user.accessToken)
      
      if (googleColorData && googleColorData.event) {
        setGoogleColors(googleColorData)
        const convertedColors = convertGoogleColors(googleColorData)
        
        // Si on a des couleurs Google, les utiliser exclusivement
        if (Object.keys(convertedColors).length > 0) {
          setColors(convertedColors)
          setIsGoogleConnected(true)
        } else {
          // Fallback uniquement si aucune couleur Google n'est disponible
          setColors(EVENT_COLORS)
          setIsGoogleConnected(false)
        }
      } else {
        // Fallback sur les couleurs locales
        setColors(EVENT_COLORS)
        setIsGoogleConnected(false)
      }
    } catch (error) {
      console.warn('⚠️ Erreur chargement couleurs Google (utilisation couleurs locales):', error.message)
      setColors(EVENT_COLORS)
      setIsGoogleConnected(false)
    } finally {
      setLoading(false)
    }
  }, [user?.accessToken])

  // Charger les couleurs quand la user change
  useEffect(() => {
    loadGoogleColors()
  }, [loadGoogleColors])

  // Obtenir une couleur spécifique avec fallback
  const getColor = useCallback((colorId) => {
    return colors[colorId] || colors['1'] || EVENT_COLORS['1']
  }, [colors])

  // Obtenir toutes les couleurs disponibles pour le picker
  const getAvailableColors = useCallback(() => {
    return colors
  }, [colors])

  // Vérifier si une couleur existe
  const hasColor = useCallback((colorId) => {
    return !!colors[colorId]
  }, [colors])

  // Recharger les couleurs manuellement
  const refreshColors = useCallback(() => {
    return loadGoogleColors()
  }, [loadGoogleColors])

  return {
    colors,
    googleColors,
    loading,
    isGoogleConnected,
    getColor,
    getAvailableColors,
    hasColor,
    refreshColors
  }
}