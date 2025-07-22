"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { FaTimes, FaExternalLinkAlt, FaChartLine, FaCoins, FaGlobe, FaReddit, FaTwitter, FaGithub } from "react-icons/fa"
import { LineChart, Line, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, BarChart, Bar } from "recharts"

const CryptoInfoModal = ({ isOpen, onClose, coin, currency }) => {
  const [historicalData, setHistoricalData] = useState(null)
  const [selectedTimeframe, setSelectedTimeframe] = useState('7')
  const [loading, setLoading] = useState(false)
  const [detailedInfo, setDetailedInfo] = useState(null)

  // Cache local pour éviter les requêtes répétées
  const [dataCache, setDataCache] = useState(new Map())
  const [requestInProgress, setRequestInProgress] = useState(false)
  
  // Récupérer les données détaillées de la crypto
  useEffect(() => {
    const fetchDetailedData = async () => {
      if (!coin?.id || requestInProgress) return
      
      // Vérifier le cache (10 minutes)
      const cacheKey = `${coin.id}_${currency}_${selectedTimeframe}`
      const cached = dataCache.get(cacheKey)
      if (cached && (Date.now() - cached.timestamp) < 600000) {
        console.log('📦 Utilisation du cache modal pour', coin.id)
        setHistoricalData(cached.historicalData)
        setDetailedInfo(cached.detailedInfo)
        return
      }
      
      setRequestInProgress(true)
      setLoading(true)
      
      try {
        // Requêtes séquentielles pour éviter rate limiting
        let priceData = null
        let detailData = null
        
        try {
          // Première requête - données de graphique
          const priceResponse = await fetch(
            `/api/crypto/${coin.id}?vs_currency=${currency}&days=${selectedTimeframe}&type=chart`
          )
          
          if (priceResponse.ok) {
            priceData = await priceResponse.json()
          }
          
          // Deuxième requête - données détaillées
          const detailResponse = await fetch(
            `/api/crypto/${coin.id}?vs_currency=${currency}&type=details`
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
        
        // Mettre en cache les résultats
        const newCache = new Map(dataCache)
        newCache.set(cacheKey, {
          historicalData: formattedData,
          detailedInfo: enhancedDetailData,
          timestamp: Date.now()
        })
        
        // Nettoyer le cache ancien (garder seulement 10 entrées)
        if (newCache.size > 10) {
          const oldestKey = Array.from(newCache.keys())[0]
          newCache.delete(oldestKey)
        }
        
        setDataCache(newCache)
        
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

    if (isOpen && coin) {
      fetchDetailedData()
    }
  }, [coin?.id, currency, selectedTimeframe, isOpen])

  // Données pour le graphique de répartition
  const allocationData = detailedInfo?.market_data ? [
    {
      name: 'Supply Circulant',
      value: detailedInfo.market_data.circulating_supply || 0,
      color: '#3B82F6'
    },
    {
      name: 'Supply Total',
      value: (detailedInfo.market_data.total_supply || 0) - (detailedInfo.market_data.circulating_supply || 0),
      color: '#1F2937'
    }
  ] : []

  // Détection mobile
  const [isMobile, setIsMobile] = useState(false)
  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768)
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  // Formater les nombres
  const formatNumber = (num, decimals = 2) => {
    if (!num && num !== 0) return 'Indisponible'
    
    // Format complet sur desktop, abrégé sur mobile
    if (isMobile) {
      if (num >= 1e12) return `${(num / 1e12).toFixed(decimals)}T`
      if (num >= 1e9) return `${(num / 1e9).toFixed(decimals)}B`
      if (num >= 1e6) return `${(num / 1e6).toFixed(decimals)}M`
      if (num >= 1e3) return `${(num / 1e3).toFixed(decimals)}K`
    }
    
    return num.toLocaleString('fr-FR', { maximumFractionDigits: decimals })
  }

  // Formater les nombres avec devise
  const formatNumberWithCurrency = (num, decimals = 2) => {
    if (!num && num !== 0) return 'Indisponible'
    
    const currencySymbols = {
      'eur': '€',
      'usd': '$',
      'btc': '₿',
      'eth': 'Ξ',
      'gbp': '£',
      'jpy': '¥',
      'cad': 'C$',
      'aud': 'A$',
      'chf': 'CHF ',
      'cny': '¥'
    }
    
    const symbol = currencySymbols[currency.toLowerCase()] || currency.toUpperCase()
    const formattedNum = formatNumber(num, decimals)
    
    if (formattedNum === 'Indisponible') return 'Indisponible'
    
    // Pour certaines devises, le symbole va après
    if (['eur', 'chf'].includes(currency.toLowerCase())) {
      return `${formattedNum} ${symbol}`
    } else {
      return `${symbol} ${formattedNum}`
    }
  }

  // Formater le prix
  const formatPrice = (price) => {
    if (!price && price !== 0) return 'Indisponible'
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: currency.toUpperCase(),
      minimumFractionDigits: price < 1 ? 6 : 2,
      maximumFractionDigits: price < 1 ? 6 : 2
    }).format(price)
  }

  // Tooltip personnalisé pour les graphiques
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-gray-900/95 backdrop-blur-sm border border-gray-600/50 rounded-lg p-3 shadow-xl">
          <p className="text-gray-300 text-sm mb-1">{new Date(parseInt(label)).toLocaleString()}</p>
          {payload.map((entry, index) => (
            <p key={index} className="text-sm" style={{ color: entry.color }}>
              {entry.name}: {entry.name === 'price' ? formatPrice(entry.value) : formatNumber(entry.value)}
            </p>
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
        className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[100] flex items-center justify-center p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          className="bg-gradient-to-br from-[#2a2d3e] to-[#212332] rounded-2xl border border-gray-600/30 max-w-7xl w-full max-h-[95vh] overflow-y-auto overflow-x-hidden shadow-2xl"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="sticky top-0 bg-gradient-to-r from-[#2a2d3e] to-[#212332] border-b border-gray-600/30 p-6 flex items-center justify-between backdrop-blur-sm z-10">
            <div className="flex items-center gap-4">
              <img 
                src={coin.image} 
                alt={coin.name}
                className="w-12 h-12 rounded-full shadow-lg object-cover object-center"
              />
              <div>
                <h2 className="text-2xl font-bold text-white">{coin.name}</h2>
                <div className="flex items-center gap-2">
                  <span className="text-gray-400 text-lg">{coin.symbol?.toUpperCase()}</span>
                  <span className="text-gray-500">#{coin.market_cap_rank}</span>
                </div>
              </div>
              <div className="text-right">
                <p className="text-3xl font-bold text-white">{formatPrice(coin.current_price)}</p>
                <p className={`text-lg ${coin.price_change_percentage_24h >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                  {coin.price_change_percentage_24h?.toFixed(2)}% (24h)
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-3 rounded-full bg-gray-800/50 hover:bg-gray-700/50 transition-colors text-gray-400 hover:text-white"
            >
              <FaTimes size={20} />
            </button>
          </div>

          <div className="p-3 sm:p-6 overflow-x-hidden">
            {/* Message d'alerte pour données manquantes */}
            {(!coin.current_price && coin.current_price !== 0) && (
              <div className="mb-6 bg-gradient-to-r from-orange-900/30 to-red-900/30 border border-orange-500/30 rounded-2xl p-6 shadow-xl">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-orange-600/30 rounded-xl flex items-center justify-center">
                    <svg className="w-6 h-6 text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                    </svg>
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-orange-300 mb-1">
                      Données temporairement indisponibles
                    </h3>
                    <p className="text-orange-200/80 text-sm">
                      Certaines informations de prix sont momentanément indisponibles en raison de limitations d'API. 
                      Veuillez recharger la page ou revenir plus tard pour obtenir les données complètes.
                    </p>
                  </div>
                </div>
              </div>
            )}
            
            {/* Section 1: Graphique et contrôles */}
            <div className="mb-6 sm:mb-8">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 sm:mb-6">
                <h3 className="text-xl font-bold text-white mb-4 sm:mb-0">Évolution du Prix</h3>
                <div className="flex flex-wrap gap-2">
                  {[
                    { label: '1h', value: '0.04' },
                    { label: '24h', value: '1' },
                    { label: '7j', value: '7' },
                    { label: '1M', value: '30' },
                    { label: '3M', value: '90' },
                    { label: '6M', value: '180' },
                    { label: '1A', value: '365' }
                  ].map((timeframe) => (
                    <button
                      key={timeframe.value}
                      onClick={() => setSelectedTimeframe(timeframe.value)}
                      className={`px-2 sm:px-3 py-1 rounded-lg text-xs sm:text-sm font-medium transition-all ${
                        selectedTimeframe === timeframe.value
                          ? 'bg-blue-600 text-white'
                          : 'bg-gray-800 text-gray-400 hover:bg-gray-700 hover:text-white'
                      }`}
                    >
                      {timeframe.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="bg-gray-900/50 rounded-xl p-2 sm:p-4 border border-gray-600/20">
                {loading ? (
                  <div className={`${isMobile ? 'h-40' : 'h-56'} flex items-center justify-center`}>
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                  </div>
                ) : historicalData && historicalData.length > 0 ? (
                  <ResponsiveContainer width="100%" height={isMobile ? 160 : 220}>
                    <AreaChart data={historicalData} margin={{ top: 5, right: isMobile ? 5 : 30, left: isMobile ? 5 : 20, bottom: 5 }}>
                      <defs>
                        <linearGradient id="priceGradient" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.8}/>
                          <stop offset="95%" stopColor="#3B82F6" stopOpacity={0.1}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                      <XAxis 
                        dataKey="timestamp" 
                        tickFormatter={(value) => {
                          if (isMobile) {
                            return new Date(value).toLocaleDateString('fr-FR', { 
                              day: 'numeric',
                              month: 'numeric'
                            })
                          }
                          return new Date(value).toLocaleDateString('fr-FR', { 
                            month: 'short', 
                            day: 'numeric' 
                          })
                        }}
                        stroke="#9CA3AF"
                        fontSize={isMobile ? 10 : 12}
                        tick={{ fill: '#9CA3AF' }}
                        interval={isMobile ? 'preserveStartEnd' : 0}
                        tickCount={isMobile ? 4 : 7}
                      />
                      <YAxis 
                        tickFormatter={(value) => {
                          if (isMobile) {
                            if (value >= 1e6) return `${(value/1e6).toFixed(1)}M`
                            if (value >= 1e3) return `${(value/1e3).toFixed(1)}K`
                            if (value >= 1) return value.toFixed(1)
                            if (value >= 0.01) return value.toFixed(3)
                            return value.toFixed(5)
                          }
                          if (value >= 1000) return `${(value/1000).toFixed(0)}k`
                          if (value >= 1) return value.toFixed(2)
                          if (value >= 0.01) return value.toFixed(4)
                          return value.toFixed(6)
                        }}
                        stroke="#9CA3AF"
                        fontSize={isMobile ? 9 : 12}
                        tick={{ fill: '#9CA3AF' }}
                        width={isMobile ? 50 : 80}
                        tickCount={isMobile ? 4 : 6}
                      />
                      <Tooltip content={<CustomTooltip />} />
                      <Area 
                        type="monotone" 
                        dataKey="price" 
                        stroke="#3B82F6" 
                        strokeWidth={isMobile ? 1.5 : 2}
                        fillOpacity={1} 
                        fill="url(#priceGradient)" 
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                ) : (
                  <div className={`${isMobile ? 'h-40' : 'h-56'} flex items-center justify-center text-gray-500`}>
                    Aucune donnée disponible
                  </div>
                )}
              </div>
            </div>

            {/* Section 2: Métriques principales en cards */}
            <div className="mb-8">
              <h3 className="text-xl font-bold text-white mb-6">Métriques Clés</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {[
                  { label: 'Capitalisation Boursière', value: formatNumberWithCurrency(coin.market_cap, 2), color: 'border-blue-500' },
                  { label: 'Volume 24h', value: formatNumberWithCurrency(coin.total_volume, 2), color: 'border-green-500' },
                  { label: 'Offre Circulante', value: `${formatNumber(coin.circulating_supply, 0)} ${coin.symbol?.toUpperCase()}`, color: 'border-purple-500' },
                  { label: 'Plus Haut Historique', value: formatPrice(coin.ath), color: 'border-yellow-500' }
                ].map((metric, index) => (
                  <div key={index} className={`bg-gray-900/50 rounded-xl p-4 border-l-4 ${metric.color}`}>
                    <p className="text-gray-400 text-sm mb-2">{metric.label}</p>
                    <p className="text-2xl font-bold text-white">{metric.value}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Section 3: Statistiques de marché avancées */}
            {detailedInfo?.market_data && (
              <div className="mb-8">
                <h3 className="text-2xl font-bold text-white mb-8">Statistiques Avancées</h3>
                
                {/* Section Analyse de Marché */}
                <div className="mb-8">
                  <h4 className="text-xl font-semibold text-white mb-6 flex items-center gap-3">
                    <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg flex items-center justify-center">
                      <FaChartLine className="w-4 h-4 text-white" />
                    </div>
                    Analyse de Marché
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    <div className="bg-gradient-to-br from-blue-900/30 to-blue-800/20 rounded-xl p-6 border border-blue-500/20">
                      <div className="text-blue-300 text-sm font-semibold mb-2">Volatilité 7 jours</div>
                      <div className="text-2xl font-bold text-white">
                        {detailedInfo.market_data?.price_change_percentage_7d ? 
                          `${Math.abs(detailedInfo.market_data.price_change_percentage_7d).toFixed(2)}%` : 'Indisponible'}
                      </div>
                      <div className="text-sm text-gray-200 mt-1">Écart des prix</div>
                    </div>
                    
                    <div className="bg-gradient-to-br from-purple-900/30 to-purple-800/20 rounded-xl p-6 border border-purple-500/20">
                      <div className="text-purple-300 text-sm font-semibold mb-2">Classement CoinGecko</div>
                      <div className="text-2xl font-bold text-white">#{detailedInfo.coingecko_rank || 'Indisponible'}</div>
                      <div className="text-sm text-gray-200 mt-1">Position mondiale</div>
                    </div>
                    
                    <div className="bg-gradient-to-br from-green-900/30 to-green-800/20 rounded-xl p-6 border border-green-500/20">
                      <div className="text-green-300 text-sm font-semibold mb-2">Score Développeur</div>
                      <div className="text-2xl font-bold text-white">
                        {detailedInfo.developer_score ? `${detailedInfo.developer_score.toFixed(1)}/100` : 'Indisponible'}
                      </div>
                      <div className="text-sm text-gray-200 mt-1">Activité GitHub</div>
                    </div>
                    
                    <div className="bg-gradient-to-br from-orange-900/30 to-orange-800/20 rounded-xl p-6 border border-orange-500/20">
                      <div className="text-orange-300 text-sm font-semibold mb-2">Score Communauté</div>
                      <div className="text-2xl font-bold text-white">
                        {detailedInfo.community_score ? `${detailedInfo.community_score.toFixed(1)}/100` : 'Indisponible'}
                      </div>
                      <div className="text-sm text-gray-200 mt-1">Engagement social</div>
                    </div>
                  </div>
                </div>

                {/* Section Supply et Tokenomics */}
                <div className="mb-8">
                  <h4 className="text-xl font-semibold text-white mb-6 flex items-center gap-3">
                    <div className="w-8 h-8 bg-gradient-to-r from-emerald-500 to-emerald-600 rounded-lg flex items-center justify-center">
                      <FaCoins className="w-4 h-4 text-white" />
                    </div>
                    Offre & Tokenomics
                  </h4>
                  
                  {/* Graphique visuel du supply */}
                  <div className="bg-gradient-to-br from-gray-900/60 to-gray-800/40 rounded-xl p-8 border border-gray-600/20 mb-6">
                    <div className="flex flex-col lg:flex-row items-center gap-8">
                      <div className="flex-1 space-y-6">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                          <div>
                            <div className="text-gray-200 text-sm mb-1 font-semibold">Offre Circulante</div>
                            <div className="text-xl font-bold text-emerald-400">
                              {formatNumber(detailedInfo.market_data.circulating_supply, 0)}
                            </div>
                            <div className="text-sm text-gray-300">{coin.symbol?.toUpperCase()} disponibles</div>
                          </div>
                          
                          <div>
                            <div className="text-gray-200 text-sm mb-1 font-semibold">Offre Maximale</div>
                            <div className="text-xl font-bold text-white">
                              {detailedInfo.market_data.max_supply ? 
                                formatNumber(detailedInfo.market_data.max_supply, 0) : '∞'}
                            </div>
                            <div className="text-sm text-gray-300">
                              {detailedInfo.market_data.max_supply ? `${coin.symbol?.toUpperCase()} maximum` : 'Illimité'}
                            </div>
                          </div>
                        </div>
                        
                        {detailedInfo.market_data.max_supply && (
                          <div>
                            <div className="flex justify-between items-center mb-2">
                              <span className="text-gray-200 text-sm font-semibold">Taux de Circulation</span>
                              <span className="text-emerald-400 font-bold">
                                {((detailedInfo.market_data.circulating_supply / detailedInfo.market_data.max_supply) * 100).toFixed(1)}%
                              </span>
                            </div>
                            <div className="w-full bg-gray-700 rounded-full h-3">
                              <div 
                                className="bg-gradient-to-r from-emerald-500 to-emerald-400 h-3 rounded-full transition-all duration-500"
                                style={{ 
                                  width: `${(detailedInfo.market_data.circulating_supply / detailedInfo.market_data.max_supply) * 100}%`
                                }}
                              ></div>
                            </div>
                            <div className="flex justify-between text-sm text-gray-300 mt-1">
                              <span>0%</span>
                              <span>100%</span>
                            </div>
                          </div>
                        )}
                      </div>
                      
                      {detailedInfo.market_data.max_supply && (
                        <div className="flex-shrink-0">
                          <ResponsiveContainer width={150} height={150}>
                            <PieChart>
                              <Pie
                                data={[
                                  { 
                                    name: 'Circulant', 
                                    value: detailedInfo.market_data.circulating_supply,
                                    color: '#10B981'
                                  },
                                  { 
                                    name: 'Restant', 
                                    value: detailedInfo.market_data.max_supply - detailedInfo.market_data.circulating_supply,
                                    color: '#374151'
                                  }
                                ]}
                                cx="50%"
                                cy="50%"
                                innerRadius={40}
                                outerRadius={70}
                                dataKey="value"
                                stroke="none"
                              >
                                <Cell fill="#10B981" />
                                <Cell fill="#374151" />
                              </Pie>
                            </PieChart>
                          </ResponsiveContainer>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  {/* Métriques supplémentaires */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div className="bg-gradient-to-br from-yellow-900/30 to-yellow-800/20 rounded-xl p-6 border border-yellow-500/20">
                      <div className="text-yellow-300 text-sm font-semibold mb-2">Valorisation Totalement Diluée</div>
                      <div className="text-xl font-bold text-white">
                        {detailedInfo.market_data?.fully_diluted_valuation?.[currency] ? 
                          formatNumberWithCurrency(detailedInfo.market_data.fully_diluted_valuation[currency]) : 
                          (coin.fully_diluted_valuation ? formatNumberWithCurrency(coin.fully_diluted_valuation) : 'Indisponible')}
                      </div>
                      <div className="text-sm text-gray-200 mt-1">Si toute l'offre était en circulation</div>
                    </div>
                    
                    <div className="bg-gradient-to-br from-indigo-900/30 to-indigo-800/20 rounded-xl p-6 border border-indigo-500/20">
                      <div className="text-indigo-300 text-sm font-semibold mb-2">Offre Totale</div>
                      <div className="text-xl font-bold text-white">
                        {detailedInfo.market_data.total_supply ? 
                          `${formatNumber(detailedInfo.market_data.total_supply, 0)} ${coin.symbol?.toUpperCase()}` : 'Indisponible'}
                      </div>
                      <div className="text-sm text-gray-200 mt-1">Tokens créés à ce jour</div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Section 4: Performances et liens */}
            {detailedInfo && (
              <div className="mb-8">
                {/* Section Performances */}
                <div className="mb-8">
                  <h3 className="text-2xl font-bold text-white mb-8 flex items-center gap-3">
                    <div className="w-8 h-8 bg-gradient-to-r from-red-500 to-pink-600 rounded-lg flex items-center justify-center">
                      <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                      </svg>
                    </div>
                    Analyse de Performance
                  </h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
                    <div className="bg-gradient-to-br from-red-900/30 to-red-800/20 rounded-xl p-6 border border-red-500/20">
                      <div className="text-red-300 text-sm font-semibold mb-2">Plus Bas Historique</div>
                      <div className="text-xl font-bold text-white mb-1">
                        {detailedInfo.market_data?.atl?.[currency] ? 
                          formatPrice(detailedInfo.market_data.atl[currency]) : 
                          (coin.atl ? formatPrice(coin.atl) : 'Indisponible')}
                      </div>
                    </div>
                    
                    <div className="bg-gradient-to-br from-yellow-900/30 to-yellow-800/20 rounded-xl p-6 border border-yellow-500/20">
                      <div className="text-yellow-300 text-sm font-semibold mb-2">Plus Haut Historique</div>
                      <div className="text-xl font-bold text-white">
                        {formatPrice(coin.ath)}
                      </div>
                    </div>
                    
                    <div className={`bg-gradient-to-br ${detailedInfo.market_data?.price_change_percentage_7d >= 0 ? 'from-green-900/30 to-green-800/20' : 'from-red-900/30 to-red-800/20'} rounded-xl p-6 border ${detailedInfo.market_data?.price_change_percentage_7d >= 0 ? 'border-green-500/20' : 'border-red-500/20'}`}>
                      <div className={`${detailedInfo.market_data?.price_change_percentage_7d >= 0 ? 'text-green-300' : 'text-red-300'} text-sm font-semibold mb-2`}>Variation 7 jours</div>
                      <div className={`text-xl font-bold ${detailedInfo.market_data?.price_change_percentage_7d >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                        {detailedInfo.market_data?.price_change_percentage_7d >= 0 ? '+' : ''}{detailedInfo.market_data?.price_change_percentage_7d?.toFixed(2) || 'Indisponible'}%
                      </div>
                    </div>
                    
                    <div className={`bg-gradient-to-br ${detailedInfo.market_data?.price_change_percentage_30d >= 0 ? 'from-green-900/30 to-green-800/20' : 'from-red-900/30 to-red-800/20'} rounded-xl p-6 border ${detailedInfo.market_data?.price_change_percentage_30d >= 0 ? 'border-green-500/20' : 'border-red-500/20'}`}>
                      <div className={`${detailedInfo.market_data?.price_change_percentage_30d >= 0 ? 'text-green-300' : 'text-red-300'} text-sm font-semibold mb-2`}>Variation 30 jours</div>
                      <div className={`text-xl font-bold ${detailedInfo.market_data?.price_change_percentage_30d >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                        {detailedInfo.market_data?.price_change_percentage_30d >= 0 ? '+' : ''}{detailedInfo.market_data?.price_change_percentage_30d?.toFixed(2) || 'Indisponible'}%
                      </div>
                    </div>
                    
                    <div className={`bg-gradient-to-br ${detailedInfo.market_data?.price_change_percentage_1y >= 0 ? 'from-green-900/30 to-green-800/20' : 'from-red-900/30 to-red-800/20'} rounded-xl p-6 border ${detailedInfo.market_data?.price_change_percentage_1y >= 0 ? 'border-green-500/20' : 'border-red-500/20'}`}>
                      <div className={`${detailedInfo.market_data?.price_change_percentage_1y >= 0 ? 'text-green-300' : 'text-red-300'} text-sm font-semibold mb-2`}>Variation 1 an</div>
                      <div className={`text-xl font-bold ${detailedInfo.market_data?.price_change_percentage_1y >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                        {detailedInfo.market_data?.price_change_percentage_1y >= 0 ? '+' : ''}{detailedInfo.market_data?.price_change_percentage_1y?.toFixed(2) || 'Indisponible'}%
                      </div>
                    </div>
                  </div>
                  
                  {/* Classement en grand */}
                  <div className="bg-gradient-to-br from-blue-900/40 to-indigo-800/30 rounded-xl p-8 border border-blue-500/20 text-center">
                    <div className="text-blue-300 text-lg font-semibold mb-2">Classement Mondial</div>
                    <div className="text-5xl font-bold text-blue-400 mb-2">#{coin.market_cap_rank || 'Indisponible'}</div>
                    <div className="text-gray-200">Position par capitalisation boursière</div>
                  </div>
                </div>

                {/* Section Liens et Communauté - Redesignée */}
                <div>
                  <h3 className="text-xl sm:text-2xl font-bold text-white mb-6 flex items-center gap-3">
                    <div className="w-8 h-8 bg-gradient-to-r from-indigo-500 to-indigo-600 rounded-lg flex items-center justify-center">
                      <FaGlobe className="w-4 h-4 text-white" />
                    </div>
                    Liens & Communauté
                  </h3>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    {/* Section Liens Officiels */}
                    <div className="bg-gradient-to-br from-gray-900/60 to-gray-800/40 rounded-xl p-4 sm:p-6 border border-gray-600/20">
                      <h4 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                        <div className="w-6 h-6 bg-blue-600/30 rounded-lg flex items-center justify-center">
                          <FaGlobe className="w-3 h-3 text-blue-400" />
                        </div>
                        Liens Officiels
                      </h4>
                      <div className="space-y-3">
                        {detailedInfo.links?.homepage?.[0] && (
                          <a 
                            href={detailedInfo.links.homepage[0]} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="group flex items-center justify-between p-3 bg-blue-900/20 hover:bg-blue-800/30 rounded-lg border border-blue-500/20 hover:border-blue-400/40 transition-all duration-300"
                          >
                            <div className="flex items-center gap-3">
                              <FaGlobe className="w-4 h-4 text-blue-400 group-hover:scale-110 transition-transform" />
                              <span className="text-white text-sm font-medium">Site Officiel</span>
                            </div>
                            <FaExternalLinkAlt className="w-3 h-3 text-gray-400 group-hover:text-blue-400 transition-colors" />
                          </a>
                        )}
                        
                        {detailedInfo.links?.repos_url?.github?.[0] && (
                          <a 
                            href={detailedInfo.links.repos_url.github[0]} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="group flex items-center justify-between p-3 bg-gray-900/20 hover:bg-gray-800/30 rounded-lg border border-gray-600/20 hover:border-gray-500/40 transition-all duration-300"
                          >
                            <div className="flex items-center gap-3">
                              <FaGithub className="w-4 h-4 text-gray-400 group-hover:scale-110 transition-transform" />
                              <span className="text-white text-sm font-medium">Dépôt GitHub</span>
                            </div>
                            <FaExternalLinkAlt className="w-3 h-3 text-gray-400 group-hover:text-white transition-colors" />
                          </a>
                        )}

                        {!detailedInfo.links?.homepage?.[0] && !detailedInfo.links?.repos_url?.github?.[0] && (
                          <div className="text-center py-4 text-gray-500 text-sm">
                            Aucun lien officiel disponible
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Section Réseaux Sociaux */}
                    <div className="bg-gradient-to-br from-gray-900/60 to-gray-800/40 rounded-xl p-4 sm:p-6 border border-gray-600/20">
                      <h4 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                        <div className="w-6 h-6 bg-purple-600/30 rounded-lg flex items-center justify-center">
                          <svg className="w-3 h-3 text-purple-400" fill="currentColor" viewBox="0 0 20 20">
                            <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                        </div>
                        Réseaux Sociaux
                      </h4>
                      <div className="space-y-3">
                        {detailedInfo.links?.twitter_screen_name && (
                          <a 
                            href={`https://twitter.com/${detailedInfo.links.twitter_screen_name}`} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="group flex items-center justify-between p-3 bg-blue-900/20 hover:bg-blue-800/30 rounded-lg border border-blue-500/20 hover:border-blue-400/40 transition-all duration-300"
                          >
                            <div className="flex items-center gap-3">
                              <FaTwitter className="w-4 h-4 text-blue-400 group-hover:scale-110 transition-transform" />
                              <span className="text-white text-sm font-medium">Twitter</span>
                            </div>
                            <span className="text-xs text-gray-400 group-hover:text-blue-300 transition-colors">@{detailedInfo.links.twitter_screen_name}</span>
                          </a>
                        )}
                        
                        {detailedInfo.links?.subreddit_url && (
                          <a 
                            href={detailedInfo.links.subreddit_url} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="group flex items-center justify-between p-3 bg-orange-900/20 hover:bg-orange-800/30 rounded-lg border border-orange-500/20 hover:border-orange-400/40 transition-all duration-300"
                          >
                            <div className="flex items-center gap-3">
                              <FaReddit className="w-4 h-4 text-orange-400 group-hover:scale-110 transition-transform" />
                              <span className="text-white text-sm font-medium">Reddit</span>
                            </div>
                            <FaExternalLinkAlt className="w-3 h-3 text-gray-400 group-hover:text-orange-400 transition-colors" />
                          </a>
                        )}
                        
                        {detailedInfo.links?.facebook_username && (
                          <a 
                            href={`https://facebook.com/${detailedInfo.links.facebook_username}`} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="group flex items-center justify-between p-3 bg-blue-900/20 hover:bg-blue-800/30 rounded-lg border border-blue-600/20 hover:border-blue-500/40 transition-all duration-300"
                          >
                            <div className="flex items-center gap-3">
                              <svg className="w-4 h-4 text-blue-500 group-hover:scale-110 transition-transform" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                              </svg>
                              <span className="text-white text-sm font-medium">Facebook</span>
                            </div>
                            <FaExternalLinkAlt className="w-3 h-3 text-gray-400 group-hover:text-blue-400 transition-colors" />
                          </a>
                        )}
                        
                        {detailedInfo.links?.telegram_channel_identifier && (
                          <a 
                            href={`https://t.me/${detailedInfo.links.telegram_channel_identifier}`} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="group flex items-center justify-between p-3 bg-blue-900/20 hover:bg-blue-800/30 rounded-lg border border-blue-500/20 hover:border-blue-400/40 transition-all duration-300"
                          >
                            <div className="flex items-center gap-3">
                              <svg className="w-4 h-4 text-blue-400 group-hover:scale-110 transition-transform" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"/>
                              </svg>
                              <span className="text-white text-sm font-medium">Telegram</span>
                            </div>
                            <FaExternalLinkAlt className="w-3 h-3 text-gray-400 group-hover:text-blue-400 transition-colors" />
                          </a>
                        )}

                        {!detailedInfo.links?.twitter_screen_name && !detailedInfo.links?.subreddit_url && !detailedInfo.links?.facebook_username && !detailedInfo.links?.telegram_channel_identifier && (
                          <div className="text-center py-4 text-gray-500 text-sm">
                            Aucun réseau social disponible
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Description uniquement si en français */}
            {detailedInfo?.description?.fr && (
              <div className="mb-8">
                <h3 className="text-xl font-bold text-white mb-6">À propos de {coin.name}</h3>
                <div className="bg-gray-900/50 rounded-xl p-6 border border-gray-600/20">
                  <p className="text-gray-300 leading-relaxed">
                    {detailedInfo.description.fr.split('. ').slice(0, 3).join('. ') + '.'}
                  </p>
                </div>
              </div>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}

export default CryptoInfoModal