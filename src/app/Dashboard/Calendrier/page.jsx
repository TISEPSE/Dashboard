"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { motion, AnimatePresence } from "framer-motion"
import { FaChevronLeft, FaChevronRight, FaPlus, FaCalendarAlt, FaFilter, FaList, FaTh, FaTrash, FaEdit, FaSync, FaCalendarDay, FaCalendarWeek, FaWifi, FaBars } from "react-icons/fa"
import LoaderPortal from "../../components/LoaderPortal"
import AddEventModal from "../../components/Calendar/AddEventModal"
import EditEventModal from "../../components/Calendar/EditEventModal"
import GoogleSignInButton from "../../components/Auth/GoogleSignInButton"
import { useCalendar } from "../../hooks/useCalendar"
import { useColors } from "../../hooks/useColors"
import Notification from "../../components/Notification"

export default function Calendrier(){
    const [isLoading, setIsLoading] = useState(false)
    const [currentDate, setCurrentDate] = useState(new Date())
    const [viewMode, setViewMode] = useState('month') // 'month', 'week', 'day'
    const [showAddEvent, setShowAddEvent] = useState(false)
    const [showEditEvent, setShowEditEvent] = useState(false)
    const [selectedEventDate, setSelectedEventDate] = useState(null)
    const [selectedEvent, setSelectedEvent] = useState(null)
    const { data: session } = useSession()
    
    // Utiliser les hooks du calendrier et des couleurs
    const { 
        events, 
        loadingEvents, 
        syncStatus, 
        notification,
        loadEvents, 
        addEvent, 
        updateEvent, 
        deleteEvent, 
        syncWithGoogle 
    } = useCalendar()

    const { getColor, isGoogleConnected } = useColors()

    // Fonction pour gérer le clic sur un jour (pour mobile et desktop)
    const handleDayClick = (date) => {
        // S'assurer que la date est un objet Date valide
        const validDate = date instanceof Date ? date : new Date(date)
        setSelectedEventDate(validDate)
        // Toujours ouvrir le modal de création d'événement
        setShowAddEvent(true)
    }

    // Fonction pour ouvrir directement le modal d'édition d'un événement
    const handleEventClick = (event, date) => {
        setSelectedEvent(event)
        setSelectedEventDate(date)
        setShowEditEvent(true)
    }

    // Supprimer le chargement automatique - seulement pour les vrais problèmes réseau
    // useEffect(() => {
    //     const timer = setTimeout(() => setIsLoading(false), 300)
    //     return () => clearTimeout(timer)
    // }, [])

    // Charger les événements (Google + locaux)
    useEffect(() => {
        const loadCurrentPeriodEvents = () => {
            let timeMin, timeMax
            const now = new Date(currentDate)
            
            if (viewMode === 'month') {
                // Premier jour du mois - étendre pour inclure la semaine précédente
                timeMin = new Date(now.getFullYear(), now.getMonth(), 1)
                const firstDayOfWeek = timeMin.getDay()
                const mondayAdjustment = firstDayOfWeek === 0 ? 6 : firstDayOfWeek - 1
                timeMin.setDate(timeMin.getDate() - mondayAdjustment)
                
                // Dernier jour du mois - étendre pour inclure la semaine suivante
                timeMax = new Date(now.getFullYear(), now.getMonth() + 1, 0)
                const lastDayOfWeek = timeMax.getDay()
                timeMax.setDate(timeMax.getDate() + (6 - lastDayOfWeek))
                
                // Assurer qu'on va jusqu'à la fin de la journée
                timeMax.setHours(23, 59, 59, 999)
            } else if (viewMode === 'week') {
                // Début de la semaine (lundi)
                timeMin = new Date(now)
                const dayOfWeek = now.getDay()
                const mondayAdjustment = dayOfWeek === 0 ? 6 : dayOfWeek - 1
                timeMin.setDate(now.getDate() - mondayAdjustment)
                timeMin.setHours(0, 0, 0, 0)
                
                // Fin de la semaine (dimanche)
                timeMax = new Date(timeMin)
                timeMax.setDate(timeMin.getDate() + 6)
                timeMax.setHours(23, 59, 59, 999)
            } else {
                // Jour actuel
                timeMin = new Date(now.getFullYear(), now.getMonth(), now.getDate())
                timeMin.setHours(0, 0, 0, 0)
                timeMax = new Date(timeMin)
                timeMax.setDate(timeMin.getDate() + 1)
                timeMax.setHours(23, 59, 59, 999)
            }

            loadEvents(timeMin.toISOString(), timeMax.toISOString())
        }

        loadCurrentPeriodEvents()
    }, [currentDate, viewMode, loadEvents])



    // Navigation du calendrier
    const navigateDate = (direction) => {
        const newDate = new Date(currentDate)
        if (viewMode === 'month') {
            newDate.setMonth(newDate.getMonth() + direction)
        } else if (viewMode === 'week') {
            newDate.setDate(newDate.getDate() + (direction * 7))
        } else {
            newDate.setDate(newDate.getDate() + direction)
        }
        setCurrentDate(newDate)
    }

    // Générer le calendrier mensuel (commence par Lundi)
    const generateMonthCalendar = () => {
        const year = currentDate.getFullYear()
        const month = currentDate.getMonth()
        const firstDay = new Date(year, month, 1)
        const lastDay = new Date(year, month + 1, 0)
        const startDate = new Date(firstDay)
        
        // Ajuster pour commencer par Lundi (0 = dimanche, 1 = lundi, etc.)
        const dayOfWeek = firstDay.getDay()
        const mondayAdjustment = dayOfWeek === 0 ? 6 : dayOfWeek - 1
        startDate.setDate(startDate.getDate() - mondayAdjustment)
        
        const days = []
        const current = new Date(startDate)
        
        for (let i = 0; i < 42; i++) {
            days.push(new Date(current))
            current.setDate(current.getDate() + 1)
        }
        
        return days
    }

    // Formater la date pour l'affichage
    const formatDate = (date) => {
        return date.toLocaleDateString('fr-FR', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        })
    }

    const formatMonthYear = (date) => {
        return date.toLocaleDateString('fr-FR', {
            month: 'long',
            year: 'numeric'
        })
    }

    const isToday = (date) => {
        const today = new Date()
        return date.toDateString() === today.toDateString()
    }

    const isCurrentMonth = (date) => {
        return date.getMonth() === currentDate.getMonth()
    }

    const getEventsForDay = (date) => {
        return events.filter(event => {
            const eventStart = new Date(event.start?.dateTime || event.start?.date)
            const eventEnd = new Date(event.end?.dateTime || event.end?.date)
            
            // Pour les événements sur plusieurs jours
            if (event.start.date && event.end.date) {
                return date >= eventStart && date <= eventEnd
            }
            
            return eventStart.toDateString() === date.toDateString()
        })
    }

    // Nouvelle fonction pour gérer les événements multi-jours
    const getMultiDayEvents = (startDate, endDate) => {
        return events.filter(event => {
            const eventStart = new Date(event.start?.dateTime || event.start?.date)
            const eventEnd = new Date(event.end?.dateTime || event.end?.date)
            
            // Événement qui s'étend sur plusieurs jours
            const isMultiDay = eventEnd.getTime() - eventStart.getTime() > 24 * 60 * 60 * 1000
            
            if (isMultiDay) {
                return (eventStart <= endDate && eventEnd >= startDate)
            }
            
            return false
        })
    }

    // Fonction pour calculer la durée d'un événement en jours
    const getEventDuration = (event) => {
        const eventStart = new Date(event.start?.dateTime || event.start?.date)
        const eventEnd = new Date(event.end?.dateTime || event.end?.date)
        return Math.ceil((eventEnd - eventStart) / (24 * 60 * 60 * 1000))
    }

    if (isLoading) {
        return <LoaderPortal show={loadingEvents} />
    }

    // Le calendrier est maintenant accessible même sans session

    return(
        <div className="min-h-screen bg-gradient-to-br from-[#0f0f23] via-[#1a1a2e] to-[#16213e] px-0 sm:px-4 lg:px-6 pb-20 sm:pb-0">
            <div className="max-w-full xl:max-w-[1200px] mx-auto py-4 sm:py-6">
                {/* Header mobile moderne sombre */}
                <div className="sm:hidden">
                    {/* Card header avec navigation */}
                    <div className="bg-gradient-to-br from-[#1e293b] to-[#0f172a] rounded-3xl mx-4 mb-4 shadow-2xl border border-slate-700/50 backdrop-blur-xl">
                        <div className="p-4">
                            <div className="flex items-center justify-between">
                                <button
                                    onClick={() => navigateDate(-1)}
                                    className="w-12 h-12 rounded-full bg-slate-800/50 hover:bg-slate-700/60 flex items-center justify-center transition-all duration-200 shadow-lg border border-slate-600/30"
                                >
                                    <FaChevronLeft className="w-5 h-5 text-slate-300" />
                                </button>
                                
                                <div className="text-center">
                                    <h1 className="text-2xl font-bold text-white capitalize">
                                        {viewMode === 'month' && formatMonthYear(currentDate)}
                                        {viewMode === 'week' && (() => {
                                            const weekStart = new Date(currentDate)
                                            const dayOfWeek = weekStart.getDay()
                                            const mondayOffset = dayOfWeek === 0 ? -6 : 1 - dayOfWeek
                                            weekStart.setDate(weekStart.getDate() + mondayOffset)
                                            
                                            const weekEnd = new Date(weekStart)
                                            weekEnd.setDate(weekStart.getDate() + 6)
                                            
                                            return `${weekStart.getDate()} - ${weekEnd.getDate()} ${weekEnd.toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' })}`
                                        })()}
                                        {viewMode === 'day' && currentDate.toLocaleDateString('fr-FR', {
                                            weekday: 'long',
                                            day: 'numeric',
                                            month: 'long'
                                        })}
                                    </h1>
                                </div>
                                
                                <button
                                    onClick={() => navigateDate(1)}
                                    className="w-12 h-12 rounded-full bg-slate-800/50 hover:bg-slate-700/60 flex items-center justify-center transition-all duration-200 shadow-lg border border-slate-600/30"
                                >
                                    <FaChevronRight className="w-5 h-5 text-slate-300" />
                                </button>
                            </div>
                            
                        </div>
                    </div>
                </div>

                {/* Header avec contrôles - Desktop uniquement */}
                <motion.div 
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="hidden sm:block bg-gradient-to-br from-[#1e293b] to-[#0f172a] rounded-3xl p-6 shadow-2xl border border-slate-700/50 mb-6 backdrop-blur-xl"
                >
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
                        {/* Navigation de date */}
                        <div className="flex items-center gap-4 flex-shrink-0">
                            <button
                                onClick={() => navigateDate(-1)}
                                className="w-12 h-12 rounded-full bg-slate-800/50 hover:bg-slate-700/60 flex items-center justify-center transition-all duration-200 transform hover:scale-105 shadow-lg border border-slate-600/30"
                            >
                                <FaChevronLeft className="w-5 h-5 text-slate-300" />
                            </button>
                            
                            <div className="text-center flex-shrink-0">
                                <h1 className="text-2xl lg:text-3xl font-bold text-white capitalize">
                                    {viewMode === 'month' && formatMonthYear(currentDate)}
                                    {viewMode === 'week' && (() => {
                                        const weekStart = new Date(currentDate)
                                        const dayOfWeek = weekStart.getDay()
                                        const mondayOffset = dayOfWeek === 0 ? -6 : 1 - dayOfWeek
                                        weekStart.setDate(weekStart.getDate() + mondayOffset)
                                        
                                        const weekEnd = new Date(weekStart)
                                        weekEnd.setDate(weekStart.getDate() + 6)
                                        
                                        return `${weekStart.getDate()} - ${weekEnd.getDate()} ${weekEnd.toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' })}`
                                    })()}
                                    {viewMode === 'day' && formatDate(currentDate)}
                                </h1>
                            </div>
                            
                            <button
                                onClick={() => navigateDate(1)}
                                className="w-12 h-12 rounded-full bg-slate-800/50 hover:bg-slate-700/60 flex items-center justify-center transition-all duration-200 transform hover:scale-105 shadow-lg border border-slate-600/30"
                            >
                                <FaChevronRight className="w-5 h-5 text-slate-300" />
                            </button>
                        </div>

                        {/* Contrôles modernes sombres */}
                        <div className="flex items-center gap-3 flex-wrap">
                            {/* Sélecteur de vue avec style moderne sombre */}
                            <div className="flex p-1 relative bg-slate-800/50 rounded-2xl border border-slate-600/30">
                                {[
                                    { key: 'month', icon: FaCalendarAlt, label: 'Mois' },
                                    { key: 'week', icon: FaCalendarWeek, label: 'Semaine' },
                                    { key: 'day', icon: FaCalendarDay, label: 'Jour' }
                                ].map(({ key, icon: Icon, label }) => (
                                    <motion.button
                                        key={key}
                                        onClick={() => setViewMode(key)}
                                        className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold relative transition-colors duration-200 ${
                                            viewMode === key 
                                                ? 'text-white shadow-lg'
                                                : 'text-slate-400 hover:text-slate-200'
                                        }`}
                                        whileHover={{ 
                                            scale: viewMode === key ? 1 : 1.02,
                                            transition: { duration: 0.1 }
                                        }}
                                        whileTap={{ 
                                            scale: 0.98,
                                            transition: { duration: 0.05 }
                                        }}
                                    >
                                        {/* Background animé moderne sombre */}
                                        {viewMode === key && (
                                            <motion.div
                                                className="absolute inset-0 bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl shadow-lg"
                                                layoutId="activeTab"
                                                transition={{ 
                                                    type: "spring", 
                                                    stiffness: 400, 
                                                    damping: 25 
                                                }}
                                            />
                                        )}
                                        
                                        <div className="relative z-10 flex items-center gap-2">
                                            <Icon className="w-4 h-4" />
                                            <span className="hidden md:inline">{label}</span>
                                        </div>
                                    </motion.button>
                                ))}
                            </div>

                            {/* Bouton synchronisation moderne sombre */}
                            <motion.button
                                onClick={syncWithGoogle}
                                disabled={loadingEvents}
                                className="flex items-center gap-2 bg-slate-800/50 hover:bg-slate-700/60 text-slate-300 px-4 py-2.5 rounded-xl font-semibold transition-all duration-200 transform hover:scale-105 shadow-lg border border-slate-600/30 disabled:opacity-50"
                            >
                                <FaSync className={`w-4 h-4 ${loadingEvents ? 'animate-spin' : ''}`} />
                                <span className="hidden md:inline">Sync</span>
                            </motion.button>

                        </div>
                    </div>
                </motion.div>

                {/* Calendrier principal */}
                <div className="bg-gradient-to-br from-[#1e293b] to-[#0f172a] rounded-none sm:rounded-3xl p-0 sm:p-6 shadow-none sm:shadow-2xl border-0 sm:border border-slate-700/50 overflow-hidden relative backdrop-blur-xl">
                    {loadingEvents ? (
                        /* Skeleton Screen */
                        <div className="animate-pulse">
                            {viewMode === 'month' && (
                                <div className="p-4 sm:p-6 lg:p-8">
                                    {/* Skeleton des en-têtes des jours */}
                                    <div className="grid grid-cols-7 gap-1 sm:gap-2 lg:gap-3 mb-3 sm:mb-4 lg:mb-6">
                                        {Array.from({ length: 7 }, (_, i) => (
                                            <div key={i} className="p-2 sm:p-3 lg:p-4 text-center">
                                                <div className="h-4 bg-gray-600/30 rounded w-8 mx-auto"></div>
                                            </div>
                                        ))}
                                    </div>
                                    
                                    {/* Skeleton de la grille du calendrier */}
                                    <div className="grid grid-cols-7 gap-1 sm:gap-2 lg:gap-3">
                                        {Array.from({ length: 42 }, (_, i) => (
                                            <div key={i} className="min-h-[100px] sm:min-h-[120px] lg:min-h-[140px] p-2 sm:p-2 lg:p-3 border border-gray-600/20 rounded-xl sm:rounded-xl lg:rounded-2xl bg-gray-700/10">
                                                <div className="h-4 bg-gray-600/30 rounded w-6 mb-2"></div>
                                                <div className="space-y-1">
                                                    {Math.random() > 0.6 && <div className="h-6 bg-gray-600/20 rounded"></div>}
                                                    {Math.random() > 0.7 && <div className="h-6 bg-gray-600/15 rounded w-3/4"></div>}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                            
                            {viewMode === 'week' && (
                                <div className="p-0 sm:p-6">
                                    {/* Skeleton grille semaine */}
                                    <div className="bg-gradient-to-br from-[#1e293b] to-[#0f172a] rounded-none sm:rounded-3xl shadow-none sm:shadow-2xl border-0 sm:border border-slate-700/50 overflow-hidden">
                                        <div className="bg-gray-800/40 backdrop-blur-sm border-b border-gray-600/30">
                                            <div className="grid grid-cols-8 gap-0">
                                                <div className="p-2 sm:p-4 bg-gray-800/50">
                                                    <div className="h-3 sm:h-4 bg-gray-600/30 rounded w-8 sm:w-12 mx-auto"></div>
                                                </div>
                                                {Array.from({ length: 7 }, (_, i) => (
                                                    <div key={i} className="p-2 sm:p-4 text-center border-l border-gray-600/20">
                                                        <div className="h-3 sm:h-4 bg-gray-600/30 rounded w-6 sm:w-8 mx-auto mb-1 sm:mb-2"></div>
                                                        <div className="w-8 h-8 sm:w-14 sm:h-14 bg-gray-600/20 rounded-xl sm:rounded-2xl mx-auto"></div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                        
                                        <div className="w-full">
                                            {Array.from({ length: 18 }, (_, i) => (
                                                <div key={i} className="grid grid-cols-8 border-b border-gray-600/10 last:border-b-0 min-h-[50px] sm:min-h-[70px]">
                                                    <div className="w-12 sm:w-20 p-2 sm:p-4 border-r border-gray-600/20 bg-gray-800/30 flex items-center justify-center">
                                                        <div className="h-4 sm:h-5 bg-gray-600/30 rounded w-8 sm:w-12"></div>
                                                    </div>
                                                    {Array.from({ length: 7 }, (_, j) => (
                                                        <div key={j} className="border-l border-gray-600/10 p-2">
                                                            {Math.random() > 0.7 && (
                                                                <div className="h-4 sm:h-6 bg-gray-600/20 rounded mb-1"></div>
                                                            )}
                                                            {Math.random() > 0.8 && (
                                                                <div className="h-3 sm:h-4 bg-gray-600/15 rounded w-3/4"></div>
                                                            )}
                                                        </div>
                                                    ))}
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            )}
                            
                            {viewMode === 'day' && (
                                <div className="p-4 sm:p-6 lg:p-8">
                                    {/* Skeleton header jour */}
                                    <div className="mb-4">
                                        <div className="h-6 bg-gray-600/30 rounded w-80 mb-2"></div>
                                        <div className="h-4 bg-gray-600/20 rounded w-48"></div>
                                    </div>
                                    
                                    {/* Skeleton vue jour */}
                                    <div className="bg-gradient-to-br from-[#2a2d3e] to-[#212332] rounded-3xl shadow-2xl border border-gray-600/20 overflow-hidden">
                                        <div className="relative">
                                            {Array.from({ length: 18 }, (_, i) => (
                                                <div key={i} className="flex border-b border-gray-600/10 min-h-[70px]">
                                                    <div className="w-20 p-4 border-r border-gray-600/20 bg-gray-800/30">
                                                        <div className="h-6 bg-gray-600/30 rounded w-12 mx-auto"></div>
                                                    </div>
                                                    <div className="flex-1 p-3">
                                                        {Math.random() > 0.6 && (
                                                            <div className="space-y-2">
                                                                <div className="h-10 bg-gray-600/20 rounded"></div>
                                                                {Math.random() > 0.7 && (
                                                                    <div className="h-8 bg-gray-600/15 rounded w-4/5"></div>
                                                                )}
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    ) : (
                        <>
                        {viewMode === 'month' && (
                        <div className="p-4 sm:p-6">
                            {/* En-têtes des jours modernes sombres */}
                            <div className="grid grid-cols-7 gap-2 mb-6">
                                {['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'].map((day, index) => (
                                    <div key={index} className="p-3 text-center">
                                        <span className="text-slate-400 font-bold text-sm uppercase tracking-wider">{day}</span>
                                    </div>
                                ))}
                            </div>

                            {/* Grille du calendrier moderne sombre */}
                            <div className="grid grid-cols-7 gap-2 sm:gap-3">
                                {generateMonthCalendar().map((date, index) => {
                                    const dayEvents = getEventsForDay(date)
                                    const isCurrentDay = isToday(date)
                                    const isInCurrentMonth = isCurrentMonth(date)
                                    
                                    return (
                                        <motion.div
                                            key={index}
                                            whileHover={{ 
                                                scale: 1.02
                                            }}
                                            whileTap={{ scale: 0.98 }}
                                            transition={{ 
                                                type: "tween",
                                                duration: 0.15,
                                                ease: "easeOut"
                                            }}
                                            className={`min-h-[100px] sm:min-h-[110px] lg:min-h-[120px] p-2 sm:p-3 cursor-pointer touch-manipulation rounded-xl border transition-all duration-100 backdrop-blur-sm ${
                                                isCurrentDay 
                                                    ? 'bg-gradient-to-br from-blue-400/25 to-blue-500/25 border-blue-300/50 shadow-xl shadow-blue-400/20 hover:shadow-2xl hover:shadow-blue-400/30'
                                                    : isInCurrentMonth
                                                    ? 'bg-gradient-to-br from-slate-700/40 to-slate-800/40 hover:from-slate-600/50 hover:to-slate-700/50 border-slate-600/30 hover:border-slate-500/50 hover:shadow-lg hover:shadow-slate-500/20'
                                                    : 'bg-slate-800/20 text-slate-600 border-slate-700/30 hover:bg-slate-700/30'
                                            } ${dayEvents.length > 0 ? 'ring-1 ring-slate-500/40' : ''}`}
                                            onClick={() => handleDayClick(date)}
                                        >
                                            <div className={`text-base sm:text-lg font-bold mb-2 relative ${
                                                isCurrentDay 
                                                    ? 'text-blue-300' 
                                                    : isInCurrentMonth 
                                                    ? 'text-slate-100' 
                                                    : 'text-slate-500'
                                            }`}>
                                                <span className={`inline-block w-8 h-8 flex items-center justify-center rounded-lg font-bold ${
                                                    isCurrentDay 
                                                        ? 'text-blue-300' 
                                                        : ''
                                                }`}>
                                                    {date.getDate()}
                                                </span>
                                            </div>
                                            
                                            {/* Événements du jour */}
                                            <div className="space-y-1 sm:space-y-1 lg:space-y-1.5 flex-1">
                                                {dayEvents.slice(0, 2).map((event, eventIndex) => {
                                                    const eventColor = getColor(event.colorId || '1')
                                                    return (
                                                        <motion.div
                                                            key={`${event.id}-${eventIndex}`}
                                                            initial={{ opacity: 0, y: 10 }}
                                                            animate={{ opacity: 1, y: 0 }}
                                                            transition={{ 
                                                                duration: 0.3, 
                                                                delay: eventIndex * 0.05,
                                                                ease: "easeOut"
                                                            }}
                                                            className="text-xs sm:text-xs lg:text-sm p-1.5 sm:p-1.5 lg:p-2 cursor-pointer md:hover:brightness-110 md:hover:shadow-md transition-all touch-manipulation h-[28px] sm:h-[32px] lg:h-[36px] flex items-center w-full rounded-lg shadow-sm"
                                                                style={{
                                                                    backgroundColor: eventColor.background,
                                                                    color: eventColor.text
                                                                }}
                                                                title={event.summary}
                                                                onClick={(e) => {
                                                                    e.stopPropagation()
                                                                    // Ouvrir le modal d'édition de l'événement
                                                                    handleEventClick(event, date)
                                                                }}
                                                            >
                                                                <span className="truncate flex-1 font-medium">{event.summary}</span>
                                                            </motion.div>
                                                        )
                                                    })}
                                                {/* Afficher un événement supplémentaire sur desktop */}
                                                {dayEvents.length > 2 && (
                                                    <div className="hidden lg:block">
                                                        <motion.div
                                                            key={`${dayEvents[2].id}-extra`}
                                                            initial={{ opacity: 0, y: 10 }}
                                                            animate={{ opacity: 1, y: 0 }}
                                                            transition={{ 
                                                                duration: 0.3, 
                                                                delay: 0.1,
                                                                ease: "easeOut"
                                                            }}
                                                            className="text-sm p-2 rounded-lg shadow-sm cursor-pointer md:hover:brightness-110 md:hover:shadow-md transition-all touch-manipulation h-[36px] flex items-center w-full"
                                                            style={{
                                                                backgroundColor: getColor(dayEvents[2].colorId || '1').background,
                                                                color: getColor(dayEvents[2].colorId || '1').text
                                                            }}
                                                            title={dayEvents[2].summary}
                                                            onClick={(e) => {
                                                                e.stopPropagation()
                                                                handleEventClick(dayEvents[2], date)
                                                            }}
                                                        >
                                                            <span className="truncate flex-1 font-medium">{dayEvents[2].summary}</span>
                                                        </motion.div>
                                                    </div>
                                                )}
                                                {/* Afficher jusqu'à 4 événements sur très grands écrans */}
                                                {dayEvents.length > 3 && (
                                                    <div className="hidden xl:block">
                                                        <motion.div
                                                            key={`${dayEvents[3].id}-extra2`}
                                                            initial={{ opacity: 0, y: 10 }}
                                                            animate={{ opacity: 1, y: 0 }}
                                                            transition={{ 
                                                                duration: 0.3, 
                                                                delay: 0.15,
                                                                ease: "easeOut"
                                                            }}
                                                            className="text-sm p-2 rounded-lg shadow-sm cursor-pointer md:hover:brightness-110 md:hover:shadow-md transition-all touch-manipulation h-[36px] flex items-center w-full"
                                                            style={{
                                                                backgroundColor: getColor(dayEvents[3].colorId || '1').background,
                                                                color: getColor(dayEvents[3].colorId || '1').text
                                                            }}
                                                            title={dayEvents[3].summary}
                                                            onClick={(e) => {
                                                                e.stopPropagation()
                                                                handleEventClick(dayEvents[3], date)
                                                            }}
                                                        >
                                                            <span className="truncate flex-1 font-medium">{dayEvents[3].summary}</span>
                                                        </motion.div>
                                                    </div>
                                                )}
                                                {/* Compteur d'événements adaptatif */}
                                                {dayEvents.length > 2 && (
                                                    <div className="text-xs sm:text-xs lg:text-sm text-gray-400 font-medium pt-1">
                                                        <span className="lg:hidden">+{dayEvents.length - 2} autres</span>
                                                        <span className="hidden lg:inline xl:hidden">
                                                            {dayEvents.length > 3 ? `+${dayEvents.length - 3} autres` : ''}
                                                        </span>
                                                        <span className="hidden xl:inline">
                                                            {dayEvents.length > 4 ? `+${dayEvents.length - 4} autres` : ''}
                                                        </span>
                                                    </div>
                                                )}
                                            </div>
                                        </motion.div>
                                    )
                                })}
                            </div>
                        </div>
                    )}

                    {viewMode === 'week' && (
                        <div className="p-0 sm:p-6 lg:p-8">

                            {/* Vue semaine moderne */}
                            <div className="bg-gradient-to-br from-[#1e293b] to-[#0f172a] rounded-none sm:rounded-3xl shadow-none sm:shadow-2xl border-0 sm:border border-slate-700/50 overflow-hidden">

                                {/* En-tête des jours */}
                                <div className="bg-gray-800/40 backdrop-blur-sm border-b border-gray-600/30">
                                    <div className="grid grid-cols-8 gap-0">
                                        {/* Colonne vide pour aligner avec les heures */}
                                        <div className="flex-1 max-w-[80px] p-2 sm:p-4 bg-slate-800/70 border-r border-slate-600/40">
                                            <div className="text-center text-xs font-semibold text-slate-200">
                                                <span className="hidden sm:inline">Heure</span>
                                                <span className="sm:hidden">H</span>
                                            </div>
                                        </div>
                                        
                                        {['L', 'M', 'M', 'J', 'V', 'S', 'D'].map((dayShort, index) => {
                                            const dayFull = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'][index]
                                            const weekStart = new Date(currentDate)
                                            const dayOfWeek = weekStart.getDay()
                                            const mondayOffset = dayOfWeek === 0 ? -6 : 1 - dayOfWeek
                                            weekStart.setDate(weekStart.getDate() + mondayOffset)
                                            
                                            const dayDate = new Date(weekStart)
                                            dayDate.setDate(weekStart.getDate() + index)
                                            
                                            const today = new Date()
                                            const isToday = dayDate.toDateString() === today.toDateString()
                                            const isWeekend = index >= 5
                                            const dayEvents = getEventsForDay(dayDate).filter(event => {
                                                // Exclure les événements multi-jours déjà affichés en haut
                                                const duration = getEventDuration(event)
                                                return duration <= 1
                                            })
                                            
                                            return (
                                                <div key={index} className={`p-2 sm:p-4 text-center transition-all duration-200 ${
                                                    `border-l border-gray-600/20 ${isToday ? 'bg-blue-400/10' : ''}`
                                                }`}>
                                                    <div className="space-y-1 sm:space-y-2">
                                                        <div className={`text-xs sm:text-sm font-medium ${
                                                            isWeekend ? 'text-gray-400' : 'text-gray-300'
                                                        }`}>
                                                            <span className="sm:hidden">{dayShort}</span>
                                                            <span className="hidden sm:inline">{dayFull}</span>
                                                        </div>
                                                        <div className={`text-lg sm:text-2xl font-bold rounded-xl sm:rounded-2xl w-8 h-8 sm:w-14 sm:h-14 flex items-center justify-center mx-auto transition-all duration-300 cursor-pointer ${
                                                            isToday 
                                                                ? 'bg-blue-500 text-white shadow-lg shadow-blue-400/25 scale-110' 
                                                                : isWeekend
                                                                ? 'text-gray-400 hover:bg-gray-700/50 hover:scale-105'
                                                                : 'text-gray-300 hover:bg-gray-700/50 hover:scale-105'
                                                        }`}
                                                        onClick={() => {
                                                            setCurrentDate(dayDate)
                                                            setViewMode('day')
                                                        }}
                                                        >
                                                            {dayDate.getDate()}
                                                        </div>
                                                        {dayEvents.length > 0 && (
                                                            <div className="flex items-center justify-center">
                                                                <div className="w-2 h-2 bg-blue-300 rounded-full animate-pulse"></div>
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            )
                                        })}
                                    </div>
                                </div>

                                {/* Grille horaire complète sans scroll - toutes les heures visibles */}
                                <div className="w-full">
                                    {Array.from({ length: 18 }, (_, hourIndex) => {
                                        const hour = hourIndex + 6 // 6h à 23h (comme la vue journée)
                                        const isPeakHour = hour >= 9 && hour <= 17
                                        const isCurrentHour = isToday(currentDate) && hour === new Date().getHours()
                                        
                                        return (
                                            <div key={hour} className={`grid grid-cols-8 border-b border-gray-600/10 last:border-b-0 transition-all duration-200 min-h-[50px] sm:min-h-[70px] ${
                                                isPeakHour ? 'bg-gray-800/20' : ''
                                            } ${isCurrentHour ? 'bg-blue-400/5' : ''}`}>
                                                {/* Colonne des heures */}
                                                <div className={`flex-1 max-w-[80px] p-2 sm:p-4 border-r border-slate-600/40 bg-slate-800/70 flex flex-col items-center justify-center ${
                                                    isCurrentHour ? 'bg-blue-400/15 border-r-blue-400/40' : ''
                                                }`}>
                                                    <div className={`text-sm sm:text-base font-bold transition-colors duration-200 ${
                                                        isCurrentHour ? 'text-blue-300' : 'text-slate-100'
                                                    }`}>
                                                        <span className="sm:hidden">{hour}h</span>
                                                        <span className="hidden sm:inline">{hour.toString().padStart(2, '0')}h</span>
                                                    </div>
                                                </div>
                                                
                                                {/* Colonnes des jours */}
                                                {Array.from({ length: 7 }, (_, dayIndex) => {
                                                    const weekStart = new Date(currentDate)
                                                    const dayOfWeek = weekStart.getDay()
                                                    const mondayOffset = dayOfWeek === 0 ? -6 : 1 - dayOfWeek
                                                    weekStart.setDate(weekStart.getDate() + mondayOffset)
                                                    
                                                    const dayDate = new Date(weekStart)
                                                    dayDate.setDate(weekStart.getDate() + dayIndex)
                                                    
                                                    const today = new Date()
                                                    const isToday = dayDate.toDateString() === today.toDateString()
                                                    
                                                    // Événements pour cette heure
                                                    const hourEvents = getEventsForDay(dayDate).filter(event => {
                                                        // Exclure les événements multi-jours
                                                        if (getEventDuration(event) > 1) return false
                                                        
                                                        if (event.start.dateTime) {
                                                            const eventStart = new Date(event.start.dateTime)
                                                            const eventEnd = new Date(event.end.dateTime)
                                                            const eventStartHour = eventStart.getHours()
                                                            const eventEndHour = eventEnd.getHours()
                                                            
                                                            return eventStartHour === hour || 
                                                                   (hour > eventStartHour && hour < eventEndHour) ||
                                                                   (hour === eventEndHour && eventEnd.getMinutes() > 0)
                                                        }
                                                        return false
                                                    })

                                                    return (
                                                        <div 
                                                            key={dayIndex} 
                                                            className={`relative border-l border-gray-600/10 transition-all duration-200 cursor-pointer group hover:bg-gray-700/10 ${
                                                                isToday ? 'bg-blue-400/5' : ''
                                                            }`}
                                                            onClick={() => {
                                                                const clickDate = new Date(dayDate)
                                                                clickDate.setHours(hour, 0, 0, 0)
                                                                handleDayClick(clickDate)
                                                            }}
                                                        >
                                                            {/* Indicateur hover */}
                                                            <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center">
                                                                <div className="w-6 h-6 rounded-full bg-blue-500/20 flex items-center justify-center">
                                                                    <FaPlus className="text-xs text-[#3A6FF8]" />
                                                                </div>
                                                            </div>

                                                            {/* Événements avec plus d'espace */}
                                                            <div className="relative z-10 p-2 h-full">
                                                                {hourEvents.map((event, eventIndex) => {
                                                                    const eventColor = getColor(event.colorId || '1')
                                                                    const eventStart = new Date(event.start.dateTime)
                                                                    const isEventStart = eventStart.getHours() === hour
                                                                    
                                                                    return (
                                                                        <div
                                                                            key={`${event.id}-${eventIndex}`}
                                                                            className={`text-xs p-2 rounded-md shadow-sm cursor-pointer transition-all duration-200 hover:shadow-md hover:scale-105 border-l-2 mb-1.5 last:mb-0 ${
                                                                                isEventStart ? 'font-medium' : 'opacity-75'
                                                                            }`}
                                                                            style={{
                                                                                backgroundColor: isEventStart ? eventColor.background : `${eventColor.background}60`,
                                                                                color: eventColor.text,
                                                                                borderLeftColor: eventColor.background
                                                                            }}
                                                                            title={`${event.summary}${event.location ? ` - ${event.location}` : ''}`}
                                                                            onClick={(e) => {
                                                                                e.stopPropagation()
                                                                                handleEventClick(event, dayDate)
                                                                            }}
                                                                        >
                                                                            <div className="truncate">
                                                                                {isEventStart && (
                                                                                    <span className="inline-block w-1 h-1 bg-current rounded-full mr-1"></span>
                                                                                )}
                                                                                {event.summary}
                                                                            </div>
                                                                        </div>
                                                                    )
                                                                })}
                                                            </div>
                                                        </div>
                                                    )
                                                })}
                                            </div>
                                        )
                                    })}
                                </div>
                            </div>

                        </div>
                    )}

                    {viewMode === 'day' && (
                        <div className="p-0 sm:p-6 lg:p-8">

                            {/* Vue détaillée de la journée */}
                            <div className="bg-gradient-to-br from-[#1e293b] to-[#0f172a] rounded-none sm:rounded-3xl shadow-none sm:shadow-2xl border-0 sm:border border-slate-700/50 overflow-hidden relative">

                                {/* Grille horaire sans scroll */}
                                <div className="relative">
                                    <div className="w-full"
                                    >
                                        
                                        {/* Ligne d'heure actuelle si c'est aujourd'hui */}
                                        {isToday(currentDate) && (
                                            <div className="absolute left-0 right-0 z-10 pointer-events-none"
                                                style={{
                                                    top: `${((new Date().getHours() - 6) * 70) + ((new Date().getMinutes() / 60) * 70)}px`
                                                }}
                                            >
                                                <div className="flex items-center">
                                                    <div className="w-3 h-3 bg-red-500 rounded-full shadow-lg animate-pulse"></div>
                                                    <div className="flex-1 h-0.5 bg-red-500 shadow-sm"></div>
                                                    <div className="text-xs text-red-500 font-medium px-2 bg-[#2a2d3e] rounded">
                                                        {new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                                                    </div>
                                                </div>
                                            </div>
                                        )}

                                        {Array.from({ length: 18 }, (_, hourIndex) => {
                                            const hour = hourIndex + 6 // Commence à 6h, va jusqu'à 23h
                                            const isPeakHour = hour >= 9 && hour <= 17
                                            const isCurrentHour = isToday(currentDate) && hour === new Date().getHours()
                                            
                                            // Récupérer les événements pour cette heure
                                            const hourEvents = getEventsForDay(currentDate).filter(event => {
                                                if (event.start.date && !event.start.dateTime) {
                                                    // Événement toute la journée - afficher à 6h
                                                    return hour === 6
                                                } else if (event.start.dateTime) {
                                                    const eventStart = new Date(event.start.dateTime)
                                                    const eventEnd = new Date(event.end.dateTime)
                                                    const eventStartHour = eventStart.getHours()
                                                    const eventEndHour = eventEnd.getHours()
                                                    
                                                    return eventStartHour === hour || 
                                                           (hour > eventStartHour && hour < eventEndHour) ||
                                                           (hour === eventEndHour && eventEnd.getMinutes() > 0)
                                                }
                                                return false
                                            })

                                            return (
                                                <div 
                                                    key={hour} 
                                                    className={`flex border-b border-gray-600/10 last:border-b-0 transition-all duration-200 ${
                                                        isPeakHour ? 'bg-gray-800/20' : ''
                                                    } ${isCurrentHour ? 'bg-blue-400/5' : ''}`}
                                                >
                                                    {/* Colonne des heures */}
                                                    <div className={`w-14 sm:w-20 p-2 sm:p-4 border-r border-gray-600/20 bg-gray-800/30 flex flex-col items-center justify-center min-h-[90px] sm:min-h-[70px] ${
                                                        isCurrentHour ? 'bg-blue-400/10' : ''
                                                    }`}>
                                                        <div className={`text-base sm:text-lg font-bold transition-colors duration-200 ${
                                                            isCurrentHour ? 'text-blue-300' : 'text-white'
                                                        }`}>
                                                            {hour.toString().padStart(2, '0')}h
                                                        </div>
                                                    </div>
                                                    
                                                    {/* Zone des événements */}
                                                    <div 
                                                        className="flex-1 p-3 min-h-[90px] sm:min-h-[70px] cursor-pointer group hover:bg-gray-700/10 transition-all duration-200 relative"
                                                        onClick={() => {
                                                            const clickDate = new Date(currentDate)
                                                            clickDate.setHours(hour, 0, 0, 0)
                                                            setSelectedEventDate(clickDate)
                                                            setShowAddEvent(true)
                                                        }}
                                                    >
                                                        {/* Indicateur de clic */}
                                                        <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                                                            <div className="w-6 h-6 rounded-full bg-blue-500/20 flex items-center justify-center">
                                                                <FaPlus className="text-xs text-[#3A6FF8]" />
                                                            </div>
                                                        </div>

                                                        {/* Événements */}
                                                        <div className="space-y-2">
                                                            {hourEvents.map((event, eventIndex) => {
                                                                const eventColor = getColor(event.colorId || '1')
                                                                const eventStart = event.start.dateTime ? new Date(event.start.dateTime) : null
                                                                const eventEnd = event.end.dateTime ? new Date(event.end.dateTime) : null
                                                                const isEventStart = eventStart && eventStart.getHours() === hour
                                                                const isAllDay = event.start.date && !event.start.dateTime
                                                                
                                                                return (
                                                                    <motion.div
                                                                        key={`${event.id}-${eventIndex}`}
                                                                        initial={{ opacity: 0, y: 10 }}
                                                                        animate={{ opacity: 1, y: 0 }}
                                                                        transition={{ 
                                                                            duration: 0.3, 
                                                                            delay: eventIndex * 0.05,
                                                                            ease: "easeOut"
                                                                        }}
                                                                        className={`p-3 rounded-lg shadow-sm cursor-pointer transition-all duration-200 hover:shadow-md hover:scale-[1.01] border-l-3 ${
                                                                            isAllDay ? 'min-h-[45px]' : 'min-h-[40px]'
                                                                        }`}
                                                                        style={{
                                                                            backgroundColor: isEventStart || isAllDay ? eventColor.background : `${eventColor.background}80`,
                                                                            color: eventColor.text,
                                                                            borderLeftColor: eventColor.background
                                                                        }}
                                                                        onClick={(e) => {
                                                                            e.stopPropagation()
                                                                            handleEventClick(event, currentDate)
                                                                        }}
                                                                    >
                                                                        <div className="flex items-start justify-between">
                                                                            <div className="flex-1 min-w-0">
                                                                                <h4 className="font-medium text-xs truncate mb-1">
                                                                                    {event.summary}
                                                                                </h4>
                                                                                {(isEventStart || isAllDay) && (
                                                                                    <div className="space-y-1">
                                                                                        {isAllDay ? (
                                                                                            <div className="flex items-center gap-1 text-xs opacity-80">
                                                                                                <FaCalendarAlt className="w-2 h-2" />
                                                                                                <span>Toute la journée</span>
                                                                                            </div>
                                                                                        ) : (
                                                                                            <div className="flex items-center gap-1 text-xs opacity-80">
                                                                                                <div className="w-1.5 h-1.5 rounded-full bg-current"></div>
                                                                                                <span>
                                                                                                    {eventStart.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })} - 
                                                                                                    {eventEnd.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                                                                                                </span>
                                                                                            </div>
                                                                                        )}
                                                                                        {event.location && (
                                                                                            <div className="text-xs opacity-70 truncate">
                                                                                                📍 {event.location}
                                                                                            </div>
                                                                                        )}
                                                                                    </div>
                                                                                )}
                                                                            </div>
                                                                            {(isEventStart || isAllDay) && (
                                                                                <div className="flex gap-1 ml-2">
                                                                                    <button
                                                                                        onClick={(e) => {
                                                                                            e.stopPropagation()
                                                                                            handleEventClick(event, currentDate)
                                                                                        }}
                                                                                        className="w-5 h-5 rounded-full bg-black/10 hover:bg-black/20 flex items-center justify-center transition-colors duration-200"
                                                                                    >
                                                                                        <FaEdit className="w-2.5 h-2.5" />
                                                                                    </button>
                                                                                </div>
                                                                            )}
                                                                        </div>
                                                                    </motion.div>
                                                                )
                                                            })}
                                                        </div>

                                                        {/* Zone vide avec message d'encouragement */}
                                                        {hourEvents.length === 0 && (
                                                            <div className="h-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                                                                <div className="text-center text-gray-500">
                                                                    <div className="text-xs">Cliquez pour ajouter un événement</div>
                                                                    <div className="text-xs opacity-70">à {hour.toString().padStart(2, '0')}h00</div>
                                                                </div>
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            )
                                        })}
                                    </div>
                                </div>

                            </div>

                        </div>
                    )}
                        </>
                    )}
                </div>


            </div>

            {/* Nouvelle barre de contrôles mobile - Simple et efficace */}
            <div className="sm:hidden fixed bottom-2 left-1/2 transform -translate-x-1/2 z-40">
                <div className="flex items-center gap-2">
                    {/* Sélecteur de vue compact */}
                    <div className="flex bg-white/10 backdrop-blur-lg rounded-full p-0.5 border border-white/20 shadow-2xl">
                        {[
                            { key: 'month', icon: FaCalendarAlt },
                            { key: 'week', icon: FaCalendarWeek },
                            { key: 'day', icon: FaCalendarDay }
                        ].map(({ key, icon: Icon }) => (
                            <motion.button
                                key={key}
                                onClick={() => setViewMode(key)}
                                className={`w-12 h-12 rounded-full flex items-center justify-center transition-all duration-200 ${
                                    viewMode === key 
                                        ? 'bg-blue-500 text-white shadow-lg' 
                                        : 'text-gray-300 hover:text-white hover:bg-white/10'
                                }`}
                                whileTap={{ scale: 0.9 }}
                                whileHover={{ scale: 1.05 }}
                            >
                                <Icon className="w-4 h-4" />
                            </motion.button>
                        ))}
                    </div>

                    {/* Bouton Sync */}
                    <motion.button
                        onClick={syncWithGoogle}
                        disabled={loadingEvents}
                        className="w-12 h-12 rounded-full bg-white/10 backdrop-blur-lg border border-white/20 shadow-2xl flex items-center justify-center text-white transition-all duration-200 hover:bg-white/20 disabled:opacity-50"
                        whileTap={{ scale: 0.9 }}
                        whileHover={{ scale: 1.05 }}
                    >
                        <FaSync className={`w-4 h-4 ${loadingEvents ? 'animate-spin' : ''}`} />
                    </motion.button>

                    {/* Bouton Menu Navbar */}
                    <motion.button
                        onClick={() => {
                            // Fonction pour dispatcher l'événement
                            const dispatchEvent = () => {
                                const event = new CustomEvent('openMobileNavbar')
                                window.dispatchEvent(event)
                            }
                            
                            // Vérifier si le listener est prêt
                            if (window._mobileNavbarReady) {
                                dispatchEvent()
                            } else {
                                // Attendre un court délai et réessayer
                                setTimeout(dispatchEvent, 100)
                            }
                        }}
                        className="w-12 h-12 rounded-full bg-blue-500 shadow-2xl flex items-center justify-center text-white transition-all duration-200 hover:bg-blue-400"
                        whileTap={{ scale: 0.9 }}
                        whileHover={{ scale: 1.05 }}
                    >
                        <FaBars className="w-4 h-4" />
                    </motion.button>
                </div>
            </div>

            {/* Modal Ajouter Événement */}
            <AddEventModal
                isOpen={showAddEvent}
                onClose={() => {
                    setShowAddEvent(false)
                    setSelectedEventDate(null)
                }}
                onSave={addEvent}
                selectedDate={selectedEventDate}
            />


            {/* Modal Modifier Événement */}
            <EditEventModal
                isOpen={showEditEvent}
                onClose={() => {
                    setShowEditEvent(false)
                    setSelectedEvent(null)
                }}
                onSave={updateEvent}
                onDelete={deleteEvent}
                event={selectedEvent}
            />

            {/* Notification */}
            <Notification 
                notification={notification}
                onClose={() => {}} 
            />
        </div>
    )
}