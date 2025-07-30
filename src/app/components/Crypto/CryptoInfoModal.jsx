"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { FaTimes, FaExternalLinkAlt, FaChartLine, FaCoins, FaGlobe, FaReddit, FaTwitter, FaGithub } from "react-icons/fa"
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts"

const CryptoInfoModal = ({ isOpen, onClose, coin, currency }) => {
  const [historicalData, setHistoricalData] = useState(null)
  const [selectedTimeframe, setSelectedTimeframe] = useState('7')
  const [loading, setLoading] = useState(false)
  const [detailedInfo, setDetailedInfo] = useState(null)

  // État de chargement pour éviter les requêtes multiples simultanées
  const [requestInProgress, setRequestInProgress] = useState(false)
  
  // Réinitialiser les données quand le modal s'ouvre
  useEffect(() => {
    if (isOpen && coin?.id) {
      setHistoricalData(null)
      setDetailedInfo(null)
      setLoading(true)
    }
  }, [isOpen, coin?.id])

  // Récupérer les données détaillées de la crypto
  useEffect(() => {
    const fetchDetailedData = async () => {
      if (!coin?.id || requestInProgress || !isOpen) return
      
      // Force le rechargement à chaque ouverture du modal - pas de cache
      
      setRequestInProgress(true)
      setLoading(true)
      
      try {
        // Requêtes séquentielles pour éviter rate limiting
        let priceData = null
        let detailData = null
        
        try {
          // Ajouter un timestamp pour forcer le rechargement
          const timestamp = Date.now()
          
          // Première requête - données de graphique
          const priceResponse = await fetch(
            `/api/crypto/${coin.id}?vs_currency=${currency}&days=${selectedTimeframe}&type=chart&_t=${timestamp}`,
            { 
              cache: 'no-store',
              headers: { 'Cache-Control': 'no-cache' }
            }
          )
          
          if (priceResponse.ok) {
            priceData = await priceResponse.json()
          }
          
          // Deuxième requête - données détaillées
          const detailResponse = await fetch(
            `/api/crypto/${coin.id}?vs_currency=${currency}&type=details&_t=${timestamp}`,
            { 
              cache: 'no-store',
              headers: { 'Cache-Control': 'no-cache' }
            }
          )
          
          if (detailResponse.ok) {
            detailData = await detailResponse.json()
          }
          
        } catch (fetchError) {
          console.warn('Erreur lors des requêtes:', fetchError)
        }
        
        // Si échec des deux requêtes principales, utiliser les données de base
        if (!priceData && !detailData) {
          throw new Error('Impossible de récupérer les données')
        }

        // Utiliser les données disponibles avec fallback intelligent
        const enhancedDetailData = detailData ? {
          ...detailData,
          market_data: {
            ...detailData.market_data,
            // Compléter avec les données de base si nécessaire
            circulating_supply: detailData.market_data?.circulating_supply || coin.circulating_supply,
            max_supply: detailData.market_data?.max_supply || coin.max_supply,
            total_supply: detailData.market_data?.total_supply || coin.total_supply,
            market_cap: detailData.market_data?.market_cap || { [currency]: coin.market_cap },
            total_volume: detailData.market_data?.total_volume || { [currency]: coin.total_volume },
            fully_diluted_valuation: detailData.market_data?.fully_diluted_valuation || { [currency]: coin.fully_diluted_valuation },
            atl: detailData.market_data?.atl || { [currency]: coin.atl }
          },
          // Scores par défaut si manquants
          developer_score: detailData.developer_score || 75,
          community_score: detailData.community_score || 70,
          coingecko_rank: detailData.coingecko_rank || detailData.market_cap_rank || coin.market_cap_rank
        } : {
          // Fallback complet si pas de données détaillées
          market_data: {
            circulating_supply: coin.circulating_supply,
            max_supply: coin.max_supply,
            total_supply: coin.total_supply,
            market_cap: { [currency]: coin.market_cap },
            total_volume: { [currency]: coin.total_volume },
            fully_diluted_valuation: { [currency]: coin.fully_diluted_valuation },
            atl: { [currency]: coin.atl },
            price_change_percentage_7d: coin.price_change_percentage_7d,
            price_change_percentage_30d: coin.price_change_percentage_30d_in_currency,
            price_change_percentage_1y: coin.price_change_percentage_1y_in_currency
          },
          developer_score: 75,
          community_score: 70,
          coingecko_rank: coin.market_cap_rank,
          links: {
            homepage: ['#'],
            twitter_screen_name: null,
            subreddit_url: null
          }
        }
        
        // Formater les données pour les graphiques avec optimisation
        const formattedData = priceData?.prices ? priceData.prices.map((item, index) => ({
          timestamp: item[0],
          date: new Date(item[0]).toLocaleDateString(),
          time: new Date(item[0]).toLocaleTimeString(),
          price: item[1],
          volume: priceData.total_volumes?.[index]?.[1] || 0,
          marketCap: priceData.market_caps?.[index]?.[1] || 0,
        })) : []
        
        // Pas de mise en cache - rechargement à chaque ouverture
        
        setHistoricalData(formattedData)
        setDetailedInfo(enhancedDetailData)
      } catch (error) {
        console.warn('Erreur lors du chargement des données:', error.message)
        
        // Fallback avec les données de base de la crypto
        const fallbackData = {
          market_data: {
            circulating_supply: coin.circulating_supply,
            max_supply: coin.max_supply,
            total_supply: coin.total_supply,
            market_cap: { [currency]: coin.market_cap },
            total_volume: { [currency]: coin.total_volume },
            fully_diluted_valuation: { [currency]: coin.fully_diluted_valuation },
            atl: { [currency]: coin.atl },
            price_change_percentage_7d: coin.price_change_percentage_7d,
            price_change_percentage_30d: coin.price_change_percentage_30d_in_currency,
            price_change_percentage_1y: coin.price_change_percentage_1y_in_currency
          },
          developer_score: 75,
          community_score: 70,
          coingecko_rank: coin.market_cap_rank,
          links: {
            homepage: ['#'],
            twitter_screen_name: null,
            subreddit_url: null
          }
        }
        
        setDetailedInfo(fallbackData)
        setHistoricalData([])
      } finally {
        setLoading(false)
        setRequestInProgress(false)
      }
    }

    if (isOpen && coin?.id) {
      fetchDetailedData()
    }
  }, [coin?.id, currency, selectedTimeframe, isOpen])

  // Empêcher le scroll de l'arrière-plan quand le modal est ouvert
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'unset'
    }

    // Cleanup: restaurer le scroll quand le composant est démonté
    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [isOpen])

  // Détection mobile
  const [isMobile, setIsMobile] = useState(false)
  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768)
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  // Formater les nombres avec option mobile/desktop
  const formatNumber = (num, decimals = 2, forceAbbreviation = false) => {
    if (!num && num !== 0) return 'Indisponible'
    
    const numValue = parseFloat(num)
    if (isNaN(numValue)) return 'Indisponible'
    
    // Sur mobile ou si forceé, utiliser format abrégé
    if (isMobile || forceAbbreviation) {
      if (numValue >= 1e12) return `${(numValue / 1e12).toFixed(decimals)}T`
      if (numValue >= 1e9) return `${(numValue / 1e9).toFixed(decimals)}B`
      if (numValue >= 1e6) return `${(numValue / 1e6).toFixed(decimals)}M`
      if (numValue >= 1e3) return `${(numValue / 1e3).toFixed(decimals)}K`
    }
    
    // Desktop: format complet avec séparateurs
    return numValue.toLocaleString('fr-FR', { 
      maximumFractionDigits: decimals, 
      minimumFractionDigits: decimals > 0 ? Math.min(decimals, 2) : 0 
    })
  }

  // Formater les nombres avec devise
  const formatNumberWithCurrency = (num, decimals = 2, forceAbbreviation = false) => {
    if (!num && num !== 0) return 'Indisponible'
    
    const numValue = parseFloat(num)
    if (isNaN(numValue)) return 'Indisponible'
    
    const currencySymbols = {
      'eur': '€',
      'usd': '$',
      'btc': '₿',
      'eth': 'Ξ',
      'gbp': '£',
      'jpy': '¥',
      'cad': 'C$',
      'aud': 'A$',
      'chf': 'CHF',
      'cny': '¥'
    }
    
    const symbol = currencySymbols[currency.toLowerCase()] || currency.toUpperCase()
    const formattedNum = formatNumber(numValue, decimals, forceAbbreviation)
    
    if (formattedNum === 'Indisponible') return 'Indisponible'
    
    // Pour certaines devises, le symbole va après
    if (['eur', 'chf'].includes(currency.toLowerCase())) {
      return `${formattedNum} ${symbol}`
    } else {
      return `${symbol}${formattedNum}`
    }
  }

  // Formater le prix
  const formatPrice = (price) => {
    if (!price && price !== 0) return 'Indisponible'
    const priceValue = parseFloat(price)
    if (isNaN(priceValue)) return 'Indisponible'
    
    try {
      return new Intl.NumberFormat('fr-FR', {
        style: 'currency',
        currency: currency.toUpperCase(),
        minimumFractionDigits: priceValue < 1 ? 6 : 2,
        maximumFractionDigits: priceValue < 1 ? 6 : 2
      }).format(priceValue)
    } catch (e) {
      // Fallback si la devise n'est pas supportée
      const symbol = currency === 'eur' ? '€' : '$'
      return `${priceValue.toFixed(priceValue < 1 ? 6 : 2)} ${symbol}`
    }
  }

  // Tooltip personnalisé cohérent
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-gradient-to-br from-[#2a2d3e] to-[#212332] border border-gray-600/40 rounded-lg p-3 shadow-2xl backdrop-blur-md">
          <div className="text-gray-300 text-xs sm:text-sm mb-2 font-medium">{new Date(parseInt(label)).toLocaleString()}</div>
          {payload.map((entry, index) => (
            <div key={index} className="text-xs sm:text-sm font-bold text-white flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-blue-500 block" />
              <span>{entry.name}: {entry.name === 'price' ? formatPrice(entry.value) : formatNumber(entry.value)}</span>
            </div>
          ))}
        </div>
      )
    }
    return null
  }

  if (!isOpen) return null

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[9999] flex items-center justify-center p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          className="bg-gradient-to-br from-[#2a2d3e] to-[#212332] rounded-3xl max-w-6xl w-full max-h-[95vh] overflow-y-auto overflow-x-hidden shadow-2xl border border-gray-600/20 scrollbar-hide"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header cohérent mobile-friendly */}
          <div className="sticky top-0 bg-gradient-to-r from-[#2a2d3e] to-[#212332] border-b border-gray-600/20 p-4 sm:p-6 z-10 backdrop-blur-sm">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div className="flex items-center gap-3 sm:gap-4 min-w-0 flex-1">
                <img 
                  src={coin.image} 
                  alt={coin.name}
                  className="w-10 h-10 sm:w-12 sm:h-12 rounded-full shadow-lg object-cover border border-blue-500/30 flex-shrink-0"
                />
                <div className="min-w-0 flex-1">
                  <h2 className="text-lg sm:text-2xl font-bold text-white truncate">{coin.name}</h2>
                  <div className="flex items-center gap-2 sm:gap-3 text-xs sm:text-sm">
                    <span className="text-blue-300 font-medium">{coin.symbol?.toUpperCase()}</span>
                    <span className={`px-2 py-1 rounded-full text-xs text-white whitespace-nowrap ${
                      coin.market_cap_rank <= 3 
                        ? 'bg-gradient-to-r from-yellow-500 to-amber-600'
                        : coin.market_cap_rank <= 10
                        ? 'bg-gradient-to-r from-emerald-500 to-green-600'
                        : coin.market_cap_rank <= 50
                        ? 'bg-gradient-to-r from-blue-500 to-indigo-600'
                        : 'bg-gradient-to-r from-slate-500 to-gray-600'
                    }`}>#{coin.market_cap_rank}</span>
                  </div>
                </div>
              </div>
              <div className="text-left sm:text-right flex-shrink-0">
                <p className="text-xl sm:text-3xl font-bold text-white">{formatPrice(coin.current_price)}</p>
                <p className={`text-sm font-medium ${coin.price_change_percentage_24h >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                  {coin.price_change_percentage_24h >= 0 ? '+' : ''}{coin.price_change_percentage_24h?.toFixed(2)}% (24h)
                </p>
              </div>
              <button
                onClick={onClose}
                className="absolute top-4 right-4 sm:relative sm:top-0 sm:right-0 p-2 rounded-full hover:bg-gray-700/50 transition-colors text-gray-400 hover:text-white"
              >
                <FaTimes size={16} className="sm:w-5 sm:h-5" />
              </button>
            </div>
          </div>

          <div className="p-4 sm:p-6 bg-gradient-to-br from-[#212332]/30 to-[#1a1d29]/20">
            {/* Layout responsive */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
            
              {/* Colonne 1: Graphique principal */}
              <div className="lg:col-span-2">
                {/* Contrôles de période - Mobile optimized */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4 sm:mb-6">
                  <h3 className="text-lg sm:text-xl font-bold text-white">Évolution du Prix</h3>
                  
                  {/* Version mobile avec sélecteur dropdown */}
                  <div className="sm:hidden">
                    <select 
                      value={selectedTimeframe}
                      onChange={(e) => setSelectedTimeframe(e.target.value)}
                      className="w-full bg-gradient-to-r from-[#2a2d3e] to-[#252837] border border-gray-600/30 rounded-xl px-4 py-3 text-white text-sm font-medium appearance-none focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50"
                      style={{
                        backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='m6 8 4 4 4-4'/%3e%3c/svg%3e")`,
                        backgroundPosition: 'right 0.75rem center',
                        backgroundRepeat: 'no-repeat',
                        backgroundSize: '1.5em 1.5em',
                      }}
                    >
                      <option value="1">1 Jour</option>
                      <option value="7">7 Jours</option>
                      <option value="30">1 Mois</option>
                      <option value="90">3 Mois</option>
                      <option value="365">1 Année</option>
                    </select>
                  </div>

                  {/* Version desktop avec boutons */}
                  <div className="hidden sm:flex flex-wrap gap-1 p-1 bg-gradient-to-r from-[#2a2d3e] to-[#252837] rounded-lg border border-gray-600/30">
                    {[
                      { label: '1J', value: '1' },
                      { label: '7J', value: '7' },
                      { label: '1M', value: '30' },
                      { label: '3M', value: '90' },
                      { label: '1A', value: '365' }
                    ].map((timeframe) => (
                      <button
                        key={timeframe.value}
                        onClick={() => setSelectedTimeframe(timeframe.value)}
                        className={`px-3 sm:px-4 py-2 rounded-md text-xs sm:text-sm font-medium transition-all ${
                          selectedTimeframe === timeframe.value
                            ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-lg'
                            : 'text-gray-300 hover:bg-gray-700/50 hover:text-white'
                        }`}
                      >
                        {timeframe.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Graphique optimisé pleine largeur */}
                <div className="bg-gradient-to-br from-[#2a2d3e] to-[#252837] rounded-2xl p-1 sm:p-2 shadow-lg border border-gray-600/20">
                  {loading ? (
                    <div className="h-64 sm:h-80 lg:h-[350px] flex items-center justify-center">
                      <div className="animate-spin rounded-full h-8 w-8 border-2 border-blue-500 border-t-transparent"></div>
                    </div>
                  ) : historicalData && historicalData.length > 0 ? (
                    <ResponsiveContainer width="100%" height={isMobile ? 280 : 350}>
                      <AreaChart data={historicalData} margin={{ top: 5, right: isMobile ? 2 : 2, left: isMobile ? 2 : 2, bottom: 5 }}>
                        <defs>
                          <linearGradient id="priceGradient" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.5}/>
                            <stop offset="50%" stopColor="#1D4ED8" stopOpacity={0.3}/>
                            <stop offset="95%" stopColor="#1E40AF" stopOpacity={0.1}/>
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="#4B5563" opacity={0.3} />
                        <XAxis 
                          dataKey="timestamp" 
                          tickFormatter={(value) => new Date(value).toLocaleDateString('fr-FR', { 
                            month: 'short', 
                            day: 'numeric' 
                          })}
                          stroke="#9CA3AF"
                          fontSize={isMobile ? 10 : 12}
                          axisLine={false}
                          tickLine={false}
                          interval={isMobile ? 'preserveStartEnd' : 'preserveStart'}
                        />
                        <YAxis 
                          tickFormatter={(value) => {
                            if (isMobile) {
                              if (value >= 1000) return `${(value/1000).toFixed(0)}k`
                              if (value >= 1) return value.toFixed(2)
                              return value.toFixed(6)
                            } else {
                              // Desktop: format compact pour économiser l'espace
                              if (value >= 1000) return `${(value/1000).toFixed(1)}k`
                              if (value >= 1) return value.toFixed(2)
                              return value.toFixed(4)
                            }
                          }}
                          stroke="#9CA3AF"
                          fontSize={isMobile ? 9 : 10}
                          axisLine={false}
                          tickLine={false}
                          width={isMobile ? 50 : 65}
                          tickCount={6}
                        />
                        <Tooltip content={<CustomTooltip />} />
                        <Area 
                          type="monotone" 
                          dataKey="price" 
                          stroke="#3B82F6" 
                          strokeWidth={3}
                          fillOpacity={1} 
                          fill="url(#priceGradient)" 
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="h-80 sm:h-96 lg:h-[500px] flex items-center justify-center text-gray-400">
                      Données indisponibles
                    </div>
                  )}
                </div>

                {/* Métriques essentielles avec valeurs complètes */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 mt-4 sm:mt-6">
                  <div className="bg-gradient-to-br from-[#2a2d3e] to-[#252837] rounded-xl p-4 shadow-lg border border-green-500/20">
                    <div className="text-sm text-green-400 mb-1">Capitalisation</div>
                    <div className="text-base sm:text-lg font-bold text-white break-words">{formatNumberWithCurrency(coin.market_cap, 0, isMobile)}</div>
                  </div>
                  <div className="bg-gradient-to-br from-[#2a2d3e] to-[#252837] rounded-xl p-4 shadow-lg border border-blue-500/20">
                    <div className="text-sm text-blue-400 mb-1">Volume 24h</div>
                    <div className="text-base sm:text-lg font-bold text-white break-words">{formatNumberWithCurrency(coin.total_volume, 0, isMobile)}</div>
                  </div>
                </div>
              </div>

              {/* Colonne 2: Informations clés colorées */}
              <div className="space-y-4 sm:space-y-6">
                {/* Performance avec couleurs cohérentes */}
                <div className="bg-gradient-to-br from-[#2a2d3e] to-[#252837] rounded-xl p-4 sm:p-6 shadow-lg border border-amber-500/20">
                  <h4 className="text-base sm:text-lg font-bold text-white mb-3 sm:mb-4 flex items-center gap-2">
                    <div className="w-2 h-2 bg-amber-500 rounded-full"></div>
                    Performance
                  </h4>
                  <div className="space-y-3 sm:space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-300 text-sm sm:text-base">24 heures</span>
                      <span className={`font-bold text-sm sm:text-base ${coin.price_change_percentage_24h >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                        {coin.price_change_percentage_24h >= 0 ? '+' : ''}{coin.price_change_percentage_24h?.toFixed(2)}%
                      </span>
                    </div>
                    {detailedInfo?.market_data?.price_change_percentage_7d && (
                      <div className="flex justify-between items-center">
                        <span className="text-gray-300 text-sm sm:text-base">7 jours</span>
                        <span className={`font-bold text-sm sm:text-base ${detailedInfo.market_data.price_change_percentage_7d >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                          {detailedInfo.market_data.price_change_percentage_7d >= 0 ? '+' : ''}{detailedInfo.market_data.price_change_percentage_7d.toFixed(2)}%
                        </span>
                      </div>
                    )}
                    {detailedInfo?.market_data?.price_change_percentage_30d && (
                      <div className="flex justify-between items-center">
                        <span className="text-gray-300 text-sm sm:text-base">30 jours</span>
                        <span className={`font-bold text-sm sm:text-base ${detailedInfo.market_data.price_change_percentage_30d >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                          {detailedInfo.market_data.price_change_percentage_30d >= 0 ? '+' : ''}{detailedInfo.market_data.price_change_percentage_30d.toFixed(2)}%
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Statistiques avec couleurs améliorées */}
                <div className="bg-gradient-to-br from-[#2a2d3e] to-[#252837] rounded-xl p-4 sm:p-6 shadow-lg border border-purple-500/20">
                  <h4 className="text-base sm:text-lg font-bold text-white mb-3 sm:mb-4 flex items-center gap-2">
                    <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                    Statistiques
                  </h4>
                  <div className="space-y-3 sm:space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-purple-200 text-sm sm:text-base font-medium">Rang</span>
                      <span className="font-bold text-purple-100 text-sm sm:text-base bg-purple-900/30 px-2 py-1 rounded-md">#{coin.market_cap_rank}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-purple-200 text-sm sm:text-base font-medium">ATH</span>
                      <span className="font-bold text-emerald-300 text-sm sm:text-base bg-emerald-900/20 px-2 py-1 rounded-md">{formatPrice(coin.ath)}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-purple-200 text-sm sm:text-base font-medium">ATL</span>
                      <span className="font-bold text-red-300 text-sm sm:text-base bg-red-900/20 px-2 py-1 rounded-md">{formatPrice(coin.atl || 0)}</span>
                    </div>
                  </div>
                </div>

                {/* Offre avec valeurs complètes */}
                {detailedInfo?.market_data && (
                  <div className="bg-gradient-to-br from-[#2a2d3e] to-[#252837] rounded-xl p-4 sm:p-6 shadow-lg border border-emerald-500/20">
                    <h4 className="text-base sm:text-lg font-bold text-white mb-3 sm:mb-4 flex items-center gap-2">
                      <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>
                      Offre
                    </h4>
                    <div className="space-y-3 sm:space-y-4">
                      <div className="flex justify-between items-center">
                        <span className="text-gray-300 text-sm sm:text-base">Circulante</span>
                        <span className="font-bold text-white text-xs sm:text-sm break-words text-right">
                          {formatNumber(detailedInfo.market_data.circulating_supply, 0, isMobile)}
                        </span>
                      </div>
                      {detailedInfo.market_data.max_supply && (
                        <>
                          <div className="flex justify-between items-center">
                            <span className="text-gray-300 text-sm sm:text-base">Maximum</span>
                            <span className="font-bold text-white text-xs sm:text-sm break-words text-right">
                              {formatNumber(detailedInfo.market_data.max_supply, 0, isMobile)}
                            </span>
                          </div>
                          <div className="mt-3">
                            <div className="flex justify-between text-xs sm:text-sm text-gray-300 mb-2">
                              <span>Progression</span>
                              <span className="font-bold">{((detailedInfo.market_data.circulating_supply / detailedInfo.market_data.max_supply) * 100).toFixed(1)}%</span>
                            </div>
                            <div className="w-full bg-gray-700 rounded-full h-2">
                              <div 
                                className="bg-gradient-to-r from-emerald-500 to-emerald-400 h-2 rounded-full transition-all duration-500"
                                style={{ width: `${(detailedInfo.market_data.circulating_supply / detailedInfo.market_data.max_supply) * 100}%` }}
                              />
                            </div>
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                )}

                {/* Liens rapides cohérents */}
                {detailedInfo?.links && (
                  <div className="bg-gradient-to-br from-[#2a2d3e] to-[#252837] rounded-xl p-4 sm:p-6 shadow-lg border border-indigo-500/20">
                    <h4 className="text-base sm:text-lg font-bold text-white mb-3 sm:mb-4 flex items-center gap-2">
                      <div className="w-2 h-2 bg-indigo-500 rounded-full"></div>
                      Liens
                    </h4>
                    <div className="space-y-2 sm:space-y-3">
                      {detailedInfo.links?.homepage?.[0] && (
                        <a 
                          href={detailedInfo.links.homepage[0]} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="flex items-center justify-between p-3 bg-gray-700/30 rounded-lg hover:bg-gray-600/40 transition-all border border-gray-600/20 hover:border-blue-500/40"
                        >
                          <div className="flex items-center gap-2 sm:gap-3">
                            <FaGlobe className="text-blue-400 text-sm sm:text-base" />
                            <span className="text-white font-medium text-sm sm:text-base">Site officiel</span>
                          </div>
                          <FaExternalLinkAlt className="text-gray-400" size={12} />
                        </a>
                      )}
                      {detailedInfo.links?.twitter_screen_name && (
                        <a 
                          href={`https://twitter.com/${detailedInfo.links.twitter_screen_name}`} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="flex items-center justify-between p-3 bg-gray-700/30 rounded-lg hover:bg-gray-600/40 transition-all border border-gray-600/20 hover:border-blue-400/40"
                        >
                          <div className="flex items-center gap-2 sm:gap-3">
                            <FaTwitter className="text-blue-400 text-sm sm:text-base" />
                            <span className="text-white font-medium text-sm sm:text-base">Twitter</span>
                          </div>
                          <FaExternalLinkAlt className="text-gray-400" size={12} />
                        </a>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}

export default CryptoInfoModal