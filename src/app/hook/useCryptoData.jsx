import { useState, useEffect, useRef, useCallback } from "react"
import axios from "axios"

const cryptoAPI = axios.create({
  baseURL: "https://api.coingecko.com/api/v3",
  timeout: 20000, // Timeout plus élevé pour les grosses requêtes
  headers: { 
    "Content-Type": "application/json",
    "Accept": "application/json"
  },
})

// Correspondance symbole -> ID CoinGecko
const symbolToId = {
  'BTC': 'bitcoin',
  'ETH': 'ethereum',
  'BNB': 'binancecoin',
  'XRP': 'ripple',
  'ADA': 'cardano',
  'DOGE': 'dogecoin',
  'SOL': 'solana',
  'TRX': 'tron',
  'TON': 'the-open-network',
  'AVAX': 'avalanche-2',
  'SHIB': 'shiba-inu',
  'DOT': 'polkadot',
  'LINK': 'chainlink',
  'MATIC': 'matic-network',
  'LTC': 'litecoin',
  'BCH': 'bitcoin-cash',
  'ICP': 'internet-computer',
  'XLM': 'stellar',
  'UNI': 'uniswap',
  'ATOM': 'cosmos',
  'FIL': 'filecoin',
  'ALGO': 'algorand',
  'VET': 'vechain',
  'HBAR': 'hedera-hashgraph',
  'APT': 'aptos',
  'MANA': 'decentraland',
  'SAND': 'the-sandbox',
  'NEAR': 'near',
  'THETA': 'theta-token',
  'EGLD': 'elrond-erd-2',
  'FLOW': 'flow',
  'AXS': 'axie-infinity',
  'ENJ': 'enjincoin',
  'GALA': 'gala',
  'CHZ': 'chiliz',
  'MANA': 'decentraland',
  'CRO': 'crypto-com-chain',
  'FTM': 'fantom',
  'AAVE': 'aave',
  'GRT': 'the-graph',
  'COMP': 'compound-coin',
  'MKR': 'maker',
  'YFI': 'yearn-finance',
  'SUSHI': 'sushi',
  'SNX': 'havven',
  'CRV': 'curve-dao-token',
  'BAL': 'balancer',
  'ZRX': '0x',
  'KNC': 'kyber-network',
  'LEND': 'ethlend',
  'MANA': 'decentraland',
  'BAT': 'basic-attention-token',
  'ZIL': 'zilliqa',
  'REP': 'augur',
  'STORJ': 'storj',
  'BNT': 'bancor',
  'POLY': 'polymath',
  'POWR': 'power-ledger',
  'MTL': 'metal',
  'LOOM': 'loom-network',
  'DENT': 'dent',
  'REN': 'republic-protocol',
  'CELR': 'celer-network',
  'CTSI': 'cartesi',
  'BAND': 'band-protocol',
  'OCEAN': 'ocean-protocol',
  'LRC': 'loopring',
  'IOTX': 'iotex',
  'ANKR': 'ankr',
  'AUDIO': 'audius',
  'MASK': 'mask-network',
  'NKN': 'nkn',
  'CTXC': 'cortex',
  'DUSK': 'dusk-network',
  'PERL': 'perlin',
  'RUNE': 'thorchain',
  'ALPHA': 'alpha-finance',
  'SXP': 'swipe',
  'CAKE': 'pancakeswap-token',
  'AUTO': 'auto',
  'BAKE': 'bakerytoken',
  'BURGER': 'burger-swap',
  'SPARTA': 'spartan-protocol-token',
  'TWT': 'trust-wallet-token',
  'SFP': 'safemoon',
  'DODO': 'dodo',
  'REEF': 'reef-finance',
  'ALICE': 'my-neighbor-alice',
  'TLM': 'alien-worlds',
  'SLP': 'smooth-love-potion',
  'PYR': 'vulcan-forged',
  'BETA': 'beta-finance',
  'RAMP': 'ramp',
  'HARD': 'kava-lend',
  'DEGO': 'dego-finance',
  'NULS': 'nuls',
  'CHR': 'chromaway',
  'UNFI': 'unifi-protocol-dao',
  'CVP': 'concentrated-voting-power',
  'FOR': 'forta',
  'PUNDIX': 'pundi-x-2',
  'LINA': 'linear',
  'EPIK': 'epik-prime',
  'CHESS': 'tranchess',
  'PROS': 'prosper',
  'FIRO': 'zcoin',
  'VITE': 'vite',
  'HIGH': 'highstreet',
  'MOVR': 'moonriver',
  'GLMR': 'moonbeam',
  'KAVA': 'kava',
  'SCRT': 'secret',
  'ROSE': 'oasis-network',
  'KEEP': 'keep-network',
  'NU': 'nucypher',
  'BADGER': 'badger-dao',
  'FARM': 'harvest-finance',
  'IDLE': 'idle',
  'COVER': 'cover-protocol',
  'PICKLE': 'pickle-finance',
  'VALUE': 'value-liquidity',
  'CREAM': 'cream-2',
  'AKRO': 'akropolis',
  'HEGIC': 'hegic',
  'RARI': 'rarible',
  'BOND': 'barnbridge',
  'ALPHA': 'alpha-finance',
  'COMBO': 'furucombo',
  'INDEX': 'index-cooperative',
  'ARMOR': 'armor',
  'DOUGH': 'piedao-dough-v2',
  'SWRV': 'swerve',
  'BASED': 'based-money',
  'WBTC': 'wrapped-bitcoin',
  'WETH': 'weth',
  'USDC': 'usd-coin',
  'USDT': 'tether',
  'BUSD': 'binance-usd',
  'DAI': 'dai',
  'TUSD': 'true-usd',
  'PAX': 'paxos-standard',
  'HUSD': 'husd',
  'GUSD': 'gemini-dollar',
  'SUSD': 'nusd',
  'DUSD': 'dusd',
  'MUSD': 'musd',
  'OUSD': 'origin-dollar',
  'LUSD': 'liquity-usd',
  'FRAX': 'frax',
  'FEI': 'fei-protocol',
  'TRIBE': 'tribe-2',
  'RAI': 'rai',
  'FLOAT': 'float-protocol-float',
  'BANK': 'float-protocol-bank',
  'AMPL': 'ampleforth',
  'SPELL': 'spell-token',
  'ICE': 'ice-token',
  'TIME': 'wonderland',
  'MEMO': 'wonderland',
  'BOBA': 'boba-network',
  'METIS': 'metis-token',
  'SYN': 'synapse-2',
  'NOIA': 'noia-network',
  'POLS': 'polkastarter',
  'OM': 'mantra-dao',
  'SAND': 'the-sandbox',
  'MANA': 'decentraland',
  'AXS': 'axie-infinity',
  'SLP': 'smooth-love-potion',
  'ALICE': 'my-neighbor-alice',
  'TLM': 'alien-worlds',
  'WIN': 'wink',
  'BTT': 'bittorrent-2',
  'JST': 'just',
  'SUN': 'sun-token',
  'NFT': 'apenft',
  'REEF': 'reef-finance',
  'DODO': 'dodo',
  'CAKE': 'pancakeswap-token',
  'BUNNY': 'pancake-bunny',
  'BURGER': 'burger-swap',
  'SPARTA': 'spartan-protocol-token',
  'AUTO': 'auto',
  'BAKE': 'bakerytoken',
  'HARD': 'kava-lend',
  'SWP': 'kava-swap',
  'USDX': 'usdx',
  'XVS': 'venus',
  'VAI': 'vai',
  'BTCB': 'bitcoin-bep2',
  'BETH': 'binance-eth',
  'LTC': 'litecoin',
  'BCH': 'bitcoin-cash',
  'XLM': 'stellar',
  'VET': 'vechain',
  'FIL': 'filecoin',
  'THETA': 'theta-token',
  'TRX': 'tron',
  'EOS': 'eos',
  'IOTA': 'iota',
  'XTZ': 'tezos',
  'DASH': 'dash',
  'XMR': 'monero',
  'ETC': 'ethereum-classic',
  'NEO': 'neo',
  'QTUM': 'qtum',
  'ONT': 'ontology',
  'ZEC': 'zcash',
  'WAVES': 'waves',
  'ICX': 'icon',
  'LSK': 'lisk',
  'ZIL': 'zilliqa',
  'BAT': 'basic-attention-token',
  'NANO': 'nano',
  'DGB': 'digibyte',
  'SC': 'siacoin',
  'ZEN': 'zencash',
  'DOGE': 'dogecoin',
  'XRP': 'ripple'
}

cryptoAPI.interceptors.response.use(
  response => response,
  error => {
    // Gestion sécurisée des erreurs
    try {
      if (error.code === "ECONNABORTED") {
        console.warn("Timeout: La requête a pris trop de temps")
      } else if (error.response?.status === 429) {
        console.warn("Rate limit atteint, veuillez réessayer dans 60 secondes")
      } else if (error.response?.status >= 500) {
        console.warn("Erreur serveur CoinGecko")
      } else if (error.code === "NETWORK_ERROR") {
        console.warn("Erreur réseau, vérifiez votre connexion")
      } else if (error.message) {
        console.warn("Erreur API:", error.message)
      }
    } catch (logError) {
      // Ignorer les erreurs de logging
    }
    return Promise.reject(error)
  }
)

export const useCryptoData = (currency, perPage, currentPage, sortBy, sortOrder, favoritesList = []) => {
  const [allCryptos, setAllCryptos] = useState([]) // Cache complet
  const [favoriteCryptos, setFavoriteCryptos] = useState([]) // Cache des favoris
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

  // Fetch spécifique des favoris - utilise les données déjà chargées
  const fetchFavoriteCryptos = useCallback(async (isRetry = false) => {
    if (favoritesList.length === 0) {
      setFavoriteCryptos([])
      return
    }
    
    console.log("🌐 Filtrage des favoris depuis allCryptos")
    console.log("Favoris recherchés:", favoritesList.map(f => f.symbol))
    console.log("Cryptos disponibles:", allCryptos.slice(0, 5).map(c => c.symbol))
    
    // Filtrer les cryptos depuis allCryptos basé sur les symboles des favoris
    const favoriteSymbols = favoritesList.map(fav => fav.symbol.toUpperCase())
    const filteredFavorites = allCryptos.filter(crypto => 
      favoriteSymbols.includes(crypto.symbol.toUpperCase())
    )
    
    console.log("✅ Favoris trouvés:", filteredFavorites.map(f => f.symbol))
    
    setFavoriteCryptos(filteredFavorites)
    
  }, [favoritesList, allCryptos])

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
      const errorMessage = err?.message || "Erreur inconnue lors du chargement"
      setError(errorMessage)
      setRetryCount(prev => prev + 1)
      console.warn("Erreur lors du chargement des cryptos:", errorMessage)
      
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
  const processDisplayedCryptos = useCallback((isShowingFavorites = false) => {
    const sourceData = isShowingFavorites ? favoriteCryptos : allCryptos
    if (sourceData.length === 0) return

    // Trier d'abord
    const sortedData = sortCryptos(sourceData)
    
    if (perPage === "all") {
      // Mode "Tout" : pagination par tranches de 40 (pour desktop)
      const startIndex = (currentPage - 1) * 40
      const endIndex = startIndex + 40
      setDisplayedCryptos(sortedData.slice(startIndex, endIndex))
    } else {
      // Modes spécifiques : afficher exactement le nombre demandé
      const itemsPerPage = typeof perPage === 'number' ? perPage : 6
      setDisplayedCryptos(sortedData.slice(0, itemsPerPage))
    }
  }, [allCryptos, favoriteCryptos, perPage, currentPage, sortBy, sortOrder])

  // Effet pour charger les données initiales
  useEffect(() => {
    fetchAllCryptos()
  }, [currency]) // Seulement quand la devise change

  // Effet pour charger les favoris
  useEffect(() => {
    if (favoritesList.length > 0 && allCryptos.length > 0) {
      fetchFavoriteCryptos()
    }
  }, [favoritesList, allCryptos, fetchFavoriteCryptos]) // Quand les favoris ou allCryptos changent

  // Effet pour traiter l'affichage
  useEffect(() => {
    processDisplayedCryptos(false) // Toujours afficher les données normales par défaut
  }, [allCryptos, perPage, currentPage, sortBy, sortOrder, processDisplayedCryptos])

  // Effet pour traiter l'affichage des favoris
  useEffect(() => {
    if (favoriteCryptos.length > 0) {
      // Ne pas remplacer l'affichage automatiquement
    }
  }, [favoriteCryptos, perPage, currentPage, sortBy, sortOrder, processDisplayedCryptos])

  // Auto-refresh périodique silencieux (toutes les 2 minutes)
  useEffect(() => {
    const interval = setInterval(() => {
      if (!isRetrying && !loading) {
        console.log("🔄 Auto-refresh silencieux du cache")
        // Fetch silencieux sans changer l'état de loading
        fetchAllCryptosSilently()
      }
    }, 120000) // 2 minutes pour respecter les limites API
    
    return () => clearInterval(interval)
  }, [currency, isRetrying, loading])

  // Fonction de refresh silencieux avec mise à jour granulaire
  const fetchAllCryptosSilently = async () => {
    try {
      setError(null)
      
      const cacheKey = getCacheKey()
      const now = Date.now()
      
      console.log("🌐 Fetch silencieux des cryptos pour", cacheKey)
      
      const response = await cryptoAPI.get("/coins/markets", {
        params: {
          vs_currency: currency,
          order: "market_cap_desc",
          per_page: 250,
          page: 1,
          price_change_percentage: "1h,24h,7d",
          sparkline: false,
          include_market_cap: true,
          include_24hr_vol: true,
          include_24hr_change: true,
          include_last_updated_at: false
        }
      })

      const newCryptoData = response.data
      
      // Mise à jour granulaire : ne changer que si les données sont différentes
      setAllCryptos(prevCryptos => {
        // Vérifier s'il y a des changements significatifs
        const hasChanges = prevCryptos.length === 0 || 
          newCryptoData.some((newCoin, index) => {
            const oldCoin = prevCryptos[index]
            return !oldCoin || 
              oldCoin.current_price !== newCoin.current_price ||
              oldCoin.price_change_percentage_24h_in_currency !== newCoin.price_change_percentage_24h_in_currency ||
              oldCoin.market_cap !== newCoin.market_cap ||
              oldCoin.total_volume !== newCoin.total_volume
          })
        
        if (hasChanges) {
          console.log(`🔄 Mise à jour granulaire de ${newCryptoData.length} cryptos`)
          return newCryptoData
        } else {
          console.log("📊 Aucun changement détecté, pas de mise à jour")
          return prevCryptos
        }
      })
      
      // Mettre en cache
      cacheRef.current[cacheKey] = {
        data: newCryptoData,
        timestamp: now
      }
      
      setLastFetch(new Date(now))
      setRetryCount(0)
      
    } catch (err) {
      console.warn("Erreur lors du refresh silencieux:", err?.message || "Erreur inconnue")
      // En cas d'erreur silencieuse, on ne change pas l'état d'erreur
    }
  }

  return {
    cryptos: displayedCryptos,
    allCryptos,
    favoriteCryptos,
    loading,
    error,
    retryCount,
    isRetrying,
    refetch: fetchAllCryptos,
    fetchFavorites: fetchFavoriteCryptos,
    processDisplayedCryptos,
    isPaginationEnabled: perPage === "all", // Pagination activée en mode "tout"
    totalCryptos: allCryptos.length,
    lastFetch,
    // Informations sur le cache
    cacheStatus: {
      isCached: !!cacheRef.current[getCacheKey()],
      cacheAge: lastFetch ? Math.round((Date.now() - lastFetch.getTime()) / 1000) : null
    }
  }
}