"use client"
import React, {useState, useEffect, useRef, useCallback} from "react"
import {useCryptoData} from "../../hooks/useCryptoData"
import {useCryptoPreferences} from "../../hooks/useCryptoPreferences"
import {useCryptoContext} from "../../context/CryptoContext"
import CryptoCard from "../../components/Crypto/CryptoCard"
import CryptoToolbar from "./CryptoToolbar"
import CryptoPagination from "./CryptoPagination"
import CryptoInfoModal from "./CryptoInfoModal"
import {
  CryptoErrorState,
  CryptoLoadingState,
  CryptoRetryNotification,
} from "../Crypto/CryptoState"
import { useFavoritesContext } from "../../context/FavoritesContext"
import { useSession } from "next-auth/react"
import Link from "next/link"

const CryptoDashboard = ({isNavOpen, setIsNavOpen}) => {
  const {setCryptoPaginationData} = useCryptoContext()
  const [currentPage, setCurrentPage] = useState(1)
  const [hasInteracted, setHasInteracted] = useState(false)
  const [showCards, setShowCards] = useState(false)
  const [filterType, setFilterType] = useState('all')
  const [displayedCryptos, setDisplayedCryptos] = useState([])
  const [loadingMore, setLoadingMore] = useState(false)
  const [isMobile, setIsMobile] = useState(false)
  const [selectedCrypto, setSelectedCrypto] = useState(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const observer = useRef()

  // Récupération des préférences
  const {
    hydrated,
    currency,
    setCurrency,
    sortBy,
    setSortBy,
    sortOrder,
    setSortOrder,
  } = useCryptoPreferences()

  // Hook pour les favoris
  const { favorites, isFavorite, refreshFavorites } = useFavoritesContext()
  
  // Hook pour la session utilisateur
  const { data: session, status } = useSession()

  // Récupération des données
  const {
    cryptos,
    favoriteCryptos,
    loading,
    error,
    retryCount,
    isRetrying,
    isRefreshing,
    refetch,
    fetchFavorites,
    isPaginationEnabled,
    itemsPerPage,
    maxCryptos,
    lastFetch,
    cacheStatus,
  } = useCryptoData(currency, currentPage, sortBy, sortOrder, favorites, searchQuery)

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

  // Logique de filtrage simplifiée
  const filteredCryptos = React.useMemo(() => {
    
    if (filterType === 'favorites') {
      // Utiliser les favoris pré-filtrés et les trier
      const sortedFavorites = sortCryptos(favoriteCryptos)
      return sortedFavorites
    } else {
      // Utiliser les cryptos de la page (déjà triés et paginés côté hook)
      return cryptos
    }
  }, [cryptos, favoriteCryptos, filterType, sortBy, sortOrder])

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

  // Calcul de pagination basé sur les 250 cryptos max (ou résultats de recherche)
  const maxPages = filterType === 'favorites' ? 1 : Math.ceil(maxCryptos / itemsPerPage)
  const totalPages = maxPages
  
  // Désactiver "Suivant" si on dépasse la limite ou pas assez de cryptos
  const isNextDisabled = filterType === 'favorites' || 
                        currentPage >= maxPages ||
                        cryptos.length < itemsPerPage

  // Reset de la page courante uniquement quand filterType ou recherche change (sans scroll)
  // Le tri ne doit PAS remettre à la page 1 pour garder la position de l'utilisateur
  useEffect(() => {
    setCurrentPage(1)
    // Ne pas scroller automatiquement pour éviter les remontées en haut
  }, [filterType, searchQuery])

  // Validation de la page courante après changement de tri pour éviter les pages inexistantes
  useEffect(() => {
    if (filterType !== 'favorites' && currentPage > maxPages && maxPages > 0) {
      setCurrentPage(maxPages)
    }
  }, [currentPage, maxPages, filterType])

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
    // Logique d'ajout ici
  }

  const handleInfoCrypto = coin => {
    setSelectedCrypto(coin)
    setIsModalOpen(true)
  }

  const handleCloseModal = () => {
    setIsModalOpen(false)
    setSelectedCrypto(null)
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
    if (loadingMore || !isMobile) return
    
    setLoadingMore(true)
    const nextBatch = 20
    const currentLength = displayedCryptos.length
    const nextCryptos = filteredCryptos.slice(0, currentLength + nextBatch)
    
    setTimeout(() => {
      setDisplayedCryptos(nextCryptos)
      setLoadingMore(false)
    }, 500)
  }, [filteredCryptos, displayedCryptos, loadingMore, isMobile])

  // Observer pour le scroll infini
  const lastCryptoRef = useCallback((node) => {
    if (loadingMore || !isMobile) return
    if (observer.current) observer.current.disconnect()
    observer.current = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting && displayedCryptos.length < filteredCryptos.length) {
        loadMoreCryptos()
      }
    })
    if (node) observer.current.observe(node)
  }, [loadingMore, displayedCryptos.length, filteredCryptos.length, loadMoreCryptos, isMobile])

  // Mise à jour des cryptos affichées
  useEffect(() => {
    if (isMobile && filterType !== 'favorites') {
      setDisplayedCryptos(filteredCryptos.slice(0, 20))
    } else {
      // Desktop ou favoris, afficher tout
      setDisplayedCryptos(filteredCryptos)
    }
  }, [filteredCryptos, isMobile, filterType])

  // Effet pour déclencher l'animation des cartes (seulement pour les changements de page)
  useEffect(() => {
    if (displayedCryptos.length > 0 && !loading && !isRefreshing) {
      setShowCards(false)
      const timer = setTimeout(() => setShowCards(true), 50)
      return () => clearTimeout(timer)
    }
  }, [displayedCryptos.length, loading, filterType, currentPage]) // Animation sur changement de page/filtre

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
        loading={loading}
        isRetrying={isRetrying}
        retryCount={retryCount}
        filterType={filterType}
        setFilterType={setFilterType}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
      />

      {/* Contenu principal */}
      <div className="max-w-9xl mx-auto px-6 pt-6 pb-6">


        {/* Notification de retry */}
        {isRetrying && cryptos.length > 0 && (
          <CryptoRetryNotification retryCount={retryCount} />
        )}

        {/* Bannière pour utilisateurs non connectés dans les favoris */}
        {filterType === 'favorites' && !session && status !== "loading" && (
          <div className="mb-6 bg-gradient-to-br from-[#2a2d3e] to-[#252837] border border-gray-600/20 rounded-2xl p-6 shadow-xl">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-gradient-to-r from-blue-600 to-blue-700 rounded-xl flex items-center justify-center shadow-lg">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </div>
                <div>
                  <p className="text-white font-semibold text-lg">
                    Connectez-vous pour gérer vos favoris
                  </p>
                  <p className="text-gray-300 text-sm mt-1">
                    Sauvegardez et organisez vos cryptomonnaies préférées
                  </p>
                </div>
              </div>
              <Link 
                href="/Dashboard/Profile"
                className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white px-6 py-3 rounded-xl text-sm font-medium transition-all duration-300 ease-in-out shadow-lg hover:shadow-xl transform hover:scale-105 active:scale-95 flex items-center gap-2"
              >
                <span>Se connecter</span>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </Link>
            </div>
          </div>
        )}

        {/* Message pour utilisateurs sans favoris */}
        {filterType === 'favorites' && filteredCryptos.length === 0 && !loading && session && (
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
              const shouldAddRef = isLast && isMobile && filterType !== 'favorites' && filterType !== 'favorites'
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
        {isMobile && loadingMore && filterType !== 'favorites' && (
          <div className="flex justify-center items-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
            <span className="ml-2 text-gray-400">Chargement...</span>
          </div>
        )}

        {/* Message fin de liste mobile (seulement si pas en mode "tout") */}
        {isMobile && filterType !== 'favorites' && displayedCryptos.length === filteredCryptos.length && displayedCryptos.length > 0 && (
          <div className="text-center py-8">
            <p className="text-gray-400">Vous avez vu toutes les cryptomonnaies disponibles</p>
          </div>
        )}

        {/* Pagination - Affichée seulement sur desktop et pas pour les favoris */}
        {isPaginationEnabled && cryptos.length > 0 && filterType !== 'favorites' && (
          <div className="hidden lg:block">
            <CryptoPagination
              currentPage={currentPage}
              onPageChange={handlePageChange}
              cryptosLength={filteredCryptos.length}
              itemsPerPage={itemsPerPage}
              totalPages={totalPages}
              hasNextPage={!isNextDisabled}
            />
          </div>
        )}
      </div>

      {/* Barre flottante mobile unifiée */}

      {/* Modal d'informations détaillées */}
      <CryptoInfoModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        coin={selectedCrypto}
        currency={currency}
      />
    </div>
  )
}

export default CryptoDashboard
