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

          {/* Status */}
          <div className="flex items-center gap-2 bg-gradient-to-r from-[#2a2d3e] to-[#252837] px-4 py-2 rounded-lg border border-gray-600/30">
            <div className={`w-2 h-2 rounded-full ${loading ? "bg-yellow-400 animate-pulse" : isRetrying ? "bg-orange-400 animate-pulse" : "bg-green-400"}`}></div>
            <span className="text-sm font-medium text-gray-300">
              {loading ? "Chargement..." : isRetrying ? `Retry ${retryCount}` : "En ligne"}
            </span>
          </div>
        </div>

        {/* Mobile - Version améliorée */}
        <div className="md:hidden space-y-4">
          {/* Première ligne - Contrôles principaux */}
          <div className="flex items-center gap-3">
            {/* Tri */}
            <div className="flex items-center gap-2 flex-1">
              <div className="flex items-center gap-1">
                <div className="w-6 h-6 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-md flex items-center justify-center">
                  <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
                  </svg>
                </div>
                <span className="text-xs font-medium text-gray-400">Tri:</span>
              </div>
              <button
                onClick={() => {
                  const currentIndex = sortOptions.findIndex(option => option.value === sortBy);
                  const nextIndex = (currentIndex + 1) % sortOptions.length;
                  setSortBy(sortOptions[nextIndex].value);
                }}
                className="bg-gradient-to-r from-[#2a2d3e] to-[#252837] hover:from-[#3a3d4e] hover:to-[#353847] text-white px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 border border-gray-600/30 hover:border-gray-500/50 flex-1 text-left"
              >
                {sortOptions.find(option => option.value === sortBy)?.shortLabel}
              </button>
              <button
                onClick={() => setSortOrder(sortOrder === 'desc' ? 'asc' : 'desc')}
                className="bg-gradient-to-r from-[#2a2d3e] to-[#252837] hover:from-[#3a3d4e] hover:to-[#353847] text-white px-3 py-2 rounded-lg text-sm transition-all duration-200 border border-gray-600/30 hover:border-gray-500/50 w-10 flex items-center justify-center"
              >
                {sortOrder === 'desc' ? '🔽' : '🔼'}
              </button>
            </div>
          </div>

          {/* Deuxième ligne - Filtre et devise */}
          <div className="flex items-center gap-3">
            {/* Filtre */}
            <div className="flex items-center gap-2 flex-1">
              <div className="flex items-center gap-1">
                <div className="w-6 h-6 bg-gradient-to-r from-amber-500 to-orange-600 rounded-md flex items-center justify-center">
                  <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.707A1 1 0 013 7V4z" />
                  </svg>
                </div>
                <span className="text-xs font-medium text-gray-400">Filtre:</span>
              </div>
              <button
                onClick={() => setFilterType(filterType === 'all' ? 'favorites' : 'all')}
                className="bg-gradient-to-r from-[#2a2d3e] to-[#252837] hover:from-[#3a3d4e] hover:to-[#353847] text-white px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 border border-gray-600/30 hover:border-gray-500/50 flex-1 flex items-center gap-2 justify-center"
              >
                <span>{filterOptions.find(option => option.value === filterType)?.icon}</span>
                <span>{filterOptions.find(option => option.value === filterType)?.shortLabel}</span>
              </button>
            </div>

            {/* Devise */}
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1">
                <div className="w-6 h-6 bg-gradient-to-r from-emerald-500 to-teal-600 rounded-md flex items-center justify-center">
                  <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                  </svg>
                </div>
                <span className="text-xs font-medium text-gray-400">Devise:</span>
              </div>
              <button
                onClick={() => setCurrency(currency === 'eur' ? 'usd' : 'eur')}
                className="bg-gradient-to-r from-[#2a2d3e] to-[#252837] hover:from-[#3a3d4e] hover:to-[#353847] text-white px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 border border-gray-600/30 hover:border-gray-500/50 w-16 flex items-center justify-center"
              >
                {currency === 'eur' ? 'EUR' : 'USD'}
              </button>
            </div>
          </div>
          
          {/* Troisième ligne - Recherche */}
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-2 flex-1">
              <div className="w-6 h-6 bg-gradient-to-r from-purple-500 to-pink-600 rounded-md flex items-center justify-center">
                <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <input
                type="text"
                placeholder="Rechercher une crypto..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="bg-gradient-to-r from-[#2a2d3e] to-[#252837] text-white px-4 py-2 rounded-lg text-sm border border-gray-600/30 focus:border-purple-500/50 focus:outline-none transition-all duration-200 flex-1 placeholder-gray-500"
              />
            </div>
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="bg-gradient-to-r from-gray-600 to-gray-700 hover:from-gray-700 hover:to-gray-800 text-white px-3 py-2 rounded-lg text-sm transition-all duration-200 w-10 h-10 flex items-center justify-center"
              >
                ✕
              </button>
            )}
          </div>

          {/* Statut en bas si nécessaire */}
          <div className="flex justify-center">
            <div className="flex items-center gap-2 bg-gradient-to-r from-[#2a2d3e] to-[#252837] px-3 py-1 rounded-full border border-gray-600/30">
              <div className={`w-2 h-2 rounded-full ${loading ? "bg-yellow-400 animate-pulse" : isRetrying ? "bg-orange-400 animate-pulse" : "bg-green-400"}`}></div>
              <span className="text-xs font-medium text-gray-300">
                {loading ? "Chargement..." : isRetrying ? `Retry ${retryCount}` : "En ligne"}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default CryptoToolbar
