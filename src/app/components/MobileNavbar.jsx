"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { FaBars, FaBitcoin, FaComments, FaCloudSun, FaHeartbeat, FaChartLine, FaCalendarAlt, FaUser, FaCog } from "react-icons/fa"
import { motion, AnimatePresence } from "framer-motion"
import { useSession } from 'next-auth/react'

export default function MobileNavbar() {
  const [isOpen, setIsOpen] = useState(false)
  const [hasMounted, setHasMounted] = useState(false)
  const pathname = usePathname()
  const { data: session } = useSession()

  useEffect(() => {
    setHasMounted(true)
  }, [])

  // Gestion de la fermeture par drag
  const handleDragEnd = (event, info) => {
    // Si on tire vers le bas de plus de 100px ou avec une vélocité suffisante, fermer
    if (info.offset.y > 100 || info.velocity.y > 500) {
      setIsOpen(false)
    }
  }

  if (!hasMounted) return null

  const navigationItems = [
    {href: "/Dashboard/Crypto", label: "Cryptos", icon: <FaBitcoin className="text-orange-400" />},
    {href: "/Dashboard/Message", label: "Messages", icon: <FaComments className="text-blue-400" />},
    {href: "/Dashboard/Meteo", label: "Météo", icon: <FaCloudSun className="text-yellow-400" />},
    {href: "/Dashboard/Sante", label: "Santé", icon: <FaHeartbeat className="text-red-400" />},
    {href: "/Dashboard/Finances", label: "Finances", icon: <FaChartLine className="text-green-400" />},
    {href: "/Dashboard/Calendrier", label: "Calendrier", icon: <FaCalendarAlt className="text-purple-400" />},
    {href: "/Dashboard/Profile", label: session ? session.user.name : "Profil", icon: <FaUser className="text-indigo-400" />, isProfile: true},
    {href: "/Dashboard/Parametre", label: "Paramètres", icon: <FaCog className="text-gray-400" />},
  ]

  return (
    <>
      {/* Bouton flottant moderne avec glassmorphism */}
      <button
        onClick={() => setIsOpen(true)}
        className="md:hidden fixed bottom-8 right-6 w-16 h-16 text-white rounded-2xl shadow-2xl transition-all duration-500 ease-out transform active:scale-90 z-[50] flex items-center justify-center group overflow-hidden"
        style={{
          background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.9) 0%, rgba(37, 99, 235, 0.9) 100%)',
          backdropFilter: 'blur(20px)',
          boxShadow: '0 8px 32px rgba(59, 130, 246, 0.3), 0 0 0 1px rgba(255, 255, 255, 0.1)',
          marginBottom: 'max(env(safe-area-inset-bottom), 0px)'
        }}
        aria-label="Ouvrir le menu de navigation"
      >
        {/* Effet de brillance */}
        <div className="absolute inset-0 bg-gradient-to-br from-white/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
        
        {/* Icône avec animation */}
        <div className="relative z-10 transition-transform duration-300 group-hover:scale-110">
          <FaBars size={22} className="drop-shadow-sm" />
        </div>

        {/* Pulse ring effect */}
        <div className="absolute inset-0 rounded-2xl bg-blue-400/30 animate-pulse scale-110 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
      </button>

      {/* Overlay background avec Framer Motion */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="md:hidden fixed inset-0 bg-black/50 z-[60]"
            onClick={() => setIsOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* Modal navbar dragable avec Framer Motion */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ 
              type: "spring", 
              damping: 30, 
              stiffness: 300,
              duration: 0.4 
            }}
            drag="y"
            dragConstraints={{ top: 0, bottom: 300 }}
            dragElastic={{ top: 0, bottom: 0.3 }}
            onDragEnd={handleDragEnd}
            className="md:hidden fixed bottom-0 left-0 right-0 z-[70] backdrop-blur-xl bg-white/10 text-white rounded-t-[2rem] shadow-2xl border border-white/20"
            style={{
              background: 'linear-gradient(135deg, rgba(42, 45, 62, 0.95) 0%, rgba(33, 35, 50, 0.95) 100%)',
              backdropFilter: 'blur(20px)',
              boxShadow: '0 -20px 40px rgba(0, 0, 0, 0.3), 0 0 0 1px rgba(255, 255, 255, 0.1)',
            }}
          >
            {/* Zone de drag avec trait indicateur */}
            <div className="flex justify-center pt-5 pb-3 cursor-grab active:cursor-grabbing">
              <div className="w-12 h-1.5 bg-gray-400/50 rounded-full shadow-sm"></div>
            </div>

            {/* Navigation compacte et équilibrée */}
            <nav className="px-6 pb-12 pt-6">
              <div className="relative">
                {/* Disposition des icônes de navigation */}
                <div className="grid grid-cols-4 gap-4 mb-6">
                  {navigationItems.map((item, index) => (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => setIsOpen(false)}
                      className={`group relative overflow-hidden flex flex-col items-center justify-center w-16 h-16 rounded-2xl transition-all duration-300 ease-out active:scale-90 ${
                        pathname === item.href
                          ? "bg-gradient-to-br from-blue-500/40 to-blue-600/40 border-2 border-blue-400/60 shadow-2xl shadow-blue-500/30 scale-105"
                          : "bg-gradient-to-br from-gray-800/30 to-gray-900/30 border border-gray-600/20 hover:border-gray-500/40 hover:bg-gradient-to-br hover:from-gray-700/40 hover:to-gray-800/40 hover:scale-105"
                      }`}
                      style={{
                        animationDelay: `${index * 60}ms`,
                        backdropFilter: 'blur(15px)'
                      }}
                    >
                      {/* Effet de brillance qui traverse */}
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -skew-x-12 translate-x-[-100%] group-hover:translate-x-[200%] transition-transform duration-700"></div>
                      
                      {/* Ring animé pour l'élément actif */}
                      {pathname === item.href && (
                        <div className="absolute inset-0 rounded-2xl border-2 border-blue-400/30 animate-pulse scale-110"></div>
                      )}
                      
                      {item.isProfile && session ? (
                        <div className={`w-8 h-8 rounded-full overflow-hidden transition-all duration-300 relative z-10 flex items-center justify-center bg-gradient-to-br from-indigo-500 to-purple-600 ${
                          pathname === item.href 
                            ? 'drop-shadow-[0_0_8px_rgba(59,130,246,0.6)] filter brightness-110' 
                            : 'group-hover:scale-110'
                        }`}>
                          {session.user.image ? (
                            <img 
                              src={session.user.image} 
                              alt={session.user.name}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <FaUser className="w-4 h-4 text-white" />
                          )}
                        </div>
                      ) : (
                        <div className={`text-xl transition-all duration-300 relative z-10 ${
                          pathname === item.href 
                            ? 'drop-shadow-[0_0_8px_rgba(59,130,246,0.6)] filter brightness-110' 
                            : 'group-hover:scale-110'
                        }`}>
                          {item.icon}
                        </div>
                      )}
                      
                      {/* Effet glow sous l'icône active */}
                      {pathname === item.href && (
                        <div className="absolute inset-0 flex items-center justify-center">
                          <div className="w-6 h-6 bg-blue-400/20 rounded-full blur-lg"></div>
                        </div>
                      )}
                    </Link>
                  ))}
                </div>


                {/* Label dynamique avec animation élégante */}
                {navigationItems.find(item => pathname === item.href) && (
                  <div className="text-center mt-8 animate-in slide-in-from-bottom-3 duration-500">
                    <div className="inline-block px-6 py-3 bg-blue-500/10 border border-blue-400/20 rounded-full backdrop-blur-sm">
                      <p className="text-blue-300 font-semibold text-base tracking-wide">
                        {navigationItems.find(item => pathname === item.href)?.label}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </nav>

            {/* Zone de sécurité */}
            <div className="h-6 bg-gradient-to-t from-gray-900/20 to-transparent rounded-b-[2rem]"></div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}