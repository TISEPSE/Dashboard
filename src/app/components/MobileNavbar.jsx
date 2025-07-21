"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { FaBars, FaTimes } from "react-icons/fa"

export default function MobileNavbar() {
  const [isOpen, setIsOpen] = useState(false)
  const [hasMounted, setHasMounted] = useState(false)
  const pathname = usePathname()

  useEffect(() => {
    setHasMounted(true)
  }, [])

  if (!hasMounted) return null

  const navigationItems = [
    {href: "/Dashboard/Crypto", label: "Cryptos", icon: "₿"},
    {href: "/Dashboard/Message", label: "Messages", icon: "💬"},
    {href: "/Dashboard/Meteo", label: "Météo", icon: "🌤️"},
    {href: "/Dashboard/Sport", label: "Sport", icon: "⚽"},
    {href: "/Dashboard/Finances", label: "Finances", icon: "💰"},
    {href: "/Dashboard/Calendrier", label: "Calendrier", icon: "📅"},
    {href: "/Dashboard/Profile", label: "Profil", icon: "👤"},
    {href: "/Dashboard/Parametre", label: "Paramètres", icon: "⚙️"},
  ]

  return (
    <>
      {/* Bouton flottant en bas à droite - optimisé pour le pouce */}
      <button
        onClick={() => setIsOpen(true)}
        className="md:hidden fixed bottom-8 right-6 w-14 h-14 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-full shadow-xl hover:shadow-2xl transition-all duration-300 ease-in-out transform active:scale-90 z-[50] flex items-center justify-center"
        style={{
          /* Position optimisée pour le pouce droit */
          marginBottom: 'max(env(safe-area-inset-bottom), 0px)'
        }}
        aria-label="Ouvrir le menu de navigation"
      >
        <FaBars size={20} />
      </button>

      {/* Overlay background */}
      {isOpen && (
        <div
          className="md:hidden fixed inset-0 bg-black/50 z-[60] transition-opacity duration-300"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Modal navbar qui sort du bas */}
      <div
        className={`md:hidden fixed bottom-0 left-0 right-0 z-[70] bg-gradient-to-br from-[#2a2d3e] to-[#212332] text-white rounded-t-3xl shadow-2xl border-t border-gray-600/30 transform transition-transform duration-300 ease-in-out ${
          isOpen ? "translate-y-0" : "translate-y-full"
        }`}
      >
        {/* Trait de drag en haut */}
        <div className="flex justify-center pt-3 pb-2">
          <div className="w-10 h-1 bg-gray-500/50 rounded-full"></div>
        </div>

        {/* En-tête de la modal - simplifié pour une main */}
        <div className="flex items-center justify-between px-6 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-blue-700 rounded-xl flex items-center justify-center shadow-lg">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </div>
            <Link href="/" onClick={() => setIsOpen(false)}>
              <span className="text-xl font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
                Dashboard
              </span>
            </Link>
          </div>

          <button
            onClick={() => setIsOpen(false)}
            className="text-white bg-gradient-to-r from-blue-600 to-blue-700 p-4 rounded-full transition-all duration-300 ease-in-out hover:from-blue-700 hover:to-blue-800 shadow-lg hover:shadow-xl transform active:scale-95 min-w-[48px] min-h-[48px] flex items-center justify-center"
            aria-label="Fermer le menu"
          >
            <FaTimes size={18} />
          </button>
        </div>

        {/* Navigation items - optimisée pour le pouce */}
        <nav className="px-4 pb-8">
          <div className="grid grid-cols-2 gap-4">
            {navigationItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setIsOpen(false)}
                className={`flex flex-col items-center gap-3 p-6 rounded-2xl transition-all duration-300 ease-in-out group min-h-[100px] ${
                  pathname === item.href
                    ? "bg-blue-600/30 text-blue-300 shadow-lg border border-blue-400/50 scale-105"
                    : "text-gray-200 hover:bg-white/10 hover:text-blue-300 active:scale-95"
                }`}
              >
                <span className="text-3xl transition-transform duration-300 ease-in-out group-hover:scale-110">
                  {item.icon}
                </span>
                <span className="font-medium text-sm text-center leading-tight">
                  {item.label}
                </span>
              </Link>
            ))}
          </div>
        </nav>

        {/* Zone de sécurité pour le gesture du bas d'écran */}
        <div className="h-6 bg-gradient-to-t from-[#212332]/50 to-transparent"></div>
      </div>
    </>
  )
}