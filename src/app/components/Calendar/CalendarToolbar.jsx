"use client"

import { motion } from "framer-motion"
import { 
    FaCalendarAlt, 
    FaCalendarWeek, 
    FaCalendarDay, 
    FaPlus, 
    FaSync,
    FaChevronLeft,
    FaChevronRight
} from "react-icons/fa"

export default function CalendarToolbar({
    viewMode,
    setViewMode,
    currentDate,
    onNavigate,
    onSync,
    onAddEvent,
    isLoading,
    onGoToToday,
    className = ""
}) {

    const formatDisplayDate = () => {
        if (viewMode === 'month') {
            return currentDate.toLocaleDateString('fr-FR', {
                month: 'long',
                year: 'numeric'
            })
        } else if (viewMode === 'week') {
            const weekStart = new Date(currentDate)
            const dayOfWeek = weekStart.getDay()
            const mondayOffset = dayOfWeek === 0 ? -6 : 1 - dayOfWeek
            weekStart.setDate(weekStart.getDate() + mondayOffset)
            
            const weekEnd = new Date(weekStart)
            weekEnd.setDate(weekStart.getDate() + 6)
            
            return `${weekStart.getDate()} - ${weekEnd.getDate()} ${weekEnd.toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' })}`
        } else {
            return currentDate.toLocaleDateString('fr-FR', {
                weekday: 'long',
                day: 'numeric',
                month: 'long',
                year: 'numeric'
            })
        }
    }


    return (
        <div className={`bg-gradient-to-br from-[#1e293b] to-[#0f172a] rounded-3xl p-4 shadow-2xl border border-slate-700/50 backdrop-blur-xl ${className}`}>
            {/* Navigation et titre - Mobile optimisé */}
            <div className="flex items-center justify-between mb-4">
                <motion.button
                    onClick={() => onNavigate(-1)}
                    className="w-10 h-10 rounded-full bg-slate-800/50 hover:bg-slate-700/60 flex items-center justify-center transition-all duration-200 shadow-lg border border-slate-600/30"
                    whileTap={{ scale: 0.95 }}
                >
                    <FaChevronLeft className="w-4 h-4 text-slate-300" />
                </motion.button>
                
                <div className="text-center flex-1 mx-3">
                    <h2 className="text-lg font-bold text-white capitalize leading-tight">
                        {formatDisplayDate()}
                    </h2>
                </div>
                
                <motion.button
                    onClick={() => onNavigate(1)}
                    className="w-10 h-10 rounded-full bg-slate-800/50 hover:bg-slate-700/60 flex items-center justify-center transition-all duration-200 shadow-lg border border-slate-600/30"
                    whileTap={{ scale: 0.95 }}
                >
                    <FaChevronRight className="w-4 h-4 text-slate-300" />
                </motion.button>
            </div>

            {/* Contrôles principaux */}
            <div className="flex items-center justify-between gap-3">
                    
                {/* Sélecteur de vue - Mobile compact */}
                <div className="flex p-1 relative bg-slate-800/50 rounded-2xl border border-slate-600/30">
                    {[
                        { key: 'month', icon: FaCalendarAlt },
                        { key: 'week', icon: FaCalendarWeek },
                        { key: 'day', icon: FaCalendarDay }
                    ].map(({ key, icon: Icon }) => (
                        <motion.button
                            key={key}
                            onClick={() => setViewMode(key)}
                            className={`w-10 h-10 rounded-xl flex items-center justify-center relative transition-colors duration-200 ${
                                viewMode === key 
                                    ? 'text-white shadow-lg'
                                    : 'text-slate-400'
                            }`}
                            whileTap={{ scale: 0.95 }}
                        >
                            {viewMode === key && (
                                <motion.div
                                    className="absolute inset-0 bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl shadow-lg"
                                    layoutId="activeViewTab"
                                    transition={{ 
                                        type: "spring", 
                                        stiffness: 400, 
                                        damping: 25 
                                    }}
                                />
                            )}
                            
                            <div className="relative z-10">
                                <Icon className="w-4 h-4" />
                            </div>
                        </motion.button>
                    ))}
                </div>

                {/* Actions essentielles - Mobile */}
                <div className="flex items-center gap-2">
                    {/* Ajouter événement */}
                    <motion.button
                        onClick={onAddEvent}
                        className="w-10 h-10 rounded-xl bg-blue-500 hover:bg-blue-600 text-white flex items-center justify-center transition-all duration-200 shadow-lg"
                        whileTap={{ scale: 0.95 }}
                        title="Ajouter événement"
                    >
                        <FaPlus className="w-4 h-4" />
                    </motion.button>

                    {/* Synchroniser */}
                    <motion.button
                        onClick={onSync}
                        disabled={isLoading}
                        className="w-10 h-10 rounded-xl bg-slate-800/50 hover:bg-slate-700/60 text-slate-300 hover:text-white flex items-center justify-center transition-all duration-200 border border-slate-600/30 disabled:opacity-50"
                        whileTap={{ scale: 0.95 }}
                        title="Synchroniser"
                    >
                        <FaSync className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
                    </motion.button>
                </div>
            </div>

        </div>
    )
}