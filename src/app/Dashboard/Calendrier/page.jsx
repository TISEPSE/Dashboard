"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { motion, AnimatePresence } from "framer-motion"
import { FaChevronLeft, FaChevronRight, FaPlus, FaCalendarAlt, FaFilter, FaList, FaTh, FaTrash, FaEdit, FaSync, FaCalendarDay, FaCalendarWeek, FaWifi } from "react-icons/fa"
import LoaderPortal from "../../components/LoaderPortal"
import AddEventModal from "../../components/Calendar/AddEventModal"
import EditEventModal from "../../components/Calendar/EditEventModal"
import GoogleSignInButton from "../../components/Auth/GoogleSignInButton"
import { useCalendar } from "../../hooks/useCalendar"
import { useColors } from "../../hooks/useColors"
import Notification from "../../components/Notification"

export default function Calendrier(){
    const [isLoading, setIsLoading] = useState(true)
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

    useEffect(() => {
        const timer = setTimeout(() => setIsLoading(false), 300)
        return () => clearTimeout(timer)
    }, [])

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
        return <LoaderPortal />
    }

    // Le calendrier est maintenant accessible même sans session

    return(
        <div className="min-h-screen bg-gradient-to-br from-[#1a1d29] to-[#212332] px-2 sm:px-4 lg:px-6">
            <div className="max-w-full xl:max-w-[1400px] mx-auto py-6">
                {/* Header avec contrôles */}
                <motion.div 
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-gradient-to-br from-[#2a2d3e] to-[#212332] rounded-2xl p-4 shadow-2xl border border-gray-600/20 mb-6"
                >
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                        {/* Navigation de date */}
                        <div className="flex items-center gap-4">
                            <button
                                onClick={() => navigateDate(-1)}
                                className="p-3 rounded-xl bg-[#3a3d4e] hover:bg-[#4a4d5e] text-white transition-all duration-200 transform hover:scale-105 shadow-lg"
                            >
                                <FaChevronLeft className="w-4 h-4" />
                            </button>
                            
                            <div className="text-center">
                                <h1 className="text-xl sm:text-2xl font-bold text-white capitalize">
                                    {viewMode === 'month' && formatMonthYear(currentDate)}
                                    {viewMode === 'week' && (() => {
                                        const weekStart = new Date(currentDate)
                                        const dayOfWeek = weekStart.getDay()
                                        const mondayOffset = dayOfWeek === 0 ? -6 : 1 - dayOfWeek
                                        weekStart.setDate(weekStart.getDate() + mondayOffset)
                                        
                                        const weekEnd = new Date(weekStart)
                                        weekEnd.setDate(weekStart.getDate() + 6)
                                        
                                        return `Semaine du ${weekStart.getDate()} au ${weekEnd.getDate()} ${weekEnd.toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' })}`
                                    })()}
                                    {viewMode === 'day' && formatDate(currentDate)}
                                </h1>
                                {viewMode === 'month' && (
                                    <p className="text-gray-400 text-sm mt-1">
                                        {new Date().getFullYear() === currentDate.getFullYear() ? 'Cette année' : currentDate.getFullYear()}
                                    </p>
                                )}
                            </div>
                            
                            <button
                                onClick={() => navigateDate(1)}
                                className="p-3 rounded-xl bg-[#3a3d4e] hover:bg-[#4a4d5e] text-white transition-all duration-200 transform hover:scale-105 shadow-lg"
                            >
                                <FaChevronRight className="w-4 h-4" />
                            </button>
                        </div>

                        {/* Contrôles */}
                        <div className="flex items-center gap-3">
                            {/* Sélecteur de vue avec background adaptatif */}
                            <div className="flex p-1 relative bg-[#3a3d4e]/50 rounded-xl border border-gray-600/20">
                                {[
                                    { key: 'month', icon: FaCalendarAlt, label: 'Mois' },
                                    { key: 'week', icon: FaCalendarWeek, label: 'Semaine' },
                                    { key: 'day', icon: FaCalendarDay, label: 'Jour' }
                                ].map(({ key, icon: Icon, label }) => (
                                    <motion.button
                                        key={key}
                                        onClick={() => setViewMode(key)}
                                        className={`flex items-center gap-2 px-4 py-3 rounded-lg text-sm font-medium relative flex-1 justify-center transition-colors duration-150 ${
                                            viewMode === key 
                                                ? 'text-white'
                                                : 'text-gray-300 hover:text-white'
                                        }`}
                                        title={label}
                                        whileHover={{ 
                                            scale: viewMode === key ? 1 : 1.02,
                                            transition: { duration: 0.1 }
                                        }}
                                        whileTap={{ 
                                            scale: 0.98,
                                            transition: { duration: 0.05 }
                                        }}
                                    >
                                        {/* Background animé qui s'adapte à chaque bouton */}
                                        {viewMode === key && (
                                            <motion.div
                                                className="absolute inset-0 bg-[#3A6FF8] rounded-lg shadow-lg"
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
                                            <span className="hidden sm:inline">{label}</span>
                                        </div>
                                    </motion.button>
                                ))}
                            </div>


                            {/* Bouton synchronisation */}
                            <motion.button
                                onClick={syncWithGoogle}
                                disabled={loadingEvents}
                                animate={{
                                    scale: loadingEvents ? [1, 1.05, 1] : 1,
                                    boxShadow: loadingEvents ? 
                                        ["0 4px 20px rgba(58, 111, 248, 0.3)", "0 8px 25px rgba(58, 111, 248, 0.4)", "0 4px 20px rgba(58, 111, 248, 0.3)"] :
                                        "0 4px 20px rgba(0, 0, 0, 0.3)"
                                }}
                                transition={{
                                    duration: 0.8,
                                    repeat: loadingEvents ? Infinity : 0,
                                    ease: "easeInOut"
                                }}
                                className="flex items-center gap-2 bg-[#3a3d4e] hover:bg-[#4a4d5e] text-white px-4 py-3 rounded-xl font-medium transition-all duration-200 transform hover:scale-105 shadow-lg disabled:opacity-50"
                            >
                                <FaSync className={`w-4 h-4 ${loadingEvents ? 'animate-spin' : ''}`} />
                                <span className="hidden sm:inline">Sync</span>
                            </motion.button>

                            {/* Bouton ajouter événement */}
                            <button
                                onClick={() => setShowAddEvent(true)}
                                className="flex items-center gap-2 bg-[#3A6FF8] hover:bg-[#2952d3] text-white px-4 py-3 rounded-xl font-medium transition-all duration-200 transform hover:scale-105 shadow-lg"
                            >
                                <FaPlus className="w-4 h-4" />
                                <span className="hidden sm:inline">Nouveau</span>
                            </button>
                        </div>
                    </div>
                </motion.div>

                {/* Calendrier principal */}
                <div className="bg-gradient-to-br from-[#2a2d3e] to-[#212332] rounded-3xl p-6 sm:p-8 shadow-2xl border border-gray-600/20 overflow-hidden relative">
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
                                <div className="p-4 sm:p-6 lg:p-8">
                                    {/* Skeleton header semaine */}
                                    <div className="mb-4">
                                        <div className="h-6 bg-gray-600/30 rounded w-64 mb-2"></div>
                                        <div className="h-4 bg-gray-600/20 rounded w-32"></div>
                                    </div>
                                    
                                    {/* Skeleton grille semaine */}
                                    <div className="bg-gradient-to-br from-[#2a2d3e] to-[#212332] rounded-3xl shadow-2xl border border-gray-600/20 overflow-hidden">
                                        <div className="grid grid-cols-8 gap-0 border-b border-gray-600/30">
                                            <div className="p-4 bg-gray-800/50">
                                                <div className="h-4 bg-gray-600/30 rounded w-12 mx-auto"></div>
                                            </div>
                                            {Array.from({ length: 7 }, (_, i) => (
                                                <div key={i} className="p-4 text-center border-l border-gray-600/20">
                                                    <div className="h-4 bg-gray-600/30 rounded w-8 mx-auto mb-2"></div>
                                                    <div className="w-14 h-14 bg-gray-600/20 rounded-2xl mx-auto"></div>
                                                </div>
                                            ))}
                                        </div>
                                        
                                        <div className="h-[500px]">
                                            {Array.from({ length: 12 }, (_, i) => (
                                                <div key={i} className="grid grid-cols-8 border-b border-gray-600/10 min-h-[42px]">
                                                    <div className="px-3 py-2 border-r border-gray-600/20 bg-gray-800/30">
                                                        <div className="h-4 bg-gray-600/30 rounded w-8 mx-auto"></div>
                                                    </div>
                                                    {Array.from({ length: 7 }, (_, j) => (
                                                        <div key={j} className="border-l border-gray-600/10 p-1">
                                                            {Math.random() > 0.7 && (
                                                                <div className="h-6 bg-gray-600/20 rounded mb-1"></div>
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
                        <div className="p-0 sm:p-6 lg:p-8">
                            {/* En-têtes des jours */}
                            <div className="grid grid-cols-7 gap-1 sm:gap-2 lg:gap-3 mb-2 sm:mb-4 lg:mb-6">
                                {['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'].map((day, index) => (
                                    <div key={index} className="p-1 sm:p-3 lg:p-4 text-center">
                                        <span className="text-gray-400 font-semibold text-xs sm:text-sm lg:text-base">{day}</span>
                                    </div>
                                ))}
                            </div>

                            {/* Grille du calendrier */}
                            <div className="grid grid-cols-7 gap-2 sm:gap-2 lg:gap-3">
                                {generateMonthCalendar().map((date, index) => {
                                    const dayEvents = getEventsForDay(date)
                                    const isCurrentDay = isToday(date)
                                    const isInCurrentMonth = isCurrentMonth(date)
                                    
                                    return (
                                        <motion.div
                                            key={index}
                                            whileHover={{ 
                                                scale: window.innerWidth >= 768 ? 1.03 : 1,
                                                y: window.innerWidth >= 768 ? -2 : 0,
                                                boxShadow: window.innerWidth >= 768 ? "0 8px 25px rgba(0, 0, 0, 0.15)" : "none"
                                            }}
                                            whileTap={{ scale: 0.98 }}
                                            transition={{ 
                                                type: "spring",
                                                stiffness: 400,
                                                damping: 25,
                                                mass: 0.5
                                            }}
                                            className={`min-h-[100px] sm:min-h-[120px] lg:min-h-[140px] p-2 sm:p-2 lg:p-3 cursor-pointer touch-manipulation active:scale-95 rounded-xl sm:rounded-xl lg:rounded-2xl border hover:md:shadow-lg ${
                                                isCurrentDay 
                                                    ? 'bg-gradient-to-br from-blue-600/30 to-indigo-600/30 border-blue-500/50 shadow-lg hover:from-blue-600/40 hover:to-indigo-600/40 hover:border-blue-400/60 hover:shadow-xl'
                                                    : isInCurrentMonth
                                                    ? 'bg-gradient-to-br from-gray-700/20 to-gray-800/20 hover:from-gray-600/30 hover:to-gray-700/30 border-gray-600/20 hover:border-gray-500/40 hover:shadow-lg'
                                                    : 'bg-gray-800/10 text-gray-500 border-gray-600/20 hover:bg-gray-700/20 hover:border-gray-500/30'
                                            } ${dayEvents.length > 0 ? 'ring-1 ring-blue-500/20 hover:ring-2 hover:ring-blue-400/30' : ''}`}
                                            onClick={() => handleDayClick(date)}
                                        >
                                            <div className={`text-xs sm:text-sm lg:text-base font-medium mb-1 sm:mb-2 lg:mb-3 relative ${
                                                isCurrentDay 
                                                    ? 'text-white' 
                                                    : isInCurrentMonth 
                                                    ? 'text-gray-200' 
                                                    : 'text-gray-500'
                                            }`}>
                                                {isCurrentDay ? (
                                                    <div className="w-6 h-6 sm:w-7 sm:h-7 lg:w-8 lg:h-8 bg-blue-500 rounded-lg flex items-center justify-center transition-all duration-75 hover:bg-blue-400 hover:scale-105 hover:shadow-lg cursor-pointer">
                                                        <span className="text-white font-bold text-xs sm:text-sm lg:text-base">
                                                            {date.getDate()}
                                                        </span>
                                                    </div>
                                                ) : (
                                                    <span>{date.getDate()}</span>
                                                )}
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
                        <div className="p-4 sm:p-6 lg:p-8">
                            {/* Header de la semaine */}
                            <div className="mb-4">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <h2 className="text-xl font-bold text-white mb-2">
                                            {(() => {
                                                const weekStart = new Date(currentDate)
                                                const dayOfWeek = weekStart.getDay()
                                                const mondayOffset = dayOfWeek === 0 ? -6 : 1 - dayOfWeek
                                                weekStart.setDate(weekStart.getDate() + mondayOffset)
                                                
                                                const weekEnd = new Date(weekStart)
                                                weekEnd.setDate(weekStart.getDate() + 6)
                                                
                                                return `${weekStart.getDate()} - ${weekEnd.getDate()} ${weekEnd.toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' })}`
                                            })()}
                                        </h2>
                                        <div className="flex items-center gap-4 text-sm text-gray-400">
                                            <span>Vue hebdomadaire</span>
                                            <div className="flex items-center gap-1">
                                                <div className={`w-2 h-2 rounded-full ${new Date().getDay() !== 0 && new Date().getDay() !== 6 ? 'bg-blue-400' : 'bg-gray-500'}`}></div>
                                                <span>Semaine de travail</span>
                                            </div>
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => setShowAddEvent(true)}
                                        className="flex items-center gap-2 bg-[#3A6FF8] hover:bg-[#2952d3] text-white px-4 py-2 rounded-xl font-medium transition-all duration-200 transform hover:scale-105 shadow-lg"
                                    >
                                        <FaPlus className="w-4 h-4" />
                                        <span className="hidden sm:inline">Nouvel événement</span>
                                    </button>
                                </div>
                            </div>

                            {/* Vue semaine moderne */}
                            <div className="bg-gradient-to-br from-[#2a2d3e] to-[#212332] rounded-3xl shadow-2xl border border-gray-600/20 overflow-hidden">
                                {/* Événements multi-jours en haut */}
                                {(() => {
                                    const weekStart = new Date(currentDate)
                                    const dayOfWeek = weekStart.getDay()
                                    const mondayOffset = dayOfWeek === 0 ? -6 : 1 - dayOfWeek
                                    weekStart.setDate(weekStart.getDate() + mondayOffset)
                                    
                                    const weekEnd = new Date(weekStart)
                                    weekEnd.setDate(weekStart.getDate() + 6)
                                    
                                    const multiDayEvents = getMultiDayEvents(weekStart, weekEnd)
                                    
                                    if (multiDayEvents.length > 0) {
                                        return (
                                            <div className="bg-gray-800/40 backdrop-blur-sm border-b border-gray-600/30 p-4">
                                                <h3 className="text-sm font-medium mb-3 text-gray-300">
                                                    📅 Événements sur plusieurs jours
                                                </h3>
                                                <div className="space-y-2">
                                                    {multiDayEvents.map((event, index) => {
                                                        const eventColor = getColor(event.colorId || '1')
                                                        const duration = getEventDuration(event)
                                                        const eventStart = new Date(event.start?.dateTime || event.start?.date)
                                                        const eventEnd = new Date(event.end?.dateTime || event.end?.date)
                                                        
                                                        return (
                                                            <motion.div
                                                                key={event.id || index}
                                                                initial={{ opacity: 0, y: 10 }}
                                                                animate={{ opacity: 1, y: 0 }}
                                                                transition={{ 
                                                                    duration: 0.3, 
                                                                    delay: index * 0.05,
                                                                    ease: "easeOut"
                                                                }}
                                                                className="flex items-center p-3 rounded-xl shadow-sm cursor-pointer transition-all duration-200 hover:shadow-lg hover:scale-[1.02] border-l-4"
                                                                style={{
                                                                    backgroundColor: `${eventColor.background}20`,
                                                                    borderLeftColor: eventColor.background
                                                                }}
                                                                onClick={() => handleEventClick(event, eventStart)}
                                                            >
                                                                <div className="flex-1">
                                                                    <div className="flex items-center gap-3">
                                                                        <div 
                                                                            className="w-4 h-4 rounded-full flex-shrink-0"
                                                                            style={{ backgroundColor: eventColor.background }}
                                                                        ></div>
                                                                        <div>
                                                                            <h4 className="font-semibold text-sm text-white">{event.summary}</h4>
                                                                            <div className="flex items-center gap-4 text-xs text-gray-400 mt-1">
                                                                                <span>
                                                                                    📅 {eventStart.toLocaleDateString('fr-FR', { 
                                                                                        day: '2-digit', 
                                                                                        month: 'short' 
                                                                                    })} → {eventEnd.toLocaleDateString('fr-FR', { 
                                                                                        day: '2-digit', 
                                                                                        month: 'short' 
                                                                                    })}
                                                                                </span>
                                                                                <span className="bg-gray-700/50 px-2 py-1 rounded-full">
                                                                                    {duration} jour{duration > 1 ? 's' : ''}
                                                                                </span>
                                                                                {event.location && (
                                                                                    <span>📍 {event.location}</span>
                                                                                )}
                                                                            </div>
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                                <button
                                                                    onClick={(e) => {
                                                                        e.stopPropagation()
                                                                        handleEventClick(event, eventStart)
                                                                    }}
                                                                    className="w-8 h-8 rounded-full bg-gray-700/50 hover:bg-gray-600/50 flex items-center justify-center transition-colors duration-200"
                                                                >
                                                                    <FaEdit className="w-3 h-3 text-gray-300" />
                                                                </button>
                                                            </motion.div>
                                                        )
                                                    })}
                                                </div>
                                            </div>
                                        )
                                    }
                                    return null
                                })()}

                                {/* En-tête des jours */}
                                <div className="bg-gray-800/40 backdrop-blur-sm border-b border-gray-600/30">
                                    <div className="grid grid-cols-8 gap-0">
                                        {/* Colonne vide pour aligner avec les heures */}
                                        <div className="p-4 bg-gray-800/50">
                                            <div className="text-center text-xs font-medium text-gray-500">
                                                Heure
                                            </div>
                                        </div>
                                        
                                        {['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'].map((day, index) => {
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
                                                <div key={index} className={`p-4 text-center transition-all duration-200 ${
                                                    `border-l border-gray-600/20 ${isToday ? 'bg-blue-500/10' : ''}`
                                                }`}>
                                                    <div className="space-y-2">
                                                        <div className={`text-sm font-medium ${
                                                            isWeekend ? 'text-gray-400' : 'text-gray-300'
                                                        }`}>
                                                            {day}
                                                        </div>
                                                        <div className={`text-2xl font-bold rounded-2xl w-14 h-14 flex items-center justify-center mx-auto transition-all duration-300 cursor-pointer ${
                                                            isToday 
                                                                ? 'bg-[#3A6FF8] text-white shadow-lg shadow-blue-500/25 scale-110' 
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
                                                                <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse"></div>
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
                                            <div key={hour} className={`grid grid-cols-8 border-b border-gray-600/10 last:border-b-0 transition-all duration-200 min-h-[70px] ${
                                                isPeakHour ? 'bg-gray-800/20' : ''
                                            } ${isCurrentHour ? 'bg-blue-500/5' : ''}`}>
                                                {/* Colonne des heures avec même taille que la section journée */}
                                                <div className={`w-20 p-4 border-r border-gray-600/20 bg-gray-800/30 flex flex-col items-center justify-center ${
                                                    isCurrentHour ? 'bg-blue-500/10' : ''
                                                }`}>
                                                    <div className={`text-lg font-bold transition-colors duration-200 ${
                                                        isCurrentHour ? 'text-blue-400' : 'text-white'
                                                    }`}>
                                                        {hour.toString().padStart(2, '0')}h
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
                                                                isToday ? 'bg-blue-500/5' : ''
                                                            }`}
                                                            onClick={() => {
                                                                const clickDate = new Date(dayDate)
                                                                clickDate.setHours(hour, 0, 0, 0)
                                                                handleDayClick(clickDate)
                                                            }}
                                                        >
                                                            {/* Indicateur hover */}
                                                            <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center">
                                                                <div className="w-6 h-6 rounded-full bg-[#3A6FF8]/20 flex items-center justify-center">
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
                        <div className="p-4 sm:p-6 lg:p-8">
                            {/* Header de la journée */}
                            <div className="mb-4">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <h2 className="text-xl font-bold text-white mb-2">
                                            {formatDate(currentDate)}
                                        </h2>
                                        <div className="flex items-center gap-4 text-sm text-gray-400">
                                            <span>{getEventsForDay(currentDate).length} événement(s)</span>
                                            <div className="flex items-center gap-1">
                                                <div className={`w-2 h-2 rounded-full ${isToday(currentDate) ? 'bg-blue-400' : 'bg-gray-500'}`}></div>
                                                <span>{isToday(currentDate) ? "Aujourd'hui" : 'Jour sélectionné'}</span>
                                            </div>
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => setShowAddEvent(true)}
                                        className="flex items-center gap-2 bg-[#3A6FF8] hover:bg-[#2952d3] text-white px-4 py-2 rounded-xl font-medium transition-all duration-200 transform hover:scale-105 shadow-lg"
                                    >
                                        <FaPlus className="w-4 h-4" />
                                        <span className="hidden sm:inline">Nouvel événement</span>
                                    </button>
                                </div>
                            </div>

                            {/* Vue détaillée de la journée */}
                            <div className="bg-gradient-to-br from-[#2a2d3e] to-[#212332] rounded-3xl shadow-2xl border border-gray-600/20 overflow-hidden relative">

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
                                                    } ${isCurrentHour ? 'bg-blue-500/5' : ''}`}
                                                >
                                                    {/* Colonne des heures */}
                                                    <div className={`w-20 p-4 border-r border-gray-600/20 bg-gray-800/30 flex flex-col items-center justify-center min-h-[70px] ${
                                                        isCurrentHour ? 'bg-blue-500/10' : ''
                                                    }`}>
                                                        <div className={`text-lg font-bold transition-colors duration-200 ${
                                                            isCurrentHour ? 'text-blue-400' : 'text-white'
                                                        }`}>
                                                            {hour.toString().padStart(2, '0')}h
                                                        </div>
                                                    </div>
                                                    
                                                    {/* Zone des événements */}
                                                    <div 
                                                        className="flex-1 p-3 min-h-[70px] cursor-pointer group hover:bg-gray-700/10 transition-all duration-200 relative"
                                                        onClick={() => {
                                                            const clickDate = new Date(currentDate)
                                                            clickDate.setHours(hour, 0, 0, 0)
                                                            setSelectedEventDate(clickDate)
                                                            setShowAddEvent(true)
                                                        }}
                                                    >
                                                        {/* Indicateur de clic */}
                                                        <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                                                            <div className="w-6 h-6 rounded-full bg-[#3A6FF8]/20 flex items-center justify-center">
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


                {/* Statistiques rapides */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-6">
                    <div className="bg-gradient-to-br from-[#2a2d3e] to-[#212332] rounded-2xl p-6 shadow-lg border border-blue-500/20">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-blue-400 text-sm font-medium">Événements ce mois</p>
                                <p className="text-2xl font-bold text-white">{events.length}</p>
                            </div>
                            <FaCalendarAlt className="w-8 h-8 text-blue-400" />
                        </div>
                    </div>
                    
                    <div className="bg-gradient-to-br from-[#2a2d3e] to-[#212332] rounded-2xl p-6 shadow-lg border border-green-500/20">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-green-400 text-sm font-medium">Aujourd'hui</p>
                                <p className="text-2xl font-bold text-white">{getEventsForDay(new Date()).length}</p>
                            </div>
                            <FaCalendarAlt className="w-8 h-8 text-green-400" />
                        </div>
                    </div>
                    
                    <div className="bg-gradient-to-br from-[#2a2d3e] to-[#212332] rounded-2xl p-6 shadow-lg border border-purple-500/20">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-purple-400 text-sm font-medium">Cette semaine</p>
                                <p className="text-2xl font-bold text-white">-</p>
                            </div>
                            <FaList className="w-8 h-8 text-purple-400" />
                        </div>
                    </div>
                    
                    <div className="bg-gradient-to-br from-[#2a2d3e] to-[#212332] rounded-2xl p-6 shadow-lg border border-amber-500/20">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-amber-400 text-sm font-medium">Synchronisation</p>
                                <p className="text-sm font-medium text-white">
                                    {session ? 'Google connecté' : 'Mode local'}
                                </p>
                            </div>
                            <div className="flex items-center gap-2">
                                {session ? (
                                    <FaWifi className="w-4 h-4 text-green-400" />
                                ) : (
                                    <div className="w-4 h-4 text-amber-400 relative">
                                        <FaWifi className="w-4 h-4" />
                                        <div className="absolute inset-0 bg-amber-400 transform rotate-45 w-0.5 h-5 top-0 left-2"></div>
                                    </div>
                                )}
                                <div className={`w-3 h-3 rounded-full ${session ? 'bg-green-400 animate-pulse' : 'bg-amber-400'}`}></div>
                            </div>
                        </div>
                    </div>
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