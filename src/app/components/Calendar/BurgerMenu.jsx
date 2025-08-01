"use client"

import { useState, useEffect } from "react"

// Style CSS pour masquer la scrollbar
const scrollbarStyles = `
  .burger-menu-scroll::-webkit-scrollbar {
    display: none;
  }
  .burger-menu-scroll {
    -ms-overflow-style: none;
    scrollbar-width: none;
  }
`
import { motion, AnimatePresence } from "framer-motion"
import { 
    FaBars, 
    FaTimes, 
    FaCalendarAlt, 
    FaCalendarWeek, 
    FaCalendarDay, 
    FaPlus, 
    FaSync,
    FaHome
} from "react-icons/fa"

export default function BurgerMenu({
    viewMode,
    setViewMode,
    onSync,
    onAddEvent,
    isLoading,
    onGoToToday,
    className = ""
}) {
    // Style pour masquer la scrollbar
    const scrollbarHideStyle = {
        scrollbarWidth: 'none', // Firefox
        msOverflowStyle: 'none', // IE et Edge
    }
    const [isOpen, setIsOpen] = useState(false)

    // Fermer le menu quand on clique en dehors et gérer le scroll du body
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (isOpen && !event.target.closest('.burger-menu')) {
                setIsOpen(false)
            }
        }

        document.addEventListener('mousedown', handleClickOutside)
        return () => document.removeEventListener('mousedown', handleClickOutside)
    }, [isOpen])
    
    // Bloquer le scroll de l'arrière-plan quand le menu est ouvert
    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden'
        } else {
            document.body.style.overflow = 'unset'
        }
        
        // Cleanup au démontage du composant
        return () => {
            document.body.style.overflow = 'unset'
        }
    }, [isOpen])

    // Fermer le menu sur les changements de vue
    useEffect(() => {
        setIsOpen(false)
    }, [viewMode])

    const menuItems = [
        {
            key: 'month',
            icon: FaCalendarAlt,
            label: 'Vue Mois',
            description: 'Affichage mensuel'
        },
        {
            key: 'week',
            icon: FaCalendarWeek,
            label: 'Vue Semaine',
            description: 'Affichage hebdomadaire'
        },
        {
            key: 'day',
            icon: FaCalendarDay,
            label: 'Vue Jour',
            description: 'Affichage journalier'
        }
    ]

    const actions = [
        {
            key: 'today',
            icon: FaHome,
            label: "Aujourd'hui",
            description: 'Aller à la date actuelle',
            action: () => {
                onGoToToday()
                setIsOpen(false)
            }
        },
        {
            key: 'add',
            icon: FaPlus,
            label: 'Nouvel événement',
            description: 'Créer un événement',
            action: () => {
                onAddEvent()
                setIsOpen(false)
            }
        },
        {
            key: 'sync',
            icon: FaSync,
            label: 'Synchroniser',
            description: 'Sync avec Google Calendar',
            action: () => {
                onSync()
                setIsOpen(false)
            },
            disabled: isLoading
        }
    ]

    return (
        <>
        {/* Injection des styles CSS */}
        <style jsx>{scrollbarStyles}</style>
        <div className={`burger-menu ${className}`}>
            {/* Bouton burger discret */}
            <motion.button
                onClick={() => setIsOpen(!isOpen)}
                className="fixed top-2 left-2 z-50 w-10 h-10 flex items-center justify-center text-slate-400 hover:text-white transition-all duration-200"
                whileTap={{ scale: 0.95 }}
                whileHover={{ scale: 1.02 }}
            >
                <AnimatePresence mode="wait">
                    {isOpen ? (
                        <motion.div
                            key="close"
                            initial={{ scale: 0.8, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.8, opacity: 0 }}
                            transition={{ duration: 0.2, ease: "easeOut" }}
                        >
                            <FaTimes className="w-5 h-5" />
                        </motion.div>
                    ) : (
                        <motion.div
                            key="menu"
                            initial={{ scale: 0.8, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.8, opacity: 0 }}
                            transition={{ duration: 0.2, ease: "easeOut" }}
                        >
                            <FaBars className="w-5 h-5" />
                        </motion.div>
                    )}
                </AnimatePresence>
            </motion.button>

            {/* Overlay */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40"
                        onClick={() => setIsOpen(false)}
                    />
                )}
            </AnimatePresence>

            {/* Menu coulissant */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ x: -300, opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        exit={{ x: -300, opacity: 0 }}
                        transition={{ 
                            type: "tween", 
                            ease: [0.25, 0.1, 0.25, 1],
                            duration: 0.3,
                            opacity: { duration: 0.2 }
                        }}
                        className="fixed top-0 left-0 w-80 h-full bg-gradient-to-br from-[#1e293b] to-[#0f172a] shadow-2xl z-45 border-r border-slate-600/30 backdrop-blur-xl overflow-y-auto burger-menu-scroll"
                        style={scrollbarHideStyle}
                    >
                        <div className="p-6 pt-12 pb-32 min-h-[120vh] flex flex-col">
                            {/* Titre */}
                            <div className="mb-8">
                                <h2 className="text-2xl font-bold text-white mb-2">Options d'affichage</h2>
                            </div>

                            {/* Vues du calendrier */}
                            <div className="mb-8">
                                <h3 className="text-lg font-semibold text-slate-300 mb-4">Types de vue</h3>
                                <div className="space-y-2">
                                    {menuItems.map(({ key, icon: Icon, label, description }) => (
                                        <motion.button
                                            key={key}
                                            onClick={() => setViewMode(key)}
                                            className={`w-full p-4 rounded-xl flex items-center gap-4 transition-all duration-200 text-left ${
                                                viewMode === key
                                                    ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-lg'
                                                    : 'bg-slate-800/50 hover:bg-slate-700/60 text-slate-300 hover:text-white'
                                            }`}
                                            whileHover={{ scale: 1.02 }}
                                            whileTap={{ scale: 0.98 }}
                                        >
                                            <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                                                viewMode === key
                                                    ? 'bg-white/20'
                                                    : 'bg-slate-700/50'
                                            }`}>
                                                <Icon className="w-5 h-5" />
                                            </div>
                                            <div className="flex-1">
                                                <div className="font-semibold">{label}</div>
                                                <div className={`text-sm ${
                                                    viewMode === key ? 'text-blue-100' : 'text-slate-400'
                                                }`}>
                                                    {description}
                                                </div>
                                            </div>
                                            {viewMode === key && (
                                                <div className="w-2 h-2 rounded-full bg-white"></div>
                                            )}
                                        </motion.button>
                                    ))}
                                </div>
                            </div>

                            {/* Actions */}
                            <div>
                                <h3 className="text-lg font-semibold text-slate-300 mb-4">Actions</h3>
                                <div className="space-y-2">
                                    {actions.map(({ key, icon: Icon, label, description, action, disabled }) => (
                                        <motion.button
                                            key={key}
                                            onClick={action}
                                            disabled={disabled}
                                            className={`w-full p-4 rounded-xl flex items-center gap-4 transition-all duration-200 text-left ${
                                                disabled
                                                    ? 'bg-slate-800/30 text-slate-500 cursor-not-allowed'
                                                    : 'bg-slate-800/50 hover:bg-slate-700/60 text-slate-300 hover:text-white'
                                            }`}
                                            whileHover={disabled ? {} : { scale: 1.02 }}
                                            whileTap={disabled ? {} : { scale: 0.98 }}
                                        >
                                            <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                                                disabled ? 'bg-slate-700/30' : 'bg-slate-700/50'
                                            }`}>
                                                <Icon className={`w-5 h-5 ${
                                                    disabled ? '' : (isLoading && key === 'sync' ? 'animate-spin' : '')
                                                }`} />
                                            </div>
                                            <div className="flex-1">
                                                <div className="font-semibold">{label}</div>
                                                <div className="text-sm text-slate-400">{description}</div>
                                            </div>
                                        </motion.button>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
        </>
    )
}