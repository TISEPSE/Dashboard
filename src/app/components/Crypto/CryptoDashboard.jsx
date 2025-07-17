"use client"
import React, {useState, useEffect} from "react"
import {useCryptoData} from "../../hook/useCryptoData"
import {useCryptoPreferences} from "../../hook/useCryptoPreferences"
import {useCryptoContext} from "../../context/CryptoContext"
import CryptoCard from "../../components/Crypto/CryptoCard"
import CryptoToolbar from "./CryptoToolbar"
import CryptoPagination from "./CryptoPagination"
import {
  CryptoErrorState,
  CryptoLoadingState,
  CryptoRetryNotification,
} from "../Crypto/CryptoState"

const CryptoDashboard = ({isNavOpen, setIsNavOpen}) => {
  const {setCryptoPaginationData} = useCryptoContext()
  const [currentPage, setCurrentPage] = useState(1)
  const [hasInteracted, setHasInteracted] = useState(false)
  const [showFavorites, setShowFavorites] = useState(false)
  const [showCards, setShowCards] = useState(false)

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
    setSortOrder,
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
    cacheStatus,
  } = useCryptoData(currency, perPage, currentPage, sortBy, sortOrder)

  // Gestion du changement de page (sans scroll automatique)
  const handlePageChange = newPage => {
    setCurrentPage(newPage)
    // Supprimé: window.scrollTo({top: 0, behavior: "smooth"})
  }

  // Gestion de la pagination
  const handlePrevious = () => {
    handlePageChange(Math.max(1, currentPage - 1))
  }

  const handleNext = () => {
    handlePageChange(currentPage + 1)
  }

  // Calculer le nombre total de pages possibles
  const totalPages = Math.ceil(totalCryptos / 40)
  const isNextDisabled = currentPage >= totalPages || cryptos.length < 40

  // Reset de la page courante quand perPage change
  useEffect(() => {
    setCurrentPage(1)
  }, [perPage])

  // Détection d'interaction pour accélérer les animations
  useEffect(() => {
    const handleInteraction = () => {
      setHasInteracted(true)
    }

    window.addEventListener('keydown', handleInteraction)

    return () => {
      window.removeEventListener('keydown', handleInteraction)
    }
  }, [])

  // Mise à jour du context avec les données de pagination
  useEffect(() => {
    if (isPaginationEnabled) {
      setCryptoPaginationData({
        isPaginationEnabled: true,
        currentPage,
        totalPages,
        isNextDisabled,
        handlePrevious,
        handleNext,
      })
    } else {
      setCryptoPaginationData({isPaginationEnabled: false})
    }
  }, [
    isPaginationEnabled,
    currentPage,
    totalPages,
    isNextDisabled,
    setCryptoPaginationData,
  ])

  // Gestion des clics sur les cartes
  const handleAddCrypto = coin => {
    console.log("Ajouter crypto:", coin)
    // Logique d'ajout ici
  }

  const handleInfoCrypto = coin => {
    console.log("Info crypto:", coin)
    // Logique d'info ici
  }

  // Effet pour déclencher l'animation des cartes (seulement au premier chargement)
  useEffect(() => {
    if (cryptos.length > 0 && !loading && !showCards) {
      setShowCards(false)
      const timer = setTimeout(() => setShowCards(true), 50)
      return () => clearTimeout(timer)
    }
  }, [cryptos.length, loading]) // Changé: dépendance sur cryptos.length au lieu de cryptos

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

  if (loading && cryptos.length === 0) {
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
      <div className="max-w-9xl mx-auto px-6 py-6 pb-24 sm:pb-6">
        
        {/* Section Favoris */}
        <div className="mb-6">
          <div className="bg-gradient-to-r from-[#2a2d3e] to-[#252837] border border-gray-600/20 rounded-xl p-4 shadow-lg">
            <div 
              className="flex items-center justify-between cursor-pointer hover:bg-white/5 rounded-lg p-2 -m-2 transition-colors duration-200"
              onClick={() => setShowFavorites(!showFavorites)}
            >
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 bg-gradient-to-r from-amber-500 to-orange-500 rounded-md flex items-center justify-center">
                  <span className="text-white text-xs leading-none">⭐</span>
                </div>
                <div>
                  <h2 className="text-base font-semibold text-white">Favoris</h2>
                  <p className="text-gray-400 text-xs">Vos cryptomonnaies suivies</p>
                </div>
              </div>
              <div className="text-gray-400 hover:text-white transition-colors duration-200">
                <svg className={`w-4 h-4 transition-transform duration-200 ${showFavorites ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </div>
            
            <div className={`overflow-hidden transition-all duration-300 ease-in-out ${showFavorites ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'}`}>
              <div className={`border-t border-gray-600/20 transition-all duration-300 ease-in-out ${showFavorites ? 'mt-3 pt-3' : 'mt-0 pt-0'}`}>
                <p className="text-center text-gray-400 py-4 text-sm">
                  Aucun favori pour le moment. Cliquez sur "Ajouter" sur une crypto pour l'ajouter à vos favoris.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Notification de retry */}
        {isRetrying && cryptos.length > 0 && (
          <CryptoRetryNotification retryCount={retryCount} />
        )}

        {/* Grille des cryptos */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5 mb-5">
          {showCards && cryptos.map((coin, index) => (
            <CryptoCard
              key={coin.id}
              coin={coin}
              currency={currency}
              onAddClick={handleAddCrypto}
              onInfoClick={handleInfoCrypto}
              index={index}
              hasInteracted={hasInteracted}
            />
          ))}
        </div>

        {/* Pagination - Affichée seulement sur desktop */}
        {isPaginationEnabled && totalCryptos > 40 && (
          <div className="hidden lg:block">
            <CryptoPagination
              currentPage={currentPage}
              onPageChange={handlePageChange}
              cryptosLength={cryptos.length}
              perPage={perPage}
              totalCryptos={totalCryptos}
            />
          </div>
        )}
      </div>

      {/* Barre flottante mobile unifiée */}
    </div>
  )
}

export default CryptoDashboard
