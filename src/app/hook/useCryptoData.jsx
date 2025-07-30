import { useState, useEffect, useRef, useCallback } from "react"
import axios from "axios"

const cryptoAPI = axios.create({
  baseURL: "https://api.coingecko.com/api/v3",
  timeout: 20000,
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

export const useCryptoData = (currency, currentPage, sortBy, sortOrder, favoritesList = [], searchQuery = '') => {
  const [allCryptos, setAllCryptos] = useState([]) // Les 250 cryptos
  const [displayedCryptos, setDisplayedCryptos] = useState([]) // Page actuelle après tri/filtre
  const [favoriteCryptos, setFavoriteCryptos] = useState([]) // Cache des favoris
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [retryCount, setRetryCount] = useState(0)
  const [isRetrying, setIsRetrying] = useState(false)
  const [lastFetch, setLastFetch] = useState(null)
  const [isRefreshing, setIsRefreshing] = useState(false) // Refresh silencieux
  const cacheRef = useRef({})
  
  const ITEMS_PER_PAGE = 40

  // Clé de cache unique par devise
  const getCacheKey = () => `crypto_${currency}`

  // Tri côté client
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

  // Filtrage par recherche
  const filterBySearch = (cryptosList) => {
    if (!searchQuery.trim()) return cryptosList
    
    const query = searchQuery.toLowerCase()
    return cryptosList.filter(crypto => 
      crypto.name.toLowerCase().includes(query) ||
      crypto.symbol.toLowerCase().includes(query)
    )
  }

  // Fetch spécifique des favoris
  const fetchFavoriteCryptos = useCallback(() => {
    if (favoritesList.length === 0 || allCryptos.length === 0) {
      setFavoriteCryptos([])
      return
    }
    
    const favoriteSymbols = favoritesList.map(fav => fav.symbol.toUpperCase())
    const filteredFavorites = allCryptos.filter(crypto => 
      favoriteSymbols.includes(crypto.symbol.toUpperCase())
    )
    
    setFavoriteCryptos(filteredFavorites)
  }, [favoritesList, allCryptos])

  // Fetch des 250 cryptos
  const fetchAllCryptos = async (isRetry = false, isRefresh = false) => {
    try {
      if (!isRefresh) {
        setLoading(true)
        setError(null)
      } else {
        setIsRefreshing(true)
      }
      
      if (isRetry) {
        setIsRetrying(true)
      }

      const cacheKey = getCacheKey()
      const now = Date.now()
      
      // Pour le refresh, ignorer le cache ; sinon vérifier le cache (5 minutes)
      if (!isRefresh && cacheRef.current[cacheKey] && 
          (now - cacheRef.current[cacheKey].timestamp) < 300000) {
        setAllCryptos(cacheRef.current[cacheKey].data)
        setLastFetch(new Date(cacheRef.current[cacheKey].timestamp))
        setRetryCount(0)
        setIsRetrying(false)
        setLoading(false)
        return
      }

      const logPrefix = isRefresh ? "🔄 Refresh" : "🌐 Fetch"
      
      const response = await fetch(`/api/crypto?vs_currency=${currency}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        }
      })
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`)
      }

      const cryptoData = await response.json()
      
      // Mettre en cache
      cacheRef.current[cacheKey] = {
        data: cryptoData,
        timestamp: now
      }
      
      // Pour le refresh, mise à jour silencieuse seulement si il y a des changements
      if (isRefresh) {
        setAllCryptos(prevCryptos => {
          const hasChanges = prevCryptos.length === 0 || 
            cryptoData.some((newCoin, index) => {
              const oldCoin = prevCryptos[index]
              return !oldCoin || 
                oldCoin.current_price !== newCoin.current_price ||
                oldCoin.price_change_percentage_24h !== newCoin.price_change_percentage_24h ||
                oldCoin.market_cap !== newCoin.market_cap
            })
          
          if (hasChanges) {
            return cryptoData
          } else {
            return prevCryptos
          }
        })
      } else {
        setAllCryptos(cryptoData)
      }
      
      setLastFetch(new Date(now))
      setRetryCount(0)
      setIsRetrying(false)
      
      if (!isRefresh) {
      }
      
    } catch (err) {
      if (!isRefresh) {
        let errorMessage = "Erreur inconnue lors du chargement"
        
        // Messages d'erreur plus spécifiques selon le type d'erreur
        if (err?.message?.includes('HTTP 429')) {
          errorMessage = "Limite de requêtes atteinte. Données temporairement indisponibles."
        } else if (err?.message?.includes('HTTP 503')) {
          errorMessage = "Service temporairement indisponible. Veuillez réessayer plus tard."
        } else if (err?.message?.includes('HTTP')) {
          errorMessage = "Erreur de connexion avec l'API CoinGecko. Certaines données peuvent être manquantes."
        } else if (err?.message?.includes('NetworkError') || err?.message?.includes('fetch')) {
          errorMessage = "Erreur de réseau. Vérifiez votre connexion internet."
        } else {
          errorMessage = err?.message || errorMessage
        }
        
        setError(errorMessage)
        setRetryCount(prev => prev + 1)
        console.warn("Erreur lors du chargement des cryptos:", errorMessage)
        
        if (retryCount < 3) {
          setIsRetrying(true)
          const retryDelay = Math.min(2000 + (retryCount * 1000), 5000)
          
          setTimeout(() => {
            fetchAllCryptos(true, isRefresh)
          }, retryDelay)
        } else {
          setIsRetrying(false)
        }
      } else {
        console.warn("Erreur refresh silencieux:", err?.message)
      }
    } finally {
      if (!isRefresh) {
        setLoading(false)
      } else {
        setIsRefreshing(false)
      }
    }
  }

  // Effet pour charger les 250 cryptos
  useEffect(() => {
    fetchAllCryptos()
  }, [currency]) // Seulement quand la devise change

  // Effet pour charger les favoris
  useEffect(() => {
    fetchFavoriteCryptos()
  }, [favoritesList, allCryptos, fetchFavoriteCryptos])

  // Effet pour traiter l'affichage (recherche + tri + pagination côté client)
  useEffect(() => {
    if (allCryptos.length === 0) {
      setDisplayedCryptos([])
      return
    }

    let processedCryptos = allCryptos
    
    // 1. Filtrer par recherche
    processedCryptos = filterBySearch(processedCryptos)
    
    // 2. Trier
    processedCryptos = sortCryptos(processedCryptos)
    
    // 3. Paginer
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE
    const endIndex = startIndex + ITEMS_PER_PAGE
    const paginatedCryptos = processedCryptos.slice(startIndex, endIndex)
    
    setDisplayedCryptos(paginatedCryptos)
  }, [allCryptos, currentPage, sortBy, sortOrder, searchQuery])

  // Auto-refresh périodique silencieux
  useEffect(() => {
    const interval = setInterval(() => {
      if (!isRetrying && !loading && !isRefreshing) {
        fetchAllCryptos(false, true) // isRefresh = true
      }
    }, 120000) // 2 minutes
    
    return () => clearInterval(interval)
  }, [currency, isRetrying, loading, isRefreshing])

  return {
    cryptos: displayedCryptos,
    allCryptos,
    favoriteCryptos,
    loading,
    error,
    retryCount,
    isRetrying,
    isRefreshing,
    refetch: () => fetchAllCryptos(),
    fetchFavorites: fetchFavoriteCryptos,
    isPaginationEnabled: true, // Pagination toujours activée
    itemsPerPage: ITEMS_PER_PAGE,
    totalCryptos: allCryptos.length,
    filteredCryptosCount: filterBySearch(allCryptos).length,
    maxCryptos: 250, // Limite CoinGecko
    lastFetch,
    // Informations sur le cache
    cacheStatus: {
      isCached: !!cacheRef.current[getCacheKey()],
      cacheAge: lastFetch ? Math.round((Date.now() - lastFetch.getTime()) / 1000) : null
    }
  }
}