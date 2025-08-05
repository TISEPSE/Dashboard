"use client"

import { useState, useEffect } from "react"
import { useAuth } from "../../context/AuthContext"
import { motion, AnimatePresence } from "framer-motion"
import { FaChevronLeft, FaChevronRight, FaPlus, FaCalendarAlt, FaFilter, FaList, FaTh, FaTrash, FaEdit, FaSync, FaCalendarDay, FaCalendarWeek, FaWifi, FaBars } from "react-icons/fa"
import LoaderPortal from "../../components/LoaderPortal"
import AddEventModal from "../../components/Calendar/AddEventModal"
import EditEventModal from "../../components/Calendar/EditEventModal"
import DayEventsListModal from "../../components/Calendar/DayEventsListModal"
import BurgerMenu from "../../components/Calendar/BurgerMenu"
import EventMobileModal from "../../components/Calendar/EventMobileModal"
import GoogleSignInButton from "../../components/Auth/GoogleSignInButton"
import { useCalendar } from "../../hooks/useCalendar"
import { useSwipeNavigation } from "../../hooks/useSwipeNavigation"
import { useColors } from "../../hooks/useColors"
import Notification from "../../components/Notification"

export default function Calendrier(){
    const [isLoading, setIsLoading] = useState(false)
    const [currentDate, setCurrentDate] = useState(new Date())
    const [viewMode, setViewMode] = useState('month') // 'month', 'week', 'day'
    const [slideDirection, setSlideDirection] = useState(0) // -1 = gauche, 1 = droite, 0 = pas d'animation
    const [showAddEvent, setShowAddEvent] = useState(false)
    const [showEditEvent, setShowEditEvent] = useState(false)
    const [showDayEvents, setShowDayEvents] = useState(false)
    const [selectedEventDate, setSelectedEventDate] = useState(null)
    const [selectedEvent, setSelectedEvent] = useState(null)
    const [showEventMobileModal, setShowEventMobileModal] = useState(false)
    const [selectedEventForModal, setSelectedEventForModal] = useState(null)
    const { user, authenticated } = useAuth()
    
    // Utiliser les hooks du calendrier et des couleurs
    const { 
        events, 
        loadingEvents, 
        syncStatus, 
        notification,
        closeNotification,
        loadEvents, 
        addEvent, 
        updateEvent, 
        deleteEvent, 
        syncWithGoogle 
    } = useCalendar()

    const { getColor, isGoogleConnected } = useColors()
    
    // Hook pour la navigation par swipe
    const { elementRef: swipeRef, isSwiping } = useSwipeNavigation(
        () => navigateDate(1),  // Swipe gauche = aller vers le futur
        () => navigateDate(-1), // Swipe droite = aller vers le passé
        true // Activé
    )

    // Fonction pour gérer le clic sur un jour (pour mobile et desktop)
    const handleDayClick = (date) => {
        // S'assurer que la date est un objet Date valide
        const validDate = date instanceof Date ? date : new Date(date)
        setSelectedEventDate(validDate)
        // Ouvrir le modal de liste des événements
        setShowDayEvents(true)
    }

    // Fonction pour ouvrir directement le modal d'édition d'un événement
    const handleEventClick = (event, date) => {
        // Utiliser le modal mobile moderne sur toutes les tailles d'écran
        setSelectedEventForModal(event)
        setShowEventMobileModal(true)
    }
    
    const handleEditFromModal = (event) => {
        setSelectedEvent(event)
        setShowEditEvent(true)
    }
    
    const handleDeleteFromModal = async (eventId) => {
        try {
            await deleteEvent(eventId)
        } catch (error) {
            console.error('Erreur lors de la suppression:', error)
        }
    }

    // Fonction pour retourner vers le modal de liste des événements
    const handleBackToEventsList = () => {
        setShowEventMobileModal(false)
        setSelectedEventForModal(null)
        setShowDayEvents(true)
    }

    // Fonction pour ouvrir le modal d'ajout depuis le modal de liste
    const handleAddEventFromList = (date) => {
        setShowDayEvents(false)
        setSelectedEventDate(date)
        setShowAddEvent(true)
    }

    // Fonction pour ouvrir le modal d'édition depuis le modal de liste
    const handleEditEventFromList = (event, date) => {
        setShowDayEvents(false)
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



    // Navigation du calendrier avec animation
    const navigateDate = (direction) => {
        // S'assurer que la direction est claire avant de déclencher l'animation
        setSlideDirection(0) // Reset d'abord
        setTimeout(() => {
            setSlideDirection(direction)
            const newDate = new Date(currentDate)
            if (viewMode === 'month') {
                newDate.setMonth(newDate.getMonth() + direction)
            } else if (viewMode === 'week') {
                newDate.setDate(newDate.getDate() + (direction * 7))
            } else {
                newDate.setDate(newDate.getDate() + direction)
            }
            setCurrentDate(newDate)
            // Reset l'animation après un délai - plus rapide
            setTimeout(() => setSlideDirection(0), 200)
        }, 10) // Petit délai pour éviter les conflits
    }

    // Aller à aujourd'hui
    const goToToday = () => {
        setSlideDirection(0) // Pas d'animation pour "aller à aujourd'hui"
        setCurrentDate(new Date())
    }
    
    // Variantes d'animation pour les slides - avec gestion améliorée
    const getSlideVariants = () => {
        return {
            enter: (direction) => ({
                x: direction > 0 ? '100%' : direction < 0 ? '-100%' : 0,
                opacity: direction === 0 ? 1 : 0
            }),
            center: {
                x: 0,
                opacity: 1
            },
            exit: (direction) => ({
                x: direction > 0 ? '-100%' : direction < 0 ? '100%' : 0,
                opacity: direction === 0 ? 1 : 0
            })
        }
    }
    
    // Transition pour les animations - plus rapide
    const slideTransition = {
        type: "tween",
        ease: [0.25, 0.1, 0.25, 1],
        duration: 0.15
    }

    // Ouvrir le modal d'ajout d'événement
    const handleAddEventClick = () => {
        setSelectedEventDate(new Date())
        setShowAddEvent(true)
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
        const filteredEvents = events.filter(event => {
            if (!event.start || !event.end) return false
            
            const eventStart = new Date(event.start?.dateTime || event.start?.date)
            const eventEnd = new Date(event.end?.dateTime || event.end?.date)
            
            // Normaliser les dates pour ignorer l'heure
            const checkDate = new Date(date.getFullYear(), date.getMonth(), date.getDate())
            const startDate = new Date(eventStart.getFullYear(), eventStart.getMonth(), eventStart.getDate())
            let endDate = new Date(eventEnd.getFullYear(), eventEnd.getMonth(), eventEnd.getDate())
            
            // Pour les événements avec end.date (toute la journée), Google Calendar utilise une date exclusive
            // donc on soustrait 1 jour pour avoir la vraie fin
            if (event.end?.date && !event.end?.dateTime) {
                endDate.setDate(endDate.getDate() - 1)
            }
            
            // L'événement est visible ce jour si la date est entre le début et la fin (inclus)
            return checkDate >= startDate && checkDate <= endDate
        })
        
        // 🎯 PRIORISER LES ÉVÉNEMENTS MULTI-JOURS pour éviter les bugs d'affichage
        return filteredEvents.sort((a, b) => {
            const aIsMultiDay = isMultiDayEvent(a)
            const bIsMultiDay = isMultiDayEvent(b)
            const aIsFirstDay = isFirstDayOfEvent(a, date)
            const bIsFirstDay = isFirstDayOfEvent(b, date)
            
            // 1. Événements multi-jours en premier (priorité absolue)
            if (aIsMultiDay && !bIsMultiDay) return -1
            if (!aIsMultiDay && bIsMultiDay) return 1
            
            // 2. Pour les événements multi-jours, premier jour en premier
            if (aIsMultiDay && bIsMultiDay) {
                if (aIsFirstDay && !bIsFirstDay) return -1
                if (!aIsFirstDay && bIsFirstDay) return 1
            }
            
            // 3. Tri par heure de début pour les événements d'une journée
            const aStart = new Date(a.start?.dateTime || a.start?.date)
            const bStart = new Date(b.start?.dateTime || b.start?.date)
            return aStart - bStart
        })
    }

    // Fonction pour déterminer si c'est le premier jour d'un événement multi-jours
    const isFirstDayOfEvent = (event, date) => {
        if (!event.start) return false
        const eventStart = new Date(event.start?.dateTime || event.start?.date)
        const checkDate = new Date(date.getFullYear(), date.getMonth(), date.getDate())
        const startDate = new Date(eventStart.getFullYear(), eventStart.getMonth(), eventStart.getDate())
        return startDate.getTime() === checkDate.getTime()
    }

    // Fonction pour déterminer si c'est le dernier jour d'un événement multi-jours
    const isLastDayOfEvent = (event, date) => {
        if (!event.end) return false
        const eventEnd = new Date(event.end?.dateTime || event.end?.date)
        let endDate = new Date(eventEnd.getFullYear(), eventEnd.getMonth(), eventEnd.getDate())
        
        // Pour les événements avec end.date, soustraire 1 jour car c'est exclusif
        if (event.end?.date && !event.end?.dateTime) {
            endDate.setDate(endDate.getDate() - 1)
        }
        
        const checkDate = new Date(date.getFullYear(), date.getMonth(), date.getDate())
        return endDate.getTime() === checkDate.getTime()
    }

    // Fonction pour déterminer si un événement est multi-jours
    const isMultiDayEvent = (event) => {
        if (!event.start || !event.end) return false
        
        const eventStart = new Date(event.start?.dateTime || event.start?.date)
        const eventEnd = new Date(event.end?.dateTime || event.end?.date)
        
        const startDate = new Date(eventStart.getFullYear(), eventStart.getMonth(), eventStart.getDate())
        let endDate = new Date(eventEnd.getFullYear(), eventEnd.getMonth(), eventEnd.getDate())
        
        if (event.end?.date && !event.end?.dateTime) {
            endDate.setDate(endDate.getDate() - 1)
        }
        
        return endDate.getTime() !== startDate.getTime()
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
        <div className="min-h-screen bg-gradient-to-br from-[#0f0f23] via-[#1a1a2e] to-[#16213e] px-0 sm:px-4 lg:px-6 pb-24 sm:pb-0">
            <div className="max-w-full xl:max-w-[1400px] mx-auto py-4 sm:py-6">
                {/* Burger Menu pour mobile et desktop */}
                <BurgerMenu
                    viewMode={viewMode}
                    setViewMode={setViewMode}
                    onSync={syncWithGoogle}
                    onAddEvent={handleAddEventClick}
                    isLoading={loadingEvents}
                    onGoToToday={goToToday}
                />

                {/* Header avec affichage de la date - sans boutons */}
                <div className="flex justify-center mb-6">
                    <AnimatePresence mode="wait" custom={slideDirection}>
                        <motion.div 
                            key={`header-${viewMode}-${currentDate.getFullYear()}-${currentDate.getMonth()}-${currentDate.getDate()}`}
                            custom={slideDirection}
                            variants={{
                                enter: (direction) => ({
                                    x: direction > 0 ? 50 : -50,
                                    opacity: 0
                                }),
                                center: {
                                    x: 0,
                                    opacity: 1
                                },
                                exit: (direction) => ({
                                    x: direction > 0 ? -50 : 50,
                                    opacity: 0
                                })
                            }}
                            initial="enter"
                            animate="center"
                            exit="exit"
                            transition={{
                                type: "tween",
                                ease: [0.25, 0.1, 0.25, 1],
                                duration: 0.12
                            }}
                            className="bg-gradient-to-br from-[#1e293b] to-[#0f172a] rounded-3xl px-6 py-4 sm:px-12 sm:py-5 shadow-2xl border border-slate-700/50 backdrop-blur-xl inline-block sm:min-w-[300px]"
                        >
                        <div className="text-center">
                            <div className="flex items-center justify-center gap-4">
                                {/* Flèche gauche - visible seulement sur desktop */}
                                <button
                                    onClick={() => navigateDate(-1)}
                                    className="hidden md:flex w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 items-center justify-center text-white transition-all duration-200"
                                >
                                    <FaChevronLeft className="w-3 h-3" />
                                </button>
                                
                                <h1 className="text-2xl lg:text-3xl font-bold text-white capitalize whitespace-nowrap">
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
                                
                                {/* Flèche droite - visible seulement sur desktop */}
                                <button
                                    onClick={() => navigateDate(1)}
                                    className="hidden md:flex w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 items-center justify-center text-white transition-all duration-200"
                                >
                                    <FaChevronRight className="w-3 h-3" />
                                </button>
                            </div>
                        </div>
                        </motion.div>
                    </AnimatePresence>
                </div>


                {/* Calendrier principal avec support du swipe */}
                <div 
                    ref={swipeRef}
                    className="bg-gradient-to-br from-[#1e293b] to-[#0f172a] rounded-none sm:rounded-3xl p-0 sm:p-6 shadow-none sm:shadow-2xl border-0 sm:border border-slate-700/50 overflow-hidden relative backdrop-blur-xl"
                >
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
                        <AnimatePresence mode="wait" custom={slideDirection}>
                        {viewMode === 'month' && (
                        <motion.div 
                            key={`month-${currentDate.getFullYear()}-${currentDate.getMonth()}`}
                            custom={slideDirection}
                            variants={getSlideVariants()}
                            initial="enter"
                            animate="center"
                            exit="exit"
                            transition={slideTransition}
                            className="p-4 sm:p-6"
                        >
                            {/* En-têtes des jours modernes sombres */}
                            <div className="grid grid-cols-7 gap-2 mb-6">
                                {['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'].map((day, index) => (
                                    <div key={index} className="p-3 text-center">
                                        <span className="text-slate-400 font-bold text-sm uppercase tracking-wider">{day}</span>
                                    </div>
                                ))}
                            </div>

                            {/* Grille du calendrier moderne sombre - tuiles plus larges */}
                            <div className="grid grid-cols-7 gap-1 sm:gap-2 lg:gap-3">
                                {generateMonthCalendar().map((date, index) => {
                                    const dayEvents = getEventsForDay(date)
                                    const isCurrentDay = isToday(date)
                                    const isInCurrentMonth = isCurrentMonth(date)
                                    
                                    return (
                                        <motion.div
                                            key={index}
                                            whileHover={{ 
                                                scale: 1.03,
                                                y: -4
                                            }}
                                            whileTap={{ scale: 0.95 }}
                                            transition={{ 
                                                type: "tween",
                                                duration: 0.15,
                                                ease: [0.25, 0.1, 0.25, 1]
                                            }}
                                            className={`h-28 sm:h-32 lg:h-36 p-2 sm:p-3 lg:p-3 cursor-pointer touch-manipulation rounded-xl border transition-all duration-150 ease-out backdrop-blur-sm ${
                                                isCurrentDay 
                                                    ? 'bg-gradient-to-br from-blue-400/25 to-blue-500/25 border-blue-300/50 shadow-xl shadow-blue-400/20 hover:shadow-2xl hover:shadow-blue-400/40 hover:border-blue-300/70'
                                                    : isInCurrentMonth
                                                    ? 'bg-gradient-to-br from-slate-700/40 to-slate-800/40 hover:from-slate-700/45 hover:to-slate-800/45 border-slate-600/30 hover:border-slate-600/35 hover:shadow-sm hover:shadow-slate-500/10'
                                                    : 'bg-slate-800/20 text-slate-600 border-slate-700/30 hover:bg-slate-800/25 hover:border-slate-700/35 hover:shadow-xs hover:shadow-slate-600/10'
                                            } ${dayEvents.length > 0 ? 'ring-1 ring-slate-500/40 hover:ring-2 hover:ring-slate-400/60' : ''}`}
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
                                            <div className="space-y-1 sm:space-y-1 lg:space-y-1.5 flex-1 overflow-visible max-h-[70px] sm:max-h-[80px] lg:max-h-[90px] flex flex-col items-center">
                                                {/* Mobile et tablet : limiter à 2 événements */}
                                                <div className="lg:hidden space-y-1 overflow-visible w-full">
                                                    {dayEvents.slice(0, 2).map((event, eventIndex) => {
                                                    const eventColor = getColor(event.colorId || '1')
                                                    const isMultiDay = isMultiDayEvent(event)
                                                    const isFirstDay = isFirstDayOfEvent(event, date)
                                                    const isLastDay = isLastDayOfEvent(event, date)
                                                    
                                                    return (
                                                        <motion.div
                                                            key={`${event.id}-${eventIndex}`}
                                                            initial={{ opacity: 0, y: 10 }}
                                                            animate={{ opacity: 1, y: 0 }}
                                                            whileHover={{ 
                                                                scale: 1.04,
                                                                y: -2
                                                            }}
                                                            transition={{ 
                                                                duration: 0.12,
                                                                ease: "easeOut"
                                                            }}
                                                            className={`text-xs sm:text-xs lg:text-sm p-1.5 sm:p-2 lg:p-2.5 cursor-pointer md:hover:brightness-125 md:hover:shadow-xl transition-all duration-120 ease-out touch-manipulation h-[28px] sm:h-[30px] lg:h-[34px] flex items-center w-full shadow-sm relative z-10 hover:z-20 ${
                                                                isMultiDay ? (
                                                                    isFirstDay ? 'rounded-l-lg rounded-r-none border-r-0' :
                                                                    isLastDay ? 'rounded-r-lg rounded-l-none border-l-0' :
                                                                    'rounded-none border-l-0 border-r-0'
                                                                ) : 'rounded-lg'
                                                            }`}
                                                            style={{
                                                                backgroundColor: eventColor.background,
                                                                color: '#ffffff'
                                                            }}
                                                            title={`${event.summary}${isMultiDay ? ' (Événement sur plusieurs jours)' : ''}`}
                                                            onClick={(e) => {
                                                                e.stopPropagation()
                                                                // Utiliser le modal moderne sur toutes les tailles
                                                                handleEventClick(event, date)
                                                            }}
                                                            onMouseEnter={(e) => e.stopPropagation()}
                                                            onMouseLeave={(e) => e.stopPropagation()}
                                                        >
                                                            {/* Indicateur de début d'événement multi-jours */}
                                                            {isMultiDay && isFirstDay && (
                                                                <div className="w-2 h-2 rounded-full bg-white/30 mr-1 flex-shrink-0"></div>
                                                            )}
                                                            
                                                            {/* Contenu de l'événement */}
                                                            <span className="truncate flex-1 font-medium">
                                                                {isFirstDay || !isMultiDay ? event.summary : ''}
                                                            </span>
                                                            
                                                            {/* Indicateur de fin d'événement multi-jours */}
                                                            {isMultiDay && isLastDay && (
                                                                <div className="w-2 h-2 rounded-full bg-white/30 ml-1 flex-shrink-0"></div>
                                                            )}
                                                            
                                                            {/* Barre de continuation pour les événements multi-jours */}
                                                            {isMultiDay && !isFirstDay && (
                                                                <div className="absolute -left-1 top-0 bottom-0 w-2 opacity-80" style={{backgroundColor: eventColor.background}}></div>
                                                            )}
                                                            {isMultiDay && !isLastDay && (
                                                                <div className="absolute -right-1 top-0 bottom-0 w-2 opacity-80" style={{backgroundColor: eventColor.background}}></div>
                                                            )}
                                                            
                                                        </motion.div>
                                                    )
                                                    })}
                                                    {/* Indicateur mobile sous les événements */}
                                                    {dayEvents.length > 2 && (
                                                        <div className="text-center mt-1 w-full">
                                                            <span className="text-xs text-gray-400 font-medium">
                                                                +{dayEvents.length - 2}
                                                            </span>
                                                        </div>
                                                    )}
                                                </div>

                                                {/* Desktop : affichage limité avec compteur */}
                                                <div className="hidden lg:block space-y-1 overflow-visible w-full">
                                                    {dayEvents.slice(0, 2).map((event, eventIndex) => {
                                                        const eventColor = getColor(event.colorId || '1')
                                                        const isMultiDay = isMultiDayEvent(event)
                                                        const isFirstDay = isFirstDayOfEvent(event, date)
                                                        const isLastDay = isLastDayOfEvent(event, date)
                                                        
                                                        return (
                                                            <motion.div
                                                                key={`${event.id}-desktop-${eventIndex}`}
                                                                initial={{ opacity: 0, y: 10 }}
                                                                animate={{ opacity: 1, y: 0 }}
                                                                whileHover={{ 
                                                                    scale: 1.04,
                                                                    y: -2
                                                                }}
                                                                transition={{ 
                                                                    duration: 0.12,
                                                                    ease: "easeOut"
                                                                }}
                                                                className={`text-sm p-2 lg:p-2.5 shadow-sm cursor-pointer md:hover:brightness-125 md:hover:shadow-xl transition-all duration-120 ease-out touch-manipulation h-[34px] lg:h-[36px] flex items-center w-full relative z-10 hover:z-20 ${
                                                                    isMultiDay ? (
                                                                        isFirstDay ? 'rounded-l-lg rounded-r-none border-r-0' :
                                                                        isLastDay ? 'rounded-r-lg rounded-l-none border-l-0' :
                                                                        'rounded-none border-l-0 border-r-0'
                                                                    ) : 'rounded-lg'
                                                                }`}
                                                                style={{
                                                                    backgroundColor: eventColor.background,
                                                                    color: '#ffffff'
                                                                }}
                                                                title={`${event.summary}${isMultiDay ? ' (Événement sur plusieurs jours)' : ''}`}
                                                                onClick={(e) => {
                                                                    e.stopPropagation()
                                                                    // Utiliser le modal moderne sur toutes les tailles
                                                                    handleEventClick(event, date)
                                                                }}
                                                                onMouseEnter={(e) => e.stopPropagation()}
                                                                onMouseLeave={(e) => e.stopPropagation()}
                                                            >
                                                                {/* Indicateur de début d'événement multi-jours */}
                                                                {isMultiDay && isFirstDay && (
                                                                    <div className="w-2 h-2 rounded-full bg-white/30 mr-1 flex-shrink-0"></div>
                                                                )}
                                                                
                                                                {/* Contenu de l'événement */}
                                                                <span className="truncate flex-1 font-medium">
                                                                    {isFirstDay || !isMultiDay ? event.summary : ''}
                                                                </span>
                                                                
                                                                {/* Indicateur de fin d'événement multi-jours */}
                                                                {isMultiDay && isLastDay && (
                                                                    <div className="w-2 h-2 rounded-full bg-white/30 ml-1 flex-shrink-0"></div>
                                                                )}
                                                                
                                                                {/* Barre de continuation pour les événements multi-jours */}
                                                                {isMultiDay && !isFirstDay && (
                                                                    <div className="absolute -left-1 top-0 bottom-0 w-2 opacity-80" style={{backgroundColor: eventColor.background}}></div>
                                                                )}
                                                                {isMultiDay && !isLastDay && (
                                                                    <div className="absolute -right-1 top-0 bottom-0 w-2 opacity-80" style={{backgroundColor: eventColor.background}}></div>
                                                                )}
                                                            </motion.div>
                                                        )
                                                    })}
                                                    {/* Indicateur desktop sous les événements */}
                                                    {dayEvents.length > 2 && (
                                                        <div className="text-center mt-1 w-full">
                                                            <span className="text-xs text-gray-400 font-medium">
                                                                +{dayEvents.length - 2} autres
                                                            </span>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </motion.div>
                                    )
                                })}
                            </div>
                        </motion.div>
                    )}

                    {viewMode === 'week' && (
                        <motion.div 
                            key={`week-${currentDate.getFullYear()}-${currentDate.getMonth()}-${Math.floor(currentDate.getDate()/7)}`}
                            custom={slideDirection}
                            variants={getSlideVariants()}
                            initial="enter"
                            animate="center"
                            exit="exit"
                            transition={slideTransition}
                            className="p-0 sm:p-6 lg:p-8"
                        >

                            {/* Vue semaine moderne */}
                            <div className="bg-gradient-to-br from-[#1e293b] to-[#0f172a] rounded-none sm:rounded-3xl shadow-none sm:shadow-2xl border-0 sm:border border-slate-700/50 overflow-hidden">

                                {/* En-tête des jours */}
                                <div className="bg-gray-800/40 backdrop-blur-sm border-b border-gray-600/30">
                                    <div className="grid grid-cols-8 gap-0">
                                        {/* Colonne pour les heures */}
                                        <div className="p-2 sm:p-4 bg-slate-800/70 border-r border-slate-600/40 flex items-center justify-center">
                                            <div className="text-center text-base font-bold text-white">
                                                Heure
                                            </div>
                                        </div>
                                        
                                        {['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'].map((dayFull, index) => {
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
                                                <div key={index} className={`p-2 sm:p-4 text-center transition-all duration-200 border-l border-gray-600/20 ${
                                                    isToday ? 'bg-blue-400/10' : ''
                                                }`}>
                                                    <div className="space-y-1 sm:space-y-2">
                                                        <div className={`text-xs sm:text-sm font-medium ${
                                                            isWeekend ? 'text-gray-400' : 'text-gray-300'
                                                        }`}>
                                                            <span className="sm:hidden">{dayFull.substring(0, 1)}</span>
                                                            <span className="hidden sm:inline">{dayFull}</span>
                                                        </div>
                                                        <div className={`text-lg sm:text-2xl font-bold rounded-xl sm:rounded-2xl w-8 h-8 sm:w-14 sm:h-14 flex items-center justify-center mx-auto transition-all duration-300 cursor-pointer ${
                                                            isToday 
                                                                ? 'bg-blue-500 text-white shadow-lg shadow-blue-400/25 scale-110' 
                                                                : isWeekend
                                                                ? 'text-gray-400 hover:bg-gray-700/30 hover:scale-102'
                                                                : 'text-gray-300 hover:bg-gray-700/30 hover:scale-102'
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
                                                <div className={`p-2 sm:p-4 border-r border-slate-600/40 bg-slate-800/70 flex flex-col items-center justify-center ${
                                                    isCurrentHour ? 'bg-blue-400/15 border-r-blue-400/40' : ''
                                                }`}>
                                                    <div className={`text-base sm:text-lg font-bold transition-colors duration-200 ${
                                                        isCurrentHour ? 'text-blue-200' : 'text-white'
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
                                                        
                                                        if (event.start.date && !event.start.dateTime) {
                                                            // Événement toute la journée - afficher à 6h (première heure)
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
                                                            key={dayIndex} 
                                                            className={`relative border-l border-gray-600/10 transition-all duration-200 cursor-pointer group hover:bg-gray-700/5 ${
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
                                                                                color: '#ffffff',
                                                                                borderLeftColor: eventColor.background
                                                                            }}
                                                                            title={`${event.summary}${event.location ? ` - ${event.location}` : ''}`}
                                                                            onClick={(e) => {
                                                                                e.stopPropagation()
                                                                                // Utiliser le modal moderne sur toutes les tailles
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

                        </motion.div>
                    )}

                    {viewMode === 'day' && (
                        <motion.div 
                            key={`day-${currentDate.getFullYear()}-${currentDate.getMonth()}-${currentDate.getDate()}`}
                            custom={slideDirection}
                            variants={getSlideVariants()}
                            initial="enter"
                            animate="center"
                            exit="exit"
                            transition={slideTransition}
                            className="p-0 sm:p-6 lg:p-8"
                        >

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
                                                        className="flex-1 p-3 min-h-[90px] sm:min-h-[70px] cursor-pointer group hover:bg-gray-700/5 transition-all duration-200 relative"
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
                                                                            color: '#ffffff',
                                                                            borderLeftColor: eventColor.background
                                                                        }}
                                                                        onClick={(e) => {
                                                                            e.stopPropagation()
                                                                            // Utiliser le modal moderne sur toutes les tailles
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
                                                                                            // Utiliser le modal moderne sur toutes les tailles
                                                                                            handleEventClick(event, currentDate)
                                                                                        }}
                                                                                        className="w-5 h-5 rounded-full bg-black/10 hover:bg-black/15 flex items-center justify-center transition-colors duration-200"
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

                        </motion.div>
                    )}
                        </AnimatePresence>
                    )}
                </div>


            </div>

            {/* Navigation mobile avec indicateurs de swipe */}
            <div className="sm:hidden fixed bottom-4 left-0 right-0 z-40">
                {/* Indicateur de swipe */}
                <AnimatePresence>
                    {isSwiping && (
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: 20 }}
                            className="text-center mb-2"
                        >
                            <div className="inline-flex items-center gap-2 bg-black/60 backdrop-blur-lg px-4 py-2 rounded-full text-white text-sm">
                                <FaChevronLeft className="w-3 h-3" />
                                <span>Glissez pour naviguer</span>
                                <FaChevronRight className="w-3 h-3" />
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
                
                {/* Barre de contrôles mobile simplifiée */}
                <div className="flex justify-center">
                    <div className="flex items-center gap-3 bg-black/20 backdrop-blur-lg rounded-full px-4 py-2 border border-white/10 shadow-2xl">
                        {/* Navigation */}
                        <motion.button
                            onClick={() => navigateDate(-1)}
                            className="w-10 h-10 rounded-full bg-white/10 hover:bg-white/15 flex items-center justify-center text-white transition-all duration-200"
                            whileTap={{ scale: 0.9 }}
                        >
                            <FaChevronLeft className="w-4 h-4" />
                        </motion.button>
                        
                        {/* Date actuelle */}
                        <div className="text-white text-sm font-medium px-2 text-center min-w-[120px]">
                            {viewMode === 'month' && formatMonthYear(currentDate)}
                            {viewMode === 'week' && (() => {
                                const weekStart = new Date(currentDate)
                                const dayOfWeek = weekStart.getDay()
                                const mondayOffset = dayOfWeek === 0 ? -6 : 1 - dayOfWeek
                                weekStart.setDate(weekStart.getDate() + mondayOffset)
                                const weekEnd = new Date(weekStart)
                                weekEnd.setDate(weekStart.getDate() + 6)
                                return `${weekStart.getDate()}-${weekEnd.getDate()} ${weekEnd.toLocaleDateString('fr-FR', { month: 'short' })}`
                            })()}
                            {viewMode === 'day' && currentDate.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })}
                        </div>
                        
                        <motion.button
                            onClick={() => navigateDate(1)}
                            className="w-10 h-10 rounded-full bg-white/10 hover:bg-white/15 flex items-center justify-center text-white transition-all duration-200"
                            whileTap={{ scale: 0.9 }}
                        >
                            <FaChevronRight className="w-4 h-4" />
                        </motion.button>
                        
                        {/* Menu Navbar */}
                        <motion.button
                            onClick={() => {
                                const dispatchEvent = () => {
                                    const event = new CustomEvent('openMobileNavbar')
                                    window.dispatchEvent(event)
                                }
                                if (window._mobileNavbarReady) {
                                    dispatchEvent()
                                } else {
                                    setTimeout(dispatchEvent, 100)
                                }
                            }}
                            className="w-10 h-10 rounded-full bg-blue-500 hover:bg-blue-400 shadow-lg flex items-center justify-center text-white transition-all duration-200"
                            whileTap={{ scale: 0.9 }}
                        >
                            <FaBars className="w-4 h-4" />
                        </motion.button>
                    </div>
                </div>
            </div>

            {/* Modal Liste des Événements du Jour */}
            <DayEventsListModal
                isOpen={showDayEvents}
                onClose={() => {
                    setShowDayEvents(false)
                    setSelectedEventDate(null)
                }}
                events={selectedEventDate ? getEventsForDay(selectedEventDate) : []}
                date={selectedEventDate}
                onAddEvent={handleAddEventFromList}
                onEditEvent={handleEditEventFromList}
                onEventClick={(event) => {
                    // Utiliser le modal mobile moderne sur toutes les tailles
                    setShowDayEvents(false)
                    setSelectedEventForModal(event)  
                    setShowEventMobileModal(true)
                }}
                getColor={getColor}
            />

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
            
            {/* Modal Événement Mobile Optimisé */}
            <EventMobileModal
                event={selectedEventForModal}
                isOpen={showEventMobileModal}
                onClose={() => {
                    setShowEventMobileModal(false)
                    setSelectedEventForModal(null)
                }}
                onBack={handleBackToEventsList}
                onEdit={handleEditFromModal}
                onDelete={handleDeleteFromModal}
                getColor={getColor}
            />

            {/* Notification */}
            <Notification 
                notification={notification}
                onClose={closeNotification} 
            />
            
        </div>
    )
}