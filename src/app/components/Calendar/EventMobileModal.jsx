"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { 
    FaTimes, 
    FaMapMarkerAlt, 
    FaCalendarAlt, 
    FaClock, 
    FaUsers, 
    FaEdit,
    FaTrash,
    FaShare,
    FaBell,
    FaChevronDown,
    FaChevronUp,
    FaAlignLeft,
    FaStar,
    FaArrowLeft
} from "react-icons/fa"

export default function EventMobileModal({ 
    event, 
    isOpen, 
    onClose, 
    onEdit, 
    onDelete,
    onBack,
    getColor 
}) {
    const [showFullDescription, setShowFullDescription] = useState(false)

    // Bloquer le scroll de l'arrière-plan quand le modal est ouvert
    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden'
        } else {
            document.body.style.overflow = 'unset'
        }
        
        return () => {
            document.body.style.overflow = 'unset'
        }
    }, [isOpen])

    if (!event) return null

    const eventColor = getColor ? getColor(event.colorId || '1') : { bg: 'bg-blue-500', text: 'text-blue-500', border: 'border-blue-500' }
    
    // Formatage des dates et heures
    const formatDateTime = (dateTime) => {
        if (!dateTime) return ''
        const date = new Date(dateTime)
        return {
            date: date.toLocaleDateString('fr-FR', { 
                weekday: 'long', 
                day: 'numeric', 
                month: 'long', 
                year: 'numeric' 
            }),
            shortDate: date.toLocaleDateString('fr-FR', { 
                day: 'numeric', 
                month: 'short', 
                year: 'numeric' 
            }),
            time: date.toLocaleTimeString('fr-FR', { 
                hour: '2-digit', 
                minute: '2-digit' 
            })
        }
    }

    const startDateTime = formatDateTime(event.start?.dateTime || event.start?.date)
    const endDateTime = formatDateTime(event.end?.dateTime || event.end?.date)
    
    const isAllDay = !event.start?.dateTime || !event.end?.dateTime
    
    // Vérifier si c'est un événement multi-jours
    const isMultiDay = () => {
        if (!event.start || !event.end) return false
        const startDate = new Date(event.start.dateTime || event.start.date)
        const endDate = new Date(event.end.dateTime || event.end.date)
        
        // Pour les événements avec heure
        if (event.start.dateTime && event.end.dateTime) {
            return startDate.toDateString() !== endDate.toDateString()
        }
        
        // Pour les événements toute la journée
        if (event.start.date && event.end.date) {
            const diffTime = Math.abs(endDate - startDate)
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
            return diffDays > 1
        }
        
        return false
    }
    const description = event.description || event.summary || ''
    const isLongDescription = description.length > 120

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Overlay */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
                        onClick={onClose}
                    />

                    {/* Modal Plein Écran Mobile */}
                    <motion.div
                        initial={{ y: "100%", opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        exit={{ y: "100%", opacity: 0 }}
                        transition={{ 
                            type: "tween", 
                            ease: [0.25, 0.1, 0.25, 1],
                            duration: 0.3 
                        }}
                        className="fixed inset-0 bg-gradient-to-br from-[#1e293b] to-[#0f172a] shadow-2xl z-50 overflow-y-auto block md:hidden min-h-screen flex flex-col"
                        style={{
                            scrollbarWidth: 'none',
                            msOverflowStyle: 'none'
                        }}
                    >
                        {/* Header simplifié */}
                        <div className="flex items-center justify-between px-4 py-4 bg-slate-900/50 backdrop-blur-sm border-b border-slate-700/50 flex-shrink-0">
                            <button
                                onClick={onBack || onClose}
                                className="w-10 h-10 rounded-lg bg-slate-800/50 hover:bg-slate-700/60 flex items-center justify-center text-slate-300 hover:text-white transition-all duration-200"
                            >
                                <FaArrowLeft className="w-4 h-4" />
                            </button>

                            <h2 className="text-base font-semibold text-white uppercase tracking-wide">Détails de l'événement</h2>

                            {/* Espace pour équilibrer le layout */}
                            <div className="w-10 h-10"></div>
                        </div>

                        {/* Contenu principal avec flex pour utiliser tout l'espace */}
                        <div className="flex-1 flex flex-col px-4 py-6 space-y-6 min-h-0 overflow-y-auto">
                            {/* Titre avec icône - H1 */}
                            <div className="flex items-center justify-center bg-gradient-to-r from-slate-800/40 to-slate-700/30 rounded-2xl p-6 border border-slate-600/20">
                                <div className="flex items-center justify-center gap-3">
                                    <FaCalendarAlt className="w-6 h-6 text-blue-400 flex-shrink-0" />
                                    <h1 className="text-xl sm:text-2xl font-bold text-white leading-tight break-words hyphens-auto max-w-full overflow-wrap-anywhere">
                                        {event.summary || event.title || 'Événement sans titre'}
                                    </h1>
                                </div>
                            </div>

                            {/* Informations principales dans des cartes */}
                            <div className="space-y-4">
                                {/* Date et heure avec support multi-jours */}
                                <div className="bg-gradient-to-r from-slate-800/40 to-slate-700/30 rounded-2xl p-5 border border-slate-600/20">
                                    <div className="flex items-center gap-3 mb-4">
                                        <div className="w-8 h-8 bg-blue-500/20 rounded-xl flex items-center justify-center">
                                            <FaClock className="w-4 h-4 text-blue-400" />
                                        </div>
                                        <h2 className="text-xs font-semibold text-slate-400 uppercase tracking-wide">
                                            {isMultiDay() ? 'PÉRIODE' : 'DATE & HEURE'}
                                        </h2>
                                    </div>
                                    
                                    {isMultiDay() ? (
                                        // Affichage pour événements multi-jours
                                        <div className="space-y-3">
                                            <div className="flex items-start gap-3">
                                                <div className="bg-green-500/20 rounded-lg p-2 mt-0.5">
                                                    <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                                                </div>
                                                <div>
                                                    <p className="text-sm text-slate-400 mb-1">Début</p>
                                                    <p className="text-lg font-medium text-white capitalize leading-tight">
                                                        {startDateTime.date}
                                                    </p>
                                                    {!isAllDay && startDateTime.time && (
                                                        <div className="flex items-center gap-2 mt-2">
                                                            <FaClock className="w-3 h-3 text-slate-400" />
                                                            <p className="text-sm text-slate-300 font-medium">{startDateTime.time}</p>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                            
                                            <div className="flex items-start gap-3">
                                                <div className="bg-red-500/20 rounded-lg p-2 mt-0.5">
                                                    <div className="w-2 h-2 bg-red-400 rounded-full"></div>
                                                </div>
                                                <div>
                                                    <p className="text-sm text-slate-400 mb-1">Fin</p>
                                                    <p className="text-lg font-medium text-white capitalize leading-tight">
                                                        {endDateTime.date}
                                                    </p>
                                                    {!isAllDay && endDateTime.time && (
                                                        <div className="flex items-center gap-2 mt-2">
                                                            <FaClock className="w-3 h-3 text-slate-400" />
                                                            <p className="text-sm text-slate-300 font-medium">{endDateTime.time}</p>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                            
                                            {isAllDay && (
                                                <div className="bg-blue-500/10 rounded-lg p-2 mt-2">
                                                    <p className="text-sm text-blue-300 text-center">Événement sur plusieurs jours</p>
                                                </div>
                                            )}
                                        </div>
                                    ) : (
                                        // Affichage pour événements d'un seul jour
                                        <div>
                                            <p className="text-lg font-medium text-white capitalize mb-2 leading-tight">
                                                {startDateTime.date}
                                            </p>
                                            {!isAllDay ? (
                                                <div className="flex items-center gap-2">
                                                    <FaClock className="w-4 h-4 text-slate-400" />
                                                    <p className="text-base text-slate-300 font-medium">
                                                        {startDateTime.time}
                                                        {endDateTime.time && endDateTime.time !== startDateTime.time && 
                                                            ` - ${endDateTime.time}`
                                                        }
                                                    </p>
                                                </div>
                                            ) : (
                                                <p className="text-sm text-slate-400">Toute la journée</p>
                                            )}
                                        </div>
                                    )}
                                </div>

                                {/* Lieu - Toujours affiché */}
                                <div className="bg-gradient-to-r from-slate-800/40 to-slate-700/30 rounded-2xl p-5 border border-slate-600/20">
                                    <div className="flex items-center gap-3 mb-3">
                                        <div className="w-8 h-8 bg-red-500/20 rounded-xl flex items-center justify-center">
                                            <FaMapMarkerAlt className="w-4 h-4 text-red-400" />
                                        </div>
                                        <h2 className="text-xs font-semibold text-slate-400 uppercase tracking-wide">LIEU</h2>
                                    </div>
                                    <p className="text-lg font-medium text-white leading-tight">
                                        {event.location || 'Aucun lieu spécifié'}
                                    </p>
                                </div>

                                {/* Participants - Toujours affiché */}
                                <div className="bg-gradient-to-r from-slate-800/40 to-slate-700/30 rounded-2xl p-5 border border-slate-600/20">
                                    <div className="flex items-center gap-3 mb-3">
                                        <div className="w-8 h-8 bg-green-500/20 rounded-xl flex items-center justify-center">
                                            <FaUsers className="w-4 h-4 text-green-400" />
                                        </div>
                                        <h2 className="text-xs font-semibold text-slate-400 uppercase tracking-wide">PARTICIPANTS</h2>
                                    </div>
                                    {event.attendees && event.attendees.length > 0 ? (
                                        <>
                                            <p className="text-lg font-medium text-white mb-2 leading-tight">
                                                {event.attendees.length} participant{event.attendees.length > 1 ? 's' : ''}
                                            </p>
                                            <p className="text-sm text-slate-400 leading-relaxed">
                                                {event.attendees.slice(0, 3).map(attendee => attendee.email).join(', ')}
                                                {event.attendees.length > 3 && ` et ${event.attendees.length - 3} autres`}
                                            </p>
                                        </>
                                    ) : (
                                        <p className="text-lg font-medium text-white leading-tight">
                                            Aucun participant
                                        </p>
                                    )}
                                </div>
                            </div>

                            {/* Description - Toujours affichée et compactée */}
                            <div className="bg-gradient-to-r from-slate-800/40 to-slate-700/30 rounded-2xl p-4 border border-slate-600/20">
                                <div className="flex items-center gap-3 mb-3">
                                    <div className="w-8 h-8 bg-purple-500/20 rounded-xl flex items-center justify-center">
                                        <FaAlignLeft className="w-4 h-4 text-purple-400" />
                                    </div>
                                    <h2 className="text-xs font-semibold text-slate-400 uppercase tracking-wide">DESCRIPTION</h2>
                                </div>
                                <div className="max-h-24 overflow-y-auto">
                                    {description ? (
                                        <>
                                            <p className={`text-white leading-relaxed text-base ${
                                                !showFullDescription && isLongDescription ? 'line-clamp-3' : ''
                                            }`}>
                                                {description}
                                            </p>
                                            {isLongDescription && (
                                                <button
                                                    onClick={() => setShowFullDescription(!showFullDescription)}
                                                    className="flex items-center gap-2 mt-2 text-blue-400 hover:text-blue-300 text-sm font-medium transition-colors duration-200"
                                                >
                                                    {showFullDescription ? (
                                                        <>
                                                            <FaChevronUp className="w-3 h-3" />
                                                            Voir moins
                                                        </>
                                                    ) : (
                                                        <>
                                                            <FaChevronDown className="w-3 h-3" />
                                                            Voir plus
                                                        </>
                                                    )}
                                                </button>
                                            )}
                                        </>
                                    ) : (
                                        <p className="text-lg font-medium text-white leading-tight">
                                            Aucune description
                                        </p>
                                    )}
                                </div>
                            </div>

                            {/* Bouton Modifier intégré dans le contenu */}
                            {onEdit && (
                                <div className="flex justify-center">
                                    <button
                                        onClick={() => {
                                            onEdit(event)
                                            onClose()
                                        }}
                                        className="bg-blue-500 hover:bg-blue-600 text-white py-3 px-6 rounded-xl font-medium text-base transition-all duration-200 flex items-center justify-center gap-2 shadow-lg min-w-[160px]"
                                    >
                                        <FaEdit className="w-4 h-4" />
                                        Modifier
                                    </button>
                                </div>
                            )}
                        </div>

                        {/* Actions secondaires fixées en bas */}
                        <div className="mt-auto bg-slate-900/80 backdrop-blur-sm border-t border-slate-700/50 p-4">
                            <div className="flex gap-2">
                                <button className="flex-1 bg-slate-800/50 hover:bg-slate-700/60 text-slate-300 hover:text-white py-3 px-4 rounded-xl transition-all duration-200 flex items-center justify-center gap-2">
                                    <FaShare className="w-4 h-4" />
                                    <span className="text-sm font-medium">Partager</span>
                                </button>
                                
                                <button className="flex-1 bg-slate-800/50 hover:bg-slate-700/60 text-slate-300 hover:text-white py-3 px-4 rounded-xl transition-all duration-200 flex items-center justify-center gap-2">
                                    <FaBell className="w-4 h-4" />
                                    <span className="text-sm font-medium">Rappel</span>
                                </button>

                                {onDelete && (
                                    <button 
                                        onClick={() => {
                                            onDelete(event.id)
                                            onClose()
                                        }}
                                        className="flex-1 bg-red-500/20 hover:bg-red-500/30 text-red-400 hover:text-red-300 py-3 px-4 rounded-xl transition-all duration-200 flex items-center justify-center gap-2"
                                    >
                                        <FaTrash className="w-4 h-4" />
                                        <span className="text-sm font-medium">Supprimer</span>
                                    </button>
                                )}
                            </div>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    )
}

// Style CSS pour masquer la scrollbar
const scrollbarStyles = `
  .event-modal-scroll::-webkit-scrollbar {
    display: none;
  }
  .event-modal-scroll {
    -ms-overflow-style: none;
    scrollbar-width: none;
  }
`