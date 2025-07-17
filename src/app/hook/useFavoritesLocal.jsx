import { useState, useEffect } from 'react'

export const useFavoritesLocal = () => {
  const [favorites, setFavorites] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  // Charger les favoris depuis localStorage
  useEffect(() => {
    try {
      const savedFavorites = localStorage.getItem('crypto-favorites')
      if (savedFavorites) {
        setFavorites(JSON.parse(savedFavorites))
      }
    } catch (err) {
      console.error('Erreur lors du chargement des favoris:', err)
    }
  }, [])

  // Sauvegarder dans localStorage
  const saveFavorites = (newFavorites) => {
    try {
      localStorage.setItem('crypto-favorites', JSON.stringify(newFavorites))
      setFavorites(newFavorites)
    } catch (err) {
      console.error('Erreur lors de la sauvegarde:', err)
    }
  }

  const addFavorite = async (symbol, name) => {
    try {
      const newFavorite = {
        id: Date.now().toString(),
        symbol,
        name,
        createdAt: new Date().toISOString()
      }
      
      const exists = favorites.some(fav => fav.symbol === symbol)
      if (exists) {
        setError('Cette crypto est déjà dans vos favoris')
        return false
      }

      const newFavorites = [...favorites, newFavorite]
      saveFavorites(newFavorites)
      setError(null)
      return true
    } catch (err) {
      setError(err.message)
      return false
    }
  }

  const removeFavorite = async (symbol) => {
    try {
      const newFavorites = favorites.filter(fav => fav.symbol !== symbol)
      saveFavorites(newFavorites)
      setError(null)
      return true
    } catch (err) {
      setError(err.message)
      return false
    }
  }

  const isFavorite = (symbol) => {
    return favorites.some(fav => fav.symbol === symbol)
  }

  return {
    favorites,
    loading,
    error,
    addFavorite,
    removeFavorite,
    isFavorite,
    refreshFavorites: () => {} // Pas nécessaire pour localStorage
  }
}