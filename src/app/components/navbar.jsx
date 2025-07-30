"use client"

import {useState, useEffect} from "react"
import Link from "next/link"
import {usePathname} from "next/navigation"
import {FaBars, FaTimes, FaBitcoin, FaComments, FaCloudSun, FaHeartbeat, FaChartLine, FaCalendarAlt, FaUser, FaCog, FaHome} from "react-icons/fa"
import { useSession } from 'next-auth/react'
import AuthButton from "./Auth/AuthButton"
import { useNavbarPreferences } from '../hooks/useNavbarPreferences'

export default function Navbar({isOpen, setIsOpen}) {
  const [hasMounted, setHasMounted] = useState(false)
  const pathname = usePathname()
  const { data: session } = useSession()
  const { getFilteredNavItems, isLoaded } = useNavbarPreferences()
  
  // Calculer le nombre total d'éléments (filteredNavItems + Paramètres + Profil)
  const allNavigationItems = [
    {href: "/", label: "Accueil", icon: <FaHome className="text-emerald-400" />},
    {href: "/Dashboard/Crypto", label: "Cryptos", icon: <FaBitcoin className="text-orange-400" />},
    {href: "/Dashboard/Message", label: "Messages", icon: <FaComments className="text-blue-400" />},
    {href: "/Dashboard/Meteo", label: "Météo", icon: <FaCloudSun className="text-yellow-400" />},
    {href: "/Dashboard/Sante", label: "Santé", icon: <FaHeartbeat className="text-red-400" />},
    {href: "/Dashboard/Finances", label: "Finances", icon: <FaChartLine className="text-green-400" />},
    {href: "/Dashboard/Calendrier", label: "Calendrier", icon: <FaCalendarAlt className="text-purple-400" />},
  ]
  
  const filteredNavItems = getFilteredNavItems(allNavigationItems)
  const totalItems = filteredNavItems.length + 2 // +2 pour Paramètres et Profil

  // Fonction pour obtenir les classes actives selon la route
  const getActiveClasses = (href) => {
    switch(href) {
      case '/': return 'bg-emerald-400/10 text-emerald-400'
      case '/Dashboard/Crypto': return 'bg-orange-400/10 text-orange-400'
      case '/Dashboard/Message': return 'bg-blue-400/10 text-blue-400'
      case '/Dashboard/Meteo': return 'bg-yellow-400/10 text-yellow-400'
      case '/Dashboard/Sante': return 'bg-red-400/10 text-red-400'
      case '/Dashboard/Finances': return 'bg-green-400/10 text-green-400'
      case '/Dashboard/Calendrier': return 'bg-purple-400/10 text-purple-400'
      default: return 'bg-blue-600/30 text-blue-300'
    }
  }

  useEffect(() => {
    setHasMounted(true)
  }, [])

  if (!hasMounted || !isLoaded) return null

  return (
    <>
      {/* Navigation Mobile - Horizontal Slider */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-[60] bg-gradient-to-t from-[#1a1d2e] to-[#2a2d3e] border-t border-gray-600/30 backdrop-blur-xl">
        <div className={`py-2 px-1 ${totalItems <= 5 ? '' : 'overflow-x-auto scrollbar-hide'}`}>
          <div className={`flex items-center ${totalItems <= 5 ? 'justify-around gap-1' : 'gap-2 min-w-max'}`}>
            {/* Navigation items */}
            {filteredNavItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`flex flex-col items-center gap-1 ${totalItems <= 5 ? 'px-2 py-3 flex-1' : 'px-5 py-3 flex-shrink-0'} rounded-xl transition-all duration-200 ${
                  pathname === item.href
                    ? `${getActiveClasses(item.href)} scale-105`
                    : "text-gray-400 hover:text-white active:scale-95"
                }`}
              >
                <div className="text-lg">{item.icon}</div>
                <span className="text-xs font-medium whitespace-nowrap">{item.label}</span>
              </Link>
            ))}
            
            {/* Paramètres */}
            <Link
              href="/Dashboard/Parametres"
              className={`flex flex-col items-center gap-1 ${totalItems <= 5 ? 'px-2 py-3 flex-1' : 'px-5 py-3 flex-shrink-0'} rounded-xl transition-all duration-200 ${
                pathname === "/Dashboard/Parametres"
                  ? "bg-gray-400/10 text-gray-400 scale-105"
                  : "text-gray-400 hover:text-white active:scale-95"
              }`}
            >
              <FaCog className="text-lg" />
              <span className="text-xs font-medium whitespace-nowrap">Paramètres</span>
            </Link>
            
            {/* Profil */}
            <Link
              href="/Dashboard/Profile"
              className={`flex flex-col items-center gap-1 ${totalItems <= 5 ? 'px-2 py-3 flex-1' : 'px-5 py-3 flex-shrink-0'} rounded-xl transition-all duration-200 ${
                pathname === "/Dashboard/Profile"
                  ? "bg-indigo-400/10 text-indigo-400 scale-105"
                  : "text-gray-400 hover:text-white active:scale-95"
              }`}
            >
              {session?.user?.image ? (
                <img 
                  src={session.user.image} 
                  alt="Profil"
                  className="w-5 h-5 rounded-full"
                />
              ) : (
                <FaUser className="text-lg" />
              )}
              <span className="text-xs font-medium whitespace-nowrap">
                Profil
              </span>
            </Link>
          </div>
        </div>
      </div>

      {/* Navigation Desktop */}
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
                <div className="flex flex-col gap-2 flex-1">
                  {filteredNavItems.map((item) => (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-300 ease-in-out group ${
                        pathname === item.href
                          ? `${getActiveClasses(item.href)} shadow-lg border border-white/20`
                          : "text-gray-200 hover:bg-white/10 hover:text-blue-300"
                      }`}
                    >
                      <div className="text-lg transition-all duration-300 ease-in-out group-hover:scale-110 min-w-[24px] flex justify-center group-hover:drop-shadow-lg">{item.icon}</div>
                      <span className="font-medium transition-transform duration-300 ease-in-out group-hover:translate-x-1">
                        {item.label}
                      </span>
                    </Link>
                  ))}
                  
                  {/* Lien Paramètres placé en bas */}
                  <div className="mt-auto">
                    <Link
                      href="/Dashboard/Parametres"
                      className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-300 ease-in-out group ${
                        pathname === "/Dashboard/Parametres"
                          ? "bg-gray-400/10 text-gray-400 shadow-lg border border-white/20"
                          : "text-gray-200 hover:bg-white/10 hover:text-blue-300"
                      }`}
                    >
                      <div className="text-lg transition-all duration-300 ease-in-out group-hover:scale-110 min-w-[24px] flex justify-center group-hover:drop-shadow-lg"><FaCog className="text-gray-400" /></div>
                      <span className="font-medium transition-transform duration-300 ease-in-out group-hover:translate-x-1">
                        Paramètres
                      </span>
                    </Link>
                  </div>
                  
                  {/* Lien Profile avec photo/pseudo si connecté */}
                  <Link
                    href="/Dashboard/Profile"
                    className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-300 ease-in-out group ${
                      pathname === "/Dashboard/Profile"
                        ? "bg-indigo-400/10 text-indigo-400 shadow-lg border border-white/20"
                        : "text-gray-200 hover:bg-white/10 hover:text-blue-300"
                    }`}
                  >
                    {session ? (
                      <>
                        <div className="w-6 h-6 rounded-full overflow-hidden transition-transform duration-300 ease-in-out group-hover:scale-110 min-w-[24px] flex items-center justify-center bg-gradient-to-br from-[#3A6FF8] to-[#2952d3]">
                          {session.user.image ? (
                            <img 
                              src={session.user.image} 
                              alt="Profil"
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <FaUser className="w-3 h-3 text-white" />
                          )}
                        </div>
                        <span className="font-medium transition-transform duration-300 ease-in-out group-hover:translate-x-1 truncate">
                          Profil
                        </span>
                      </>
                    ) : (
                      <>
                        <div className="text-lg transition-all duration-300 ease-in-out group-hover:scale-110 min-w-[24px] flex justify-center group-hover:drop-shadow-lg"><FaUser className="text-indigo-400" /></div>
                        <span className="font-medium transition-transform duration-300 ease-in-out group-hover:translate-x-1">
                          Profil
                        </span>
                      </>
                    )}
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
              )}

            {!isOpen && (
              /* Version fermée - icônes uniquement */
              <div className="flex flex-col gap-2 items-center py-4 h-full">
                <div className="flex flex-col gap-2 items-center flex-1">
                  {filteredNavItems.map((item) => (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={`w-12 h-12 flex items-center justify-center rounded-xl transition-all duration-300 ease-in-out transform hover:scale-110 hover:shadow-lg ${
                        pathname === item.href
                          ? `${getActiveClasses(item.href)} shadow-lg scale-105`
                          : "text-gray-300 hover:bg-white/10 hover:text-blue-300"
                      }`}
                    >
                      <div className="text-lg transition-all duration-300 ease-in-out group-hover:drop-shadow-lg">{item.icon}</div>
                    </Link>
                  ))}
                  
                  {/* Paramètres en bas */}
                  <div className="mt-auto mb-2">
                    <Link
                      href="/Dashboard/Parametres"
                      className={`w-12 h-12 flex items-center justify-center rounded-xl transition-all duration-300 ease-in-out transform hover:scale-110 hover:shadow-lg ${
                        pathname === "/Dashboard/Parametres"
                          ? "bg-blue-600/30 text-blue-300 shadow-lg scale-105"
                          : "text-gray-300 hover:bg-white/10 hover:text-blue-300"
                      }`}
                    >
                      <div className="text-lg transition-all duration-300 ease-in-out group-hover:drop-shadow-lg"><FaCog className="text-gray-400" /></div>
                    </Link>
                  </div>
                </div>
                
                {/* Photo de profil en bas quand connecté */}
                <div className="mb-4">
                  {session ? (
                    <Link
                      href="/Dashboard/Profile"
                      className="w-12 h-12 flex items-center justify-center rounded-xl transition-all duration-300 ease-in-out transform hover:scale-110 hover:shadow-lg overflow-hidden border-2 border-blue-500/50 bg-gradient-to-br from-[#3A6FF8] to-[#2952d3]"
                    >
                      {session.user.image ? (
                        <img 
                          src={session.user.image} 
                          alt="Profil"
                          className="w-full h-full object-cover rounded-lg"
                        />
                      ) : (
                        <FaUser className="w-5 h-5 text-white" />
                      )}
                    </Link>
                  ) : (
                    <Link
                      href="/Dashboard/Profile"
                      className={`w-12 h-12 flex items-center justify-center rounded-xl transition-all duration-300 ease-in-out transform hover:scale-110 hover:shadow-lg ${
                        pathname === "/Dashboard/Profile"
                          ? "bg-blue-600/30 text-blue-300 shadow-lg scale-105"
                          : "text-gray-300 hover:bg-white/10 hover:text-blue-300"
                      }`}
                    >
                      <div className="text-lg transition-all duration-300 ease-in-out group-hover:drop-shadow-lg"><FaUser className="text-indigo-400" /></div>
                    </Link>
                  )}
                </div>
              </div>
            )}
          </nav>
        </div>
      </div>
    </>
  )
}