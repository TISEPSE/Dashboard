'use client'

import { createContext, useContext, useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'

const FavoritesContext = createContext()

export const FavoritesProvider = ({ children }) => {
  const { data: session, status } = useSession()
  const [favorites, setFavorites] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

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

  const addFavorite = async (symbol, name) => {
    if (!session?.user?.id) {
      return { 
        success: false, 
        message: 'Connectez-vous avec Google pour ajouter des favoris',
        needsAuth: true 
      }
    }

    try {
      const response = await fetch('/api/favorites', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ symbol, name, userId: session.user.id })
      })
      
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to add favorite')
      }
      
      // Refresh favorites after adding
      const favoritesResponse = await fetch(`/api/favorites?userId=${session.user.id}`)
      const data = await favoritesResponse.json()
      setFavorites(data)
      
      return { success: true, message: `${name} ajouté aux favoris` }
    } catch (err) {
      setError(err.message)
      return { success: false, message: `Erreur: ${err.message}` }
    }
  }

  const removeFavorite = async (symbol) => {
    if (!session?.user?.id) {
      return { 
        success: false, 
        message: 'Connectez-vous avec Google pour gérer vos favoris',
        needsAuth: true 
      }
    }

    try {
      const favorite = favorites.find(fav => fav.symbol === symbol)
      const name = favorite?.name || symbol.toUpperCase()
      
      const response = await fetch(`/api/favorites?symbol=${symbol}&userId=${session.user.id}`, {
        method: 'DELETE'
      })
      
      if (!response.ok) throw new Error('Failed to remove favorite')
      
      // Refresh favorites after removing
      const favoritesResponse = await fetch(`/api/favorites?userId=${session.user.id}`)
      const data = await favoritesResponse.json()
      setFavorites(data)
      
      return { success: true, message: `${name} retiré des favoris` }
    } catch (err) {
      setError(err.message)
      return { success: false, message: `Erreur: ${err.message}` }
    }
  }

  const isFavorite = (symbol) => {
    return favorites.some(fav => fav.symbol === symbol)
  }

  const refreshFavorites = async () => {
    if (!session?.user?.id) return
    
    try {
      const response = await fetch(`/api/favorites?userId=${session.user.id}`)
      const data = await response.json()
      setFavorites(data)
    } catch (err) {
      console.error('Error refreshing favorites:', err)
    }
  }

  const value = {
    favorites,
    loading,
    error,
    addFavorite,
    removeFavorite,
    isFavorite,
    refreshFavorites
  }

  return (
    <FavoritesContext.Provider value={value}>
      {children}
    </FavoritesContext.Provider>
  )
}

export const useFavoritesContext = () => {
  const context = useContext(FavoritesContext)
  if (!context) {
    throw new Error('useFavoritesContext must be used within FavoritesProvider')
  }
  return context
}