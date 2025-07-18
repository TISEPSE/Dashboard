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
import { useFavorites } from "../../hook/useFavorites"

const CryptoDashboard = ({isNavOpen, setIsNavOpen}) => {
  const {setCryptoPaginationData} = useCryptoContext()
  const [currentPage, setCurrentPage] = useState(1)
  const [hasInteracted, setHasInteracted] = useState(false)
  const [showCards, setShowCards] = useState(false)
  const [filterType, setFilterType] = useState('all')

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

  // Hook pour les favoris
  const { favorites, isFavorite, refreshFavorites } = useFavorites()

  // Récupération des données
  const {
    cryptos,
    allCryptos,
    favoriteCryptos,
    loading,
    error,
    retryCount,
    isRetrying,
    refetch,
    fetchFavorites,
    processDisplayedCryptos,
    isPaginationEnabled,
    totalCryptos,
    lastFetch,
    cacheStatus,
  } = useCryptoData(currency, perPage, currentPage, sortBy, sortOrder, favorites)

  // Tri des cryptos
  const sortCryptos = (cryptosList) => {
    return [...cryptosList].sort((a, b) => {
      let aValue = a[sortBy]
      let bValue = b[sortBy]

      if (sortBy === "name") {
        aValue = aValue.toLowerCase()
        bValue = bValue.toLowerCase()
      }

      if (aValue === null || aValue === undefined) return 1
      if (bValue === null || bValue === undefined) return -1

      if (sortOrder === "asc") {
        return aValue > bValue ? 1 : -1
      } else {
        return aValue < bValue ? 1 : -1
      }
    })
  }

  // Logique de filtrage et pagination complète
  const filteredCryptos = React.useMemo(() => {
    console.log("🔍 Filtrage - Type:", filterType)
    
    let sourceData = []
    
    if (filterType === 'favorites') {
      // Filtrer les favoris depuis allCryptos
      if (favorites.length > 0 && allCryptos.length > 0) {
        const favoriteSymbols = favorites.map(fav => fav.symbol.toUpperCase())
        sourceData = allCryptos.filter(crypto => 
          favoriteSymbols.includes(crypto.symbol.toUpperCase())
        )
        console.log("Favoris trouvés:", sourceData.map(c => c.symbol))
      } else {
        sourceData = []
      }
    } else {
      // Utiliser allCryptos pour les filtres normaux
      sourceData = allCryptos
    }

    if (sourceData.length === 0) return []

    // Trier
    const sortedData = sortCryptos(sourceData)
    
    // Appliquer la pagination/limitation
    if (perPage === "all") {
      // Mode "Tout" : pagination par tranches de 40
      const startIndex = (currentPage - 1) * 40
      const endIndex = startIndex + 40
      return sortedData.slice(startIndex, endIndex)
    } else {
      // Modes spécifiques : afficher exactement le nombre demandé
      const itemsPerPage = typeof perPage === 'number' ? perPage : 6
      return sortedData.slice(0, itemsPerPage)
    }
  }, [allCryptos, favorites, filterType, sortBy, sortOrder, perPage, currentPage])

  // Gestion du changement de page avec scroll automatique
  const handlePageChange = newPage => {
    setCurrentPage(newPage)
    window.scrollTo({top: 0, behavior: "smooth"})
  }

  // Gestion de la pagination
  const handlePrevious = () => {
    handlePageChange(Math.max(1, currentPage - 1))
  }

  const handleNext = () => {
    handlePageChange(currentPage + 1)
  }

  // Calculer le nombre total de pages possibles
  const totalFilteredCryptos = filterType === 'favorites' ? 
    (favorites.length > 0 && allCryptos.length > 0 ? 
      allCryptos.filter(crypto => 
        favorites.map(fav => fav.symbol.toUpperCase()).includes(crypto.symbol.toUpperCase())
      ).length : 0) : 
    totalCryptos
  const totalPages = Math.ceil(totalFilteredCryptos / 40)
  const isNextDisabled = currentPage >= totalPages || filteredCryptos.length < 40

  // Reset de la page courante quand perPage ou filterType change
  useEffect(() => {
    setCurrentPage(1)
    window.scrollTo({top: 0, behavior: "smooth"})
  }, [perPage, filterType])

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
    if (filteredCryptos.length > 0 && !loading) {
      setShowCards(false)
      const timer = setTimeout(() => setShowCards(true), 50)
      return () => clearTimeout(timer)
    }
  }, [filteredCryptos.length, loading, filterType]) // Ajout de filterType pour re-déclencher l'animation

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
    <div className="min-h-screen bg-[#212332] text-[#FeFeFe] overflow-x-hidden">
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
        filterType={filterType}
        setFilterType={setFilterType}
      />

      {/* Contenu principal */}
      <div className="max-w-9xl mx-auto px-6 py-6 pb-6">

        {/* Notification de retry */}
        {isRetrying && cryptos.length > 0 && (
          <CryptoRetryNotification retryCount={retryCount} />
        )}

        {/* Grille des cryptos */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5 mb-5">
          {showCards && filteredCryptos.map((coin, index) => (
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
              cryptosLength={filteredCryptos.length}
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
