"use client"

import React, { useEffect, useState } from "react"
import axios from "axios"
import CryptoSelector from "../../components/Crypto/CryptoSelector"

const cryptoAPI = axios.create({
  baseURL: "https://api.coingecko.com/api/v3",
  timeout: 10000,
  headers: { "Content-Type": "application/json" },
})

cryptoAPI.interceptors.response.use(
  response => response,
  error => {
    if (error.code === "ECONNABORTED") {
      console.error("Timeout: La requête a pris trop de temps")
    } else if (error.response?.status === 429) {
      console.error("Rate limit atteint, veuillez réessayer plus tard")
    } else if (error.response?.status >= 500) {
      console.error("Erreur serveur CoinGecko")
    } else {
      console.error("Erreur API:", error.message)
    }
    return Promise.reject(error)
  }
)

export default function CryptoDashboardClient() {
  const [cryptos, setCryptos] = useState([])
  const [sortedCryptos, setSortedCryptos] = useState([])
  const [perPage, setPerPage] = useState(6)
  const [page, setPage] = useState(1)
  const [error, setError] = useState(null)
  const [currency, setCurrency] = useState("eur")
  const [loading, setLoading] = useState(false)
  const [hydrated, setHydrated] = useState(false)
  const [sortBy, setSortBy] = useState("market_cap")
  const [sortOrder, setSortOrder] = useState("desc")
  const [retryCount, setRetryCount] = useState(0)
  const [isRetrying, setIsRetrying] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)

  // Tous les modes utilisent maintenant la pagination API
  const getApiParams = () => {
    if (perPage === "all") {
      return {
        perPageParam: 50,
        pageParam: currentPage
      }
    } else {
      // Pour les modes spécifiques, on utilise directement la valeur
      const itemsPerPage = typeof perPage === 'number' ? perPage : 6
      return {
        perPageParam: itemsPerPage,
        pageParam: currentPage
      }
    }
  }

  const sortOptions = [
    { value: "market_cap", label: "Capitalisation", shortLabel: "Cap." },
    { value: "current_price", label: "Prix", shortLabel: "Prix" },
    { value: "name", label: "Nom", shortLabel: "Nom" },
    { value: "price_change_percentage_24h", label: "Variation 24h", shortLabel: "24h" },
    { value: "price_change_percentage_7d_in_currency", label: "Variation 7j", shortLabel: "7j" },
    { value: "market_cap_rank", label: "Classement", shortLabel: "Rang" },
    { value: "total_volume", label: "Volume 24h", shortLabel: "Vol." }
  ]

  useEffect(() => {
    setHydrated(true)
    const savedCurrency = localStorage.getItem("currency")
    if (savedCurrency) setCurrency(savedCurrency)

    const savedPerPage = localStorage.getItem("perPage")
    if (savedPerPage)
      setPerPage(savedPerPage === "all" ? "all" : Number(savedPerPage))

    const savedSortBy = localStorage.getItem("sortBy")
    if (savedSortBy) setSortBy(savedSortBy)

    const savedSortOrder = localStorage.getItem("sortOrder")
    if (savedSortOrder) setSortOrder(savedSortOrder)
  }, [])

  useEffect(() => {
    if (!hydrated) return
    localStorage.setItem("currency", currency)
  }, [currency, hydrated])

  useEffect(() => {
    if (!hydrated) return
    localStorage.setItem("perPage", perPage)
  }, [perPage, hydrated])

  useEffect(() => {
    if (!hydrated) return
    localStorage.setItem("sortBy", sortBy)
  }, [sortBy, hydrated])

  useEffect(() => {
    if (!hydrated) return
    localStorage.setItem("sortOrder", sortOrder)
  }, [sortOrder, hydrated])

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

  useEffect(() => {
    if (cryptos.length > 0) {
      setSortedCryptos(sortCryptos(cryptos))
    }
  }, [cryptos, sortBy, sortOrder])

  const fetchCryptos = async (isRetry = false) => {
    try {
      setLoading(true)
      setError(null)
      if (isRetry) {
        setIsRetrying(true)
      }

      const { perPageParam, pageParam } = getApiParams()

      const response = await cryptoAPI.get("/coins/markets", {
        params: {
          vs_currency: currency,
          order: "market_cap_desc",
          per_page: perPageParam,
          page: pageParam,
          price_change_percentage: "1h,24h,7d",
        },
      })

      setCryptos(response.data)
      setRetryCount(0) // Reset retry count on success
      setIsRetrying(false)
    } catch (err) {
      setError(err.message)
      setRetryCount(prev => prev + 1)
      console.error("Erreur lors du chargement des cryptos:", err)
      
      // Auto-retry every 5 seconds on network errors
      if (err.code === "ECONNABORTED" || err.response?.status >= 500 || err.code === "NETWORK_ERROR") {
        setIsRetrying(true)
        setTimeout(() => {
          fetchCryptos(true)
        }, 5000)
      } else {
        setIsRetrying(false)
      }
    } finally {
      setLoading(false)
    }
  }

  // Pagination logic - Tous les modes utilisent maintenant l'API
  const getCurrentPageCryptos = () => {
    // On affiche directement ce qui vient de l'API pour tous les modes
    return sortedCryptos
  }

  const getTotalPages = () => {
    // Pour tous les modes, on ne connaît pas le nombre total exact
    // On permet la navigation jusqu'à ce qu'on arrive à une page vide
    return null
  }

  const handlePageChange = (newPage) => {
    setCurrentPage(newPage)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  // Reset current page when perPage changes
  useEffect(() => {
    setCurrentPage(1)
  }, [perPage])

  // Refetch when currentPage changes pour tous les modes
  useEffect(() => {
    if (!hydrated) return
    fetchCryptos()
  }, [currentPage, perPage, currency, hydrated])

  // Auto-refresh seulement pour la page courante
  useEffect(() => {
    if (!hydrated) return
    const interval = setInterval(() => {
      fetchCryptos()
    }, 10000)
    return () => clearInterval(interval)
  }, [currentPage, perPage, currency, hydrated])

  if (!hydrated) return null

  if (error && !isRetrying) {
    return (
      <div className="min-h-screen bg-[#212332] flex items-center justify-center px-4">
        <div className="text-center bg-red-500/10 border border-red-500/30 rounded-lg p-8 max-w-md">
          <div className="w-16 h-16 mx-auto mb-4 bg-red-500/20 rounded-full flex items-center justify-center">
            <svg className="w-8 h-8 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h3 className="text-red-400 text-xl font-semibold mb-2">Erreur de chargement</h3>
          <p className="text-gray-300 mb-4">{error}</p>
          {retryCount > 0 && (
            <p className="text-yellow-400 text-sm mb-4">
              Tentatives de reconnexion: {retryCount}
            </p>
          )}
          <button
            onClick={() => fetchCryptos()}
            className="bg-[#3A6FF8] hover:bg-[#2952d3] text-white px-6 py-3 rounded-lg font-medium transition-all duration-200 shadow-lg"
          >
            Réessayer
          </button>
        </div>
      </div>
    )
  }

  // Loading state when retrying with network issues
  if (isRetrying && cryptos.length === 0) {
    return (
      <div className="min-h-screen bg-[#212332] flex items-center justify-center px-4">
        <div className="text-center bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-8 max-w-md">
          <div className="w-16 h-16 mx-auto mb-4 bg-yellow-500/20 rounded-full flex items-center justify-center">
            <svg className="w-8 h-8 text-yellow-400 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
          </div>
          <h3 className="text-yellow-400 text-xl font-semibold mb-2">Problème de connexion</h3>
          <p className="text-gray-300 mb-4">Tentative de reconnexion en cours...</p>
          <div className="flex items-center justify-center gap-2">
            <div className="w-2 h-2 bg-yellow-500 rounded-full animate-pulse"></div>
            <div className="w-2 h-2 bg-yellow-500 rounded-full animate-pulse" style={{ animationDelay: '0.2s' }}></div>
            <div className="w-2 h-2 bg-yellow-500 rounded-full animate-pulse" style={{ animationDelay: '0.4s' }}></div>
          </div>
          <p className="text-sm text-gray-400 mt-4">
            Tentatives: {retryCount} • Prochaine tentative dans 5s
          </p>
        </div>
      </div>
    )
  }

  const Variation = ({ label, value }) => (
    <div className="flex items-center gap-1.5 text-sm">
      <span className="text-gray-400 font-medium">{label}</span>
      <span
        className={`font-semibold px-2.5 py-1 rounded-full text-xs ${value >= 0
            ? "bg-green-600/20 text-green-400"
            : "bg-red-600/20 text-red-400"
          }`}
      >
        {value?.toFixed(2)}%
      </span>
    </div>
  )

  const renderCard = (coin) => (
    <div
      key={coin.id}
      className="
        bg-[#2a2d3e] border border-[#3a3d4e] rounded-lg p-5 
        hover:border-[#3A6FF8]/50 hover:shadow-lg hover:shadow-[#3A6FF8]/10
        transition-all duration-200 group cursor-pointer
        transform hover:scale-[1.02] hover:-translate-y-1
      "
    >
      <div className="flex justify-between items-start mb-5">
        <div className="flex items-center gap-3">
          <div className="relative">
            <img
              src={coin.image}
              alt={coin.name}
              className="w-9 h-9 rounded-full"
            />
            <div className="absolute -top-1 -right-1 w-4 h-4 bg-[#3A6FF8] rounded-full flex items-center justify-center">
              <span className="text-xs font-bold text-white">#{coin.market_cap_rank}</span>
            </div>
          </div>
          <div>
            <h3 className="text-lg font-bold text-[#FeFeFe] group-hover:text-[#3A6FF8] transition-colors duration-200">
              {coin.name}
            </h3>
            <p className="text-sm text-gray-400 font-medium">
              {coin.symbol.toUpperCase()}
            </p>
          </div>
        </div>

        <div className="flex flex-col items-end gap-1.5">
          <Variation label="1h" value={coin.price_change_percentage_1h_in_currency} />
          <Variation label="24h" value={coin.price_change_percentage_24h_in_currency} />
          <Variation label="7j" value={coin.price_change_percentage_7d_in_currency} />
        </div>
      </div>

      <div className="mb-5">
        <div className="text-2xl font-bold text-[#FeFeFe] mb-1">
          {coin.current_price?.toLocaleString()} {currency === "eur" ? "€" : "$"}
        </div>
        <div className="text-sm text-gray-400">
          Cap. marché: {coin.market_cap?.toLocaleString()} {currency === "eur" ? "€" : "$"}
        </div>
        <div className="text-sm text-gray-400">
          Volume 24h: {coin.total_volume?.toLocaleString()} {currency === "eur" ? "€" : "$"}
        </div>
      </div>

      <div className="flex gap-2">
        <button className="flex-1 bg-red-500 hover:bg-red-600 text-white py-2 px-3 rounded-lg font-medium text-sm transition-all duration-200 transform hover:scale-105">
          Ajouter
        </button>
        <button className="flex-1 bg-[#3A6FF8] hover:bg-[#2952d3] text-white py-2 px-3 rounded-lg font-medium text-sm transition-all duration-200 transform hover:scale-105">
          Info
        </button>
      </div>
    </div>
  )

  return (
    <div className="min-h-screen bg-[#212332] text-[#FeFeFe]">
      {/* Barre d'outils responsive */}
      <div className="bg-[#1a1d29] border-b border-[#3a3d4e] sticky top-0 z-40 shadow-lg">
        <div className="w-full px-4 sm:px-6 py-3">
          <div className="bg-[#2a2d3e] rounded-lg border border-[#3a3d4e] overflow-hidden">
            {/* Version desktop - Plus compacte */}
            <div className="hidden md:flex items-center justify-between px-3 py-2 gap-4">
              <div className="flex items-center gap-4">
                {/* Tri et ordre groupés */}
                <div className="flex items-center gap-2">
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="bg-[#1a1d29] text-[#FeFeFe] border border-[#3a3d4e] rounded px-2 py-1.5 text-sm focus:ring-2 focus:ring-[#3A6FF8] focus:border-transparent transition-all duration-200 min-w-[120px]"
                  >
                    {sortOptions.map(option => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                  <select
                    value={sortOrder}
                    onChange={(e) => setSortOrder(e.target.value)}
                    className="bg-[#1a1d29] text-[#FeFeFe] border border-[#3a3d4e] rounded px-2 py-1.5 text-sm focus:ring-2 focus:ring-[#3A6FF8] focus:border-transparent transition-all duration-200 w-16"
                  >
                    <option value="desc">↓</option>
                    <option value="asc">↑</option>
                  </select>
                </div>

                {/* Devise */}
                <select
                  id="currency"
                  value={currency}
                  onChange={(e) => setCurrency(e.target.value)}
                  className="bg-[#1a1d29] text-[#FeFeFe] border border-[#3a3d4e] rounded px-2 py-1.5 text-sm focus:ring-2 focus:ring-[#3A6FF8] focus:border-transparent transition-all duration-200 w-16"
                >
                  <option value="eur">EUR</option>
                  <option value="usd">USD</option>
                </select>

                {/* Nombre d'éléments */}
                <div className="min-w-[70px]">
                  <CryptoSelector value={perPage} onChange={setPerPage} />
                </div>
              </div>

              {/* Indicateur de statut */}
              <div className="flex items-center gap-2 text-sm text-gray-400">
                <div className={`w-2 h-2 rounded-full ${
                  loading ? 'bg-yellow-500 animate-pulse' : 
                  isRetrying ? 'bg-orange-500 animate-pulse' : 
                  'bg-green-500'
                }`}></div>
                <span className="whitespace-nowrap text-xs">
                  {loading ? 'Sync...' : 
                   isRetrying ? `Retry ${retryCount}` : 
                   'Live'}
                </span>
              </div>
            </div>

            {/* Version mobile/tablette - Compacte */}
            <div className="md:hidden">
              <div className="flex items-center justify-between px-3 py-2 gap-2">
                <div className="flex items-center gap-2 flex-1">
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="bg-[#1a1d29] text-[#FeFeFe] border border-[#3a3d4e] rounded px-2 py-1.5 text-xs focus:ring-1 focus:ring-[#3A6FF8] focus:border-transparent transition-all duration-200 flex-1 min-w-0"
                  >
                    {sortOptions.map(option => (
                      <option key={option.value} value={option.value}>
                        {option.shortLabel}
                      </option>
                    ))}
                  </select>
                  <select
                    value={sortOrder}
                    onChange={(e) => setSortOrder(e.target.value)}
                    className="bg-[#1a1d29] text-[#FeFeFe] border border-[#3a3d4e] rounded px-2 py-1.5 text-xs focus:ring-1 focus:ring-[#3A6FF8] focus:border-transparent transition-all duration-200 w-12"
                  >
                    <option value="desc">↓</option>
                    <option value="asc">↑</option>
                  </select>
                </div>
                
                <div className="flex items-center gap-2">
                  <select
                    value={currency}
                    onChange={(e) => setCurrency(e.target.value)}
                    className="bg-[#1a1d29] text-[#FeFeFe] border border-[#3a3d4e] rounded px-2 py-1.5 text-xs focus:ring-1 focus:ring-[#3A6FF8] focus:border-transparent transition-all duration-200 w-12"
                  >
                    <option value="eur">€</option>
                    <option value="usd">$</option>
                  </select>
                  
                  <div className="min-w-[50px]">
                    <CryptoSelector value={perPage} onChange={setPerPage} />
                  </div>
                  
                  <div className="flex items-center gap-1">
                    <div className={`w-2 h-2 rounded-full ${
                      loading ? 'bg-yellow-500 animate-pulse' : 
                      isRetrying ? 'bg-orange-500 animate-pulse' : 
                      'bg-green-500'
                    }`}></div>
                    <span className="text-xs text-gray-400">
                      {isRetrying ? retryCount : ''}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Contenu principal */}
      <div className="max-w-7xl mx-auto px-6 py-6">
        {/* Notification de retry si les données sont affichées */}
        {isRetrying && cryptos.length > 0 && (
          <div className="mb-6 bg-orange-500/10 border border-orange-500/30 rounded-lg p-4 flex items-center gap-3">
            <div className="w-5 h-5 bg-orange-500/20 rounded-full flex items-center justify-center flex-shrink-0">
              <svg className="w-3 h-3 text-orange-400 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
            </div>
            <div className="flex-1">
              <p className="text-orange-400 text-sm font-medium">
                Problème de connexion détecté
              </p>
              <p className="text-gray-300 text-xs">
                Tentative de reconnexion {retryCount} • Prochaine tentative dans 5s
              </p>
            </div>
          </div>
        )}

        {/* Grille des cryptos */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5 mb-6">
          {getCurrentPageCryptos().map(renderCard)}
        </div>

        {/* Pagination uniforme */}
        <div className="flex justify-center items-center gap-3 mt-8">
          <button
            disabled={currentPage === 1}
            onClick={() => handlePageChange(Math.max(1, currentPage - 1))}
            className="bg-[#3a3d4e] hover:bg-[#4a4d5e] disabled:bg-[#2a2d3e] text-white px-4 py-2 rounded-lg font-medium text-sm transition-all duration-200 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            <span className="hidden sm:inline">Précédent</span>
          </button>

          <div className="flex items-center gap-2 px-3 py-2 bg-[#2a2d3e] rounded-lg border border-[#3a3d4e]">
            <span className="text-gray-300 text-sm">
              Page {currentPage}
            </span>
            <span className="text-xs text-gray-400">
              ({sortedCryptos.length} résultats)
            </span>
          </div>

          <button
            disabled={sortedCryptos.length === 0 || (perPage !== "all" && sortedCryptos.length < (typeof perPage === 'number' ? perPage : 6))}
            onClick={() => handlePageChange(currentPage + 1)}
            className="bg-[#3A6FF8] hover:bg-[#2952d3] disabled:bg-[#2a2d3e] text-white px-4 py-2 rounded-lg font-medium text-sm transition-all duration-200 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            <span className="hidden sm:inline">Suivant</span>
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  )
}