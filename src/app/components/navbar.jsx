"use client"

import {useState, useEffect} from "react"
import Link from "next/link"
import {usePathname} from "next/navigation"
import {FaBars, FaTimes} from "react-icons/fa"

export default function Navbar({isOpen, setIsOpen}) {
  const [hasMounted, setHasMounted] = useState(false)
  const pathname = usePathname()

  useEffect(() => {
    setHasMounted(true)
  }, [])

  if (!hasMounted) return null

  return (
    <>
      {/* Navigation Desktop uniquement */}
      <div
        className={`hidden md:flex fixed top-0 left-0 h-screen z-[60] bg-gradient-to-br from-[#2a2d3e] to-[#212332] text-white flex-col overflow-hidden transition-all duration-300 ease-in-out shadow-2xl border-r border-gray-600/30 ${
          isOpen ? "w-64" : "w-16 min-w-[64px]"
        }`}
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        {/* En-tête */}
        <div
          className={`flex items-center ${isOpen ? "justify-between p-6" : "justify-center p-4"} text-xl font-bold bg-gradient-to-b from-[#2a2d3e]/20 via-[#2a2d3e]/10 to-transparent border-b border-gray-600/30 transition-all duration-300 ease-in-out`}
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
              <div className="transition-opacity duration-300 ease-in-out">
                <Link href="/" className="whitespace-nowrap">
                  <span className="bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
                    Dashboard
                  </span>
                </Link>
              </div>
            )}
          </div>

          <button
            onClick={() => setIsOpen(!isOpen)}
            className="text-white bg-gradient-to-r from-blue-600 to-blue-700 p-3 rounded-xl cursor-pointer flex-shrink-0 transition-all duration-300 ease-in-out hover:from-blue-700 hover:to-blue-800 shadow-lg hover:shadow-xl transform hover:scale-105 active:scale-95"
            aria-label={isOpen ? "Fermer la navbar" : "Ouvrir la navbar"}
          >
            <div className="transition-transform duration-300 ease-in-out">
              {isOpen ? <FaTimes size={20} /> : <FaBars size={20} />}
            </div>
          </button>
        </div>

        {/* Contenu navigation */}
        <div className="flex-1 overflow-hidden">
          <nav className="flex flex-col gap-4 px-6 py-4 h-full overflow-auto" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
            {isOpen && (
              <>
                {/* Affichage direct des liens avec icônes et textes */}
                <div className="flex flex-col gap-2">
                  {[
                    {href: "/Dashboard/Crypto", label: "Cryptos", icon: "₿"},
                    {href: "/Dashboard/Message", label: "Messages", icon: "💬"},
                    {href: "/Dashboard/Meteo", label: "Météo", icon: "🌤️"},
                    {href: "/Dashboard/Sante", label: "Santé", icon: "🏥"},
                    {href: "/Dashboard/Finances", label: "Finances", icon: "💰"},
                    {href: "/Dashboard/Calendrier", label: "Calendrier", icon: "📅"},
                    {href: "/Dashboard/Profile", label: "Profil", icon: "👤"},
                    {href: "/Dashboard/Parametre", label: "Paramètres", icon: "⚙️"},
                  ].map((item) => (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-300 ease-in-out group ${
                        pathname === item.href
                          ? "bg-blue-600/30 text-blue-300 shadow-lg border border-blue-400/50"
                          : "text-gray-200 hover:bg-white/10 hover:text-blue-300"
                      }`}
                    >
                      <span className="text-lg transition-transform duration-300 ease-in-out group-hover:scale-110 min-w-[24px] text-center">{item.icon}</span>
                      <span className="font-medium transition-transform duration-300 ease-in-out group-hover:translate-x-1">
                        {item.label}
                      </span>
                    </Link>
                  ))}
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
              )}

            {!isOpen && (
              /* Version fermée - icônes uniquement */
              <div className="flex flex-col gap-2 items-center py-4">
                {[
                  {href: "/Dashboard/Crypto", icon: "₿"},
                  {href: "/Dashboard/Message", icon: "💬"},
                  {href: "/Dashboard/Meteo", icon: "🌤️"},
                  {href: "/Dashboard/Sante", icon: "🏥"},
                  {href: "/Dashboard/Finances", icon: "💰"},
                  {href: "/Dashboard/Calendrier", icon: "📅"},
                  {href: "/Dashboard/Profile", icon: "👤"},
                  {href: "/Dashboard/Parametre", icon: "⚙️"},
                ].map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`w-12 h-12 flex items-center justify-center rounded-xl transition-all duration-300 ease-in-out transform hover:scale-110 hover:shadow-lg ${
                      pathname === item.href
                        ? "bg-blue-600/30 text-blue-300 shadow-lg scale-105"
                        : "text-gray-300 hover:bg-white/10 hover:text-blue-300"
                    }`}
                  >
                    <span className="text-lg transition-all duration-300 ease-in-out">{item.icon}</span>
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