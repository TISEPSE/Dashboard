import React from "react"
import Variation from "./Variation"

export default function CryptoCard({ coin, currency }) {
  return (
    <div
      className="
        bg-[#2a2d3e] rounded-lg p-4 flex flex-col justify-between hover:bg-[#323654] 
        transition-transform duration-150 m-1 overflow-visible
        transform hover:scale-110 hover:shadow-2xl
        group relative hover:z-50
      "
      style={{ width: "calc((100% / 6) - 0.8rem)", height: "11em" }}
    >
      <div className="flex justify-between gap-2">
        <div className="w-2/3 break-words">
          <div className="flex items-center gap-2 mb-1">
            <img src={coin.image} alt={coin.name} className="w-7 h-7" />
            <span
              title={`${coin.name} (${coin.symbol.toUpperCase()})`}
              className="
                text-lg font-semibold truncate text-[#FeFeFe]
                group-hover:text-[#a0a0a0]
                transition-colors duration-100
              "
            >
              {coin.name} ({coin.symbol.toUpperCase()})
            </span>
          </div>
          <span
            className="
              text-2xl font-bold block mt-4 text-[#a0a0a0]
              group-hover:text-[#FeFeFe]
              transition-colors duration-100
            "
          >
            {coin.current_price} {currency === "eur" ? "€" : "$"}
          </span>
        </div>
        <div className="w-1/3 flex flex-col items-end gap-0.5 mt-1">
          <Variation label="1h" value={coin.price_change_percentage_1h_in_currency} />
          <Variation label="24h" value={coin.price_change_percentage_24h_in_currency} />
          <Variation label="7j" value={coin.price_change_percentage_7d_in_currency} />
        </div>
      </div>

      <div className="mt-3 flex justify-between items-center">
        <span className="text-gray-500 text-xs font-mono select-none">
          #{coin.market_cap_rank}
        </span>
        <div className="flex gap-2">
          <button className="w-24 px-3 py-1 border border-red-500 text-red-500 rounded transition hover:bg-red-500 hover:text-white">
            Ajouter
          </button>
          <button className="w-24 px-3 py-1 border border-blue-500 text-blue-500 rounded transition hover:bg-blue-500 hover:text-white">
            Info
          </button>
        </div>
      </div>
    </div>
  )
}
