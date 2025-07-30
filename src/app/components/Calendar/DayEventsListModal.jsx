"use client"

import { motion, AnimatePresence } from "framer-motion"
import { FaTimes, FaCalendarAlt, FaMapMarkerAlt, FaClock, FaEdit, FaPlus } from "react-icons/fa"
import { useEffect } from "react"

const DayEventsListModal = ({ isOpen, onClose, events, date, onAddEvent, onEditEvent, getColor }) => {
  // Désactiver le scroll du body quand le modal est ouvert
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'unset'
    }

    // Cleanup: restaurer le scroll quand le composant est démonté
    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [isOpen])

  if (!isOpen || !date) return null

  const formatDate = (date) => {
    return date.toLocaleDateString('fr-FR', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    })
  }

  const formatTime = (dateTimeString) => {
    if (!dateTimeString) return null
    return new Date(dateTimeString).toLocaleTimeString('fr-FR', {
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  return (
    <AnimatePresence>
      <motion.div
        initial={events.length > 1 ? { opacity: 0 } : { opacity: 1 }}
        animate={{ opacity: 1 }}
        exit={events.length > 1 ? { opacity: 0 } : { opacity: 1 }}
        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[9999] flex items-center justify-center p-4"
        onClick={onClose}
      >
        <motion.div
          initial={events.length > 1 ? { scale: 0.9, opacity: 0, y: 20 } : { scale: 1, opacity: 1, y: 0 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={events.length > 1 ? { scale: 0.9, opacity: 0, y: 20 } : { scale: 1, opacity: 1, y: 0 }}
          className="bg-gradient-to-br from-[#2a2d3e] to-[#212332] rounded-2xl w-full max-w-2xl shadow-2xl border border-gray-600/20 max-h-[85vh] overflow-hidden"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="bg-gradient-to-r from-[#2a2d3e] to-[#212332] border-b border-gray-600/20 p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-[#3A6FF8] rounded-lg flex items-center justify-center">
                  <FaCalendarAlt className="w-4 h-4 text-white" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-white capitalize">
                    {formatDate(date)}
                  </h2>
                  <p className="text-sm text-gray-400">
                    {events.length} événement{events.length > 1 ? 's' : ''}
                  </p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="p-2 rounded-full hover:bg-gray-700/50 transition-colors text-gray-400 hover:text-white"
              >
                <FaTimes className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Events List */}
          <div className="p-6 max-h-[65vh] overflow-y-auto">
            {events.length === 0 ? (
              <div className="text-center py-8">
                <div className="w-16 h-16 bg-gray-700/30 rounded-full flex items-center justify-center mx-auto mb-4">
                  <FaCalendarAlt className="w-6 h-6 text-gray-500" />
                </div>
                <p className="text-gray-400 mb-4">Aucun événement pour cette journée</p>
                <button
                  onClick={() => onAddEvent(date)}
                  className="bg-[#3A6FF8] hover:bg-[#2952d3] text-white px-4 py-2 rounded-lg font-medium transition-all duration-200 flex items-center gap-2 mx-auto"
                >
                  <FaPlus className="w-3 h-3" />
                  Ajouter un événement
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                {events.map((event, index) => {
                  const eventColor = getColor(event.colorId || '1')
                  const startTime = formatTime(event.start?.dateTime)
                  const endTime = formatTime(event.end?.dateTime)
                  const isAllDay = event.start?.date && !event.start?.dateTime

                  return (
                    <motion.div
                      key={event.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className="bg-gradient-to-r from-gray-700/20 to-gray-800/20 rounded-xl p-5 border border-gray-600/20 hover:border-gray-500/30 transition-all duration-200 group"
                    >
                      <div className="flex items-start gap-3">
                        {/* Color indicator */}
                        <div 
                          className="w-4 h-4 rounded-full flex-shrink-0 mt-0.5"
                          style={{ backgroundColor: eventColor.background }}
                        ></div>
                        
                        {/* Event content */}
                        <div className="flex-1 min-w-0">
                          <h3 className="font-medium text-white text-base mb-2">
                            {event.summary}
                          </h3>
                          
                          {/* Time */}
                          <div className="flex items-center gap-2 text-sm text-gray-400 mb-3">
                            <FaClock className="w-4 h-4" />
                            {isAllDay ? (
                              <span>Toute la journée</span>
                            ) : (
                              <span>{startTime} - {endTime}</span>
                            )}
                          </div>

                          {/* Location */}
                          {event.location && (
                            <div className="flex items-center gap-2 text-sm text-gray-400 mb-3">
                              <FaMapMarkerAlt className="w-4 h-4" />
                              <span className="truncate">{event.location}</span>
                            </div>
                          )}

                          {/* Description */}
                          {event.description && (
                            <p className="text-sm text-gray-500 line-clamp-3">
                              {event.description}
                            </p>
                          )}
                        </div>

                        {/* Edit button */}
                        <button
                          onClick={() => onEditEvent(event, date)}
                          className="p-3 lg:p-3 rounded-lg hover:bg-gray-600/30 transition-all duration-200 text-gray-400 hover:text-white flex items-center justify-center min-w-[44px] min-h-[44px] lg:min-w-[auto] lg:min-h-[auto]"
                        >
                          <FaEdit className="w-5 h-5 lg:w-4 lg:h-4" />
                        </button>
                      </div>
                    </motion.div>
                  )
                })}
              </div>
            )}
          </div>

          {/* Footer */}
          {events.length > 0 && (
            <div className="bg-gray-800/30 border-t border-gray-600/20 p-6">
              <button
                onClick={() => onAddEvent(date)}
                className="w-full bg-[#3A6FF8] hover:bg-[#2952d3] text-white py-2.5 rounded-lg font-medium transition-all duration-200 flex items-center justify-center gap-2"
              >
                <FaPlus className="w-3 h-3" />
                Ajouter un événement
              </button>
            </div>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}

export default DayEventsListModal