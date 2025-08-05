'use client'

import { createContext, useContext, useState, useEffect, useMemo, useCallback, useRef } from 'react'
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
  const db = useMemo(() => getDatabaseAdapter(), [])
  const loadingRef = useRef(false)

  useEffect(() => {
    const loadFavorites = async () => {
      if (loadingRef.current) return
      loadingRef.current = true
      
      try {
        setLoading(true)
        setError(null)
        
        const favoritesList = await db.getCryptoFavorites()
        
        // Convert to array of symbol strings for backwards compatibility
        const favoriteSymbols = favoritesList ? favoritesList.map(fav => fav.symbol.toLowerCase()) : []
        setFavorites(favoriteSymbols)
      } catch (err) {
        // Erreur lors du chargement des favoris
        setError(err.message)
        setFavorites([])
      } finally {
        setLoading(false)
        loadingRef.current = false
      }
    }

    loadFavorites()
  }, [])

  const addFavorite = async (symbol, name) => {
    try {
      
      const result = await db.addCryptoFavorite({
        symbol: symbol.toLowerCase(),
        name: name,
        addedAt: new Date().toISOString()
      })
      
      
      // Refresh favorites after adding
      const favoritesList = await db.getCryptoFavorites()
      const favoriteSymbols = favoritesList ? favoritesList.map(fav => fav.symbol.toLowerCase()) : []
      setFavorites(favoriteSymbols)
      
      return {
        success: true,
        message: `${symbol.toUpperCase()} ajouté aux favoris`
      }
    } catch (error) {
      // Erreur lors de l'ajout
      setError(error.message)
      return {
        success: false,
        message: 'Erreur lors de l\'ajout aux favoris'
      }
    }
  }

  const removeFavorite = async (symbol) => {
    try {
      
      const result = await db.removeCryptoFavorite(symbol.toLowerCase())
      
      // Refresh favorites after removing
      const favoritesList = await db.getCryptoFavorites()
      const favoriteSymbols = favoritesList ? favoritesList.map(fav => fav.symbol.toLowerCase()) : []
      setFavorites(favoriteSymbols)
      
      return {
        success: true,
        message: `${symbol.toUpperCase()} retiré des favoris`
      }
    } catch (error) {
      // Erreur lors de la suppression
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
      const favoritesList = await db.getCryptoFavorites()
      const favoriteSymbols = favoritesList ? favoritesList.map(fav => fav.symbol.toLowerCase()) : []
      setFavorites(favoriteSymbols)
    } catch (err) {
      // Erreur lors de l'actualisation
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