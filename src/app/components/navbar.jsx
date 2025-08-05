"use client"

import {useState, useEffect} from "react"
import Link from "next/link"
import {usePathname} from "next/navigation"
import {FaBars, FaTimes, FaBitcoin, FaComments, FaCloudSun, FaHeartbeat, FaChartLine, FaCalendarAlt, FaCog, FaHome, FaUser} from "react-icons/fa"
import { useAuth } from '../context/AuthContext'
import { useNavbarPreferences } from '../hooks/useNavbarPreferences'

export default function Navbar({isOpen, setIsOpen}) {
  const [hasMounted, setHasMounted] = useState(false)
  const pathname = usePathname()
  const { user, authenticated } = useAuth()
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

  // Fonction pour vérifier si une route est active
  const isActiveRoute = (href) => {
    // Nettoyer les chemins pour la comparaison
    const cleanPathname = pathname.replace(/\/$/, '') || '/';
    const cleanHref = href.replace(/\/$/, '') || '/';
    
    return cleanPathname === cleanHref;
  };

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
      case '/Dashboard/Parametres': return 'bg-gray-400/10 text-gray-400'
      case '/Dashboard/Profile': return 'bg-indigo-400/10 text-indigo-400'
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
                className={`relative flex flex-col items-center gap-1 ${totalItems <= 5 ? 'px-2 py-3 flex-1' : 'px-5 py-3 flex-shrink-0'} rounded-xl transition-all duration-200 ${
                  isActiveRoute(item.href)
                    ? `${getActiveClasses(item.href)} scale-105 shadow-lg`
                    : "text-gray-400 hover:text-white active:scale-95"
                }`}
              >
                {/* Indicateur actif en haut */}
                {pathname === item.href && (
                  <div className="absolute -top-1 left-1/2 transform -translate-x-1/2 w-8 h-1 bg-gradient-to-r from-transparent via-current to-transparent rounded-full opacity-80"></div>
                )}
                
                <div className="text-lg">{item.icon}</div>
                <span className="text-xs font-medium whitespace-nowrap">{item.label}</span>
                
                {/* Point indicateur en bas */}
                {isActiveRoute(item.href) && (
                  <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-2 h-2 bg-current rounded-full opacity-60 animate-pulse"></div>
                )}
              </Link>
            ))}
            
            {/* Paramètres */}
            <Link
              href="/Dashboard/Parametres"
              className={`relative flex flex-col items-center gap-1 ${totalItems <= 5 ? 'px-2 py-3 flex-1' : 'px-5 py-3 flex-shrink-0'} rounded-xl transition-all duration-200 ${
                isActiveRoute("/Dashboard/Parametres")
                  ? "bg-gray-400/10 text-gray-400 scale-105 shadow-lg"
                  : "text-gray-400 hover:text-white active:scale-95"
              }`}
            >
              {/* Indicateur actif en haut */}
              {pathname === "/Dashboard/Parametres" && (
                <div className="absolute -top-1 left-1/2 transform -translate-x-1/2 w-8 h-1 bg-gradient-to-r from-transparent via-gray-400 to-transparent rounded-full opacity-80"></div>
              )}
              
              <FaCog className="text-lg" />
              <span className="text-xs font-medium whitespace-nowrap">Paramètres</span>
              
              {/* Point indicateur en bas */}
              {isActiveRoute("/Dashboard/Parametres") && (
                <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-2 h-2 bg-gray-400 rounded-full opacity-60 animate-pulse"></div>
              )}
            </Link>
            
            {/* Profil */}
            <Link
              href="/Dashboard/Profile"
              className={`relative flex flex-col items-center gap-1 ${totalItems <= 5 ? 'px-2 py-3 flex-1' : 'px-5 py-3 flex-shrink-0'} rounded-xl transition-all duration-200 ${
                isActiveRoute("/Dashboard/Profile")
                  ? "bg-indigo-400/10 text-indigo-400 scale-105 shadow-lg"
                  : "text-gray-400 hover:text-white active:scale-95"
              }`}
            >
              {/* Indicateur actif en haut */}
              {pathname === "/Dashboard/Profile" && (
                <div className="absolute -top-1 left-1/2 transform -translate-x-1/2 w-8 h-1 bg-gradient-to-r from-transparent via-indigo-400 to-transparent rounded-full opacity-80"></div>
              )}
              
              {user?.image ? (
                <img 
                  src={user.image} 
                  alt="Profil"
                  className="w-5 h-5 rounded-full"
                />
              ) : (
                <FaUser className="text-lg text-white" />
              )}
              <span className="text-xs font-medium whitespace-nowrap">
                Profil
              </span>
              
              {/* Point indicateur en bas */}
              {isActiveRoute("/Dashboard/Profile") && (
                <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-2 h-2 bg-indigo-400 rounded-full opacity-60 animate-pulse"></div>
              )}
            </Link>
          </div>
        </div>
      </div>

      {/* Navigation Desktop */}
      <div
        className={`hidden md:flex fixed top-0 left-0 h-screen z-[60] bg-gradient-to-br from-[#2a2d3e] to-[#212332] text-white flex-col shadow-2xl border-r border-gray-600/30 transition-all duration-300 ease-in-out ${
          isOpen ? "w-64" : "w-16"
        }`}
        style={{ 
          scrollbarWidth: 'none', 
          msOverflowStyle: 'none'
        }}
      >
        {/* En-tête */}
        <div
          className={`flex items-center text-xl font-bold bg-gradient-to-b from-[#2a2d3e]/20 via-[#2a2d3e]/10 to-transparent border-b border-gray-600/30 transition-all duration-300 ${
            isOpen ? "justify-between p-6" : "justify-center p-4"
          }`}
          style={{minHeight: "72px"}}
        >
          <div className="flex items-center gap-2 overflow-hidden">
            <div className="relative">
              <div className="w-10 h-10 flex items-center justify-center">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
            </div>
            {isOpen && (
              <div className="transition-opacity duration-300">
                <Link href="/">
                  <span className="bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
                    Dashboard
                  </span>
                </Link>
              </div>
            )}
          </div>

          <button
            onClick={() => setIsOpen(!isOpen)}
            className="text-white bg-gradient-to-r from-blue-600 to-blue-700 p-3 rounded-xl cursor-pointer flex-shrink-0 shadow-lg hover:from-blue-700 hover:to-blue-800 transition-all duration-200"
            aria-label={isOpen ? "Fermer la navbar" : "Ouvrir la navbar"}
          >
            {isOpen ? <FaTimes size={20} /> : <FaBars size={20} />}
          </button>
        </div>

        {/* Contenu navigation */}
        <div className="flex-1 overflow-hidden">
          <nav 
            className="flex flex-col gap-4 px-6 py-4 h-full overflow-y-auto" 
            style={{ 
              scrollbarWidth: 'none', 
              msOverflowStyle: 'none'
            }}
          >
            {isOpen && (
              <div className="flex flex-col gap-2 flex-1">
                {/* Navigation items */}
                {filteredNavItems.map((item) => (
                  <Link key={item.href} href={item.href}>
                    <div
                      className={`relative flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 group ${
                        isActiveRoute(item.href)
                          ? `${getActiveClasses(item.href)} shadow-lg border border-white/20`
                          : "text-gray-200 hover:bg-white/10 hover:text-blue-300"
                      }`}
                    >
                      {/* Barre indicatrice à gauche */}
                      {isActiveRoute(item.href) && (
                        <div className="absolute left-0 top-1/2 transform -translate-y-1/2 w-1 h-8 bg-current rounded-r-full opacity-80"></div>
                      )}
                      
                      <div className="text-lg min-w-[24px] flex justify-center">
                        {item.icon}
                      </div>
                      <span className="font-medium">
                        {item.label}
                      </span>
                      
                      {/* Point indicateur à droite */}
                      {isActiveRoute(item.href) && (
                        <div className="absolute right-3 top-1/2 transform -translate-y-1/2 w-2 h-2 bg-current rounded-full opacity-60"></div>
                      )}
                    </div>
                  </Link>
                ))}
                
                {/* Paramètres */}
                <div className="mt-auto">
                  <Link href="/Dashboard/Parametres">
                    <div
                      className={`relative flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 group ${
                        isActiveRoute("/Dashboard/Parametres")
                          ? "bg-gray-400/10 text-gray-400 shadow-lg border border-white/20"
                          : "text-gray-200 hover:bg-white/10 hover:text-blue-300"
                      }`}
                    >
                      {/* Barre indicatrice à gauche */}
                      {isActiveRoute("/Dashboard/Parametres") && (
                        <div className="absolute left-0 top-1/2 transform -translate-y-1/2 w-1 h-8 bg-gray-400 rounded-r-full opacity-80"></div>
                      )}
                      
                      <div className="text-lg min-w-[24px] flex justify-center">
                        <FaCog className="text-gray-400" />
                      </div>
                      <span className="font-medium">
                        Paramètres
                      </span>
                      
                      {/* Point indicateur à droite */}
                      {isActiveRoute("/Dashboard/Parametres") && (
                        <div className="absolute right-3 top-1/2 transform -translate-y-1/2 w-2 h-2 bg-gray-400 rounded-full opacity-60"></div>
                      )}
                    </div>
                  </Link>
                </div>
                
                {/* Profile */}
                <Link href="/Dashboard/Profile">
                  <div
                    className={`relative flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 group ${
                      isActiveRoute("/Dashboard/Profile")
                        ? "bg-indigo-400/10 text-indigo-400 shadow-lg border border-white/20"
                        : "text-gray-200 hover:bg-white/10 hover:text-blue-300"
                    }`}
                  >
                    {/* Barre indicatrice à gauche */}
                    {isActiveRoute("/Dashboard/Profile") && (
                      <div className="absolute left-0 top-1/2 transform -translate-y-1/2 w-1 h-8 bg-indigo-400 rounded-r-full opacity-80"></div>
                    )}
                    
                    {authenticated && user ? (
                      <>
                        <div className="w-6 h-6 rounded-full min-w-[24px] flex items-center justify-center bg-gradient-to-br from-[#3A6FF8] to-[#2952d3]">
                          <FaUser className="text-xs text-white" />
                        </div>
                        <span className="font-medium truncate">
                          Profil
                        </span>
                      </>
                    ) : (
                      <>
                        <div className="text-lg min-w-[24px] flex justify-center">
                          <FaUser className="text-indigo-400" />
                        </div>
                        <span className="font-medium">
                          Profil
                        </span>
                      </>
                    )}
                    
                    {/* Point indicateur à droite */}
                    {isActiveRoute("/Dashboard/Profile") && (
                      <div className="absolute right-3 top-1/2 transform -translate-y-1/2 w-2 h-2 bg-indigo-400 rounded-full opacity-60"></div>
                    )}
                  </div>
                </Link>
                
                {/* Section infos */}
                <div className="mt-auto pt-4 border-t border-gray-600/30">
                  <div className="flex items-center justify-between text-sm text-gray-400">
                    <span>v1.0.0</span>
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                      <span>En ligne</span>
                    </div>
                  </div>
                  
                  <div className="mt-2 text-xs text-gray-500 flex items-center gap-2">
                    <div className="w-1 h-4 bg-blue-400 rounded-full opacity-60"></div>
                    <span>Page active</span>
                  </div>
                </div>
              </div>
            )}

            {!isOpen && (
              <div className="flex flex-col gap-2 items-center py-4 h-full">
                <div className="flex flex-col gap-2 items-center flex-1">
                  {filteredNavItems.map((item) => (
                    <Link key={item.href} href={item.href}>
                      <div
                        className={`relative w-12 h-12 flex items-center justify-center rounded-xl transition-all duration-200 hover:scale-105 ${
                          isActiveRoute(item.href)
                            ? `${getActiveClasses(item.href)} shadow-lg ring-2 ring-current ring-opacity-50`
                            : "text-gray-300 hover:bg-white/10 hover:text-blue-300"
                        }`}
                      >
                        {/* Barre indicatrice à gauche */}
                        {isActiveRoute(item.href) && (
                          <div className="absolute -left-2 top-1/2 transform -translate-y-1/2 w-2 h-10 bg-current rounded-r-full opacity-90 shadow-lg"></div>
                        )}
                        
                        {/* Point indicateur en haut à droite */}
                        {isActiveRoute(item.href) && (
                          <div className="absolute -top-1 -right-1 w-3 h-3 bg-current rounded-full opacity-80 shadow-sm animate-pulse"></div>
                        )}
                        
                        <div className="text-lg">
                          {item.icon}
                        </div>
                      </div>
                    </Link>
                  ))}
                  
                  {/* Paramètres en bas */}
                  <div className="mt-auto mb-2">
                    <Link href="/Dashboard/Parametres">
                      <div
                        className={`relative w-12 h-12 flex items-center justify-center rounded-xl transition-all duration-200 hover:scale-105 ${
                          isActiveRoute("/Dashboard/Parametres")
                            ? "bg-gray-400/10 text-gray-400 shadow-lg ring-2 ring-gray-400 ring-opacity-50"
                            : "text-gray-300 hover:bg-white/10 hover:text-blue-300"
                        }`}
                      >
                        {/* Barre indicatrice à gauche */}
                        {isActiveRoute("/Dashboard/Parametres") && (
                          <div className="absolute -left-2 top-1/2 transform -translate-y-1/2 w-2 h-10 bg-gray-400 rounded-r-full opacity-90 shadow-lg"></div>
                        )}
                        
                        {/* Point indicateur en haut à droite */}
                        {isActiveRoute("/Dashboard/Parametres") && (
                          <div className="absolute -top-1 -right-1 w-3 h-3 bg-gray-400 rounded-full opacity-80 shadow-sm animate-pulse"></div>
                        )}
                        
                        <div className="text-lg">
                          <FaCog className="text-gray-400" />
                        </div>
                      </div>
                    </Link>
                  </div>
                </div>
                
                {/* Photo de profil en bas */}
                <div className="mb-4">
                  {authenticated && user ? (
                    <Link href="/Dashboard/Profile">
                      <div
                        className={`relative w-12 h-12 flex items-center justify-center rounded-xl transition-all duration-200 hover:scale-105 overflow-hidden border-2 ${
                          isActiveRoute("/Dashboard/Profile")
                            ? "border-indigo-400/80 bg-gradient-to-br from-[#3A6FF8] to-[#2952d3] shadow-lg ring-2 ring-indigo-400 ring-opacity-50"
                            : "border-blue-500/50 bg-gradient-to-br from-[#3A6FF8] to-[#2952d3]"
                        }`}
                      >
                        {/* Barre indicatrice à gauche */}
                        {isActiveRoute("/Dashboard/Profile") && (
                          <div className="absolute -left-2 top-1/2 transform -translate-y-1/2 w-2 h-10 bg-indigo-400 rounded-r-full opacity-90 shadow-lg"></div>
                        )}
                        
                        {/* Point indicateur en haut à droite */}
                        {isActiveRoute("/Dashboard/Profile") && (
                          <div className="absolute -top-1 -right-1 w-3 h-3 bg-indigo-400 rounded-full opacity-80 shadow-sm animate-pulse"></div>
                        )}
                        
                        <FaUser className="text-lg text-white" />
                      </div>
                    </Link>
                  ) : (
                    <Link href="/Dashboard/Profile">
                      <div
                        className={`relative w-12 h-12 flex items-center justify-center rounded-xl transition-all duration-200 hover:scale-105 ${
                          isActiveRoute("/Dashboard/Profile")
                            ? "bg-indigo-400/10 text-indigo-400 shadow-lg ring-2 ring-indigo-400 ring-opacity-50"
                            : "text-gray-300 hover:bg-white/10 hover:text-blue-300"
                        }`}
                      >
                        {/* Barre indicatrice à gauche */}
                        {isActiveRoute("/Dashboard/Profile") && (
                          <div className="absolute -left-2 top-1/2 transform -translate-y-1/2 w-2 h-10 bg-indigo-400 rounded-r-full opacity-90 shadow-lg"></div>
                        )}
                        
                        {/* Point indicateur en haut à droite */}
                        {isActiveRoute("/Dashboard/Profile") && (
                          <div className="absolute -top-1 -right-1 w-3 h-3 bg-indigo-400 rounded-full opacity-80 shadow-sm animate-pulse"></div>
                        )}
                        
                        <div className="text-lg">
                          <FaUser className="text-indigo-400 text-lg" />
                        </div>
                      </div>
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