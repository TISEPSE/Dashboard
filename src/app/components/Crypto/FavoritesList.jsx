import React from 'react'
import { useFavorites } from '../../hook/useFavorites'

const FavoritesList = ({ onCryptoSelect }) => {
  const { favorites, loading, error, removeFavorite } = useFavorites()

  if (loading) {
    return (
      <div className="text-gray-400 text-center py-4">Chargement...</div>
    )
  }

  if (error) {
    return (
      <div className="text-red-400 text-center py-4">Erreur: {error}</div>
    )
  }

  if (favorites.length === 0) {
    return (
      <div className="text-gray-400 text-center py-4">
        Aucun favori pour le moment.
        <br />
        Cliquez sur l'étoile d'une crypto pour l'ajouter !
      </div>
    )
  }

  return (
    <div>
      <div className="text-white font-medium mb-3">
        Mes Favoris ({favorites.length})
      </div>
      <div className="space-y-2 max-h-48 overflow-y-auto">
        {favorites.map((favorite) => (
          <div
            key={favorite.id}
            className="flex items-center justify-between p-2 bg-[#1f2937] rounded-lg hover:bg-[#374151] transition-colors"
          >
            <div
              className="flex items-center gap-2 flex-1 cursor-pointer"
              onClick={() => onCryptoSelect?.(favorite.symbol)}
            >
              <div className="w-2 h-2 bg-yellow-400 rounded-full"></div>
              <div>
                <div className="text-white text-sm font-medium">{favorite.name}</div>
                <div className="text-gray-400 text-xs">{favorite.symbol.toUpperCase()}</div>
              </div>
            </div>
            <button
              onClick={(e) => {
                e.stopPropagation()
                removeFavorite(favorite.symbol)
              }}
              className="text-gray-400 hover:text-red-400 transition-colors p-1"
              title="Retirer des favoris"
            >
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        ))}
      </div>
    </div>
  )
}

export default FavoritesList