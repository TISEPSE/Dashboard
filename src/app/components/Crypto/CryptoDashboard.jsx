"use client"

import React, { useState, useEffect } from "react"
import { useCryptoData } from "../../hook/useCryptoData"
import { useCryptoPreferences } from "../../hook/useCryptoPreferences"
import CryptoCard from "../../components/Crypto/CryptoCard"
import CryptoToolbar from "./CryptoToolbar"
import CryptoPagination from "./CryptoPagination"
import { CryptoErrorState, CryptoLoadingState, CryptoRetryNotification } from "../Crypto/CryptoState"

const CryptoDashboard = () => {
  const [currentPage, setCurrentPage] = useState(1)
  
  // Récupération des préférences
  const {
    hydrated,
    currency,
    setCurrency,
    perPage,
    setPerPage,
    sortBy,
    setSortBy,
    sortOrder,
    setSortOrder
  } = useCryptoPreferences()

  // Récupération des données
  const {
    cryptos,
    loading,
    error,
    retryCount,
    isRetrying,
    refetch,
    isPaginationEnabled
  } = useCryptoData(currency, perPage, currentPage, sortBy, sortOrder)

  // Gestion du changement de page
  const handlePageChange = (newPage) => {
    setCurrentPage(newPage)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  // Reset de la page courante quand perPage change
  useEffect(() => {
    setCurrentPage(1)
  }, [perPage])

  // Gestion des clics sur les cartes
  const handleAddCrypto = (coin) => {
    console.log("Ajouter crypto:", coin)
    // Logique d'ajout ici
  }

  const handleInfoCrypto = (coin) => {
    console.log("Info crypto:", coin)
    // Logique d'info ici
  }

  // Attendre l'hydratation
  if (!hydrated) return null

  // États d'erreur et de chargement
  if (error && !isRetrying) {
    return (
      <CryptoErrorState 
        error={error} 
        retryCount={retryCount} 
        onRetry={() => refetch()} 
      />
    )
  }

  if (isRetrying && cryptos.length === 0) {
    return <CryptoLoadingState retryCount={retryCount} />
  }

  return (
    <div className="min-h-screen bg-[#212332] text-[#FeFeFe]">
      {/* Barre d'outils */}
      <CryptoToolbar
        sortBy={sortBy}
        setSortBy={setSortBy}
        sortOrder={sortOrder}
        setSortOrder={setSortOrder}
        currency={currency}
        setCurrency={setCurrency}
        perPage={perPage}
        setPerPage={setPerPage}
        loading={loading}
        isRetrying={isRetrying}
        retryCount={retryCount}
      />

      {/* Contenu principal */}
      <div className="max-w-7xl mx-auto px-6 py-6 pb-32 sm:pb-6">
        {/* Notification de retry */}
        {isRetrying && cryptos.length > 0 && (
          <CryptoRetryNotification retryCount={retryCount} />
        )}

        {/* Grille des cryptos */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5 mb-6">
          {cryptos.map((coin) => (
            <CryptoCard
              key={coin.id}
              coin={coin}
              currency={currency}
              onAddClick={handleAddCrypto}
              onInfoClick={handleInfoCrypto}
            />
          ))}
        </div>

        {/* Pagination - Affichée seulement si "Tout" est sélectionné */}
        {isPaginationEnabled && (
          <CryptoPagination
            currentPage={currentPage}
            onPageChange={handlePageChange}
            cryptosLength={cryptos.length}
            perPage={perPage}
          />
        )}
      </div>
    </div>
  )
}

export default CryptoDashboard