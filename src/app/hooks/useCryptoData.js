import { useState, useEffect, useCallback } from 'react'

export function useCryptoData(currency = 'usd', currentPage = 1, sortBy = 'market_cap', sortOrder = 'desc', favorites = [], searchQuery = '') {
  const [cryptos, setCryptos] = useState([])
  const [favoriteCryptos, setFavoriteCryptos] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [retryCount, setRetryCount] = useState(0)
  const [isRetrying, setIsRetrying] = useState(false)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [lastFetch, setLastFetch] = useState(null)
  const [cacheStatus, setCacheStatus] = useState('fresh')

  // Configuration
  const itemsPerPage = 50
  const maxCryptos = 250
  const isPaginationEnabled = true

  const fetchCryptoData = useCallback(async (isRetry = false) => {
    if (isRetry) {
      setIsRetrying(true)
    } else {
      setLoading(true)
    }
    setError(null)

    try {
      const queryParams = new URLSearchParams({
        vs_currency: currency,
        order: `${sortBy}_${sortOrder}`,
        per_page: itemsPerPage.toString(),
        page: currentPage.toString(),
        sparkline: 'false',
        price_change_percentage: '24h,7d'
      })

      const response = await fetch(
        `https://api.coingecko.com/api/v3/coins/markets?${queryParams}`
      )

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const cryptoData = await response.json()
      
      // Filtrer par recherche si nécessaire
      const filteredData = searchQuery 
        ? cryptoData.filter(crypto => 
            crypto.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            crypto.symbol.toLowerCase().includes(searchQuery.toLowerCase())
          )
        : cryptoData

      setCryptos(filteredData)
      setLastFetch(Date.now())
      setCacheStatus('fresh')
      setRetryCount(0)
    } catch (err) {
      console.error('Erreur lors de la récupération des données crypto:', err)
      setError(err.message)
      setRetryCount(prev => prev + 1)
    } finally {
      setLoading(false)
      setIsRetrying(false)
      setIsRefreshing(false)
    }
  }, [currency, currentPage, sortBy, sortOrder, searchQuery])

  const fetchFavorites = useCallback(() => {
    if (!favorites.length || !cryptos.length) {
      setFavoriteCryptos([])
      return
    }

    console.log('🔍 [CRYPTO-DATA] Filtrage des favoris:', { favorites, cryptosCount: cryptos.length })

    // Filtrer les cryptos par leur symbol
    const favoriteData = cryptos.filter(crypto => 
      favorites.includes(crypto.symbol.toLowerCase())
    )
    
    console.log('✅ [CRYPTO-DATA] Favoris trouvés:', favoriteData.length, favoriteData.map(c => c.symbol))
    setFavoriteCryptos(favoriteData)
  }, [favorites, cryptos])

  const refetch = useCallback((isRetry = false) => {
    fetchCryptoData(isRetry)
  }, [fetchCryptoData])

  // Charger les données au montage et quand les paramètres changent
  useEffect(() => {
    fetchCryptoData()
  }, [fetchCryptoData])

  // Charger les favoris quand ils changent ou quand les cryptos sont chargés
  useEffect(() => {
    fetchFavorites()
  }, [fetchFavorites])

  return {
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
    cacheStatus
  }
}