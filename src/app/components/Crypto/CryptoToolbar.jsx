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
  retryCount,
  filterType,
  setFilterType,
}) => {
  const sortOptions = [
    { value: "market_cap", label: "Capitalisation", shortLabel: "Cap." },
    { value: "current_price", label: "Prix", shortLabel: "Prix" },
    { value: "name", label: "Nom", shortLabel: "Nom" },
    {
      value: "price_change_percentage_24h",
      label: "Variation 24h",
      shortLabel: "24h",
    },
    { value: "market_cap_rank", label: "Classement", shortLabel: "Rang" },
  ]

  const filterOptions = [
    { value: "all", label: "Tous", shortLabel: "Tous", icon: "🌐" },
    { value: "favorites", label: "Favoris", shortLabel: "Fav.", icon: "⭐" },
  ]

  return (
    <div className="bg-gradient-to-r from-[#212332] to-[#1a1d29] border-b border-gray-600/20 sticky top-0 z-40 shadow-lg backdrop-blur-sm">
      <div className="w-full px-4 sm:px-6 py-4">
        {/* Desktop */}
        <div className="hidden md:flex items-center justify-between">
          <div className="flex items-center gap-6">
            {/* Tri */}
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center">
                  <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
                  </svg>
                </div>
                <span className="text-sm font-medium text-gray-300">Tri</span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    const currentIndex = sortOptions.findIndex(option => option.value === sortBy);
                    const nextIndex = (currentIndex + 1) % sortOptions.length;
                    setSortBy(sortOptions[nextIndex].value);
                  }}
                  className="bg-gradient-to-r from-[#2a2d3e] to-[#252837] hover:from-[#3a3d4e] hover:to-[#353847] text-white px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 border border-gray-600/30 hover:border-gray-500/50 min-w-[130px] text-left"
                >
                  {sortOptions.find(option => option.value === sortBy)?.label}
                </button>
                <button
                  onClick={() => setSortOrder(sortOrder === 'desc' ? 'asc' : 'desc')}
                  className="bg-gradient-to-r from-[#2a2d3e] to-[#252837] hover:from-[#3a3d4e] hover:to-[#353847] text-white px-3 py-2 rounded-lg text-sm transition-all duration-200 border border-gray-600/30 hover:border-gray-500/50 w-10 flex items-center justify-center"
                >
                  {sortOrder === 'desc' ? '🔽' : '🔼'}
                </button>
              </div>
            </div>

            {/* Filtre */}
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-gradient-to-r from-amber-500 to-orange-600 rounded-lg flex items-center justify-center">
                  <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.707A1 1 0 013 7V4z" />
                  </svg>
                </div>
                <span className="text-sm font-medium text-gray-300">Filtre</span>
              </div>
              <button
                onClick={() => setFilterType(filterType === 'all' ? 'favorites' : 'all')}
                className="bg-gradient-to-r from-[#2a2d3e] to-[#252837] hover:from-[#3a3d4e] hover:to-[#353847] text-white px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 border border-gray-600/30 hover:border-gray-500/50 min-w-[100px] flex items-center gap-2"
              >
                <span>{filterOptions.find(option => option.value === filterType)?.icon}</span>
                <span>{filterOptions.find(option => option.value === filterType)?.label}</span>
              </button>
            </div>

            {/* Devise */}
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-gradient-to-r from-emerald-500 to-teal-600 rounded-lg flex items-center justify-center">
                  <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                  </svg>
                </div>
                <span className="text-sm font-medium text-gray-300">Devise</span>
              </div>
              <button
                onClick={() => setCurrency(currency === 'eur' ? 'usd' : 'eur')}
                className="bg-gradient-to-r from-[#2a2d3e] to-[#252837] hover:from-[#3a3d4e] hover:to-[#353847] text-white px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 border border-gray-600/30 hover:border-gray-500/50 min-w-[70px]"
              >
                {currency === 'eur' ? 'EUR' : 'USD'}
              </button>
            </div>

            {/* Affichage */}
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-pink-600 rounded-lg flex items-center justify-center">
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

          {/* Status */}
          <div className="flex items-center gap-2 bg-gradient-to-r from-[#2a2d3e] to-[#252837] px-4 py-2 rounded-lg border border-gray-600/30">
            <div className={`w-2 h-2 rounded-full ${loading ? "bg-yellow-400 animate-pulse" : isRetrying ? "bg-orange-400 animate-pulse" : "bg-green-400"}`}></div>
            <span className="text-sm font-medium text-gray-300">
              {loading ? "Chargement..." : isRetrying ? `Retry ${retryCount}` : "En ligne"}
            </span>
          </div>
        </div>

        {/* Mobile */}
        <div className="md:hidden">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2 flex-1">
              <button
                onClick={() => {
                  const currentIndex = sortOptions.findIndex(option => option.value === sortBy);
                  const nextIndex = (currentIndex + 1) % sortOptions.length;
                  setSortBy(sortOptions[nextIndex].value);
                }}
                className="bg-gradient-to-r from-[#2a2d3e] to-[#252837] hover:from-[#3a3d4e] hover:to-[#353847] text-white px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 border border-gray-600/30 hover:border-gray-500/50 flex-1 min-w-0"
              >
                {sortOptions.find(option => option.value === sortBy)?.shortLabel}
              </button>
              <button
                onClick={() => setSortOrder(sortOrder === 'desc' ? 'asc' : 'desc')}
                className="bg-gradient-to-r from-[#2a2d3e] to-[#252837] hover:from-[#3a3d4e] hover:to-[#353847] text-white px-2 py-2 rounded-lg text-xs transition-all duration-200 border border-gray-600/30 hover:border-gray-500/50 w-8 flex items-center justify-center"
              >
                {sortOrder === 'desc' ? '🔽' : '🔼'}
              </button>
              <button
                onClick={() => setFilterType(filterType === 'all' ? 'favorites' : 'all')}
                className="bg-gradient-to-r from-[#2a2d3e] to-[#252837] hover:from-[#3a3d4e] hover:to-[#353847] text-white px-2 py-2 rounded-lg text-xs transition-all duration-200 border border-gray-600/30 hover:border-gray-500/50 w-8 flex items-center justify-center"
              >
                {filterOptions.find(option => option.value === filterType)?.icon}
              </button>
            </div>

            <div className="flex items-center gap-1">
              <button
                onClick={() => setCurrency(currency === 'eur' ? 'usd' : 'eur')}
                className="bg-gradient-to-r from-[#2a2d3e] to-[#252837] hover:from-[#3a3d4e] hover:to-[#353847] text-white px-2 py-2 rounded-lg text-sm font-medium transition-all duration-200 border border-gray-600/30 hover:border-gray-500/50 w-8 flex items-center justify-center"
              >
                {currency === 'eur' ? '€' : '$'}
              </button>

              <div className="bg-gradient-to-r from-[#2a2d3e] to-[#252837] px-2 py-2 rounded-lg border border-gray-600/30">
                <div className={`w-2 h-2 rounded-full ${loading ? "bg-yellow-400 animate-pulse" : isRetrying ? "bg-orange-400 animate-pulse" : "bg-green-400"}`}></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default CryptoToolbar
