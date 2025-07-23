"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { motion, AnimatePresence } from "framer-motion"
import { FaChevronLeft, FaChevronRight, FaPlus, FaCalendarAlt, FaFilter, FaList, FaTh, FaTrash, FaEdit, FaSync, FaCalendarDay, FaCalendarWeek } from "react-icons/fa"
import LoaderPortal from "../../components/LoaderPortal"
import AddEventModal from "../../components/Calendar/AddEventModal"
import DayEventsModal from "../../components/Calendar/DayEventsModal"
import EditEventModal from "../../components/Calendar/EditEventModal"
import GoogleSignInButton from "../../components/Auth/GoogleSignInButton"

export default function Calendrier(){
    const [isLoading, setIsLoading] = useState(true)
    const [currentDate, setCurrentDate] = useState(new Date())
    const [viewMode, setViewMode] = useState('month') // 'month', 'week', 'day'
    const [events, setEvents] = useState([])
    const [showAddEvent, setShowAddEvent] = useState(false)
    const [showDayEvents, setShowDayEvents] = useState(false)
    const [showEditEvent, setShowEditEvent] = useState(false)
    const [selectedEventDate, setSelectedEventDate] = useState(null)
    const [selectedEvent, setSelectedEvent] = useState(null)
    const [loadingEvents, setLoadingEvents] = useState(false)
    const { data: session } = useSession()

    useEffect(() => {
        const timer = setTimeout(() => setIsLoading(false), 1000)
        return () => clearTimeout(timer)
    }, [])

    // Charger les événements Google Calendar
    useEffect(() => {
        if (session?.accessToken) {
            loadGoogleCalendarEvents()
        }
    }, [session, currentDate, viewMode])

    const loadGoogleCalendarEvents = async () => {
        if (!session?.accessToken) {
            console.log('❌ Pas de session ou token manquant:', { 
                hasSession: !!session, 
                hasToken: !!session?.accessToken 
            })
            return
        }
        
        setLoadingEvents(true)
        console.log('🔄 Rechargement des événements...', { 
            viewMode, 
            currentDate: currentDate.toDateString(),
            tokenPresent: !!session.accessToken
        })
        
        try {
            // Calculer les dates de début et fin basées sur le mode d'affichage
            let timeMin, timeMax
            const now = new Date(currentDate)
            
            if (viewMode === 'month') {
                // Premier jour du mois - étendre pour inclure la semaine précédente
                timeMin = new Date(now.getFullYear(), now.getMonth(), 1)
                const firstDayOfWeek = timeMin.getDay()
                timeMin.setDate(timeMin.getDate() - firstDayOfWeek)
                
                // Dernier jour du mois - étendre pour inclure la semaine suivante
                timeMax = new Date(now.getFullYear(), now.getMonth() + 1, 0)
                const lastDayOfWeek = timeMax.getDay()
                timeMax.setDate(timeMax.getDate() + (6 - lastDayOfWeek))
                
                // Assurer qu'on va jusqu'à la fin de la journée
                timeMax.setHours(23, 59, 59, 999)
            } else if (viewMode === 'week') {
                // Début de la semaine (dimanche)
                timeMin = new Date(now)
                timeMin.setDate(now.getDate() - now.getDay())
                timeMin.setHours(0, 0, 0, 0)
                
                // Fin de la semaine (samedi)
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

            console.log('📅 Plage de dates:', { 
                timeMin: timeMin.toISOString(), 
                timeMax: timeMax.toISOString() 
            })

            const params = new URLSearchParams({
                timeMin: timeMin.toISOString(),
                timeMax: timeMax.toISOString(),
                maxResults: '500' // Augmenté pour plus d'événements
            })

            const response = await fetch(`/api/calendar/events?${params}`, {
                headers: {
                    'Authorization': `Bearer ${session.accessToken}`,
                    'Cache-Control': 'no-cache'
                }
            })
            
            if (response.ok) {
                const data = await response.json()
                console.log('✅ Événements reçus:', data.totalFound)
                setEvents(data.events || [])
            } else {
                const errorData = await response.json()
                console.error('❌ Erreur API:', errorData)
                if (errorData.needsReauth) {
                    console.log('🔄 Token expiré, reconnexion nécessaire')
                }
            }
        } catch (error) {
            console.error('❌ Erreur lors du chargement des événements:', error)
        } finally {
            setLoadingEvents(false)
        }
    }

    const handleAddEvent = async (eventData) => {
        try {
            const response = await fetch('/api/calendar/events', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${session.accessToken}`
                },
                body: JSON.stringify(eventData)
            })

            if (response.ok) {
                const data = await response.json()
                console.log('✅ Événement créé:', data.event.summary)
                // Recharger tous les événements pour synchroniser
                await loadGoogleCalendarEvents()
                return data.event
            } else {
                const error = await response.json()
                throw new Error(error.error || 'Erreur lors de la création')
            }
        } catch (error) {
            console.error('Erreur création événement:', error)
            throw error
        }
    }

    const handleDeleteEvent = async (eventId) => {
        try {
            const response = await fetch(`/api/calendar/events/${eventId}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${session.accessToken}`
                }
            })

            if (response.ok) {
                console.log('✅ Événement supprimé')
                // Recharger tous les événements pour synchroniser
                await loadGoogleCalendarEvents()
            } else {
                const error = await response.json()
                throw new Error(error.error || 'Erreur lors de la suppression')
            }
        } catch (error) {
            console.error('Erreur suppression événement:', error)
            alert('Erreur lors de la suppression de l\'événement')
        }
    }

    const handleEditEvent = async (eventData) => {
        try {
            const response = await fetch('/api/calendar/events', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${session.accessToken}`
                },
                body: JSON.stringify(eventData)
            })

            if (response.ok) {
                const data = await response.json()
                console.log('✅ Événement modifié:', data.event.summary)
                // Recharger tous les événements pour synchroniser
                await loadGoogleCalendarEvents()
                return data.event
            } else {
                const error = await response.json()
                throw new Error(error.error || 'Erreur lors de la modification')
            }
        } catch (error) {
            console.error('Erreur modification événement:', error)
            throw error
        }
    }


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

    // Générer le calendrier mensuel
    const generateMonthCalendar = () => {
        const year = currentDate.getFullYear()
        const month = currentDate.getMonth()
        const firstDay = new Date(year, month, 1)
        const lastDay = new Date(year, month + 1, 0)
        const startDate = new Date(firstDay)
        startDate.setDate(startDate.getDate() - firstDay.getDay())
        
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

    if (!session) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-[#1a1d29] to-[#212332] px-6">
                <div className="max-w-7xl mx-auto">
                    <div className="flex flex-col justify-center items-center min-h-screen">
                        <div className="bg-gradient-to-br from-[#2a2d3e] to-[#212332] rounded-3xl p-8 shadow-2xl border border-gray-600/20 text-center">
                            <FaCalendarAlt className="w-16 h-16 text-blue-400 mx-auto mb-4" />
                            <h1 className="text-3xl text-white mb-4 font-bold">Calendrier Google</h1>
                            <p className="text-gray-300 mb-6">Connectez-vous avec Google pour accéder à votre calendrier</p>
                            <div className="flex justify-center">
                                <GoogleSignInButton
                                    size="large"
                                    variant="dark"
                                    className="transform hover:scale-105"
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        )
    }

    return(
        <div className="min-h-screen bg-gradient-to-br from-[#1a1d29] to-[#212332] px-4 sm:px-6">
            <div className="max-w-7xl mx-auto py-6">
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
                                    {viewMode === 'week' && `Semaine du ${formatDate(currentDate).split(' ')[3]}`}
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


                            {/* Bouton refresh */}
                            <button
                                onClick={loadGoogleCalendarEvents}
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
                        <div className="absolute inset-0 bg-black/20 backdrop-blur-sm z-10 flex items-center justify-center">
                            <div className="animate-spin rounded-full h-8 w-8 border-2 border-blue-500 border-t-transparent"></div>
                        </div>
                    )}

                    {viewMode === 'month' && (
                        <div className="p-6">
                            {/* En-têtes des jours */}
                            <div className="grid grid-cols-7 gap-1 mb-4">
                                {['Dim', 'Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam'].map((day, index) => (
                                    <div key={index} className="p-3 text-center">
                                        <span className="text-gray-400 font-medium text-sm">{day}</span>
                                    </div>
                                ))}
                            </div>

                            {/* Grille du calendrier */}
                            <div className="grid grid-cols-7 gap-1 sm:gap-2">
                                {generateMonthCalendar().map((date, index) => {
                                    const dayEvents = getEventsForDay(date)
                                    const isCurrentDay = isToday(date)
                                    const isInCurrentMonth = isCurrentMonth(date)
                                    
                                    return (
                                        <motion.div
                                            key={index}
                                            whileHover={{ scale: 1.02 }}
                                            className={`min-h-[80px] sm:min-h-[120px] p-1 sm:p-2 border border-gray-600/20 rounded-lg transition-all duration-200 cursor-pointer ${
                                                isCurrentDay 
                                                    ? 'bg-gradient-to-br from-blue-600/30 to-indigo-600/30 border-blue-500/50 shadow-lg'
                                                    : isInCurrentMonth
                                                    ? 'bg-gradient-to-br from-gray-700/20 to-gray-800/20 hover:from-gray-600/30 hover:to-gray-700/30'
                                                    : 'bg-gray-800/10 text-gray-500'
                                            }`}
                                            onClick={() => {
                                                const dayEvents = getEventsForDay(date)
                                                setSelectedEventDate(date)
                                                if (dayEvents.length > 0) {
                                                    setShowDayEvents(true)
                                                } else {
                                                    setShowAddEvent(true)
                                                }
                                            }}
                                        >
                                            <div className={`text-xs sm:text-sm font-medium mb-1 sm:mb-2 relative ${
                                                isCurrentDay ? 'text-white' : isInCurrentMonth ? 'text-gray-200' : 'text-gray-500'
                                            }`}>
                                                {isCurrentDay ? (
                                                    <div className="w-5 h-5 sm:w-6 sm:h-6 bg-blue-500 rounded-full flex items-center justify-center">
                                                        <span className="text-white font-bold text-xs sm:text-sm">
                                                            {date.getDate()}
                                                        </span>
                                                    </div>
                                                ) : (
                                                    <span>{date.getDate()}</span>
                                                )}
                                            </div>
                                            
                                            {/* Événements du jour */}
                                            <div className="space-y-0.5 sm:space-y-1">
                                                {dayEvents.slice(0, 2).map((event, eventIndex) => (
                                                    <div
                                                        key={eventIndex}
                                                        className="text-xs p-0.5 sm:p-1 rounded bg-[#3A6FF8]/80 text-white truncate cursor-pointer hover:bg-[#2952d3]/90 transition-all"
                                                        title={event.summary}
                                                        onClick={(e) => e.stopPropagation()}
                                                    >
                                                        <span className="truncate block">{event.summary}</span>
                                                    </div>
                                                ))}
                                                {/* Afficher un événement supplémentaire sur desktop */}
                                                {dayEvents.length > 2 && (
                                                    <div className="hidden sm:block">
                                                        <div
                                                            className="text-xs p-1 rounded bg-[#3A6FF8]/80 text-white truncate cursor-pointer hover:bg-[#2952d3]/90 transition-all"
                                                            title={dayEvents[2].summary}
                                                            onClick={(e) => e.stopPropagation()}
                                                        >
                                                            <span className="truncate block">{dayEvents[2].summary}</span>
                                                        </div>
                                                    </div>
                                                )}
                                                {dayEvents.length > 2 && (
                                                    <div className="text-xs text-gray-400 font-medium">
                                                        <span className="sm:hidden">+{dayEvents.length - 2} autres</span>
                                                        <span className="hidden sm:inline">
                                                            {dayEvents.length > 3 ? `+${dayEvents.length - 3} autres` : ''}
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
                        <div className="p-6">
                            <div className="text-center text-gray-300 py-12">
                                <FaCalendarAlt className="w-12 h-12 mx-auto mb-4 text-gray-500" />
                                <p>Vue semaine - En cours de développement</p>
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
                                <p className="text-sm font-medium text-white">{session ? 'Connecté' : 'Déconnecté'}</p>
                            </div>
                            <div className={`w-3 h-3 rounded-full ${session ? 'bg-green-400 animate-pulse' : 'bg-red-400'}`}></div>
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
                onSave={handleAddEvent}
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
                onDeleteEvent={handleDeleteEvent}
            />

            {/* Modal Modifier Événement */}
            <EditEventModal
                isOpen={showEditEvent}
                onClose={() => {
                    setShowEditEvent(false)
                    setSelectedEvent(null)
                }}
                onSave={handleEditEvent}
                event={selectedEvent}
            />
        </div>
    )
}