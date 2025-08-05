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
                console.error('Erreur suppression événement:', error)
            }
        }
    }

    return (
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
                        className="fixed inset-0 md:fixed md:inset-0 md:ml-16 lg:ml-64 md:flex md:items-center md:justify-center bg-gradient-to-br from-[#1e293b] to-[#0f172a] md:rounded-3xl shadow-2xl z-50 flex flex-col md:w-auto md:h-auto md:max-w-4xl md:max-h-[85vh] md:mx-4"
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* Header */}
                        <div className="flex items-center justify-between px-3 md:px-4 py-4 bg-slate-900/60 backdrop-blur-md border-b border-slate-700/40 flex-shrink-0 md:rounded-t-3xl">
                            {/* Bouton retour à gauche - plus vers l'extérieur */}
                            <div className="flex-1 flex justify-start">
                                <button
                                    onClick={onBack || onClose}
                                    className="w-9 h-9 rounded-lg bg-slate-700/50 hover:bg-slate-600/60 flex items-center justify-center text-slate-300 hover:text-white transition-all duration-200"
                                >
                                    <FaArrowLeft className="w-4 h-4" />
                                </button>
                            </div>

                            {/* Titre centré avec pastille */}
                            <div className="flex items-center gap-3">
                                <div 
                                    className="w-3 h-3 rounded-full"
                                    style={{ backgroundColor: eventColor.background }}
                                />
                                <h2 className="text-xl font-bold text-white">
                                    Détails de l'événement
                                </h2>
                            </div>

                            {/* Desktop: boutons d'action à droite - plus vers l'extérieur */}
                            <div className="hidden md:flex items-center gap-2 flex-1 justify-end">
                                <button
                                    onClick={() => onEdit && onEdit(event)}
                                    className="px-4 py-2 bg-blue-600/80 hover:bg-blue-600 text-white rounded-lg font-medium transition-all duration-200 flex items-center gap-2 text-sm"
                                >
                                    <FaEdit className="w-3 h-3" />
                                    Modifier
                                </button>
                                <button
                                    onClick={() => setShowDeleteConfirm(true)}
                                    className="px-4 py-2 bg-red-600/80 hover:bg-red-600 text-white rounded-lg font-medium transition-all duration-200 flex items-center gap-2 text-sm"
                                >
                                    <FaTrash className="w-3 h-3" />
                                    Supprimer
                                </button>
                                <button
                                    onClick={onClose}
                                    className="w-9 h-9 rounded-lg bg-slate-700/50 hover:bg-slate-600/60 flex items-center justify-center text-slate-300 hover:text-white transition-all duration-200 ml-2"
                                >
                                    <FaTimes className="w-4 h-4" />
                                </button>
                            </div>

                            {/* Mobile: bouton fermer à droite - plus vers l'extérieur */}
                            <div className="md:hidden flex-1 flex justify-end">
                                <button
                                    onClick={onClose}
                                    className="w-9 h-9 rounded-lg bg-slate-700/50 hover:bg-slate-600/60 flex items-center justify-center text-slate-300 hover:text-white transition-all duration-200"
                                >
                                    <FaTimes className="w-4 h-4" />
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
                                                        <h3 className="text-white font-semibold text-lg mb-3">Participants</h3>
                                                        <p className="text-white text-sm sm:text-base opacity-70">Pas de participants</p>
                                                    </>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Description - toujours affichée */}
                                <div className="bg-slate-800/40 rounded-2xl p-6 border border-slate-700/30">
                                    <div className="flex items-center gap-4">
                                        <FaAlignLeft className="w-7 h-7 text-purple-400 flex-shrink-0" />
                                        <div className="flex-1">
                                            <h3 className="text-white font-semibold text-lg mb-3">Description</h3>
                                            <p className="text-white leading-relaxed text-sm sm:text-base">
                                                {description || "Pas de description"}
                                            </p>
                                        </div>
                                    </div>
                                </div>

                            </div>

                        </div>

                        {/* Boutons d'action mobile uniquement - Fixés en bas */}
                        <div className="md:hidden flex gap-2 px-4 py-3 bg-slate-900/40 border-t border-slate-700/40 backdrop-blur-md flex-shrink-0">
                            <button
                                onClick={() => onEdit && onEdit(event)}
                                className="flex-1 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white py-2.5 px-3 rounded-lg font-medium transition-all duration-200 flex items-center justify-center gap-2 text-sm"
                            >
                                <FaEdit className="w-3.5 h-3.5" />
                                Modifier
                            </button>
                            
                            <button
                                onClick={() => setShowDeleteConfirm(true)}
                                className="flex-1 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white py-2.5 px-3 rounded-lg font-medium transition-all duration-200 flex items-center justify-center gap-2 text-sm"
                            >
                                <FaTrash className="w-3.5 h-3.5" />
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
    )
}