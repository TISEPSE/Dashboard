import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'

export const useFavorites = () => {
  const { data: session, status } = useSession()
  const userId = session?.user?.id
  const [favorites, setFavorites] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const fetchFavorites = async () => {
    // Ne pas charger les favoris si l'utilisateur n'est pas connecté
    if (status === 'loading') return
    if (!session?.user?.id) {
      setFavorites([])
      setLoading(false)
      setError(null)
      return
    }

    try {
      setLoading(true)
      setError(null)
      const response = await fetch(`/api/favorites?userId=${userId}`)
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to fetch favorites')
      }
      const data = await response.json()
      setFavorites(data)
    } catch (err) {
      console.error('Error fetching favorites:', err)
      setError(err.message)
      setFavorites([])
    } finally {
      setLoading(false)
    }
  }

  const addFavorite = async (symbol, name) => {
    // Bloquer l'ajout si pas connecté
    if (!session?.user?.id) {
      return { success: false, message: 'Vous devez être connecté pour ajouter des favoris' }
    }

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
    // Bloquer la suppression si pas connecté
    if (!session?.user?.id) {
      return { success: false, message: 'Vous devez être connecté pour supprimer des favoris' }
    }

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
    if (status === 'loading') return
    if (!session?.user?.id) {
      setFavorites([])
      setLoading(false)
      setError(null)
      return
    }

    const loadFavorites = async () => {
      try {
        setLoading(true)
        setError(null)
        const response = await fetch(`/api/favorites?userId=${session.user.id}`)
        if (!response.ok) {
          const errorData = await response.json()
          throw new Error(errorData.error || 'Failed to fetch favorites')
        }
        const data = await response.json()
        setFavorites(data)
      } catch (err) {
        console.error('Error fetching favorites:', err)
        setError(err.message)
        setFavorites([])
      } finally {
        setLoading(false)
      }
    }

    loadFavorites()
  }, [session?.user?.id, status])

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