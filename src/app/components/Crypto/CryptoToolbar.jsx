import React from "react"
import CryptoSelector from "./CryptoSelector"

const CryptoToolbar = ({
  sortBy,
  setSortBy,
  sortOrder,
  setSortOrder,
  currency,
  setCurrency,
  perPage,
  setPerPage,
  loading,
  isRetrying,
  retryCount
}) => {
  const sortOptions = [
    { value: "market_cap", label: "Capitalisation", shortLabel: "Cap." },
    { value: "current_price", label: "Prix", shortLabel: "Prix" },
    { value: "name", label: "Nom", shortLabel: "Nom" },
    { value: "price_change_percentage_24h", label: "Variation 24h", shortLabel: "24h" },
    { value: "price_change_percentage_7d_in_currency", label: "Variation 7j", shortLabel: "7j" },
    { value: "market_cap_rank", label: "Classement", shortLabel: "Rang" },
    { value: "total_volume", label: "Volume 24h", shortLabel: "Vol." }
  ]

  return (
    <div className="bg-gradient-to-r from-[#1a1d29] to-[#212332] border-b border-gray-500/30 sticky top-0 z-40 shadow-2xl backdrop-blur-sm">
      <div className="w-full px-4 sm:px-6 py-3.5">
        <div className="bg-gradient-to-r from-[#2a2d3e] to-[#1f2937] rounded-2xl border border-gray-600/50 overflow-hidden shadow-xl">
          {/* Version desktop - Redesignée */}
          <div className="hidden md:flex items-center justify-between px-6 py-4 gap-6">
            <div className="flex items-center gap-6">
              {/* Section Tri */}
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-gradient-to-r from-[#3A6FF8] to-[#2952d3] rounded-lg flex items-center justify-center shadow-lg">
                    <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
                    </svg>
                  </div>
                  <span className="text-sm font-medium text-gray-300">Tri</span>
                </div>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="bg-gradient-to-r from-[#1a1d29] to-[#212332] text-white border border-gray-600/50 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-[#3A6FF8] focus:border-transparent transition-all duration-200 min-w-[140px] shadow-lg hover:shadow-xl"
                >
                  {sortOptions.map(option => (
                    <option key={option.value} value={option.value} className="bg-[#1a1d29] text-white">
                      {option.label}
                    </option>
                  ))}
                </select>
                <select
                  value={sortOrder}
                  onChange={(e) => setSortOrder(e.target.value)}
                  className="bg-gradient-to-r from-[#1a1d29] to-[#212332] text-white border border-gray-600/50 rounded-xl px-3 py-2.5 text-sm focus:ring-2 focus:ring-[#3A6FF8] focus:border-transparent transition-all duration-200 w-16 shadow-lg hover:shadow-xl"
                >
                  <option value="desc" className="bg-[#1a1d29] text-white">↓</option>
                  <option value="asc" className="bg-[#1a1d29] text-white">↑</option>
                </select>
              </div>

              {/* Section Devise */}
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-gradient-to-r from-[#10B981] to-[#059669] rounded-lg flex items-center justify-center shadow-lg">
                    <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                    </svg>
                  </div>
                  <span className="text-sm font-medium text-gray-300">Devise</span>
                </div>
                <select
                  value={currency}
                  onChange={(e) => setCurrency(e.target.value)}
                  className="bg-gradient-to-r from-[#1a1d29] to-[#212332] text-white border border-gray-600/50 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-[#3A6FF8] focus:border-transparent transition-all duration-200 w-20 shadow-lg hover:shadow-xl"
                >
                  <option value="eur" className="bg-[#1a1d29] text-white">EUR</option>
                  <option value="usd" className="bg-[#1a1d29] text-white">USD</option>
                </select>
              </div>

              {/* Section Affichage */}
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-gradient-to-r from-[#8B5CF6] to-[#7C3AED] rounded-lg flex items-center justify-center shadow-lg">
                    <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                    </svg>
                  </div>
                  <span className="text-sm font-medium text-gray-300">Affichage</span>
                </div>
                <div className="min-w-[80px]">
                  <CryptoSelector value={perPage} onChange={setPerPage} />
                </div>
              </div>
            </div>

            {/* Indicateur de statut amélioré */}
            <div className="flex items-center gap-3 bg-gradient-to-r from-[#374151] to-[#1f2937] px-4 py-2 rounded-xl shadow-lg">
              <div className="flex items-center gap-2">
                <div className={`w-3 h-3 rounded-full shadow-lg ${
                  loading ? 'bg-yellow-500 animate-pulse' : 
                  isRetrying ? 'bg-orange-500 animate-pulse' : 
                  'bg-green-500 animate-pulse'
                }`}></div>
                <span className="text-xs font-medium text-gray-300">
                  {loading ? 'Synchronisation...' : 
                   isRetrying ? `Reconnexion ${retryCount}` : 
                   'En ligne'}
                </span>
              </div>
            </div>
          </div>

          {/* Version mobile/tablette - Redesignée */}
          <div className="md:hidden">
            <div className="flex items-center justify-between px-4 py-3 gap-3">
              <div className="flex items-center gap-2 flex-1">
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="bg-gradient-to-r from-[#1a1d29] to-[#212332] text-white border border-gray-600/50 rounded-xl px-3 py-2 text-xs focus:ring-1 focus:ring-[#3A6FF8] focus:border-transparent transition-all duration-200 flex-1 min-w-0 shadow-lg"
                >
                  {sortOptions.map(option => (
                    <option key={option.value} value={option.value} className="bg-[#1a1d29] text-white">
                      {option.shortLabel}
                    </option>
                  ))}
                </select>
                <select
                  value={sortOrder}
                  onChange={(e) => setSortOrder(e.target.value)}
                  className="bg-gradient-to-r from-[#1a1d29] to-[#212332] text-white border border-gray-600/50 rounded-xl px-2 py-2 text-xs focus:ring-1 focus:ring-[#3A6FF8] focus:border-transparent transition-all duration-200 w-12 shadow-lg"
                >
                  <option value="desc" className="bg-[#1a1d29] text-white">↓</option>
                  <option value="asc" className="bg-[#1a1d29] text-white">↑</option>
                </select>
              </div>
              
              <div className="flex items-center gap-2">
                <select
                  value={currency}
                  onChange={(e) => setCurrency(e.target.value)}
                  className="bg-gradient-to-r from-[#1a1d29] to-[#212332] text-white border border-gray-600/50 rounded-xl px-2 py-2 text-xs focus:ring-1 focus:ring-[#3A6FF8] focus:border-transparent transition-all duration-200 w-12 shadow-lg"
                >
                  <option value="eur" className="bg-[#1a1d29] text-white">€</option>
                  <option value="usd" className="bg-[#1a1d29] text-white">$</option>
                </select>
                
                <div className="min-w-[50px]">
                  <CryptoSelector value={perPage} onChange={setPerPage} />
                </div>
                
                <div className="flex items-center gap-1 bg-gradient-to-r from-[#374151] to-[#1f2937] px-2 py-1 rounded-lg">
                  <div className={`w-2 h-2 rounded-full ${
                    loading ? 'bg-yellow-500 animate-pulse' : 
                    isRetrying ? 'bg-orange-500 animate-pulse' : 
                    'bg-green-500 animate-pulse'
                  }`}></div>
                  <span className="text-xs text-gray-400 font-medium">
                    {isRetrying ? retryCount : ''}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default CryptoToolbar