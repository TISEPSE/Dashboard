"use client"

import {useState, useEffect} from "react"
import Link from "next/link"
import {usePathname} from "next/navigation"
import {FaBars, FaTimes} from "react-icons/fa"

export default function Navbar({isOpen, setIsOpen}) {
  const [hasMounted, setHasMounted] = useState(false)
  const [dashboardOpen, setDashboardOpen] = useState(false)
  const pathname = usePathname()

  useEffect(() => {
    setHasMounted(true)
  }, [])

  if (!hasMounted) return null

  return (
    <>
      {/* Navigation Desktop uniquement */}
      <div
        className={`fixed top-0 left-0 h-screen z-[60] bg-gradient-to-br from-[#2a2d3e] to-[#212332] text-white flex flex-col overflow-y-auto transition-all duration-300 shadow-2xl border-r border-gray-600/30 ${
          isOpen ? "w-64" : "w-16 min-w-[64px]"
        }`}
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        {/* En-tête */}
        <div
          className={`flex items-center ${isOpen ? "justify-between p-6" : "justify-center p-4"} text-xl font-bold bg-gradient-to-b from-[#2a2d3e]/20 via-[#2a2d3e]/10 to-transparent border-b border-gray-600/30`}
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
            {isOpen && (
              <div className="transition-all duration-500 ease-in-out opacity-100 max-w-[200px] transform translate-x-0">
                <Link href="/" className="whitespace-nowrap">
                  <span className="bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
                    Dashboard
                  </span>
                </Link>
              </div>
            )}
          </div>

          {isOpen && (
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="text-white bg-gradient-to-r from-blue-600 to-blue-700 p-3 rounded-xl cursor-pointer flex-shrink-0 transition-all duration-200 hover:from-blue-700 hover:to-blue-800 shadow-lg hover:shadow-xl transform hover:scale-105 active:scale-95"
              aria-label="Fermer la navbar"
            >
              <FaTimes size={20} />
            </button>
          )}
          
          {!isOpen && (
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="text-white bg-gradient-to-r from-blue-600 to-blue-700 p-3 rounded-xl cursor-pointer flex-shrink-0 transition-all duration-200 hover:from-blue-700 hover:to-blue-800 shadow-lg hover:shadow-xl transform hover:scale-105 active:scale-95"
              aria-label="Ouvrir la navbar"
            >
              <FaBars size={20} />
            </button>
          )}
        </div>

        {/* Contenu navigation */}
        <div className="flex-1 overflow-auto">
          <nav className="flex flex-col gap-4 px-6 py-4 h-full">
            {isOpen ? (
              <>
                {/* Navigation dashboard dropdown - desktop */}
                <div 
                  className="bg-gradient-to-r from-[#2a2d3e] to-[#252837] border border-gray-500/50 text-white rounded-xl shadow-xl"
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
                    className={`transition-all duration-300 ease-in-out px-4 flex flex-col gap-3 ${
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
                      {href: "/Dashboard/Calendrier", label: "Calendrier", icon: "📅"},
                      {href: "/Dashboard/Profile", label: "Profil & Connexion", icon: "👤"},
                    ].map((item) => (
                      <Link
                        key={item.href}
                        href={item.href}
                        className={`block w-full hover:text-blue-300 hover:bg-white/10 transition-all duration-300 rounded-lg group hover:scale-105 hover:shadow-lg border border-transparent hover:border-blue-400/30 ${
                          pathname === item.href
                            ? "bg-blue-600/30 text-blue-300 border-blue-400/50 shadow-lg"
                            : "text-gray-200"
                        }`}
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

                {/* Paramètres */}
                <div className="flex flex-col gap-3">
                  <Link
                    href="/Dashboard/Parametre"
                    className={`block w-full hover:text-blue-300 hover:bg-gradient-to-r hover:from-blue-600/15 hover:to-blue-600/10 hover:border-blue-500/50 hover:shadow-lg hover:shadow-blue-600/25 transition-all duration-300 rounded-lg group border border-gray-500/40 bg-gradient-to-r from-[#2a2d3e] to-[#252837] shadow-lg transform hover:scale-105 hover:-translate-y-0.5 ${
                      pathname === "/Dashboard/Parametre"
                        ? "bg-blue-600/30 text-blue-300 border-blue-500/50 shadow-xl"
                        : "text-gray-200"
                    }`}
                  >
                    <div className="flex items-center gap-3 py-3 px-4 w-full h-full">
                      <span className="text-lg transition-transform duration-300 group-hover:scale-110">⚙️</span>
                      <span className="font-medium group-hover:translate-x-0.5 transition-transform duration-300 flex-1">
                        Paramètres
                      </span>
                    </div>
                  </Link>
                </div>

                {/* Section infos */}
                <div className="mt-auto pt-4 border-t border-gray-600/30">
                  <div className="flex items-center justify-between text-sm text-gray-400">
                    <span>v1.0.0</span>
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                      <span>En ligne</span>
                    </div>
                  </div>
                </div>
              </>
            ) : (
              /* Version fermée - icônes uniquement */
              <div className="flex flex-col gap-2 items-center py-4">
                {[
                  {href: "/Dashboard/Crypto", icon: "₿"},
                  {href: "/Dashboard/Message", icon: "💬"},
                  {href: "/Dashboard/Meteo", icon: "🌤️"},
                  {href: "/Dashboard/Sport", icon: "⚽"},
                  {href: "/Dashboard/Calendrier", icon: "📅"},
                  {href: "/Dashboard/Profile", icon: "👤"},
                  {href: "/Dashboard/Parametre", icon: "⚙️"},
                ].map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`w-12 h-12 flex items-center justify-center rounded-xl transition-all duration-300 hover:scale-110 hover:shadow-lg ${
                      pathname === item.href
                        ? "bg-blue-600/30 text-blue-300 shadow-lg"
                        : "text-gray-300 hover:bg-white/10"
                    }`}
                  >
                    <span className="text-lg">{item.icon}</span>
                  </Link>
                ))}
              </div>
            )}
          </nav>
        </div>
      </div>
    </>
  )
}