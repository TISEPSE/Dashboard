import React from "react"

const CryptoToolbar = ({
  sortBy,
  setSortBy,
  sortOrder,
  setSortOrder,
  currency,
  setCurrency,
  loading,
  isRetrying,
  retryCount,
  filterType,
  setFilterType,
  searchQuery,
  setSearchQuery,
}) => {
  const sortOptions = [
    { value: "market_cap", label: "Capitalisation", shortLabel: "Capitalisation" },
    { value: "current_price", label: "Prix", shortLabel: "Prix" },
    { value: "name", label: "Nom", shortLabel: "Nom" },
    { value: "market_cap_rank", label: "Classement", shortLabel: "Classement" },
  ]

  const filterOptions = [
    { value: "all", label: "Tous", shortLabel: "Tous", icon: "🌐" },
    { value: "favorites", label: "Favoris", shortLabel: "Favoris", icon: "⭐" },
  ]

  return (
    <div className="bg-gradient-to-r from-[#212332] to-[#1a1d29] border-b border-gray-600/20 z-40 shadow-lg backdrop-blur-sm">
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

            {/* Barre de recherche */}
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-pink-600 rounded-lg flex items-center justify-center">
                  <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
                <span className="text-sm font-medium text-gray-300">Recherche</span>
              </div>
              <input
                type="text"
                placeholder="Nom ou symbole..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="bg-gradient-to-r from-[#2a2d3e] to-[#252837] text-white px-4 py-2 rounded-lg text-sm border border-gray-600/30 focus:border-purple-500/50 focus:outline-none transition-all duration-200 min-w-[200px] placeholder-gray-500"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="bg-gradient-to-r from-gray-600 to-gray-700 hover:from-gray-700 hover:to-gray-800 text-white px-2 py-2 rounded-lg text-sm transition-all duration-200 w-8 h-8 flex items-center justify-center"
                >
                  ✕
                </button>
              )}
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

          </div>

        </div>

        {/* Mobile - Nouveau design avec slider horizontal */}
        <div className="md:hidden">
          {/* Barre de recherche principale */}
          <div className="flex items-center gap-2 mb-3">
            <div className="relative flex-1">
              <div className="absolute left-3 top-1/2 transform -translate-y-1/2">
                <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <input
                type="text"
                placeholder="Rechercher Bitcoin, ETH..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-gradient-to-r from-[#2a2d3e] to-[#252837] text-white pl-10 pr-10 py-3 rounded-2xl text-sm border border-gray-600/30 focus:border-purple-500/50 focus:outline-none transition-all duration-200 placeholder-gray-500"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              )}
            </div>
          </div>

          {/* Slider horizontal pour les contrôles */}
          <div className="overflow-x-auto scrollbar-hide">
            <div className="flex items-center gap-3 pb-2 min-w-max px-1">

              {/* Filtre favoris */}
              <button
                onClick={() => setFilterType(filterType === 'all' ? 'favorites' : 'all')}
                className={`flex items-center gap-2 rounded-2xl p-3 border transition-all duration-200 min-w-fit ${
                  filterType === 'favorites' 
                    ? 'bg-gradient-to-r from-amber-500/20 to-orange-600/20 border-amber-500/50 text-amber-400' 
                    : 'bg-gradient-to-r from-[#2a2d3e] to-[#252837] border-gray-600/30 text-gray-300'
                }`}
              >
                <span className="text-lg">⭐</span>
                <span className="text-sm font-medium whitespace-nowrap">Favoris</span>
              </button>

              {/* Prix croissant/décroissant rapide */}
              <button
                onClick={() => {
                  setSortBy('current_price');
                  setSortOrder(sortOrder === 'desc' ? 'asc' : 'desc');
                }}
                className={`flex items-center gap-2 rounded-2xl p-3 border transition-all duration-200 min-w-fit ${
                  sortBy === 'current_price'
                    ? 'bg-gradient-to-r from-green-500/20 to-emerald-600/20 border-green-500/50 text-green-400'
                    : 'bg-gradient-to-r from-[#2a2d3e] to-[#252837] border-gray-600/30 text-gray-300'
                }`}
              >
                <span className="text-lg">💰</span>
                <span className="text-sm font-medium whitespace-nowrap">Prix</span>
                <span className="text-xs">{sortBy === 'current_price' ? (sortOrder === 'desc' ? '↓' : '↑') : ''}</span>
              </button>

              {/* Capitalisation */}
              <button
                onClick={() => {
                  setSortBy('market_cap');
                  setSortOrder(sortBy === 'market_cap' && sortOrder === 'desc' ? 'asc' : 'desc');
                }}
                className={`flex items-center gap-2 rounded-2xl p-3 border transition-all duration-200 min-w-fit ${
                  sortBy === 'market_cap'
                    ? 'bg-gradient-to-r from-purple-500/20 to-pink-600/20 border-purple-500/50 text-purple-400'
                    : 'bg-gradient-to-r from-[#2a2d3e] to-[#252837] border-gray-600/30 text-gray-300'
                }`}
              >
                <span className="text-lg">📊</span>
                <span className="text-sm font-medium whitespace-nowrap">Capitalisation</span>
                <span className="text-xs">{sortBy === 'market_cap' ? (sortOrder === 'desc' ? '↓' : '↑') : ''}</span>
              </button>

              {/* Variation 24h */}
              <button
                onClick={() => {
                  setSortBy('price_change_percentage_24h');
                  setSortOrder('desc');
                }}
                className={`flex items-center gap-2 rounded-2xl p-3 border transition-all duration-200 min-w-fit ${
                  sortBy === 'price_change_percentage_24h'
                    ? 'bg-gradient-to-r from-red-500/20 to-pink-600/20 border-red-500/50 text-red-400'
                    : 'bg-gradient-to-r from-[#2a2d3e] to-[#252837] border-gray-600/30 text-gray-300'
                }`}
              >
                <span className="text-lg">📈</span>
                <span className="text-sm font-medium whitespace-nowrap">24h</span>
              </button>

              {/* Devise */}
              <button
                onClick={() => setCurrency(currency === 'eur' ? 'usd' : 'eur')}
                className="flex items-center justify-center bg-gradient-to-r from-emerald-500/20 to-teal-600/20 border border-emerald-500/50 rounded-2xl p-3 text-emerald-400 min-w-[80px]"
              >
                <span className="text-sm font-medium whitespace-nowrap">{currency.toUpperCase()}</span>
              </button>
            </div>
          </div>

          {/* Indicateur de statut discret */}
          {(loading || isRetrying) && (
            <div className="flex justify-center mt-2">
              <div className="flex items-center gap-2 bg-gradient-to-r from-[#2a2d3e]/80 to-[#252837]/80 backdrop-blur-sm px-3 py-1 rounded-full border border-gray-600/20">
                <div className={`w-2 h-2 rounded-full ${loading ? "bg-yellow-400 animate-pulse" : "bg-orange-400 animate-pulse"}`}></div>
                <span className="text-xs text-gray-400">
                  {loading ? "Chargement..." : `Retry ${retryCount}`}
                </span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default CryptoToolbar
