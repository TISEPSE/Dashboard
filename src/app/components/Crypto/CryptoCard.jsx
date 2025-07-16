import React from "react"

const Variation = ({ label, value }) => (
  <div className="flex items-center gap-1.5 text-sm">
    <span className="text-gray-400 font-medium">{label}</span>
    <span
      className={`font-semibold px-2.5 py-1 rounded-full text-xs ${
        value >= 0
          ? "bg-green-600/20 text-green-400"
          : "bg-red-600/20 text-red-400"
      }`}
    >
      {value?.toFixed(2)}%
    </span>
  </div>
)

const CryptoCard = ({ coin, currency, onAddClick, onInfoClick }) => {
  return (
    <div className="bg-[#2a2d3e] border border-[#3a3d4e] rounded-lg p-5 hover:border-[#3A6FF8]/50 hover:shadow-lg hover:shadow-[#3A6FF8]/10 transition-all duration-200 group cursor-pointer transform hover:scale-[1.02] hover:-translate-y-1 h-[280px] flex flex-col">
      <div className="flex justify-between items-start mb-5 flex-shrink-0">
        <div className="flex items-center gap-3 flex-1 min-w-0">
          <div className="relative flex-shrink-0">
            <img
              src={coin.image}
              alt={coin.name}
              className="w-9 h-9 rounded-full"
            />
            <div className="absolute -top-1 -right-1 w-4 h-4 bg-[#3A6FF8] rounded-full flex items-center justify-center">
              <span className="text-xs font-bold text-white">
                #{coin.market_cap_rank}
              </span>
            </div>
          </div>
          <div className="min-w-0 flex-1">
            <h3 
              className="text-lg font-bold text-[#FeFeFe] group-hover:text-[#3A6FF8] transition-colors duration-200 truncate"
              title={coin.name} // Tooltip pour voir le nom complet
            >
              {coin.name}
            </h3>
            <p className="text-sm text-gray-400 font-medium truncate">
              {coin.symbol.toUpperCase()}
            </p>
          </div>
        </div>

        <div className="flex flex-col items-end gap-1.5 flex-shrink-0">
          <Variation
            label="1h"
            value={coin.price_change_percentage_1h_in_currency}
          />
          <Variation
            label="24h"
            value={coin.price_change_percentage_24h_in_currency}
          />
          <Variation
            label="7j"
            value={coin.price_change_percentage_7d_in_currency}
          />
        </div>
      </div>

      <div className="mb-5 flex-grow">
        <div className="text-2xl font-bold text-[#FeFeFe] mb-1 truncate" title={`${coin.current_price?.toLocaleString()} ${currency === "eur" ? "€" : "$"}`}>
          {coin.current_price?.toLocaleString()}{" "}
          {currency === "eur" ? "€" : "$"}
        </div>
        <div className="text-sm text-gray-400 truncate" title={`Cap. marché: ${coin.market_cap?.toLocaleString()} ${currency === "eur" ? "€" : "$"}`}>
          Cap. marché: {coin.market_cap?.toLocaleString()}{" "}
          {currency === "eur" ? "€" : "$"}
        </div>
        <div className="text-sm text-gray-400 truncate" title={`Volume 24h: ${coin.total_volume?.toLocaleString()} ${currency === "eur" ? "€" : "$"}`}>
          Volume 24h: {coin.total_volume?.toLocaleString()}{" "}
          {currency === "eur" ? "€" : "$"}
        </div>
      </div>

      <div className="flex gap-2 mt-auto flex-shrink-0">
        <button
          onClick={() => onAddClick?.(coin)}
          className="flex-1 bg-red-500 hover:bg-red-600 text-white py-2 px-3 rounded-lg font-medium text-sm transition-all duration-200 transform hover:scale-105"
        >
          Ajouter
        </button>
        <button
          onClick={() => onInfoClick?.(coin)}
          className="flex-1 bg-[#3A6FF8] hover:bg-[#2952d3] text-white py-2 px-3 rounded-lg font-medium text-sm transition-all duration-200 transform hover:scale-105"
        >
          Info
        </button>
      </div>
    </div>
  )
}

export default CryptoCard