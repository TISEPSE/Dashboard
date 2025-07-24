"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { motion, AnimatePresence } from "framer-motion"
import { FaChevronLeft, FaChevronRight, FaPlus, FaCalendarAlt, FaFilter, FaList, FaTh, FaTrash, FaEdit, FaSync, FaCalendarDay, FaCalendarWeek, FaWifi } from "react-icons/fa"
import LoaderPortal from "../../components/LoaderPortal"
import AddEventModal from "../../components/Calendar/AddEventModal"
import DayEventsModal from "../../components/Calendar/DayEventsModal"
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
    const [showDayEvents, setShowDayEvents] = useState(false)
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
        const dayEvents = getEventsForDay(date)
        setSelectedEventDate(date)
        if (dayEvents.length > 0) {
            setShowDayEvents(true)
        } else {
            setShowAddEvent(true)
        }
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
            const eventDate = new Date(event.start?.dateTime || event.start?.date)
            return eventDate.toDateString() === date.toDateString()
        })
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
                    className="bg-gradient-to-br from-[#2a2d3e] to-[#212332] rounded-3xl p-6 shadow-2xl border border-gray-600/20 mb-6"
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
                                <h1 className="text-2xl sm:text-3xl font-bold text-white capitalize">
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
                            {/* Sélecteur de vue */}
                            <div className="flex bg-[#3a3d4e]/50 rounded-xl p-1 border border-gray-600/20">
                                {[
                                    { key: 'month', icon: FaCalendarAlt, label: 'Mois' },
                                    { key: 'week', icon: FaCalendarWeek, label: 'Semaine' },
                                    { key: 'day', icon: FaCalendarDay, label: 'Jour' }
                                ].map(({ key, icon: Icon, label }) => (
                                    <button
                                        key={key}
                                        onClick={() => setViewMode(key)}
                                        className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                                            viewMode === key 
                                                ? 'bg-[#3A6FF8] text-white shadow-lg transform scale-105'
                                                : 'text-gray-300 hover:text-white hover:bg-[#4a4d5e]/50'
                                        }`}
                                        title={label}
                                    >
                                        <Icon className="w-4 h-4" />
                                        <span className="hidden sm:inline">{label}</span>
                                    </button>
                                ))}
                            </div>


                            {/* Bouton synchronisation */}
                            <button
                                onClick={syncWithGoogle}
                                disabled={loadingEvents}
                                className="flex items-center gap-2 bg-[#3a3d4e] hover:bg-[#4a4d5e] text-white px-4 py-3 rounded-xl font-medium transition-all duration-200 transform hover:scale-105 shadow-lg disabled:opacity-50"
                            >
                                <FaSync className={`w-4 h-4 ${loadingEvents ? 'animate-spin' : ''}`} />
                                <span className="hidden sm:inline">Sync</span>
                            </button>

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
                <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="bg-gradient-to-br from-[#2a2d3e] to-[#212332] rounded-3xl shadow-2xl border border-gray-600/20 overflow-hidden"
                >
                    {loadingEvents && (
                        <motion.div 
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.8 }}
                            className="absolute top-4 right-4 z-10 bg-gray-800/95 backdrop-blur-sm rounded-full p-2.5 shadow-lg border border-gray-600/40"
                        >
                            <motion.div
                                animate={{ rotate: 360 }}
                                transition={{ duration: 1.2, repeat: Infinity, ease: "linear" }}
                                className="w-5 h-5 text-blue-400"
                            >
                                <svg viewBox="0 0 24 24" fill="currentColor" className="w-full h-full">
                                    <path d="M12 2L13.09 8.26L22 9L13.09 9.74L12 16L10.91 9.74L2 9L10.91 8.26L12 2Z" />
                                </svg>
                            </motion.div>
                        </motion.div>
                    )}

                    {viewMode === 'month' && (
                        <div className="p-4 sm:p-6 lg:p-8">
                            {/* En-têtes des jours */}
                            <div className="grid grid-cols-7 gap-1 sm:gap-2 lg:gap-3 mb-3 sm:mb-4 lg:mb-6">
                                {['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'].map((day, index) => (
                                    <div key={index} className="p-2 sm:p-3 lg:p-4 text-center">
                                        <span className="text-gray-400 font-semibold text-xs sm:text-sm lg:text-base">{day}</span>
                                    </div>
                                ))}
                            </div>

                            {/* Grille du calendrier */}
                            <div className="grid grid-cols-7 gap-1 sm:gap-2 lg:gap-3">
                                {generateMonthCalendar().map((date, index) => {
                                    const dayEvents = getEventsForDay(date)
                                    const isCurrentDay = isToday(date)
                                    const isInCurrentMonth = isCurrentMonth(date)
                                    
                                    return (
                                        <motion.div
                                            key={index}
                                            whileHover={{ scale: window.innerWidth >= 768 ? 1.02 : 1 }}
                                            whileTap={{ scale: 0.98 }}
                                            className={`min-h-[100px] sm:min-h-[120px] lg:min-h-[140px] p-2 sm:p-2 lg:p-3 border border-gray-600/20 rounded-xl sm:rounded-xl lg:rounded-2xl transition-all duration-200 cursor-pointer touch-manipulation active:scale-95 ${
                                                isCurrentDay 
                                                    ? 'bg-gradient-to-br from-blue-600/30 to-indigo-600/30 border-blue-500/50 shadow-lg'
                                                    : isInCurrentMonth
                                                    ? 'bg-gradient-to-br from-gray-700/20 to-gray-800/20 md:hover:from-gray-600/30 md:hover:to-gray-700/30'
                                                    : 'bg-gray-800/10 text-gray-500'
                                            } ${dayEvents.length > 0 ? 'ring-1 ring-blue-500/20' : ''}`}
                                            onClick={() => handleDayClick(date)}
                                        >
                                            <div className={`text-xs sm:text-sm lg:text-base font-medium mb-1 sm:mb-2 lg:mb-3 relative ${
                                                isCurrentDay ? 'text-white' : isInCurrentMonth ? 'text-gray-200' : 'text-gray-500'
                                            }`}>
                                                {isCurrentDay ? (
                                                    <div className="w-5 h-5 sm:w-6 sm:h-6 lg:w-7 lg:h-7 bg-blue-500 rounded-full flex items-center justify-center">
                                                        <span className="text-white font-bold text-xs sm:text-sm lg:text-base">
                                                            {date.getDate()}
                                                        </span>
                                                    </div>
                                                ) : (
                                                    <span>{date.getDate()}</span>
                                                )}
                                            </div>
                                            
                                            {/* Événements du jour */}
                                            <div className="space-y-0.5 sm:space-y-1 lg:space-y-1.5 flex-1">
                                                {dayEvents.slice(0, 2).map((event, eventIndex) => {
                                                    const eventColor = getColor(event.colorId || '1')
                                                    return (
                                                        <div
                                                            key={eventIndex}
                                                            className="text-xs sm:text-xs lg:text-sm p-1 sm:p-1.5 lg:p-2 rounded-lg shadow-sm cursor-pointer md:hover:brightness-110 md:hover:shadow-md transition-all touch-manipulation h-[28px] sm:h-[32px] lg:h-[36px] flex items-center w-full"
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
                                                        </div>
                                                    )
                                                })}
                                                {/* Afficher un événement supplémentaire sur desktop */}
                                                {dayEvents.length > 2 && (
                                                    <div className="hidden lg:block">
                                                        {(() => {
                                                            const eventColor = getColor(dayEvents[2].colorId || '1')
                                                            return (
                                                                <div
                                                                    className="text-sm p-2 rounded-lg shadow-sm cursor-pointer md:hover:brightness-110 md:hover:shadow-md transition-all touch-manipulation h-[36px] flex items-center w-full"
                                                                    style={{
                                                                        backgroundColor: eventColor.background,
                                                                        color: eventColor.text
                                                                    }}
                                                                    title={dayEvents[2].summary}
                                                                    onClick={(e) => {
                                                                        e.stopPropagation()
                                                                        // Ouvrir le modal d'édition de l'événement
                                                                        handleEventClick(dayEvents[2], date)
                                                                    }}
                                                                >
                                                                    <span className="truncate flex-1 font-medium">{dayEvents[2].summary}</span>
                                                                </div>
                                                            )
                                                        })()}
                                                    </div>
                                                )}
                                                {/* Afficher jusqu'à 4 événements sur très grands écrans */}
                                                {dayEvents.length > 3 && (
                                                    <div className="hidden xl:block">
                                                        {(() => {
                                                            const eventColor = getColor(dayEvents[3].colorId || '1')
                                                            return (
                                                                <div
                                                                    className="text-sm p-2 rounded-lg shadow-sm cursor-pointer md:hover:brightness-110 md:hover:shadow-md transition-all touch-manipulation h-[36px] flex items-center w-full"
                                                                    style={{
                                                                        backgroundColor: eventColor.background,
                                                                        color: eventColor.text
                                                                    }}
                                                                    title={dayEvents[3].summary}
                                                                    onClick={(e) => {
                                                                        e.stopPropagation()
                                                                        // Ouvrir le modal d'édition de l'événement
                                                                        handleEventClick(dayEvents[3], date)
                                                                    }}
                                                                >
                                                                    <span className="truncate flex-1 font-medium">{dayEvents[3].summary}</span>
                                                                </div>
                                                            )
                                                        })()}
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
                            {/* Design moderne de la vue semaine */}
                            <div className="bg-gradient-to-br from-[#2a2d3e] to-[#212332] rounded-3xl shadow-2xl border border-gray-600/20 overflow-hidden">
                                {/* En-tête élégante avec les jours */}
                                <div className="bg-gray-800/40 backdrop-blur-sm border-b border-gray-600/30">
                                    <div className="grid grid-cols-8 gap-0">
                                        {/* Colonne vide pour aligner avec les heures */}
                                        <div className="p-4"></div>
                                        
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
                                            
                                            return (
                                                <div key={index} className="p-4 text-center border-l border-gray-600/20">
                                                    <div className="space-y-2">
                                                        <div className={`text-sm font-medium ${isWeekend ? 'text-gray-400' : 'text-gray-300'}`}>
                                                            {day}
                                                        </div>
                                                        <div className={`text-xl font-bold rounded-xl w-12 h-12 flex items-center justify-center mx-auto transition-all duration-300 ${
                                                            isToday 
                                                                ? 'bg-[#3A6FF8] text-white shadow-lg shadow-blue-500/25 scale-110' 
                                                                : isWeekend
                                                                ? 'text-gray-400 hover:bg-gray-700/50 hover:scale-105'
                                                                : 'text-gray-300 hover:bg-gray-700/50 hover:scale-105'
                                                        }`}>
                                                            {dayDate.getDate()}
                                                        </div>
                                                    </div>
                                                </div>
                                            )
                                        })}
                                    </div>
                                </div>

                                {/* Corps principal avec scroll amélioré */}
                                <div className="relative">
                                    <div className="max-h-[600px] overflow-y-auto custom-scrollbar">
                                        {Array.from({ length: 15 }, (_, hourIndex) => {
                                            const hour = hourIndex + 6 // Commencer à 6h
                                            const isPeakHour = hour >= 9 && hour <= 17
                                            
                                            return (
                                                <div key={hour} className={`grid grid-cols-8 border-b border-gray-600/10 last:border-b-0 ${isPeakHour ? 'bg-gray-800/20' : ''}`}>
                                                    {/* Colonne des heures stylisée */}
                                                    <div className={`p-3 border-r border-gray-600/20 bg-gray-800/30 min-w-[80px] flex items-center justify-center`}>
                                                        <div className="text-lg font-bold text-white">
                                                            {hour.toString().padStart(2, '0')}h
                                                        </div>
                                                    </div>
                                                    
                                                    {/* Colonnes des jours améliorées */}
                                                    {Array.from({ length: 7 }, (_, dayIndex) => {
                                                        const weekStart = new Date(currentDate)
                                                        const dayOfWeek = weekStart.getDay()
                                                        const mondayOffset = dayOfWeek === 0 ? -6 : 1 - dayOfWeek
                                                        weekStart.setDate(weekStart.getDate() + mondayOffset)
                                                        
                                                        const dayDate = new Date(weekStart)
                                                        dayDate.setDate(weekStart.getDate() + dayIndex)
                                                        
                                                        const today = new Date()
                                                        const isToday = dayDate.toDateString() === today.toDateString()
                                                        const isWeekend = dayIndex >= 5
                                                        
                                                        // Récupérer TOUS les événements du jour
                                                        const allDayEvents = getEventsForDay(dayDate)
                                                        
                                                        // Séparer les événements par heure et ceux qui durent toute la journée
                                                        let hourEvents = []
                                                        let dayLongEvents = []
                                                        
                                                        allDayEvents.forEach(event => {
                                                            if (event.start.date && !event.start.dateTime) {
                                                                // Événement toute la journée - afficher dans la première tranche visible
                                                                if (hour === 6) {
                                                                    dayLongEvents.push(event)
                                                                }
                                                            } else if (event.start.dateTime) {
                                                                // Événement avec heure spécifique
                                                                const eventStart = new Date(event.start.dateTime)
                                                                const eventEnd = new Date(event.end.dateTime)
                                                                const eventStartHour = eventStart.getHours()
                                                                const eventStartMinute = eventStart.getMinutes()
                                                                const eventEndHour = eventEnd.getHours()
                                                                const eventEndMinute = eventEnd.getMinutes()
                                                                
                                                                // Logique améliorée : afficher l'événement dans sa tranche horaire de début
                                                                // et aussi dans les tranches qu'il traverse s'il dure plus d'une heure
                                                                const eventDurationHours = eventEndHour - eventStartHour
                                                                
                                                                if (eventStartHour === hour || 
                                                                    (hour > eventStartHour && hour < eventEndHour) ||
                                                                    (hour === eventEndHour && eventEndMinute > 0)) {
                                                                    
                                                                    // Marquer si c'est le début de l'événement
                                                                    const isEventStart = eventStartHour === hour
                                                                    hourEvents.push({
                                                                        ...event,
                                                                        isEventStart,
                                                                        eventStartTime: eventStart,
                                                                        eventEndTime: eventEnd,
                                                                        durationHours: eventDurationHours
                                                                    })
                                                                }
                                                            }
                                                        })

                                                        return (
                                                            <div 
                                                                key={dayIndex} 
                                                                className={`relative min-h-[80px] border-l border-gray-600/10 transition-all duration-200 cursor-pointer group ${
                                                                    isToday ? 'bg-blue-500/5 hover:bg-blue-500/10' : 
                                                                    'hover:bg-gray-700/20'
                                                                }`}
                                                                onClick={() => {
                                                                    const clickDate = new Date(dayDate)
                                                                    clickDate.setHours(hour, 0, 0, 0)
                                                                    handleDayClick(clickDate)
                                                                }}
                                                            >
                                                                {/* Indicateur de clic */}
                                                                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                                                                    <div className="absolute top-2 right-2">
                                                                        <div className="w-6 h-6 rounded-full bg-[#3A6FF8]/20 flex items-center justify-center">
                                                                            <span className="text-xs text-[#3A6FF8]">+</span>
                                                                        </div>
                                                                    </div>
                                                                </div>

                                                                {/* Événements de la journée entière */}
                                                                <div className="p-2 space-y-1">
                                                                    {dayLongEvents.map((event, eventIndex) => {
                                                                        const eventColor = getColor(event.colorId || '1')
                                                                        return (
                                                                            <div
                                                                                key={`day-${event.id || eventIndex}`}
                                                                                className="text-xs p-2 rounded-lg shadow-sm cursor-pointer transition-all duration-200 hover:shadow-md hover:scale-105 border-l-4 w-full min-h-[32px] flex items-center"
                                                                                style={{
                                                                                    backgroundColor: `${eventColor.background}20`,
                                                                                    color: eventColor.background,
                                                                                    borderLeftColor: eventColor.background
                                                                                }}
                                                                                title={`${event.summary} - Toute la journée`}
                                                                                onClick={(e) => {
                                                                                    e.stopPropagation()
                                                                                    // Ouvrir le modal d'édition de l'événement
                                                                                    handleEventClick(event, dayDate)
                                                                                }}
                                                                            >
                                                                                <div className="font-medium truncate w-full">{event.summary}</div>
                                                                            </div>
                                                                        )
                                                                    })}
                                                                    
                                                                    {/* Événements avec heure */}
                                                                    {hourEvents.map((event, eventIndex) => {
                                                                        const eventColor = getColor(event.colorId || '1')
                                                                        const eventStart = event.eventStartTime
                                                                        const eventEnd = event.eventEndTime
                                                                        const isStart = event.isEventStart
                                                                        
                                                                        return (
                                                                            <div
                                                                                key={`hour-${event.id || eventIndex}`}
                                                                                className={`text-xs p-2 rounded-lg shadow-sm cursor-pointer transition-all duration-200 hover:shadow-md hover:scale-105 w-full min-h-[32px] flex flex-col justify-center ${
                                                                                    isStart ? 'border-l-4' : 'border-l-2 opacity-75'
                                                                                }`}
                                                                                style={{
                                                                                    backgroundColor: isStart ? eventColor.background : `${eventColor.background}80`,
                                                                                    color: eventColor.text,
                                                                                    borderLeftColor: eventColor.background
                                                                                }}
                                                                                title={`${event.summary} - ${eventStart.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })} à ${eventEnd.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}`}
                                                                                onClick={(e) => {
                                                                                    e.stopPropagation()
                                                                                    // Ouvrir le modal d'édition de l'événement
                                                                                    handleEventClick(event, dayDate)
                                                                                }}
                                                                            >
                                                                                <div className="font-medium truncate">
                                                                                    {event.summary}
                                                                                </div>
                                                                                {isStart && (
                                                                                    <div className="text-xs opacity-80 mt-1">
                                                                                        {eventStart.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })} - {eventEnd.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                                                                                        {event.durationHours > 1 && (
                                                                                            <span className="ml-1 bg-black/20 px-1 rounded text-xs">
                                                                                                {event.durationHours}h
                                                                                            </span>
                                                                                        )}
                                                                                    </div>
                                                                                )}
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

                            {/* Style pour masquer la scrollbar */}
                            <style jsx>{`
                                .custom-scrollbar::-webkit-scrollbar {
                                    display: none;
                                }
                                .custom-scrollbar {
                                    -ms-overflow-style: none;
                                    scrollbar-width: none;
                                }
                            `}</style>

                            {/* Instructions améliorées */}
                            <div className="mt-6 text-center space-y-2">
                                <p className="text-sm text-gray-400">
                                    ✨ Cliquez sur un créneau pour ajouter un événement
                                </p>
                                <div className="flex items-center justify-center gap-4 text-xs text-gray-500">
                                    <div className="flex items-center gap-1">
                                        <div className="w-3 h-3 bg-[#3A6FF8] rounded-full"></div>
                                        <span>Aujourd'hui</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {viewMode === 'day' && (
                        <div className="p-6">
                            <div className="text-center text-gray-300 py-12">
                                <FaCalendarAlt className="w-12 h-12 mx-auto mb-4 text-gray-500" />
                                <p>Vue jour - En cours de développement</p>
                            </div>
                        </div>
                    )}
                </motion.div>


                {/* Statistiques rapides */}
                <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-6"
                >
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
                </motion.div>
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

            {/* Modal Événements du Jour */}
            <DayEventsModal
                isOpen={showDayEvents}
                onClose={() => {
                    setShowDayEvents(false)
                    setSelectedEventDate(null)
                }}
                selectedDate={selectedEventDate}
                events={selectedEventDate ? getEventsForDay(selectedEventDate) : []}
                onEditEvent={(event) => {
                    setSelectedEvent(event)
                    setShowDayEvents(false)
                    setShowEditEvent(true)
                }}
                onDeleteEvent={deleteEvent}
            />

            {/* Modal Modifier Événement */}
            <EditEventModal
                isOpen={showEditEvent}
                onClose={() => {
                    setShowEditEvent(false)
                    setSelectedEvent(null)
                }}
                onSave={updateEvent}
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