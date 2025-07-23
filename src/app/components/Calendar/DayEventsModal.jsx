"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { FaTimes, FaEdit, FaTrash, FaClock, FaMapMarkerAlt, FaAlignLeft } from "react-icons/fa"

const DayEventsModal = ({ isOpen, onClose, selectedDate, events, onEditEvent, onDeleteEvent }) => {
  const [selectedEvent, setSelectedEvent] = useState(null)

  if (!isOpen || !selectedDate) return null

  const formatDate = (date) => {
    return date.toLocaleDateString('fr-FR', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  const formatTime = (dateString) => {
    if (!dateString) return ''
    const date = new Date(dateString)
    return date.toLocaleTimeString('fr-FR', {
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const handleEventClick = (event) => {
    setSelectedEvent(selectedEvent?.id === event.id ? null : event)
  }

  const handleEdit = (event) => {
    onEditEvent(event)
    onClose()
  }

  const handleDelete = (event) => {
    if (confirm(`Supprimer l'événement "${event.summary}" ?`)) {
      onDeleteEvent(event.id)
      onClose()
    }
  }

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[9999] flex items-center justify-center p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          className="bg-gradient-to-br from-[#2a2d3e] to-[#212332] rounded-3xl w-full max-w-sm sm:max-w-md md:max-w-lg shadow-2xl border border-gray-600/20 max-h-[90vh] overflow-y-auto scrollbar-hide"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="sticky top-0 bg-gradient-to-r from-[#2a2d3e] to-[#212332] border-b border-gray-600/20 p-4 sm:p-6 z-10 backdrop-blur-sm">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-[#3A6FF8] rounded-xl flex items-center justify-center">
                  <span className="text-white font-bold text-lg">
                    {selectedDate.getDate()}
                  </span>
                </div>
                <div>
                  <h2 className="text-xl font-bold text-white">Événements</h2>
                  <p className="text-gray-400 text-sm capitalize">{formatDate(selectedDate)}</p>
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
          <div className="p-4 sm:p-6">
            {events.length === 0 ? (
              <div className="text-center py-12">
                <div className="w-16 h-16 bg-gray-700/30 rounded-full flex items-center justify-center mx-auto mb-4">
                  <FaAlignLeft className="w-6 h-6 text-gray-500" />
                </div>
                <p className="text-gray-400 text-lg">Aucun événement</p>
                <p className="text-gray-500 text-sm">Cette journée est libre</p>
              </div>
            ) : (
              <div className="space-y-3">
                {events.map((event, index) => (
                  <motion.div
                    key={event.id || index}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className={`bg-gradient-to-r from-[#3a3d4e] to-[#2f3240] rounded-xl p-4 border transition-all duration-200 cursor-pointer ${
                      selectedEvent?.id === event.id 
                        ? 'border-[#3A6FF8] shadow-lg shadow-[#3A6FF8]/20' 
                        : 'border-gray-600/30 hover:border-gray-500/50'
                    }`}
                    onClick={() => handleEventClick(event)}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-white text-base truncate mb-2">
                          {event.summary || 'Sans titre'}
                        </h3>
                        
                        {/* Time */}
                        {(event.start?.dateTime || event.start?.date) && (
                          <div className="flex items-center gap-2 text-gray-300 text-sm mb-2">
                            <FaClock className="w-3 h-3 text-[#3A6FF8]" />
                            <span>
                              {event.start?.dateTime ? (
                                `${formatTime(event.start.dateTime)} - ${formatTime(event.end?.dateTime)}`
                              ) : (
                                'Toute la journée'
                              )}
                            </span>
                          </div>
                        )}

                        {/* Location */}
                        {event.location && (
                          <div className="flex items-center gap-2 text-gray-300 text-sm mb-2">
                            <FaMapMarkerAlt className="w-3 h-3 text-[#3A6FF8]" />
                            <span className="truncate">{event.location}</span>
                          </div>
                        )}

                        {/* Description */}
                        {event.description && (
                          <div className="flex items-start gap-2 text-gray-400 text-sm">
                            <FaAlignLeft className="w-3 h-3 text-[#3A6FF8] mt-0.5 flex-shrink-0" />
                            <p className="line-clamp-2">{event.description}</p>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Actions - Visible when selected */}
                    <AnimatePresence>
                      {selectedEvent?.id === event.id && (
                        <motion.div
                          initial={{ opacity: 0, height: 0, marginTop: 0, paddingTop: 0 }}
                          animate={{ opacity: 1, height: 'auto', marginTop: 16, paddingTop: 16 }}
                          exit={{ opacity: 0, height: 0, marginTop: 0, paddingTop: 0 }}
                          transition={{ duration: 0.3, ease: "easeInOut" }}
                          className="flex gap-2 border-t border-gray-600/30 overflow-hidden"
                        >
                          <button
                            onClick={(e) => {
                              e.stopPropagation()
                              handleEdit(event)
                            }}
                            className="flex items-center gap-2 bg-[#3A6FF8] hover:bg-[#2952d3] text-white px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 transform hover:scale-105"
                          >
                            <FaEdit className="w-3 h-3" />
                            Modifier
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation()
                              handleDelete(event)
                            }}
                            className="flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 transform hover:scale-105"
                          >
                            <FaTrash className="w-3 h-3" />
                            Supprimer
                          </button>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}

export default DayEventsModal