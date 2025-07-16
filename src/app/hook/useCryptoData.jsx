import { useState, useEffect } from "react"
import axios from "axios"

const cryptoAPI = axios.create({
  baseURL: "https://api.coingecko.com/api/v3",
  timeout: 12000, // Timeout par défaut augmenté
  headers: { 
    "Content-Type": "application/json",
    "Accept": "application/json"
  },
})

cryptoAPI.interceptors.request.use(
  config => {
    // Ajouter un délai anti-spam
    const now = Date.now()
    const lastRequest = cryptoAPI.lastRequest || 0
    const timeSinceLastRequest = now - lastRequest
    
    if (timeSinceLastRequest < 1000) { // Minimum 1 seconde entre les requêtes
      return new Promise(resolve => {
        setTimeout(() => {
          cryptoAPI.lastRequest = Date.now()
          resolve(config)
        }, 1000 - timeSinceLastRequest)
      })
    }
    
    cryptoAPI.lastRequest = now
    return config
  },
  error => Promise.reject(error)
)

cryptoAPI.interceptors.response.use(
  response => response,
  error => {
    if (error.code === "ECONNABORTED") {
      console.error("Timeout: La requête a pris trop de temps")
    } else if (error.response?.status === 429) {
      console.error("Rate limit atteint, veuillez réessayer dans 60 secondes")
    } else if (error.response?.status >= 500) {
      console.error("Erreur serveur CoinGecko")
    } else if (error.code === "NETWORK_ERROR") {
      console.error("Erreur réseau, vérifiez votre connexion")
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
      // Pour les choix spécifiques (6, 12, 24), on charge toujours depuis la page 1
      const itemsPerPage = typeof perPage === 'number' ? perPage : 6
      return {
        perPageParam: itemsPerPage,
        pageParam: 1
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

  // Fetch des données avec optimisations réseau
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
          // Optimisations pour réduire la charge réseau
          sparkline: false,
          include_market_cap: true,
          include_24hr_vol: true,
          include_24hr_change: true,
          include_last_updated_at: false
        },
        // Optimisations supplémentaires
        timeout: perPage === "all" ? 15000 : 10000, // Plus de temps pour le mode "Tout"
        headers: {
          "Content-Type": "application/json",
          "Cache-Control": "public, max-age=30" // Cache pendant 30 secondes
        }
      })

      setCryptos(response.data)
      setRetryCount(0)
      setIsRetrying(false)
    } catch (err) {
      setError(err.message)
      setRetryCount(prev => prev + 1)
      console.error("Erreur lors du chargement des cryptos:", err)
      
      // Retry plus agressif pour le mode "Tout"
      const shouldRetry = err.code === "ECONNABORTED" || 
                         err.response?.status >= 500 || 
                         err.code === "NETWORK_ERROR" ||
                         err.message?.includes("Network Error") ||
                         err.message?.includes("timeout") ||
                         !err.response
      
      if (shouldRetry) {
        setIsRetrying(true)
        // Délai adaptatif selon le nombre de tentatives
        const retryDelay = perPage === "all" ? 
          Math.min(5000 + (retryCount * 2000), 15000) : // 5s, 7s, 9s, 11s, 13s, 15s max
          5000
        
        setTimeout(() => {
          fetchCryptos(true)
        }, retryDelay)
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
  }, [perPage, currency, sortBy, sortOrder]) // Ajout de sortBy et sortOrder

  // Effet pour fetch les données quand currentPage change SEULEMENT en mode "all"
  useEffect(() => {
    if (perPage === "all") {
      fetchCryptos()
    }
  }, [currentPage])

  // Auto-refresh optimisé
  useEffect(() => {
    // Intervalle adaptatif selon le mode
    const refreshInterval = perPage === "all" ? 15000 : 10000 // 15s pour "Tout", 10s pour les autres
    
    const interval = setInterval(() => {
      // Éviter les refresh si on est déjà en retry
      if (!isRetrying) {
        fetchCryptos()
      }
    }, refreshInterval)
    
    return () => clearInterval(interval)
  }, [currentPage, perPage, currency, sortBy, sortOrder, isRetrying])

  return {
    cryptos: sortedCryptos,
    loading,
    error,
    retryCount,
    isRetrying,
    refetch: fetchCryptos,
    isPaginationEnabled: perPage === "all" // Nouvelle propriété pour savoir si la pagination est active
  }
}