"use client"

import React, { useEffect, useState } from "react"
import axios from "axios"
import CryptoSelector from "../../components/Crypto/CryptoSelector"

const cryptoAPI = axios.create({
  baseURL: "https://api.coingecko.com/api/v3",
  timeout: 10000,
  headers: { "Content-Type": "application/json" },
})

cryptoAPI.interceptors.response.use(
  response => response,
  error => {
    if (error.code === "ECONNABORTED") {
      console.error("Timeout: La requête a pris trop de temps")
    } else if (error.response?.status === 429) {
      console.error("Rate limit atteint, veuillez réessayer plus tard")
    } else if (error.response?.status >= 500) {
      console.error("Erreur serveur CoinGecko")
    } else {
      console.error("Erreur API:", error.message)
    }
    return Promise.reject(error)
  }
)

export default function CryptoDashboardClient() {
  const maxPerPage = 250
  const [cryptos, setCryptos] = useState([])
  const [perPage, setPerPage] = useState(6)
  const [page, setPage] = useState(1)
  const [error, setError] = useState(null)
  const [currency, setCurrency] = useState("eur")
  const [loading, setLoading] = useState(false)

  const isPaginationActive = perPage === "all"

  const fetchCryptos = async () => {
    try {
      setLoading(true)
      setError(null)

      const perPageParam = isPaginationActive ? maxPerPage : perPage
      const pageParam = isPaginationActive ? page : 1

      const response = await cryptoAPI.get("/coins/markets", {
        params: {
          vs_currency: currency,
          order: "market_cap_desc",
          per_page: perPageParam,
          page: pageParam,
          price_change_percentage: "1h,24h,7d",
        },
      })

      setCryptos(response.data)
    } catch (err) {
      setError(err.message)
      console.error("Erreur lors du chargement des cryptos:", err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchCryptos()
    const fetchInterval = setInterval(() => {
      fetchCryptos()
    }, 10000)

    const reloadInterval = setInterval(() => {
      window.location.reload()
    }, 10000)

    return () => {
      clearInterval(fetchInterval)
      clearInterval(reloadInterval)
    }
  }, [perPage, page, currency])

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center bg-red-500/10 border border-red-500 rounded-lg p-6 max-w-md">
          <p className="text-red-400 text-xl mb-2">Erreur de chargement</p>
          <p className="text-gray-300 mb-4">{error}</p>
          <button
            onClick={() => fetchCryptos()}
            className="bg-[#3A6FF8] hover:bg-[#2952d3] text-white px-4 py-2 rounded-lg transition-colors"
          >
            Réessayer
          </button>
        </div>
      </div>
    )
  }

  const Variation = ({ label, value }) => (
    <div className="flex items-center gap-1 text-xs">
      <span className="text-gray-400">{label}</span>
      <span
        className={`font-semibold px-2 py-0.5 rounded-full ${
          value >= 0 ? "bg-green-600/20 text-green-400" : "bg-red-600/20 text-red-400"
        }`}
      >
        {value?.toFixed(2)}%
      </span>
    </div>
  )

  const renderCard = (coin) => (
    <div
      key={coin.id}
      className="
        bg-[#2a2d3e] rounded-lg p-4 flex flex-col justify-between hover:bg-[#323654] 
        transition-transform duration-150 m-1 overflow-visible
        transform hover:scale-110 hover:shadow-2xl
        group
        relative
        hover:z-50
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
          <button
            className="w-24 px-3 py-1 border border-red-500 text-red-500 rounded transition hover:bg-red-500 hover:text-white"
          >
            Ajouter
          </button>
          <button
            className="w-24 px-3 py-1 border border-blue-500 text-blue-500 rounded transition hover:bg-blue-500 hover:text-white"
          >
            Info
          </button>
        </div>
      </div>
    </div>
  )

  return (
    <div className="min-h-screen text-[#FeFeFe] bg-[#212332] px-4 py-4">
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 mb-6 px-4">
        <h1 className="text-xl font-bold text-white bg-[#3A6FF8] px-4 py-2 rounded-xl shadow-md text-center sm:text-left">
          Classement des cryptos par Capitalisation Boursières (Top {cryptos.length})
        </h1>

        <div className="flex items-center gap-2">
          <label htmlFor="currency" className="text-[#FeFeFe] font-semibold">
            Devise:
          </label>
          <select
            id="currency"
            value={currency}
            onChange={e => setCurrency(e.target.value)}
            className="bg-[#2a2d3e] text-[#FeFeFe] border border-gray-600 rounded px-2 py-1"
          >
            <option value="eur">EUR (€)</option>
            <option value="usd">USD ($)</option>
          </select>
        </div>

        <CryptoSelector value={perPage} onChange={setPerPage} />
      </div>

      <div className="flex flex-wrap justify-start overflow-visible">{cryptos.map(renderCard)}</div>

      {isPaginationActive && (
        <div className="flex justify-center gap-4 mt-6">
          <button
            disabled={page === 1}
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            className="bg-[#3A6FF8] hover:bg-[#2952d3] text-white px-4 py-2 rounded-lg disabled:opacity-50 transition"
          >
            Page précédente
          </button>
          <button
            onClick={() => setPage((p) => p + 1)}
            className="bg-[#3A6FF8] hover:bg-[#2952d3] text-white px-4 py-2 rounded-lg transition"
          >
            Page suivante
          </button>
        </div>
      )}
    </div>
  )
}
