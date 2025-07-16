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
    <div className="bg-[#1a1d29] border-b border-[#3a3d4e] sticky top-0 z-40 shadow-lg">
      <div className="w-full px-4 sm:px-6 py-3">
        <div className="bg-[#2a2d3e] rounded-lg border border-[#3a3d4e] overflow-hidden">
          {/* Version desktop - Plus compacte */}
          <div className="hidden md:flex items-center justify-between px-3 py-2 gap-4">
            <div className="flex items-center gap-4">
              {/* Tri et ordre groupés */}
              <div className="flex items-center gap-2">
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="bg-[#1a1d29] text-[#FeFeFe] border border-[#3a3d4e] rounded px-2 py-1.5 text-sm focus:ring-2 focus:ring-[#3A6FF8] focus:border-transparent transition-all duration-200 min-w-[120px]"
                >
                  {sortOptions.map(option => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
                <select
                  value={sortOrder}
                  onChange={(e) => setSortOrder(e.target.value)}
                  className="bg-[#1a1d29] text-[#FeFeFe] border border-[#3a3d4e] rounded px-2 py-1.5 text-sm focus:ring-2 focus:ring-[#3A6FF8] focus:border-transparent transition-all duration-200 w-16"
                >
                  <option value="desc">↓</option>
                  <option value="asc">↑</option>
                </select>
              </div>

              {/* Devise */}
              <select
                value={currency}
                onChange={(e) => setCurrency(e.target.value)}
                className="bg-[#1a1d29] text-[#FeFeFe] border border-[#3a3d4e] rounded px-2 py-1.5 text-sm focus:ring-2 focus:ring-[#3A6FF8] focus:border-transparent transition-all duration-200 w-16"
              >
                <option value="eur">EUR</option>
                <option value="usd">USD</option>
              </select>

              {/* Nombre d'éléments */}
              <div className="min-w-[70px]">
                <CryptoSelector value={perPage} onChange={setPerPage} />
              </div>
            </div>

            {/* Indicateur de statut */}
            <div className="flex items-center gap-2 text-sm text-gray-400">
              <div className={`w-2 h-2 rounded-full ${
                loading ? 'bg-yellow-500 animate-pulse' : 
                isRetrying ? 'bg-orange-500 animate-pulse' : 
                'bg-green-500'
              }`}></div>
              <span className="whitespace-nowrap text-xs">
                {loading ? 'Sync...' : 
                 isRetrying ? `Retry ${retryCount}` : 
                 'Live'}
              </span>
            </div>
          </div>

          {/* Version mobile/tablette - Compacte */}
          <div className="md:hidden">
            <div className="flex items-center justify-between px-3 py-2 gap-2">
              <div className="flex items-center gap-2 flex-1">
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="bg-[#1a1d29] text-[#FeFeFe] border border-[#3a3d4e] rounded px-2 py-1.5 text-xs focus:ring-1 focus:ring-[#3A6FF8] focus:border-transparent transition-all duration-200 flex-1 min-w-0"
                >
                  {sortOptions.map(option => (
                    <option key={option.value} value={option.value}>
                      {option.shortLabel}
                    </option>
                  ))}
                </select>
                <select
                  value={sortOrder}
                  onChange={(e) => setSortOrder(e.target.value)}
                  className="bg-[#1a1d29] text-[#FeFeFe] border border-[#3a3d4e] rounded px-2 py-1.5 text-xs focus:ring-1 focus:ring-[#3A6FF8] focus:border-transparent transition-all duration-200 w-12"
                >
                  <option value="desc">↓</option>
                  <option value="asc">↑</option>
                </select>
              </div>
              
              <div className="flex items-center gap-2">
                <select
                  value={currency}
                  onChange={(e) => setCurrency(e.target.value)}
                  className="bg-[#1a1d29] text-[#FeFeFe] border border-[#3a3d4e] rounded px-2 py-1.5 text-xs focus:ring-1 focus:ring-[#3A6FF8] focus:border-transparent transition-all duration-200 w-12"
                >
                  <option value="eur">€</option>
                  <option value="usd">$</option>
                </select>
                
                <div className="min-w-[50px]">
                  <CryptoSelector value={perPage} onChange={setPerPage} />
                </div>
                
                <div className="flex items-center gap-1">
                  <div className={`w-2 h-2 rounded-full ${
                    loading ? 'bg-yellow-500 animate-pulse' : 
                    isRetrying ? 'bg-orange-500 animate-pulse' : 
                    'bg-green-500'
                  }`}></div>
                  <span className="text-xs text-gray-400">
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