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
    FaArrowLeft,
    FaExclamationTriangle
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
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)

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

    const handleDelete = async () => {
        if (onDelete) {
            try {
                await onDelete(event.id)
                setShowDeleteConfirm(false)
                onClose()
                // Forcer le rafraîchissement de la page
                window.location.reload()
            } catch (error) {
                // Erreur suppression événement
            }
        }
    }

    return (
        <>
            <style jsx>{`
                .custom-scrollbar::-webkit-scrollbar {
                    width: 6px;
                }
                .custom-scrollbar::-webkit-scrollbar-track {
                    background: transparent;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb {
                    background-color: rgba(148, 163, 184, 0.3);
                    border-radius: 3px;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb:hover {
                    background-color: rgba(148, 163, 184, 0.5);
                }
            `}</style>
            <AnimatePresence>
            {isOpen && (
                <>
                    {/* Overlay */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/70 backdrop-blur-md z-50"
                        onClick={onClose}
                    />

                    {/* Modal - Plein écran mobile, centré dans l'espace disponible sur desktop */}
                    <motion.div
                        initial={{ scale: 0.9, opacity: 0, y: 20 }}
                        animate={{ scale: 1, opacity: 1, y: 0 }}
                        exit={{ scale: 0.9, opacity: 0, y: 20 }}
                        transition={{ 
                            type: "spring", 
                            damping: 25,
                            stiffness: 300,
                            duration: 0.3 
                        }}
                        className="fixed inset-4 md:inset-16 lg:inset-20 bg-gradient-to-br from-[#1e293b] to-[#0f172a] rounded-3xl shadow-2xl z-50 flex flex-col max-w-none md:max-w-4xl md:mx-auto md:my-auto"
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* Header */}
                        <div className="flex items-center justify-between px-6 py-5 bg-gradient-to-r from-slate-900/80 to-slate-800/80 backdrop-blur-md border-b border-slate-700/40 flex-shrink-0 rounded-t-3xl">
                            {/* Bouton retour à gauche */}
                            <div className="flex items-center">
                                <button
                                    onClick={onBack || onClose}
                                    className="w-10 h-10 rounded-xl bg-slate-700/50 hover:bg-slate-600/70 flex items-center justify-center text-slate-300 hover:text-white transition-all duration-200 mr-4"
                                >
                                    <FaArrowLeft className="w-4 h-4" />
                                </button>
                            </div>

                            {/* Titre centré avec pastille */}
                            <div className="flex items-center gap-3 flex-1 justify-center">
                                <div 
                                    className="w-4 h-4 rounded-full shadow-lg"
                                    style={{ backgroundColor: eventColor.background }}
                                />
                                <h2 className="text-xl md:text-2xl font-bold text-white">
                                    Détails de l'événement
                                </h2>
                            </div>

                            {/* Desktop: boutons d'action à droite */}
                            <div className="hidden md:flex items-center gap-3">
                                <button
                                    onClick={() => onEdit && onEdit(event)}
                                    className="px-4 py-2.5 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white rounded-xl font-medium transition-all duration-200 flex items-center gap-2 text-sm shadow-lg"
                                >
                                    <FaEdit className="w-4 h-4" />
                                    Modifier
                                </button>
                                <button
                                    onClick={() => setShowDeleteConfirm(true)}
                                    className="px-4 py-2.5 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white rounded-xl font-medium transition-all duration-200 flex items-center gap-2 text-sm shadow-lg"
                                >
                                    <FaTrash className="w-4 h-4" />
                                    Supprimer
                                </button>
                                <button
                                    onClick={onClose}
                                    className="w-10 h-10 rounded-xl bg-slate-700/50 hover:bg-slate-600/70 flex items-center justify-center text-slate-300 hover:text-white transition-all duration-200 ml-2"
                                >
                                    <FaTimes className="w-5 h-5" />
                                </button>
                            </div>

                            {/* Mobile: bouton fermer à droite */}
                            <div className="md:hidden flex items-center">
                                <button
                                    onClick={onClose}
                                    className="w-10 h-10 rounded-xl bg-slate-700/50 hover:bg-slate-600/70 flex items-center justify-center text-slate-300 hover:text-white transition-all duration-200"
                                >
                                    <FaTimes className="w-5 h-5" />
                                </button>
                            </div>
                        </div>

                        {/* Contenu principal */}
                        <div className="flex-1 px-4 md:px-8 py-6 overflow-y-auto min-h-0 scrollbar-hide">
                            {/* Design moderne uni-colonne */}
                            <div className="space-y-6">
                                {/* Titre principal sans pastille */}
                                <div className="mb-6">
                                    <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-white text-center">{event.summary}</h1>
                                </div>

                                {/* Informations principales - pleine largeur */}
                                <div className="space-y-6">
                                    {/* Date - pleine largeur */}
                                    <div className="bg-slate-800/40 rounded-2xl p-4 border border-slate-700/30">
                                        <div className="flex items-center gap-4">
                                            <FaCalendarAlt className="w-7 h-7 text-blue-400 flex-shrink-0" />
                                            <div className="flex-1">
                                                <h3 className="text-white font-semibold text-lg mb-3">Date et heure</h3>
                                                <div className="flex flex-wrap items-center gap-4">
                                                    <p className="text-white text-sm sm:text-base">
                                                        {isAllDay ? 'Toute la journée' : `${startDateTime.time} - ${endDateTime.time}`}
                                                    </p>
                                                    <p className="text-white text-xs sm:text-sm opacity-80">{startDateTime.shortDate}</p>
                                                    {isMultiDay() && (
                                                        <p className="text-white text-xs sm:text-sm opacity-80">jusqu'au {endDateTime.shortDate}</p>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Lieu - pleine largeur */}
                                    <div className="bg-slate-800/40 rounded-2xl p-4 border border-slate-700/30">
                                        <div className="flex items-center gap-4">
                                            <FaMapMarkerAlt className="w-7 h-7 text-green-400 flex-shrink-0" />
                                            <div className="flex-1">
                                                <h3 className="text-white font-semibold text-lg mb-3">Lieu</h3>
                                                <p className="text-white text-sm sm:text-base break-words">
                                                    {event.location || "Pas de lieu spécifié"}
                                                </p>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Participants - pleine largeur */}
                                    <div className="bg-slate-800/40 rounded-2xl p-4 border border-slate-700/30">
                                        <div className="flex items-start gap-4">
                                            <FaUsers className="w-7 h-7 text-orange-400 flex-shrink-0 mt-1" />
                                            <div className="flex-1">
                                                {event.attendees && event.attendees.length > 0 ? (
                                                    <>
                                                        <h3 className="text-white font-semibold text-lg mb-3">
                                                            {event.attendees.length} participant{event.attendees.length > 1 ? 's' : ''}
                                                        </h3>
                                                        <div className="flex flex-wrap gap-2">
                                                            {event.attendees.slice(0, 8).map((attendee, index) => (
                                                                <div key={index} className="flex items-center gap-2 bg-slate-700/30 rounded-lg px-3 py-2">
                                                                    <div className="w-6 h-6 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center text-white text-xs font-bold">
                                                                        {attendee.email ? attendee.email.charAt(0).toUpperCase() : '?'}
                                                                    </div>
                                                                    <span className="text-white text-xs sm:text-sm">
                                                                        {attendee.email ? attendee.email.split('@')[0] : 'Invité'}
                                                                    </span>
                                                                    {attendee.responseStatus === 'accepted' && (
                                                                        <span className="text-green-400 text-xs">✓</span>
                                                                    )}
                                                                </div>
                                                            ))}
                                                            {event.attendees.length > 8 && (
                                                                <div className="flex items-center gap-2 bg-slate-600/40 rounded-lg px-3 py-2">
                                                                    <span className="text-white text-xs sm:text-sm">
                                                                        +{event.attendees.length - 8} autres
                                                                    </span>
                                                                </div>
                                                            )}
                                                        </div>
                                                    </>
                                                ) : (
                                                    <>
                                                        <h3 className="text-white font-semibold text-xl mb-3">Participants</h3>
                                                        <p className="text-slate-400 text-base italic">Pas de participants</p>
                                                    </>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Description */}
                                <div className="lg:col-span-2 bg-gradient-to-r from-slate-800/60 to-slate-700/40 rounded-2xl p-6 border border-slate-600/30 shadow-lg">
                                    <div className="flex items-start gap-4">
                                        <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center flex-shrink-0">
                                            <FaAlignLeft className="w-6 h-6 text-white" />
                                        </div>
                                        <div className="flex-1">
                                            <h3 className="text-white font-semibold text-xl mb-4">Description</h3>
                                            <div className="text-slate-200 leading-relaxed text-base">
                                                {description ? (
                                                    <p className="whitespace-pre-wrap">{description}</p>
                                                ) : (
                                                    <p className="text-slate-400 italic">Pas de description</p>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>

                            </div>

                        </div>

                        {/* Boutons d'action mobile uniquement */}
                        <div className="md:hidden flex gap-4 px-6 py-5 bg-gradient-to-r from-slate-900/80 to-slate-800/80 backdrop-blur-md border-t border-slate-600/40 flex-shrink-0 rounded-b-3xl">
                            <button
                                onClick={() => onEdit && onEdit(event)}
                                className="flex-1 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white py-3 px-4 rounded-xl font-semibold transition-all duration-200 flex items-center justify-center gap-3 shadow-lg transform hover:scale-105 active:scale-95"
                            >
                                <FaEdit className="w-4 h-4" />
                                Modifier
                            </button>
                            
                            <button
                                onClick={() => setShowDeleteConfirm(true)}
                                className="flex-1 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white py-3 px-4 rounded-xl font-semibold transition-all duration-200 flex items-center justify-center gap-3 shadow-lg transform hover:scale-105 active:scale-95"
                            >
                                <FaTrash className="w-4 h-4" />
                                Supprimer
                            </button>
                        </div>
                    </motion.div>

                    {/* Modal de confirmation de suppression */}
                    <AnimatePresence>
                        {showDeleteConfirm && (
                            <>
                                {/* Overlay supplémentaire */}
                                <motion.div
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    exit={{ opacity: 0 }}
                                    className="fixed inset-0 bg-black/80 backdrop-blur-sm z-60"
                                    onClick={() => setShowDeleteConfirm(false)}
                                />

                                {/* Modal de confirmation */}
                                <motion.div
                                    initial={{ scale: 0.9, opacity: 0, y: 20 }}
                                    animate={{ scale: 1, opacity: 1, y: 0 }}
                                    exit={{ scale: 0.9, opacity: 0, y: 20 }}
                                    transition={{ 
                                        type: "spring", 
                                        damping: 25,
                                        stiffness: 300,
                                        duration: 0.2 
                                    }}
                                    className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl shadow-2xl z-60 p-6 w-[90%] max-w-md mx-auto"
                                    onClick={(e) => e.stopPropagation()}
                                >
                                    <div className="text-center">
                                        {/* Icône d'avertissement */}
                                        <div className="mx-auto flex items-center justify-center w-12 h-12 rounded-full bg-red-100 mb-4">
                                            <FaExclamationTriangle className="w-6 h-6 text-red-600" />
                                        </div>

                                        {/* Titre */}
                                        <h3 className="text-lg font-semibold text-white mb-2">
                                            Confirmer la suppression
                                        </h3>

                                        {/* Message */}
                                        <p className="text-slate-300 mb-6">
                                            Êtes-vous sûr de vouloir supprimer cet événement ? Cette action est irréversible.
                                        </p>

                                        {/* Nom de l'événement */}
                                        <div className="bg-slate-700/50 rounded-lg p-3 mb-6">
                                            <p className="text-white font-medium text-sm">
                                                "{event.summary}"
                                            </p>
                                        </div>

                                        {/* Boutons */}
                                        <div className="flex gap-3">
                                            <button
                                                onClick={() => setShowDeleteConfirm(false)}
                                                className="flex-1 px-4 py-2.5 bg-slate-600 hover:bg-slate-500 text-white rounded-lg font-medium transition-all duration-200"
                                            >
                                                Annuler
                                            </button>
                                            <button
                                                onClick={handleDelete}
                                                className="flex-1 px-4 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition-all duration-200"
                                            >
                                                Supprimer
                                            </button>
                                        </div>
                                    </div>
                                </motion.div>
                            </>
                        )}
                    </AnimatePresence>
                </>
            )}
            </AnimatePresence>
        </>
    )
}