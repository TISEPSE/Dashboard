import React from "react"

const Variation = ({label, value}) => (
  <div className="flex items-center gap-[0.25em] text-[0.7em]">
    <span className="text-gray-400">{label}</span>
    <span
      className={`font-semibold px-[0.5em] py-[0.em] rounded-full ${
        value >= 0
          ? "bg-green-600/20 text-green-400"
          : "bg-red-600/20 text-red-400"
      }`}
    >
      {value?.toFixed(2)}%
    </span>
  </div>
)

const CryptoCard = ({coin, currency, onAddClick, onInfoClick}) => {
  return (
    <div
      className="bg-[#2a2d3e] border border-[#3a3d4e] rounded-[0.75em] p-[1em]
                 transition-all duration-300 group cursor-pointer flex flex-col h-[16em]
                 hover:border-[#3A6FF8] hover:shadow-[0_8px_20px_rgba(58,111,248,0.4)]
                 hover:scale-[1.05] hover:-translate-y-[0.3em]"
    >
      <div className="flex justify-between items-start">
        <div className="flex items-center gap-[0.5em] flex-1 min-w-0">
          <div className="relative">
            <img
              src={coin.image}
              alt={coin.name}
              className="w-[2.1em] h-[2.1em] rounded-full"
            />
            <div className="absolute -top-[0.5em] -right-[0.5em] w-[1.2em] h-[1.2em] bg-[#3A6FF8] rounded-full flex items-center justify-center">
              <span className="text-[0.6em] font-bold text-white">
                #{coin.market_cap_rank}
              </span>
            </div>
          </div>
          <div className="min-w-0">
            <h3
              className="text-[1.4em] font-bold text-[#FeFeFe] group-hover:text-[#3A6FF8] truncate mt-2 transition-colors duration-200 ease-in-out"
              title={coin.name}
            >
              {coin.name}
            </h3>
            <p className="text-[0.7em] text-gray-400 font-medium truncate">
              {coin.symbol.toUpperCase()}
            </p>
          </div>
        </div>

        <div className="flex flex-col items-end text-[1.2em] gap-[0.5em]">
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

      <div className="mb-2">
        <div
          className="text-[1.4em] font-bold text-[#FeFeFe] truncate"
          title={`${coin.current_price?.toLocaleString()} ${
            currency === "eur" ? "€" : "$"
          }`}
        >
          {coin.current_price?.toLocaleString()}{" "}
          {currency === "eur" ? "€" : "$"}
        </div>
      </div>

      <div className="space-y-[0.2em] text-[0.9em] text-gray-400">
        <div
          className="truncate"
          title={`Cap. marché: ${coin.market_cap?.toLocaleString()} ${
            currency === "eur" ? "€" : "$"
          }`}
        >
          Cap: {coin.market_cap?.toLocaleString()}{" "}
          {currency === "eur" ? "€" : "$"}
        </div>
        <div
          className="truncate"
          title={`Volume 24h: ${coin.total_volume?.toLocaleString()} ${
            currency === "eur" ? "€" : "$"
          }`}
        >
          Volume: {coin.total_volume?.toLocaleString()}{" "}
          {currency === "eur" ? "€" : "$"}
        </div>
      </div>

      <div className="flex gap-[0.75em] mt-auto">
        <button
          onClick={() => onAddClick?.(coin)}
          className="flex-1 bg-red-500 hover:bg-red-600 text-white py-[0.7em] px-[1.2em] rounded-[0.5em] font-medium text-[0.85em] transition-all duration-200 hover:scale-[1.03]"
        >
          Ajouter
        </button>
        <button
          onClick={() => onInfoClick?.(coin)}
          className="flex-1 bg-[#3A6FF8] hover:bg-[#2952d3] text-white py-[0.7em] px-[1.2em] rounded-[0.5em] font-medium text-[0.85em] transition-all duration-200 hover:scale-[1.03]"
        >
          Info
        </button>
      </div>
    </div>
  )
}

export default CryptoCard
