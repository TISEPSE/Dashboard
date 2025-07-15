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
  const [perPage, setPerPage] = useState(20)
  const [page, setPage] = useState(1)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const isPaginationActive = perPage === "all"

  useEffect(() => {
    const fetchCryptos = async () => {
      try {
        setLoading(true)
        setError(null)

        const perPageParam = isPaginationActive ? maxPerPage : perPage
        const pageParam = isPaginationActive ? page : 1

        const response = await cryptoAPI.get("/coins/markets", {
          params: {
            vs_currency: "eur",
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

    fetchCryptos()
  }, [perPage, page])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-[#3A6FF8] mx-auto mb-4"></div>
          <p className="text-[2em] text-[#FeFeFe]">Chargement...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center bg-red-500/10 border border-red-500 rounded-lg p-6 max-w-md">
          <p className="text-red-400 text-xl mb-2">Erreur de chargement</p>
          <p className="text-gray-300 mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
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
        transition-transform duration-150 m-1 flex-grow-0 flex-shrink-0 h-[11em] overflow-hidden
        transform hover:scale-110 hover:shadow-2xl
        group
        relative
      "
      style={{ flexBasis: "calc(100% / 6 - 0.5rem)" }}
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
            {coin.current_price} €
          </span>
        </div>
        <div className="w-1/3 flex flex-col items-end gap-0.5 mt-1">
          <Variation label="1h" value={coin.price_change_percentage_1h_in_currency} />
          <Variation label="24h" value={coin.price_change_percentage_24h_in_currency} />
          <Variation label="7j" value={coin.price_change_percentage_7d_in_currency} />
        </div>
      </div>

      <span className="absolute bottom-2 left-2 text-gray-500 text-xs font-mono select-none">
        #{coin.market_cap_rank}
      </span>

      <div className="mt-3 flex justify-center gap-2">
        <button className="btn btn-base btn-outline btn-error w-24 transition-all duration-200 hover:scale-105">
          Ajouter
        </button>
        <button className="btn btn-base btn-outline btn-info w-24 transition-all duration-200 hover:scale-105">
          Info
        </button>
      </div>
    </div>
  )

  return (
    <div className="min-h-screen text-[#FeFeFe] bg-[#212332] px-4 py-4">
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 mb-6 px-4">
        <h1 className="text-xl font-bold text-white bg-[#3A6FF8] px-4 py-2 rounded-xl shadow-md text-center sm:text-left">
          Classement des cryptos par Capitalisation Bourssières (Top {cryptos.length})
        </h1>
        <CryptoSelector value={perPage} onChange={setPerPage} />
      </div>

      <div className="flex flex-wrap justify-start">{cryptos.map(renderCard)}</div>

      {isPaginationActive && (
        <div className="flex justify-center gap-4 mt-6">
          <button
            disabled={page === 1}
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            className="bg-[#3A6FF8] hover:bg-[#2952d3] text-white px-4 py-2 rounded-lg disabled:opacity-50"
          >
            Page précédente
          </button>
          <button
            onClick={() => setPage((p) => p + 1)}
            className="bg-[#3A6FF8] hover:bg-[#2952d3] text-white px-4 py-2 rounded-lg"
          >
            Page suivante
          </button>
        </div>
      )}
    </div>
  )
}
