'use client'

import { createContext, useContext, useState, useEffect } from 'react'
import { getDatabaseAdapter } from '../lib/database-adapter'

const FavoritesContext = createContext()

export const useFavoritesContext = () => {
  const context = useContext(FavoritesContext)
  if (!context) {
    throw new Error('useFavoritesContext must be used within a FavoritesProvider')
  }
  return context
}

export const FavoritesProvider = ({ children }) => {
  const [favorites, setFavorites] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const db = getDatabaseAdapter()

  useEffect(() => {
    const loadFavorites = async () => {
      try {
        setLoading(true)
        setError(null)
        console.log('🔍 [FAVORITES] Chargement des favoris depuis le stockage local...')
        
        const favoritesList = await db.getCryptoFavorites()
        console.log('✅ [FAVORITES] Favoris chargés:', favoritesList)
        
        // Convert to array of symbol strings for backwards compatibility
        const favoriteSymbols = favoritesList ? favoritesList.map(fav => fav.symbol.toLowerCase()) : []
        setFavorites(favoriteSymbols)
      } catch (err) {
        console.error('❌ [FAVORITES] Erreur lors du chargement des favoris:', err)
        setError(err.message)
        setFavorites([])
      } finally {
        setLoading(false)
      }
    }

    loadFavorites()
  }, [])

  const addFavorite = async (symbol, name) => {
    try {
      console.log('➕ [FAVORITES] Ajout favori:', { symbol, name })
      
      const result = await db.addCryptoFavorite({
        symbol: symbol.toLowerCase(),
        name: name,
        addedAt: new Date().toISOString()
      })
      
      console.log('✅ [FAVORITES] Favori ajouté:', result)
      
      // Refresh favorites after adding
      const favoritesList = await db.getCryptoFavorites()
      const favoriteSymbols = favoritesList ? favoritesList.map(fav => fav.symbol.toLowerCase()) : []
      setFavorites(favoriteSymbols)
      
      return {
        success: true,
        message: `${symbol.toUpperCase()} ajouté aux favoris`
      }
    } catch (error) {
      console.error('❌ [FAVORITES] Erreur lors de l\'ajout:', error)
      setError(error.message)
      return {
        success: false,
        message: 'Erreur lors de l\'ajout aux favoris'
      }
    }
  }

  const removeFavorite = async (symbol) => {
    try {
      console.log('➖ [FAVORITES] Suppression favori:', symbol)
      
      const result = await db.removeCryptoFavorite(symbol.toLowerCase())
      console.log('✅ [FAVORITES] Favori supprimé:', result)
      
      // Refresh favorites after removing
      const favoritesList = await db.getCryptoFavorites()
      const favoriteSymbols = favoritesList ? favoritesList.map(fav => fav.symbol.toLowerCase()) : []
      setFavorites(favoriteSymbols)
      
      return {
        success: true,
        message: `${symbol.toUpperCase()} retiré des favoris`
      }
    } catch (error) {
      console.error('❌ [FAVORITES] Erreur lors de la suppression:', error)
      setError(error.message)
      return {
        success: false,
        message: 'Erreur lors de la suppression'
      }
    }
  }

  const isFavorite = (symbol) => {
    return favorites.includes(symbol.toLowerCase())
  }

  const refreshFavorites = async () => {
    try {
      console.log('🔄 [FAVORITES] Actualisation des favoris...')
      const favoritesList = await db.getCryptoFavorites()
      const favoriteSymbols = favoritesList ? favoritesList.map(fav => fav.symbol.toLowerCase()) : []
      setFavorites(favoriteSymbols)
      console.log('✅ [FAVORITES] Favoris actualisés:', favoriteSymbols)
    } catch (err) {
      console.error('❌ [FAVORITES] Erreur lors de l\'actualisation:', err)
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