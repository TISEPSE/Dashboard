"use client"
import React, { useState, useEffect } from "react"
import { useCryptoData } from "../../hook/useCryptoData"
import { useCryptoPreferences } from "../../hook/useCryptoPreferences"
import CryptoCard from "../../components/Crypto/CryptoCard"
import CryptoToolbar from "./CryptoToolbar"
import CryptoPagination from "./CryptoPagination"
import { CryptoErrorState, CryptoLoadingState, CryptoRetryNotification } from "../Crypto/CryptoState"

const CryptoDashboard = ({ isNavOpen, setIsNavOpen }) => {
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
    isPaginationEnabled,
    totalCryptos,
    lastFetch,
    cacheStatus
  } = useCryptoData(currency, perPage, currentPage, sortBy, sortOrder)

  // Gestion du changement de page
  const handlePageChange = (newPage) => {
    setCurrentPage(newPage)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  // Gestion de la pagination
  const handlePrevious = () => {
    handlePageChange(Math.max(1, currentPage - 1))
  }

  const handleNext = () => {
    handlePageChange(currentPage + 1)
  }

  // Calculer le nombre total de pages possibles
  const totalPages = Math.ceil(totalCryptos / 50)
  const isNextDisabled = currentPage >= totalPages || cryptos.length < 50

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
        {/* Informations sur le cache */}
        {cacheStatus.isCached && (
          <div className="mb-4 bg-blue-500/10 border border-blue-500/30 rounded-lg p-3 flex items-center gap-3">
            <div className="w-4 h-4 bg-blue-500/20 rounded-full flex items-center justify-center">
              <span className="text-xs text-blue-400">📦</span>
            </div>
            <div className="flex-1 text-sm">
              <span className="text-blue-400 font-medium">Cache actif</span>
              <span className="text-gray-300 ml-2">
                {totalCryptos} cryptos • Dernière MAJ: {cacheStatus.cacheAge}s
              </span>
            </div>
          </div>
        )}

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
            totalCryptos={totalCryptos}
          />
        )}
      </div>

      {/* Barre flottante mobile unifiée */}
      <div className="sm:hidden fixed bottom-0 left-0 right-0 z-[70] pb-4 px-4">
        <div className="bg-[#212332] border border-gray-500 rounded-lg p-3 shadow-lg">
          {/* Pagination mobile si activée */}
          {isPaginationEnabled && (
            <div className="flex items-center justify-between gap-2 mb-3 pb-3 border-b border-gray-600">
              <button
                disabled={currentPage === 1}
                onClick={handlePrevious}
                className="bg-[#3a3d4e] hover:bg-[#4a4d5e] disabled:bg-[#2a2d3e] text-white px-3 py-2 rounded-lg font-medium text-xs transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1"
              >
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                <span>Préc.</span>
              </button>

              <div className="flex items-center gap-2 px-2 py-1 bg-[#2a2d3e] rounded border border-[#3a3d4e]">
                <span className="text-gray-300 text-xs font-medium">
                  {currentPage}/{totalPages}
                </span>
              </div>

              <button
                disabled={isNextDisabled}
                onClick={handleNext}
                className="bg-[#3A6FF8] hover:bg-[#2952d3] disabled:bg-[#2a2d3e] text-white px-3 py-2 rounded-lg font-medium text-xs transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1"
              >
                <span>Suiv.</span>
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>
          )}

          {/* Bouton navbar */}
          <button
            onClick={() => setIsNavOpen?.(!isNavOpen)}
            className="w-full text-white bg-[#3A6FF8] p-3 rounded-lg cursor-pointer transition-all duration-200 hover:bg-[#2952d3] flex items-center justify-center gap-2"
          >
            <div className="transition-transform duration-200">
              {isNavOpen ? (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              ) : (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              )}
            </div>
            <span className="font-medium text-sm">
              {isNavOpen ? "Fermer le menu" : "Ouvrir le menu"}
            </span>
          </button>
        </div>
      </div>
    </div>
  )
}

export default CryptoDashboard