import { useState, useEffect } from 'react'

export const useFavorites = (userId = 'anonymous') => {
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
      return true
    } catch (err) {
      setError(err.message)
      return false
    }
  }

  const removeFavorite = async (symbol) => {
    try {
      const response = await fetch(`/api/favorites?symbol=${symbol}&userId=${userId}`, {
        method: 'DELETE'
      })
      
      if (!response.ok) throw new Error('Failed to remove favorite')
      
      await fetchFavorites()
      return true
    } catch (err) {
      setError(err.message)
      return false
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