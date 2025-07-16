import { useState, useEffect } from "react"
import axios from "axios"

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

export const useCryptoData = (currency, perPage, currentPage, sortBy, sortOrder) => {
  const [cryptos, setCryptos] = useState([])
  const [sortedCryptos, setSortedCryptos] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [retryCount, setRetryCount] = useState(0)
  const [isRetrying, setIsRetrying] = useState(false)

  // Paramètres API
  const getApiParams = () => {
    if (perPage === "all") {
      return {
        perPageParam: 50,
        pageParam: currentPage
      }
    } else {
      const itemsPerPage = typeof perPage === 'number' ? perPage : 6
      return {
        perPageParam: itemsPerPage,
        pageParam: currentPage
      }
    }
  }

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

  // Fetch des données
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
      setRetryCount(0)
      setIsRetrying(false)
    } catch (err) {
      setError(err.message)
      setRetryCount(prev => prev + 1)
      console.error("Erreur lors du chargement des cryptos:", err)
      
      // Auto-retry sur les erreurs réseau
      if (err.code === "ECONNABORTED" || 
          err.response?.status >= 500 || 
          err.code === "NETWORK_ERROR" ||
          err.message?.includes("Network Error") ||
          err.message?.includes("timeout") ||
          !err.response) {
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

  // Effet pour trier les cryptos
  useEffect(() => {
    if (cryptos.length > 0) {
      setSortedCryptos(sortCryptos(cryptos))
    }
  }, [cryptos, sortBy, sortOrder])

  // Effet pour fetch les données
  useEffect(() => {
    fetchCryptos()
  }, [currentPage, perPage, currency])

  // Auto-refresh
  useEffect(() => {
    const interval = setInterval(() => {
      fetchCryptos()
    }, 10000)
    return () => clearInterval(interval)
  }, [currentPage, perPage, currency])

  return {
    cryptos: sortedCryptos,
    loading,
    error,
    retryCount,
    isRetrying,
    refetch: fetchCryptos
  }
}