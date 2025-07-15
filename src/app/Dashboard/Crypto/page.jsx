"use client"

import React, {useEffect, useState, useRef} from "react"

export default function CryptoDashboardClient() {
  const [cryptos, setCryptos] = useState([])
  const [loading, setLoading] = useState(true)
  const carouselRefs = useRef([])

  useEffect(() => {
    fetch(
      "https://api.coingecko.com/api/v3/coins/markets?vs_currency=eur&order=market_cap_desc&per_page=25&page=1&price_change_percentage=1h,24h,7d"
    )
      .then(res => res.json())
      .then(data => {
        setCryptos(data)
        setLoading(false)
      })
      .catch(err => {
        console.error(err)
        setLoading(true)
      })
  }, [])

  useEffect(() => {
    const cleanupFunctions = []

    carouselRefs.current.forEach(carousel => {
      if (!carousel) return

      let isDown = false
      let startX
      let scrollLeft

      // Drag avec souris
      const onMouseDown = e => {
        isDown = true
        carousel.classList.add("cursor-grabbing")
        // Désactive temporairement le scroll smooth pour le drag
        carousel.style.scrollBehavior = "auto"
        startX = e.pageX - carousel.offsetLeft
        scrollLeft = carousel.scrollLeft
      }

      const onMouseUp = () => {
        isDown = false
        carousel.classList.remove("cursor-grabbing")
        // Réactive le scroll smooth après le drag
        carousel.style.scrollBehavior = "smooth"
      }

      const onMouseMove = e => {
        if (!isDown) return
        e.preventDefault()
        const x = e.pageX - carousel.offsetLeft
        const walk = (x - startX) * 1.5 // Réduit le multiplicateur pour plus de contrôle
        carousel.scrollLeft = scrollLeft - walk
      }

      // Scroll molette horizontal fluide
      const onWheel = e => {
        e.preventDefault()
        // Désactive temporairement le smooth scroll pour éviter les conflits
        carousel.style.scrollBehavior = "auto"

        // Calcul de la distance de scroll basée sur la vitesse de rotation
        const scrollAmount = e.deltaY * 0.8
        carousel.scrollLeft += scrollAmount
      }

      // Touch pour mobile
      const onTouchStart = e => {
        isDown = true
        carousel.style.scrollBehavior = "auto"
        startX = e.touches[0].pageX - carousel.offsetLeft
        scrollLeft = carousel.scrollLeft
      }

      const onTouchEnd = () => {
        isDown = false
        carousel.style.scrollBehavior = "smooth"
      }

      const onTouchMove = e => {
        if (!isDown) return
        e.preventDefault()
        const x = e.touches[0].pageX - carousel.offsetLeft
        const walk = (x - startX) * 1.5
        carousel.scrollLeft = scrollLeft - walk
      }

      // Event listeners
      carousel.addEventListener("mousedown", onMouseDown)
      carousel.addEventListener("mouseup", onMouseUp)
      carousel.addEventListener("mouseleave", onMouseUp)
      carousel.addEventListener("mousemove", onMouseMove)
      carousel.addEventListener("wheel", onWheel, {passive: false})
      carousel.addEventListener("touchstart", onTouchStart, {passive: false})
      carousel.addEventListener("touchend", onTouchEnd)
      carousel.addEventListener("touchmove", onTouchMove, {passive: false})

      // Nettoyage
      cleanupFunctions.push(() => {
        carousel.removeEventListener("mousedown", onMouseDown)
        carousel.removeEventListener("mouseup", onMouseUp)
        carousel.removeEventListener("mouseleave", onMouseUp)
        carousel.removeEventListener("mousemove", onMouseMove)
        carousel.removeEventListener("wheel", onWheel)
        carousel.removeEventListener("touchstart", onTouchStart)
        carousel.removeEventListener("touchend", onTouchEnd)
        carousel.removeEventListener("touchmove", onTouchMove)
      })
    })

    return () => {
      cleanupFunctions.forEach(cleanup => cleanup())
    }
  }, [cryptos])

  if (loading) {
    return (
      <p className="flex items-center justify-center min-h-screen text-[2em]">
        Chargement...
      </p>
    )
  }

  const splitIntoThreeCarousels = array => {
    const total = array.length
    const part = Math.ceil(total / 3)
    return [
      array.slice(0, part),
      array.slice(part, part * 2),
      array.slice(part * 2),
    ]
  }

  const groups = splitIntoThreeCarousels(cryptos)

  const Variation = ({label, value}) => (
    <div className="flex items-center gap-1 text-xs">
      <span className="text-gray-400">{label}</span>
      <span
        className={`font-semibold px-2 py-0.5 rounded-full ${
          value >= 0
            ? "bg-green-600/20 text-green-400"
            : "bg-red-600/20 text-red-400"
        }`}
      >
        {value?.toFixed(2)}%
      </span>
    </div>
  )

  const renderCard = coin => (
    <div
      key={coin.id}
      className="bg-[#2a2d3e] rounded-xl p-4 min-w-[20rem] w-[20rem] flex-shrink-0 flex flex-col justify-between transition-all duration-300 hover:scale-110 hover:bg-[#323654] relative"
      style={{
        filter: "none",
      }}
      onMouseEnter={e => {
        e.currentTarget.style.filter =
          "drop-shadow(0 8px 16px rgba(0, 0, 0, 0.15))"
      }}
      onMouseLeave={e => {
        e.currentTarget.style.filter = "none"
      }}
    >
      <div className="flex justify-between gap-2">
        <div className="w-2/3 break-words">
          <img src={coin.image} alt={coin.name} className="w-7 h-7 mb-2" />
          <span className="text-[#d1d1d1] text-base font-semibold block truncate">
            {coin.name} ({coin.symbol.toUpperCase()})
          </span>
          <span className="text-lg block mt-1">{coin.current_price} €</span>
        </div>
        <div className="w-1/3 flex flex-col items-end gap-1 mt-1">
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
      <div className="mt-4 flex justify-center gap-3">
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
    <div className="min-h-screen text-[#FeFeFe] bg-[#212332] px-4 py-6">
      <div className="flex items-center justify-center">
        <h1 className="font-bold text-lg mb-6 bg-[#3A6FF8] p-4 rounded-xl">
          Top {cryptos.length} des cryptos du moment
        </h1>
      </div>

      {groups.map((group, idx) =>
        group.length > 0 ? (
          <div
            key={idx}
            ref={el => (carouselRefs.current[idx] = el)}
            className="flex overflow-x-scroll gap-6 scrollbar-hide cursor-grab select-none py-3"
            style={{
              scrollBehavior: "smooth",
              WebkitOverflowScrolling: "touch",
            }}
          >
            {group.map(renderCard)}
          </div>
        ) : null
      )}
    </div>
  )
}
