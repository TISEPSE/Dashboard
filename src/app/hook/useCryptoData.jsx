import { useState, useEffect, useRef } from "react"
import axios from "axios"

const cryptoAPI = axios.create({
  baseURL: "https://api.coingecko.com/api/v3",
  timeout: 20000, // Timeout plus élevé pour les grosses requêtes
  headers: { 
    "Content-Type": "application/json",
    "Accept": "application/json"
  },
})

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
  const [allCryptos, setAllCryptos] = useState([]) // Cache complet
  const [displayedCryptos, setDisplayedCryptos] = useState([]) // Données affichées
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [retryCount, setRetryCount] = useState(0)
  const [isRetrying, setIsRetrying] = useState(false)
  const [lastFetch, setLastFetch] = useState(null)
  const cacheRef = useRef({})

  // Clé de cache unique par devise
  const getCacheKey = () => `crypto_${currency}`

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

  // Fetch complet de toutes les cryptos (250 premières)
  const fetchAllCryptos = async (isRetry = false) => {
    try {
      setLoading(true)
      setError(null)
      if (isRetry) {
        setIsRetrying(true)
      }

      const cacheKey = getCacheKey()
      const now = Date.now()
      
      // Vérifier le cache (valide pendant 2 minutes)
      if (cacheRef.current[cacheKey] && 
          (now - cacheRef.current[cacheKey].timestamp) < 120000) {
        console.log("📦 Utilisation du cache pour", cacheKey)
        setAllCryptos(cacheRef.current[cacheKey].data)
        setLastFetch(new Date(cacheRef.current[cacheKey].timestamp))
        setRetryCount(0)
        setIsRetrying(false)
        setLoading(false)
        return
      }

      console.log("🌐 Fetch complet des cryptos pour", cacheKey)
      
      const response = await cryptoAPI.get("/coins/markets", {
        params: {
          vs_currency: currency,
          order: "market_cap_desc",
          per_page: 250, // Toujours charger 250 cryptos
          page: 1,
          price_change_percentage: "1h,24h,7d",
          sparkline: false,
          include_market_cap: true,
          include_24hr_vol: true,
          include_24hr_change: true,
          include_last_updated_at: false
        }
      })

      const cryptoData = response.data
      
      // Mettre en cache
      cacheRef.current[cacheKey] = {
        data: cryptoData,
        timestamp: now
      }
      
      setAllCryptos(cryptoData)
      setLastFetch(new Date(now))
      setRetryCount(0)
      setIsRetrying(false)
      
      console.log(`✅ ${cryptoData.length} cryptos chargées et mises en cache`)
      
    } catch (err) {
      setError(err.message)
      setRetryCount(prev => prev + 1)
      console.error("Erreur lors du chargement des cryptos:", err)
      
      // Retry plus agressif
      const shouldRetry = err.code === "ECONNABORTED" || 
                         err.response?.status >= 500 || 
                         err.code === "NETWORK_ERROR" ||
                         err.message?.includes("Network Error") ||
                         err.message?.includes("timeout") ||
                         !err.response
      
      if (shouldRetry && retryCount < 5) {
        setIsRetrying(true)
        const retryDelay = Math.min(3000 + (retryCount * 2000), 15000) // 3s, 5s, 7s, 9s, 11s
        
        setTimeout(() => {
          fetchAllCryptos(true)
        }, retryDelay)
      } else {
        setIsRetrying(false)
      }
    } finally {
      setLoading(false)
    }
  }

  // Filtrer et paginer les données du cache
  const processDisplayedCryptos = () => {
    if (allCryptos.length === 0) return

    // Trier d'abord
    const sortedData = sortCryptos(allCryptos)
    
    if (perPage === "all") {
      // Mode "Tout" : pagination par tranches de 50
      const startIndex = (currentPage - 1) * 50
      const endIndex = startIndex + 50
      setDisplayedCryptos(sortedData.slice(startIndex, endIndex))
    } else {
      // Modes spécifiques : afficher exactement le nombre demandé
      const itemsPerPage = typeof perPage === 'number' ? perPage : 6
      setDisplayedCryptos(sortedData.slice(0, itemsPerPage))
    }
  }

  // Effet pour charger les données initiales
  useEffect(() => {
    fetchAllCryptos()
  }, [currency]) // Seulement quand la devise change

  // Effet pour traiter l'affichage
  useEffect(() => {
    processDisplayedCryptos()
  }, [allCryptos, perPage, currentPage, sortBy, sortOrder])

  // Auto-refresh périodique (toutes les 30 secondes)
  useEffect(() => {
    const interval = setInterval(() => {
      if (!isRetrying && !loading) {
        console.log("🔄 Auto-refresh du cache (temps réel)")
        fetchAllCryptos()
      }
    }, 30000) // 30 secondes pour du temps réel
    
    return () => clearInterval(interval)
  }, [currency, isRetrying, loading])

  return {
    cryptos: displayedCryptos,
    loading,
    error,
    retryCount,
    isRetrying,
    refetch: fetchAllCryptos,
    isPaginationEnabled: perPage === "all",
    totalCryptos: allCryptos.length,
    lastFetch,
    // Informations sur le cache
    cacheStatus: {
      isCached: !!cacheRef.current[getCacheKey()],
      cacheAge: lastFetch ? Math.round((Date.now() - lastFetch.getTime()) / 1000) : null
    }
  }
}