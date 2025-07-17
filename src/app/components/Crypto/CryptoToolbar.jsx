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
    {
      value: "price_change_percentage_7d_in_currency",
      label: "Variation 7j",
      shortLabel: "7j",
    },
    { value: "market_cap_rank", label: "Classement", shortLabel: "Rang" },
    { value: "total_volume", label: "Volume 24h", shortLabel: "Vol." },
  ]

  return (
    <div className="bg-gradient-to-r from-[#212332] to-[#1a1d29] border-b border-gray-600/20 sticky top-0 z-40 shadow-lg backdrop-blur-sm">
      <div className="w-full px-4 sm:px-6 py-3">
        {/* Desktop */}
        <div className="hidden md:flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 bg-[#2a2d3e] px-3 py-2 rounded-lg border border-gray-600/30">
              <span className="text-xs font-medium text-gray-400">Tri</span>
              <select
                value={sortBy}
                onChange={e => setSortBy(e.target.value)}
                className="bg-transparent text-white text-sm focus:outline-none min-w-[120px]"
              >
                {sortOptions.map(option => (
                  <option key={option.value} value={option.value} className="bg-[#2a2d3e] text-white">
                    {option.label}
                  </option>
                ))}
              </select>
              <select
                value={sortOrder}
                onChange={e => setSortOrder(e.target.value)}
                className="bg-transparent text-white text-sm focus:outline-none w-8"
              >
                <option value="desc" className="bg-[#2a2d3e] text-white">🔽</option>
                <option value="asc" className="bg-[#2a2d3e] text-white">🔼</option>
              </select>
            </div>

            <div className="flex items-center gap-2 bg-[#2a2d3e] px-3 py-2 rounded-lg border border-gray-600/30">
              <span className="text-xs font-medium text-gray-400">Devise</span>
              <select
                value={currency}
                onChange={e => setCurrency(e.target.value)}
                className="bg-transparent text-white text-sm focus:outline-none"
              >
                <option value="eur" className="bg-[#2a2d3e] text-white">EUR</option>
                <option value="usd" className="bg-[#2a2d3e] text-white">USD</option>
              </select>
            </div>

            <div className="flex items-center gap-2 bg-[#2a2d3e] px-3 py-2 rounded-lg border border-gray-600/30">
              <span className="text-xs font-medium text-gray-400">Affichage</span>
              <div className="min-w-[60px]">
                <CryptoSelector value={perPage} onChange={setPerPage} />
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 bg-[#2a2d3e] px-3 py-2 rounded-lg border border-gray-600/30">
            <div className={`w-2 h-2 rounded-full ${loading ? "bg-yellow-400 animate-pulse" : isRetrying ? "bg-orange-400 animate-pulse" : "bg-green-400"}`}></div>
            <span className="text-xs font-medium text-gray-300">
              {loading ? "Chargement..." : isRetrying ? `Retry ${retryCount}` : "En ligne"}
            </span>
          </div>
        </div>

        {/* Mobile */}
        <div className="md:hidden">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2 bg-[#2a2d3e] px-2 py-1.5 rounded-lg border border-gray-600/30 flex-1">
              <select
                value={sortBy}
                onChange={e => setSortBy(e.target.value)}
                className="bg-transparent text-white text-xs focus:outline-none flex-1 min-w-0"
              >
                {sortOptions.map(option => (
                  <option key={option.value} value={option.value} className="bg-[#2a2d3e] text-white">
                    {option.shortLabel}
                  </option>
                ))}
              </select>
              <select
                value={sortOrder}
                onChange={e => setSortOrder(e.target.value)}
                className="bg-transparent text-white text-xs focus:outline-none w-6"
              >
                <option value="desc" className="bg-[#2a2d3e] text-white">🔽</option>
                <option value="asc" className="bg-[#2a2d3e] text-white">🔼</option>
              </select>
            </div>

            <div className="flex items-center gap-1">
              <div className="bg-[#2a2d3e] px-2 py-1.5 rounded-lg border border-gray-600/30">
                <select
                  value={currency}
                  onChange={e => setCurrency(e.target.value)}
                  className="bg-transparent text-white text-xs focus:outline-none w-6"
                >
                  <option value="eur" className="bg-[#2a2d3e] text-white">€</option>
                  <option value="usd" className="bg-[#2a2d3e] text-white">$</option>
                </select>
              </div>

              <div className="bg-[#2a2d3e] px-2 py-1.5 rounded-lg border border-gray-600/30">
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
