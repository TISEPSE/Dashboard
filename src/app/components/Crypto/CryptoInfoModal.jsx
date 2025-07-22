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
      console.log('🔄 Rechargement des données pour', coin.id)
      
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
    
    const numValue = parseFloat(num)
    if (isNaN(numValue)) return 'Indisponible'
    
    // Format toujours abrégé pour économiser l'espace
    if (numValue >= 1e12) return `${(numValue / 1e12).toFixed(decimals)}T`
    if (numValue >= 1e9) return `${(numValue / 1e9).toFixed(decimals)}B`
    if (numValue >= 1e6) return `${(numValue / 1e6).toFixed(decimals)}M`
    if (numValue >= 1e3) return `${(numValue / 1e3).toFixed(decimals)}K`
    
    return numValue.toLocaleString('fr-FR', { maximumFractionDigits: decimals, minimumFractionDigits: 0 })
  }

  // Formater les nombres avec devise
  const formatNumberWithCurrency = (num, decimals = 2) => {
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
    const formattedNum = formatNumber(numValue, decimals)
    
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

  // Tooltip personnalisé pour les graphiques
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white border border-gray-200 rounded-lg p-3 shadow-lg">
          <p className="text-gray-600 text-sm mb-1">{new Date(parseInt(label)).toLocaleString()}</p>
          {payload.map((entry, index) => (
            <p key={index} className="text-sm font-semibold" style={{ color: entry.color }}>
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
          className="bg-gradient-to-br from-[#2a2d3e] to-[#212332] rounded-3xl max-w-6xl w-full max-h-[90vh] overflow-y-auto overflow-x-hidden shadow-2xl border border-gray-600/20"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header sombre épuré */}
          <div className="sticky top-0 bg-gradient-to-r from-[#2a2d3e] to-[#212332] border-b border-gray-600/20 p-6 flex items-center justify-between z-10 backdrop-blur-sm">
            <div className="flex items-center gap-4">
              <img 
                src={coin.image} 
                alt={coin.name}
                className="w-12 h-12 rounded-full shadow-lg object-cover border border-gray-600/30"
              />
              <div>
                <h2 className="text-2xl font-bold text-white">{coin.name}</h2>
                <div className="flex items-center gap-3 text-sm">
                  <span className="text-gray-300 font-medium">{coin.symbol?.toUpperCase()}</span>
                  <span className="px-2 py-1 bg-gradient-to-r from-gray-600 to-gray-700 rounded-full text-xs text-white">#{coin.market_cap_rank}</span>
                </div>
              </div>
            </div>
            <div className="text-right">
              <p className="text-3xl font-bold text-white">{formatPrice(coin.current_price)}</p>
              <p className={`text-sm font-medium ${coin.price_change_percentage_24h >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                {coin.price_change_percentage_24h >= 0 ? '+' : ''}{coin.price_change_percentage_24h?.toFixed(2)}% (24h)
              </p>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-full hover:bg-gray-700/50 transition-colors text-gray-400 hover:text-white"
            >
              <FaTimes size={20} />
            </button>
          </div>

          <div className="p-6 bg-gradient-to-br from-[#212332]/30 to-[#1a1d29]/20">
            {/* Layout principal en 2 colonnes */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            
              {/* Colonne 1: Graphique principal */}
              <div className="lg:col-span-2">
                {/* Contrôles de période */}
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-bold text-white">Évolution du Prix</h3>
                  <div className="flex gap-1 p-1 bg-gradient-to-r from-[#2a2d3e] to-[#252837] rounded-lg border border-gray-600/30">
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
                        className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
                          selectedTimeframe === timeframe.value
                            ? 'bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-sm'
                            : 'text-gray-300 hover:bg-gray-700/50 hover:text-white'
                        }`}
                      >
                        {timeframe.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Graphique */}
                <div className="bg-gradient-to-br from-[#2a2d3e] to-[#252837] rounded-2xl p-6 shadow-lg border border-gray-600/20">
                  {loading ? (
                    <div className="h-96 flex items-center justify-center">
                      <div className="animate-spin rounded-full h-8 w-8 border-2 border-blue-500 border-t-transparent"></div>
                    </div>
                  ) : historicalData && historicalData.length > 0 ? (
                    <ResponsiveContainer width="100%" height={400}>
                      <AreaChart data={historicalData} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
                        <defs>
                          <linearGradient id="priceGradient" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.4}/>
                            <stop offset="95%" stopColor="#3B82F6" stopOpacity={0.1}/>
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="#4B5563" />
                        <XAxis 
                          dataKey="timestamp" 
                          tickFormatter={(value) => new Date(value).toLocaleDateString('fr-FR', { 
                            month: 'short', 
                            day: 'numeric' 
                          })}
                          stroke="#9CA3AF"
                          fontSize={12}
                          axisLine={false}
                          tickLine={false}
                        />
                        <YAxis 
                          tickFormatter={(value) => {
                            if (value >= 1000) return `${(value/1000).toFixed(0)}k`
                            if (value >= 1) return value.toFixed(2)
                            return value.toFixed(6)
                          }}
                          stroke="#9CA3AF"
                          fontSize={12}
                          axisLine={false}
                          tickLine={false}
                          width={80}
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
                    <div className="h-96 flex items-center justify-center text-gray-400">
                      Données indisponibles
                    </div>
                  )}
                </div>

                {/* Métriques essentielles */}
                <div className="grid grid-cols-2 gap-4 mt-6">
                  <div className="bg-gradient-to-br from-[#2a2d3e] to-[#252837] rounded-xl p-4 shadow-lg border border-gray-600/20">
                    <div className="text-sm text-gray-400 mb-1">Capitalisation</div>
                    <div className="text-xl font-bold text-white">{formatNumberWithCurrency(coin.market_cap, 0)}</div>
                  </div>
                  <div className="bg-gradient-to-br from-[#2a2d3e] to-[#252837] rounded-xl p-4 shadow-lg border border-gray-600/20">
                    <div className="text-sm text-gray-400 mb-1">Volume 24h</div>
                    <div className="text-xl font-bold text-white">{formatNumberWithCurrency(coin.total_volume, 0)}</div>
                  </div>
                </div>
              </div>

              {/* Colonne 2: Informations clés */}
              <div className="space-y-6">
                {/* Performance périodes */}
                <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                  <h4 className="text-lg font-bold text-gray-900 mb-4">Performance</h4>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">24 heures</span>
                      <span className={`font-semibold ${coin.price_change_percentage_24h >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {coin.price_change_percentage_24h >= 0 ? '+' : ''}{coin.price_change_percentage_24h?.toFixed(2)}%
                      </span>
                    </div>
                    {detailedInfo?.market_data?.price_change_percentage_7d && (
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600">7 jours</span>
                        <span className={`font-semibold ${detailedInfo.market_data.price_change_percentage_7d >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                          {detailedInfo.market_data.price_change_percentage_7d >= 0 ? '+' : ''}{detailedInfo.market_data.price_change_percentage_7d.toFixed(2)}%
                        </span>
                      </div>
                    )}
                    {detailedInfo?.market_data?.price_change_percentage_30d && (
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600">30 jours</span>
                        <span className={`font-semibold ${detailedInfo.market_data.price_change_percentage_30d >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                          {detailedInfo.market_data.price_change_percentage_30d >= 0 ? '+' : ''}{detailedInfo.market_data.price_change_percentage_30d.toFixed(2)}%
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Statistiques */}
                <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                  <h4 className="text-lg font-bold text-gray-900 mb-4">Statistiques</h4>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Rang</span>
                      <span className="font-semibold text-gray-900">#{coin.market_cap_rank}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">ATH</span>
                      <span className="font-semibold text-gray-900">{formatPrice(coin.ath)}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">ATL</span>
                      <span className="font-semibold text-gray-900">{formatPrice(coin.atl || 0)}</span>
                    </div>
                  </div>
                </div>

                {/* Offre */}
                {detailedInfo?.market_data && (
                  <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                    <h4 className="text-lg font-bold text-gray-900 mb-4">Offre</h4>
                    <div className="space-y-4">
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600">Circulante</span>
                        <span className="font-semibold text-gray-900">
                          {formatNumber(detailedInfo.market_data.circulating_supply, 0)}
                        </span>
                      </div>
                      {detailedInfo.market_data.max_supply && (
                        <>
                          <div className="flex justify-between items-center">
                            <span className="text-gray-600">Maximum</span>
                            <span className="font-semibold text-gray-900">
                              {formatNumber(detailedInfo.market_data.max_supply, 0)}
                            </span>
                          </div>
                          <div className="mt-3">
                            <div className="flex justify-between text-sm text-gray-600 mb-2">
                              <span>Progression</span>
                              <span>{((detailedInfo.market_data.circulating_supply / detailedInfo.market_data.max_supply) * 100).toFixed(1)}%</span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-2">
                              <div 
                                className="bg-blue-600 h-2 rounded-full transition-all duration-500"
                                style={{ width: `${(detailedInfo.market_data.circulating_supply / detailedInfo.market_data.max_supply) * 100}%` }}
                              />
                            </div>
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                )}

                {/* Liens rapides */}
                {detailedInfo?.links && (
                  <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                    <h4 className="text-lg font-bold text-gray-900 mb-4">Liens</h4>
                    <div className="space-y-3">
                      {detailedInfo.links?.homepage?.[0] && (
                        <a 
                          href={detailedInfo.links.homepage[0]} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                        >
                          <div className="flex items-center gap-3">
                            <FaGlobe className="text-gray-600" />
                            <span className="text-gray-900 font-medium">Site officiel</span>
                          </div>
                          <FaExternalLinkAlt className="text-gray-400" size={14} />
                        </a>
                      )}
                      {detailedInfo.links?.twitter_screen_name && (
                        <a 
                          href={`https://twitter.com/${detailedInfo.links.twitter_screen_name}`} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                        >
                          <div className="flex items-center gap-3">
                            <FaTwitter className="text-blue-500" />
                            <span className="text-gray-900 font-medium">Twitter</span>
                          </div>
                          <FaExternalLinkAlt className="text-gray-400" size={14} />
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