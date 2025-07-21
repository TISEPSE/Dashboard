"use client"
import React, {useState, useEffect, useRef, useCallback} from "react"
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
import { useFavoritesContext } from "../../context/FavoritesContext"

const CryptoDashboard = ({isNavOpen, setIsNavOpen}) => {
  const {setCryptoPaginationData} = useCryptoContext()
  const [currentPage, setCurrentPage] = useState(1)
  const [hasInteracted, setHasInteracted] = useState(false)
  const [showCards, setShowCards] = useState(false)
  const [filterType, setFilterType] = useState('all')
  const [displayedCryptos, setDisplayedCryptos] = useState([])
  const [loadingMore, setLoadingMore] = useState(false)
  const [isMobile, setIsMobile] = useState(false)
  const observer = useRef()

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
  const { favorites, isFavorite, refreshFavorites } = useFavoritesContext()

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
    
    // Pour les favoris, afficher tous sans pagination
    if (filterType === 'favorites') {
      return sortedData
    }
    
    // Appliquer la pagination/limitation pour les autres filtres
    if (perPage === "all") {
      // Mode "Tout" : sur mobile, afficher tout ; sur desktop, paginer par 40
      if (isMobile) {
        return sortedData // Tout sur mobile
      } else {
        // Pagination par tranches de 40 sur desktop
        const startIndex = (currentPage - 1) * 40
        const endIndex = startIndex + 40
        return sortedData.slice(startIndex, endIndex)
      }
    } else {
      // Modes spécifiques : afficher exactement le nombre demandé
      const itemsPerPage = typeof perPage === 'number' ? perPage : 6
      return sortedData.slice(0, itemsPerPage)
    }
  }, [allCryptos, favorites, filterType, sortBy, sortOrder, perPage, currentPage, isMobile])

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

  // Reset de la page courante quand perPage ou filterType change (sans scroll)
  useEffect(() => {
    setCurrentPage(1)
    // Ne pas scroller automatiquement pour éviter les remontées en haut
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

  // Détection mobile
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 1024)
    }
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  // Gestion du scroll infini mobile
  const loadMoreCryptos = useCallback(() => {
    if (loadingMore || !isMobile || perPage === "all") return
    
    setLoadingMore(true)
    const nextBatch = 20
    const currentLength = displayedCryptos.length
    const nextCryptos = filteredCryptos.slice(0, currentLength + nextBatch)
    
    setTimeout(() => {
      setDisplayedCryptos(nextCryptos)
      setLoadingMore(false)
    }, 500)
  }, [filteredCryptos, displayedCryptos, loadingMore, isMobile, perPage])

  // Observer pour le scroll infini
  const lastCryptoRef = useCallback((node) => {
    if (loadingMore || !isMobile || perPage === "all") return
    if (observer.current) observer.current.disconnect()
    observer.current = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting && displayedCryptos.length < filteredCryptos.length) {
        loadMoreCryptos()
      }
    })
    if (node) observer.current.observe(node)
  }, [loadingMore, displayedCryptos.length, filteredCryptos.length, loadMoreCryptos, isMobile, perPage])

  // Mise à jour des cryptos affichées
  useEffect(() => {
    if (isMobile && perPage !== "all") {
      setDisplayedCryptos(filteredCryptos.slice(0, 20))
    } else {
      // Si perPage === "all" ou desktop, afficher tout
      setDisplayedCryptos(filteredCryptos)
    }
  }, [filteredCryptos, isMobile, perPage])

  // Effet pour déclencher l'animation des cartes (seulement au premier chargement)
  useEffect(() => {
    if (displayedCryptos.length > 0 && !loading) {
      setShowCards(false)
      const timer = setTimeout(() => setShowCards(true), 50)
      return () => clearTimeout(timer)
    }
  }, [displayedCryptos.length, loading, filterType]) // Ajout de filterType pour re-déclencher l'animation

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

        {/* Message pour utilisateurs sans favoris */}
        {filterType === 'favorites' && filteredCryptos.length === 0 && !loading && (
          <div className="flex flex-col items-center justify-center py-16 px-6">
            <div className="bg-gradient-to-r from-[#2a2d3e] to-[#252837] border border-gray-600/20 rounded-2xl p-8 max-w-md mx-auto text-center shadow-xl">
              <div className="w-16 h-16 bg-gradient-to-r from-amber-500 to-orange-500 rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="text-white text-2xl">⭐</span>
              </div>
              <h3 className="text-xl font-semibold text-white mb-3">
                {favorites.length === 0 ? "Aucun favori ajouté" : "Favoris introuvables"}
              </h3>
              <p className="text-gray-400 text-sm leading-relaxed mb-6">
                {favorites.length === 0 
                  ? "Commencez à ajouter des cryptomonnaies à vos favoris en cliquant sur l'étoile des cartes crypto."
                  : "Vos cryptomonnaies favorites ne sont pas disponibles actuellement. Essayez de rafraîchir la page."
                }
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <button
                  onClick={() => setFilterType('all')}
                  className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white px-6 py-2 rounded-lg text-sm font-medium transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105"
                >
                  Voir toutes les cryptos
                </button>
                {favorites.length > 0 && (
                  <button
                    onClick={() => refetch()}
                    className="bg-gradient-to-r from-gray-600 to-gray-700 hover:from-gray-700 hover:to-gray-800 text-white px-6 py-2 rounded-lg text-sm font-medium transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105"
                  >
                    Actualiser
                  </button>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Grille des cryptos */}
        {filteredCryptos.length > 0 && (
          <div className="crypto-grid grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5 mb-5">
            {showCards && filteredCryptos.map((coin, index) => {
              const isLast = index === filteredCryptos.length - 1
              const shouldAddRef = isLast && isMobile && perPage !== "all" && filterType !== 'favorites'
              return (
                <CryptoCard
                key={coin.id}
                coin={coin}
                currency={currency}
                onAddClick={handleAddCrypto}
                onInfoClick={handleInfoCrypto}
                index={index}
                hasInteracted={hasInteracted}
                ref={shouldAddRef ? lastCryptoRef : null}
              />
              )
            })}
          </div>
        )}

        {/* Indicateur de chargement mobile (seulement si pas en mode "tout") */}
        {isMobile && loadingMore && perPage !== "all" && (
          <div className="flex justify-center items-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
            <span className="ml-2 text-gray-400">Chargement...</span>
          </div>
        )}

        {/* Message fin de liste mobile (seulement si pas en mode "tout") */}
        {isMobile && perPage !== "all" && displayedCryptos.length === filteredCryptos.length && displayedCryptos.length > 0 && (
          <div className="text-center py-8">
            <p className="text-gray-400">Vous avez vu toutes les cryptomonnaies disponibles</p>
          </div>
        )}

        {/* Pagination - Affichée seulement sur desktop et pas pour les favoris */}
        {isPaginationEnabled && totalCryptos > 40 && filterType !== 'favorites' && (
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
