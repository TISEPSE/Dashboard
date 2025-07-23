import { useState, useEffect, useCallback } from 'react'
import { useSession } from 'next-auth/react'
import { EVENT_COLORS, fetchGoogleColors, convertGoogleColors } from '../services/localCalendar'

export const useColors = () => {
  const [colors, setColors] = useState(EVENT_COLORS)
  const [googleColors, setGoogleColors] = useState(null)
  const [loading, setLoading] = useState(false)
  const [isGoogleConnected, setIsGoogleConnected] = useState(false)
  const { data: session } = useSession()

  // Récupérer les couleurs Google quand l'utilisateur est connecté
  const loadGoogleColors = useCallback(async () => {
    if (!session?.accessToken) {
      setIsGoogleConnected(false)
      setColors(EVENT_COLORS)
      return
    }

    setLoading(true)
    try {
      console.log('🎨 Chargement des couleurs Google Calendar...')
      const googleColorData = await fetchGoogleColors(session.accessToken)
      
      if (googleColorData) {
        setGoogleColors(googleColorData)
        const convertedColors = convertGoogleColors(googleColorData)
        setColors(convertedColors)
        setIsGoogleConnected(true)
        console.log('✅ Couleurs Google chargées:', Object.keys(convertedColors).length + ' couleurs')
      } else {
        // Fallback sur les couleurs locales
        setColors(EVENT_COLORS)
        setIsGoogleConnected(false)
        console.log('⚠️ Fallback sur les couleurs locales')
      }
    } catch (error) {
      console.error('❌ Erreur chargement couleurs Google:', error)
      setColors(EVENT_COLORS)
      setIsGoogleConnected(false)
    } finally {
      setLoading(false)
    }
  }, [session?.accessToken])

  // Charger les couleurs quand la session change
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