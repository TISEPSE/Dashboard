import React, { useEffect, useRef } from "react"

const Variation = ({label, value}) => (
  <div className="flex items-center gap-[0.3em] text-[0.75em]">
    <span className="text-gray-400 font-medium">{label}</span>
    <span
      className={`font-semibold px-[0.4em] py-[0.1em] rounded ${
        value >= 0
          ? "bg-emerald-500/20 text-emerald-300"
          : "bg-red-500/20 text-red-300"
      }`}
    >
      {value >= 0 ? '+' : ''}{value?.toFixed(2)}%
    </span>
  </div>
)

const CryptoCard = ({coin, currency, onAddClick, onInfoClick, index = 0, hasInteracted = false, shouldAnimate = false, onVisible}) => {
  const cardRef = useRef(null)

  useEffect(() => {
    if (!shouldAnimate && onVisible) {
      const observer = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) {
            onVisible()
            observer.disconnect()
          }
        },
        {
          threshold: 0.1,
          rootMargin: '50px'
        }
      )

      if (cardRef.current) {
        observer.observe(cardRef.current)
      }

      return () => observer.disconnect()
    }
  }, [shouldAnimate, onVisible])

  return (
    <div
      ref={cardRef}
      className={`bg-[#2a2d3e] border border-[#3a3d4e] rounded-[0.75em] p-[1em]
                 transition-all duration-300 group cursor-pointer flex flex-col h-[16em]
                 hover:border-[#3A6FF8] hover:shadow-[0_0_40px_rgba(58,111,248,0.6)]
                 hover:bg-gradient-to-br hover:from-[#2a2d3e] hover:to-[#3A6FF8]/10
                 hover:scale-[1.02] hover:-translate-y-[0.2em]
                 overflow-hidden relative
                 before:absolute before:inset-0 before:bg-gradient-to-r before:from-transparent before:via-white/5 before:to-transparent
                 before:transform before:-translate-x-full before:transition-transform before:duration-700
                 hover:before:translate-x-full
                 ${shouldAnimate ? 'animate-[fadeInUp_0.3s_ease-out_forwards] opacity-0' : 'opacity-100'}`}
      style={{
        animationDelay: shouldAnimate ? `${index * 0.05}s` : '0s'
      }}
    >
      <div className="flex justify-between items-start mb-3">
        <div className="flex items-center gap-[0.6em] flex-1 min-w-0">
          <div className="relative">
            <img
              src={coin.image}
              alt={coin.name}
              className="w-[2.2em] h-[2.2em] rounded-full"
            />
            <div className="absolute -top-[0.4em] -right-[0.4em] w-[1.3em] h-[1.3em] bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full flex items-center justify-center shadow-lg border-2 border-[#2a2d3e]">
              <span className="text-[0.6em] font-bold text-white leading-none">
                #{coin.market_cap_rank}
              </span>
            </div>
          </div>
          <div className="min-w-0">
            <h3
              className="text-[1.3em] font-bold text-[#FeFeFe] truncate transition-colors duration-200 ease-in-out"
              title={coin.name}
            >
              {coin.name}
            </h3>
            <p className="text-[0.75em] text-gray-400 font-medium truncate">
              {coin.symbol.toUpperCase()}
            </p>
          </div>
        </div>

        <div className="flex flex-col items-end text-[1em] gap-[0.3em]">
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

      <div className="mb-4">
        <div
          className="text-[1.6em] font-bold text-[#FeFeFe] truncate"
          title={`${coin.current_price?.toLocaleString()} ${
            currency === "eur" ? "€" : "$"
          }`}
        >
          {coin.current_price?.toLocaleString()}{" "}
          <span className="text-[0.7em] text-gray-400">
            {currency === "eur" ? "€" : "$"}
          </span>
        </div>
      </div>

      <div className="space-y-[0.3em] text-[0.8em] text-gray-400 mb-4">
        <div className="flex justify-between items-center">
          <span className="text-gray-400">Cap. marché</span>
          <span className="font-medium text-gray-200">
            {coin.market_cap?.toLocaleString()} {currency === "eur" ? "€" : "$"}
          </span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-gray-400">Volume 24h</span>
          <span className="font-medium text-gray-200">
            {coin.total_volume?.toLocaleString()} {currency === "eur" ? "€" : "$"}
          </span>
        </div>
      </div>

      <div className="flex gap-[0.5em] mt-auto">
        <button
          onClick={() => onAddClick?.(coin)}
          className="flex-1 bg-gradient-to-r from-emerald-600 to-emerald-700 text-white py-[0.6em] px-[1em] rounded-[0.4em] font-medium text-[0.8em] border border-emerald-500/20 transform transition-all duration-500 ease-out hover:from-emerald-500 hover:to-emerald-600 hover:shadow-lg hover:shadow-emerald-500/30 hover:border-emerald-400/60 hover:scale-[1.03] hover:-translate-y-[2px] active:scale-[0.97] active:translate-y-[0px] active:duration-150"
        >
          Ajouter
        </button>
        <button
          onClick={() => onInfoClick?.(coin)}
          className="flex-1 bg-gradient-to-r from-slate-600 to-slate-700 text-white py-[0.6em] px-[1em] rounded-[0.4em] font-medium text-[0.8em] border border-slate-500/20 transform transition-all duration-500 ease-out hover:from-slate-500 hover:to-slate-600 hover:shadow-lg hover:shadow-slate-500/30 hover:border-slate-400/60 hover:scale-[1.03] hover:-translate-y-[2px] active:scale-[0.97] active:translate-y-[0px] active:duration-150"
        >
          Info
        </button>
      </div>
    </div>
  )
}

export default CryptoCard
