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
      
      // Vérifier le cache (5 minutes)
      const cacheKey = `${coin.id}_${currency}_${selectedTimeframe}`
      const cached = dataCache.get(cacheKey)
      if (cached && (Date.now() - cached.timestamp) < 300000) {
        console.log('📦 Utilisation du cache modal pour', coin.id)
        setHistoricalData(cached.historicalData)
        setDetailedInfo(cached.detailedInfo)
        return
      }
      
      setRequestInProgress(true)
      setLoading(true)
      
      try {
        // Requêtes en parallèle avec timeout réduit
        const [priceResponse, detailResponse] = await Promise.allSettled([
          fetch(
            `https://api.coingecko.com/api/v3/coins/${coin.id}/market_chart?vs_currency=${currency}&days=${selectedTimeframe}&interval=${selectedTimeframe <= 1 ? 'hourly' : 'daily'}`,
            { timeout: 8000 }
          ),
          fetch(
            `https://api.coingecko.com/api/v3/coins/${coin.id}?localization=false&tickers=false&market_data=true&community_data=false&developer_data=false&sparkline=false`,
            { timeout: 8000 }
          )
        ])
        
        let priceData = null
        let detailData = null
        
        if (priceResponse.status === 'fulfilled' && priceResponse.value.ok) {
          priceData = await priceResponse.value.json()
        }
        
        if (detailResponse.status === 'fulfilled' && detailResponse.value.ok) {
          detailData = await detailResponse.value.json()
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
    if (!num && num !== 0) return 'N/A'
    
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
    if (!num && num !== 0) return 'N/A'
    
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
    
    if (formattedNum === 'N/A') return 'N/A'
    
    // Pour certaines devises, le symbole va après
    if (['eur', 'chf'].includes(currency.toLowerCase())) {
      return `${formattedNum} ${symbol}`
    } else {
      return `${symbol} ${formattedNum}`
    }
  }

  // Formater le prix
  const formatPrice = (price) => {
    if (!price) return 'N/A'
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
          className="bg-gradient-to-br from-[#2a2d3e] to-[#212332] rounded-2xl border border-gray-600/30 max-w-7xl w-full max-h-[95vh] overflow-y-auto shadow-2xl"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="sticky top-0 bg-gradient-to-r from-[#2a2d3e] to-[#212332] border-b border-gray-600/30 p-6 flex items-center justify-between backdrop-blur-sm z-10">
            <div className="flex items-center gap-4">
              <img 
                src={coin.image} 
                alt={coin.name}
                className="w-12 h-12 rounded-full shadow-lg"
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

          <div className="p-6">
            {/* Section 1: Graphique et contrôles */}
            <div className="mb-8">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
                <h3 className="text-xl font-bold text-white mb-4 sm:mb-0">Évolution du Prix</h3>
                <div className="flex gap-2">
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
                      className={`px-3 py-1 rounded-lg text-sm font-medium transition-all ${
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

              <div className="bg-gray-900/50 rounded-xl p-4 border border-gray-600/20">
                {loading ? (
                  <div className="h-56 flex items-center justify-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                  </div>
                ) : historicalData && historicalData.length > 0 ? (
                  <ResponsiveContainer width="100%" height={220}>
                    <AreaChart data={historicalData}>
                      <defs>
                        <linearGradient id="priceGradient" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.8}/>
                          <stop offset="95%" stopColor="#3B82F6" stopOpacity={0.1}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                      <XAxis 
                        dataKey="timestamp" 
                        tickFormatter={(value) => new Date(value).toLocaleDateString('fr-FR', { 
                          month: 'short', 
                          day: 'numeric' 
                        })}
                        stroke="#9CA3AF"
                        fontSize={12}
                        tick={{ fill: '#9CA3AF' }}
                      />
                      <YAxis 
                        tickFormatter={(value) => {
                          if (value >= 1000) return `${(value/1000).toFixed(0)}k`
                          if (value >= 1) return value.toFixed(2)
                          if (value >= 0.01) return value.toFixed(4)
                          return value.toFixed(6)
                        }}
                        stroke="#9CA3AF"
                        fontSize={12}
                        tick={{ fill: '#9CA3AF' }}
                        width={80}
                      />
                      <Tooltip content={<CustomTooltip />} />
                      <Area 
                        type="monotone" 
                        dataKey="price" 
                        stroke="#3B82F6" 
                        strokeWidth={2}
                        fillOpacity={1} 
                        fill="url(#priceGradient)" 
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-56 flex items-center justify-center text-gray-500">
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
                <h3 className="text-xl font-bold text-white mb-6">Statistiques Avancées</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  {/* Colonne 1: Volatilité et rang */}
                  <div className="bg-gray-900/50 rounded-xl p-5 border border-gray-600/20">
                    <h4 className="text-lg font-semibold text-white mb-4">Analyse de marché</h4>
                    <div className="space-y-4">
                      <div className="flex justify-between items-center">
                        <span className="text-gray-300 text-sm">Volatilité (7j)</span>
                        <span className="text-white font-semibold">
                          {detailedInfo.market_data?.price_change_percentage_7d ? 
                            `${Math.abs(detailedInfo.market_data.price_change_percentage_7d).toFixed(2)}%` : 'N/A'}
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-300 text-sm">Rang CoinGecko</span>
                        <span className="text-blue-400 font-bold">#{detailedInfo.coingecko_rank || 'N/A'}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-300 text-sm">Score Développeur</span>
                        <span className="text-green-400 font-semibold">
                          {detailedInfo.developer_score ? `${detailedInfo.developer_score.toFixed(1)}/100` : 'N/A'}
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-300 text-sm">Score Communauté</span>
                        <span className="text-purple-400 font-semibold">
                          {detailedInfo.community_score ? `${detailedInfo.community_score.toFixed(1)}/100` : 'N/A'}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Colonne 2: Supply et liquidité */}
                  <div className="bg-gray-900/50 rounded-xl p-5 border border-gray-600/20">
                    <h4 className="text-lg font-semibold text-white mb-4">Supply & Liquidité</h4>
                    <div className="space-y-4">
                      <div className="flex justify-between items-center">
                        <span className="text-gray-300 text-sm">Supply Circulant</span>
                        <span className="text-blue-400 font-semibold">
                          {formatNumber(detailedInfo.market_data.circulating_supply, 0)} {coin.symbol?.toUpperCase()}
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-300 text-sm">Supply Max</span>
                        <span className="text-white font-semibold">
                          {detailedInfo.market_data.max_supply ? `${formatNumber(detailedInfo.market_data.max_supply, 0)} ${coin.symbol?.toUpperCase()}` : '∞'}
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-300 text-sm">Dilution Totale</span>
                        <span className="text-yellow-400 font-semibold">
                          {detailedInfo.market_data?.fully_diluted_valuation?.[currency] ? 
                            formatNumberWithCurrency(detailedInfo.market_data.fully_diluted_valuation[currency]) : 
                            (coin.fully_diluted_valuation ? formatNumberWithCurrency(coin.fully_diluted_valuation) : 'N/A')}
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-300 text-sm">Taux Circulation</span>
                        <span className="text-green-400 font-semibold">
                          {detailedInfo.market_data.max_supply ? 
                            `${((detailedInfo.market_data.circulating_supply / detailedInfo.market_data.max_supply) * 100).toFixed(1)}%` : 'N/A'}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Section 4: Performances et liens */}
            {detailedInfo && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
                {/* Performances */}
                <div>
                  <h3 className="text-xl font-bold text-white mb-6">Performances</h3>
                  <div className="bg-gray-900/50 rounded-xl p-6 border border-gray-600/20 space-y-4">
                    <div className="flex justify-between items-center py-2">
                      <span className="text-gray-300">Plus Bas Historique</span>
                      <span className="text-white font-semibold">
                        {detailedInfo.market_data?.atl?.[currency] ? 
                          formatPrice(detailedInfo.market_data.atl[currency]) : 
                          (coin.atl ? formatPrice(coin.atl) : 'N/A')}
                      </span>
                    </div>
                    <div className="flex justify-between items-center py-2">
                      <span className="text-gray-300">7 jours</span>
                      <span className={`font-bold ${detailedInfo.market_data?.price_change_percentage_7d >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                        {detailedInfo.market_data?.price_change_percentage_7d >= 0 ? '+' : ''}{detailedInfo.market_data?.price_change_percentage_7d?.toFixed(2)}%
                      </span>
                    </div>
                    <div className="flex justify-between items-center py-2">
                      <span className="text-gray-300">30 jours</span>
                      <span className={`font-bold ${detailedInfo.market_data?.price_change_percentage_30d >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                        {detailedInfo.market_data?.price_change_percentage_30d >= 0 ? '+' : ''}{detailedInfo.market_data?.price_change_percentage_30d?.toFixed(2)}%
                      </span>
                    </div>
                    <div className="flex justify-between items-center py-2">
                      <span className="text-gray-300">1 an</span>
                      <span className={`font-bold ${detailedInfo.market_data?.price_change_percentage_1y >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                        {detailedInfo.market_data?.price_change_percentage_1y >= 0 ? '+' : ''}{detailedInfo.market_data?.price_change_percentage_1y?.toFixed(2)}%
                      </span>
                    </div>
                    <div className="pt-4 mt-4 border-t border-gray-600 flex justify-between items-center">
                      <span className="text-blue-400 font-semibold">Classement Mondial</span>
                      <span className="text-blue-400 font-bold text-2xl">#{detailedInfo.market_cap_rank}</span>
                    </div>
                  </div>
                </div>

                {/* Liens officiels - Version compacte */}
                <div>
                  <h3 className="text-xl font-bold text-white mb-6">Liens Officiels</h3>
                  <div className="bg-gray-900/50 rounded-xl p-6 border border-gray-600/20">
                    {/* Liens principaux */}
                    <div className="flex flex-wrap gap-3 mb-4">
                      {detailedInfo.links?.homepage?.[0] && (
                        <a 
                          href={detailedInfo.links.homepage[0]} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600/20 hover:bg-blue-600/30 text-blue-400 hover:text-blue-300 rounded-lg text-sm font-medium transition-all border border-blue-500/20"
                        >
                          <FaGlobe size={14} />
                          <span>Site Web</span>
                          <FaExternalLinkAlt size={10} />
                        </a>
                      )}
                      {detailedInfo.links?.repos_url?.github?.[0] && (
                        <a 
                          href={detailedInfo.links.repos_url.github[0]} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-2 px-4 py-2 bg-gray-700/30 hover:bg-gray-600/40 text-gray-300 hover:text-white rounded-lg text-sm font-medium transition-all border border-gray-600/20"
                        >
                          <FaGithub size={14} />
                          <span>GitHub</span>
                          <FaExternalLinkAlt size={10} />
                        </a>
                      )}
                    </div>
                    
                    {/* Réseaux sociaux complets */}
                    {(detailedInfo.links?.twitter_screen_name || detailedInfo.links?.subreddit_url || detailedInfo.links?.facebook_username || detailedInfo.links?.telegram_channel_identifier || detailedInfo.links?.bitcointalk_thread_identifier) && (
                      <div className="pt-3 border-t border-gray-700/30">
                        <div className="flex items-center flex-wrap gap-2">
                          <span className="text-gray-500 text-xs">Réseaux:</span>
                          {detailedInfo.links?.twitter_screen_name && (
                            <a 
                              href={`https://twitter.com/${detailedInfo.links.twitter_screen_name}`} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="text-gray-400 hover:text-blue-400 transition-colors"
                              title="Twitter"
                            >
                              <FaTwitter size={12} />
                            </a>
                          )}
                          {detailedInfo.links?.subreddit_url && (
                            <a 
                              href={detailedInfo.links.subreddit_url} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="text-gray-400 hover:text-orange-400 transition-colors"
                              title="Reddit"
                            >
                              <FaReddit size={12} />
                            </a>
                          )}
                          {detailedInfo.links?.facebook_username && (
                            <a 
                              href={`https://facebook.com/${detailedInfo.links.facebook_username}`} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="text-gray-400 hover:text-blue-600 transition-colors"
                              title="Facebook"
                            >
                              <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
                                <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                              </svg>
                            </a>
                          )}
                          {detailedInfo.links?.telegram_channel_identifier && (
                            <a 
                              href={`https://t.me/${detailedInfo.links.telegram_channel_identifier}`} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="text-gray-400 hover:text-blue-500 transition-colors"
                              title="Telegram"
                            >
                              <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
                                <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"/>
                              </svg>
                            </a>
                          )}
                          {detailedInfo.links?.bitcointalk_thread_identifier && (
                            <a 
                              href={`https://bitcointalk.org/index.php?topic=${detailedInfo.links.bitcointalk_thread_identifier}`} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="text-gray-400 hover:text-yellow-500 transition-colors"
                              title="BitcoinTalk"
                            >
                              <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
                                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                              </svg>
                            </a>
                          )}
                        </div>
                      </div>
                    )}
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