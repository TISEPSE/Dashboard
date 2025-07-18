import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'

export const useFavorites = () => {
  const { data: session } = useSession()
  const userId = session?.user?.id || 'anonymous'
  const [favorites, setFavorites] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const fetchFavorites = async () => {
    try {
      setLoading(true)
      const response = await fetch(`/api/favorites?userId=${userId}`)
      if (!response.ok) throw new Error('Failed to fetch favorites')
      const data = await response.json()
      setFavorites(data)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const addFavorite = async (symbol, name) => {
    try {
      const response = await fetch('/api/favorites', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ symbol, name, userId })
      })
      
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to add favorite')
      }
      
      await fetchFavorites()
      return { success: true, message: `${name} ajouté aux favoris` }
    } catch (err) {
      setError(err.message)
      return { success: false, message: `Erreur: ${err.message}` }
    }
  }

  const removeFavorite = async (symbol) => {
    try {
      // Find the favorite name before removing
      const favorite = favorites.find(fav => fav.symbol === symbol)
      const name = favorite?.name || symbol.toUpperCase()
      
      const response = await fetch(`/api/favorites?symbol=${symbol}&userId=${userId}`, {
        method: 'DELETE'
      })
      
      if (!response.ok) throw new Error('Failed to remove favorite')
      
      await fetchFavorites()
      return { success: true, message: `${name} retiré des favoris` }
    } catch (err) {
      setError(err.message)
      return { success: false, message: `Erreur: ${err.message}` }
    }
  }

  const isFavorite = (symbol) => {
    return favorites.some(fav => fav.symbol === symbol)
  }

  useEffect(() => {
    fetchFavorites()
  }, [userId])

  return {
    favorites,
    loading,
    error,
    addFavorite,
    removeFavorite,
    isFavorite,
    refreshFavorites: fetchFavorites
  }
}