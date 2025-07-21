"use client"

import {useState, useEffect} from "react"
import Link from "next/link"
import {usePathname} from "next/navigation"
import {FaBars, FaTimes, FaChartBar} from "react-icons/fa"
import {useCryptoContext} from "../context/CryptoContext"
import AuthButton from "./Auth/AuthButton"

export default function Navbar({isOpen, setIsOpen}) {
  const [hasMounted, setHasMounted] = useState(false)
  const [dashboardOpen, setDashboardOpen] = useState(false)
  const pathname = usePathname()
  const {cryptoPaginationData} = useCryptoContext()

  useEffect(() => {
    setHasMounted(true)
  }, [])

  if (!hasMounted) return null

  const isCryptoPage = pathname === "/Dashboard/Crypto"
  const showPagination =
    isCryptoPage && cryptoPaginationData?.isPaginationEnabled

  return (
    <>
      {/* Bouton flottant mobile - repositionné pour l'accès facile */}
      <div
        className="md:hidden fixed bottom-6 right-6 z-[999]"
        style={{
          paddingBottom: "env(safe-area-inset-bottom, 0px)",
        }}
      >
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="w-14 h-14 bg-gradient-to-r from-[#3A6FF8] to-[#2952d3] hover:from-[#2952d3] hover:to-[#1e3a8a] text-white rounded-full transition-all duration-200 shadow-xl flex items-center justify-center transform hover:scale-110 active:scale-95 touch-none"
          aria-label={isOpen ? "Fermer la navbar" : "Ouvrir la navbar"}
        >
          <div className="transition-transform duration-300 pointer-events-none">
            {isOpen ? <FaTimes size={20} /> : <FaBars size={20} />}
          </div>
        </button>
      </div>

      {/* Overlay */}
      {isOpen && (
        <div
          className="md:hidden fixed inset-0 bg-black bg-opacity-50 z-[55] transition-opacity duration-300"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Navigation - Desktop sidebar / Mobile bottom sheet */}
      <div
        className={`
          fixed z-[60] bg-gradient-to-br from-[#2a2d3e] to-[#212332] text-white flex flex-col overflow-y-auto transition-all duration-300 shadow-2xl
          md:top-0 md:left-0 md:h-screen md:border-r md:border-gray-600/30 md:rounded-none
          ${
            isOpen
              ? "md:w-64 bottom-0 left-0 right-0 h-[85vh] max-h-[600px] rounded-t-3xl border-t border-gray-600/30"
              : "md:w-16 md:min-w-[64px] -bottom-full left-0 right-0 h-0 md:border-r md:border-gray-600/30"
          }
        `}
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        {/* Handle mobile - indicateur de tirage */}
        <div className="md:hidden flex justify-center py-3">
          <div className="w-12 h-1 bg-gray-400 rounded-full opacity-50"></div>
        </div>

        <div
          className={`flex items-center justify-between p-4 md:pt-6 text-xl font-bold bg-gradient-to-b from-[#2a2d3e]/20 via-[#2a2d3e]/10 to-transparent border-b border-gray-600/30 md:border-b ${
            isOpen ? "gap-2" : "md:justify-center"
          }`}
          style={{minHeight: "72px"}}
        >
          <div className="flex items-center gap-2 overflow-hidden">
            <div className="relative">
              <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-blue-700 rounded-lg flex items-center justify-center shadow-lg">
                <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
            </div>
            <div
              className={`transition-all duration-500 ease-in-out ${
                isOpen
                  ? "opacity-100 max-w-[200px] transform translate-x-0"
                  : "md:opacity-0 md:max-w-0 md:transform md:-translate-x-4"
              }`}
            >
              <Link href="/" className="whitespace-nowrap">
                <span className="bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
                  Dashboard
                </span>
              </Link>
            </div>
          </div>

          <button
            onClick={() => setIsOpen(!isOpen)}
            className="hidden md:block text-white bg-gradient-to-r from-blue-600 to-blue-700 p-3 rounded-xl cursor-pointer flex-shrink-0 transition-all duration-200 hover:from-blue-700 hover:to-blue-800 shadow-lg hover:shadow-xl transform hover:scale-105 active:scale-95 touch-none"
            aria-label={isOpen ? "Fermer la navbar" : "Ouvrir la navbar"}
          >
            <div className="transition-transform duration-200 pointer-events-none">
              {isOpen ? <FaTimes size={20} /> : <FaBars size={20} />}
            </div>
          </button>
        </div>

        <div
          className={`transition-all duration-300 ease-in-out flex-1 overflow-auto ${
            isOpen
              ? "opacity-100 max-h-screen transform translate-y-0"
              : "md:opacity-0 md:max-h-0 md:transform md:-translate-y-4 md:pointer-events-none"
          }`}
        >
          <nav className="flex flex-col gap-4 p-4 md:px-6 md:py-6 h-full overflow-auto" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
            
            {/* Navigation mobile optimisée - Grille des liens principaux */}
            <div className="md:hidden">
              <h3 className="text-sm font-medium text-gray-400 mb-4 px-2">Navigation</h3>
              <div className="grid grid-cols-2 gap-3 mb-6">
                {[
                  {href: "/Dashboard/Crypto", label: "Cryptos", icon: "₿", color: "from-orange-500 to-yellow-500"},
                  {href: "/Dashboard/Message", label: "Messages", icon: "💬", color: "from-blue-500 to-cyan-500"},
                  {href: "/Dashboard/Meteo", label: "Météo", icon: "🌤️", color: "from-sky-500 to-blue-500"},
                  {href: "/Dashboard/Sport", label: "Sport", icon: "⚽", color: "from-green-500 to-emerald-500"},
                ].map((item, index) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`relative group flex flex-col items-center justify-center p-4 rounded-2xl transition-all duration-300 hover:scale-105 active:scale-95 ${
                      pathname === item.href
                        ? "bg-gradient-to-br " + item.color + " shadow-lg"
                        : "bg-white/5 hover:bg-white/10"
                    }`}
                    onClick={(e) => {
                      e.stopPropagation();
                      setIsOpen(false);
                    }}
                  >
                    <div className={`text-2xl mb-2 transition-transform duration-300 group-hover:scale-110 ${
                      pathname === item.href ? "drop-shadow-sm" : ""
                    }`}>
                      {item.icon}
                    </div>
                    <span className={`text-sm font-medium text-center ${
                      pathname === item.href ? "text-white" : "text-gray-300"
                    }`}>
                      {item.label}
                    </span>
                    {pathname === item.href && (
                      <div className="absolute inset-0 bg-white/10 rounded-2xl"></div>
                    )}
                  </Link>
                ))}
              </div>
              
              {/* Liens additionnels */}
              <div className="grid grid-cols-1 gap-3">
                <Link
                  href="/Dashboard/Calendrier"
                  className={`flex items-center gap-4 p-4 rounded-2xl transition-all duration-300 hover:scale-[1.02] active:scale-95 ${
                    pathname === "/Dashboard/Calendrier"
                      ? "bg-gradient-to-br from-purple-500 to-pink-500 shadow-lg"
                      : "bg-white/5 hover:bg-white/10"
                  }`}
                  onClick={(e) => {
                    e.stopPropagation();
                    setIsOpen(false);
                  }}
                >
                  <div className="text-2xl">📅</div>
                  <span className="font-medium text-gray-300 flex-1">Calendrier</span>
                </Link>
                
                <Link
                  href="/Dashboard/Parametre"
                  className={`flex items-center gap-4 p-4 rounded-2xl transition-all duration-300 hover:scale-[1.02] active:scale-95 ${
                    pathname === "/Dashboard/Parametre"
                      ? "bg-gradient-to-br from-gray-600 to-gray-700 shadow-lg"
                      : "bg-white/5 hover:bg-white/10"
                  }`}
                  onClick={(e) => {
                    e.stopPropagation();
                    setIsOpen(false);
                  }}
                >
                  <div className="text-2xl">⚙️</div>
                  <span className="font-medium text-gray-300 flex-1">Paramètres</span>
                </Link>
              </div>
            </div>

            {/* Navigation desktop - structure existante */}
            <div className="hidden md:block">
              <div 
                className="bg-gradient-to-r from-[#2a2d3e] to-[#252837] border border-gray-500/50 text-white rounded-xl shadow-xl animate-[slideInLeft_0.5s_ease-out]"
                onClick={(e) => e.stopPropagation()}
              >
                <div
                  onClick={(e) => {
                    e.stopPropagation();
                    setDashboardOpen(!dashboardOpen);
                  }}
                  className="flex items-center justify-between p-4 cursor-pointer font-bold select-none"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg flex items-center justify-center shadow-lg border border-blue-400/30">
                      <svg
                        className="w-4 h-4 text-white"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
                        />
                      </svg>
                    </div>
                    <span className="text-lg font-semibold text-white drop-shadow-sm">Dashboard</span>
                  </div>
                  <div
                    className={`w-8 h-8 flex items-center justify-center text-gray-400 transition-transform duration-300 ease-in-out ${
                      dashboardOpen ? "rotate-180" : ""
                    }`}
                  >
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 9l-7 7-7-7"
                      />
                    </svg>
                  </div>
                </div>
                <div
                  className={` transition-all duration-300 ease-in-out px-4 flex flex-col gap-3 ${
                    dashboardOpen
                      ? "max-h-[calc(100vh-80px)] opacity-100 pb-4"
                      : "max-h-0 opacity-0 pointer-events-none"
                  }`}
                  onClick={(e) => e.stopPropagation()}
                >
                  {[
                    {href: "/Dashboard/Crypto", label: "Cryptos", icon: "₿"},
                    {href: "/Dashboard/Message", label: "Messages", icon: "💬"},
                    {href: "/Dashboard/Meteo", label: "Météo", icon: "🌤️"},
                    {href: "/Dashboard/Sport", label: "Sport", icon: "⚽"},
                    {
                      href: "/Dashboard/Calendrier",
                      label: "Calendrier",
                      icon: "📅",
                    },
                  ].map((item, index) => (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={`block w-full hover:text-blue-300 hover:bg-white/10 transition-all duration-300 rounded-lg group hover:scale-105 hover:shadow-lg animate-[slideInFromLeft_0.4s_ease-out] border border-transparent hover:border-blue-400/30 ${
                        pathname === item.href
                          ? "bg-blue-600/30 text-blue-300 border-blue-400/50 shadow-lg"
                          : "text-gray-200"
                      }`}
                      style={{
                        animationDelay: `${0.2 + index * 0.1}s`
                      }}
                      onClick={(e) => {
                        e.stopPropagation();
                        setIsOpen(false);
                      }}
                    >
                      <div className="flex items-center gap-2 py-3 px-3 w-full h-full">
                        <span className="text-lg transition-transform duration-300 group-hover:scale-110">{item.icon}</span>
                        <span className="font-medium group-hover:translate-x-2 transition-transform duration-300 flex-1">
                          {item.label}
                        </span>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            </div>

            {/* Paramètres - desktop uniquement */}
            <div className="hidden md:block">
              <div 
                className="flex flex-col gap-3"
                onClick={(e) => e.stopPropagation()}
              >
                <Link
                  href="/Dashboard/Parametre"
                  className={`block w-full hover:text-blue-300 hover:bg-gradient-to-r hover:from-blue-600/15 hover:to-blue-600/10 hover:border-blue-500/50 hover:shadow-lg hover:shadow-blue-600/25 transition-all duration-300 rounded-lg group border border-gray-500/40 bg-gradient-to-r from-[#2a2d3e] to-[#252837] shadow-lg transform hover:scale-105 hover:-translate-y-0.5 animate-[slideInRight_0.5s_ease-out] ${
                    pathname === "/Dashboard/Parametre"
                      ? "bg-blue-600/30 text-blue-300 border-blue-500/50 shadow-xl"
                      : "text-gray-200"
                  }`}
                  style={{
                    animationDelay: "0.8s"
                  }}
                  onClick={(e) => {
                    e.stopPropagation();
                    setIsOpen(false);
                  }}
                >
                  <div className="flex items-center gap-3 py-3 px-4 w-full h-full">
                    <span className="text-lg transition-transform duration-300 group-hover:scale-110">⚙️</span>
                    <span className="font-medium group-hover:translate-x-0.5 transition-transform duration-300 flex-1">
                      Paramètres
                    </span>
                  </div>
                </Link>
              </div>
            </div>

            {/* Section profil et infos */}
            <div className="mt-auto pt-4 border-t border-gray-600/30 space-y-3 pb-6 md:pb-0">
              <div className="w-full">
                <AuthButton setIsOpen={setIsOpen} />
              </div>
              <div className="flex items-center justify-between text-sm text-gray-400">
                <span>v1.0.0</span>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                  <span>En ligne</span>
                </div>
              </div>
            </div>
          </nav>
        </div>
      </div>
    </>
  )
}
