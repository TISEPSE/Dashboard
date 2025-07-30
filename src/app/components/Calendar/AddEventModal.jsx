"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { FaTimes, FaCalendarAlt, FaClock, FaMapMarkerAlt, FaAlignLeft, FaSave, FaPalette } from "react-icons/fa"
import ColorPicker from "./ColorPicker"

const AddEventModal = ({ isOpen, onClose, onSave, selectedDate = null }) => {
  const [formData, setFormData] = useState({
    summary: '',
    description: '',
    location: '',
    startDate: selectedDate ? (() => {
      const year = selectedDate.getFullYear()
      const month = (selectedDate.getMonth() + 1).toString().padStart(2, '0')
      const day = selectedDate.getDate().toString().padStart(2, '0')
      return `${year}-${month}-${day}`
    })() : (() => {
      const today = new Date()
      const year = today.getFullYear()
      const month = (today.getMonth() + 1).toString().padStart(2, '0')
      const day = today.getDate().toString().padStart(2, '0')
      return `${year}-${month}-${day}`
    })(),
    startTime: '09:00',
    endDate: selectedDate ? (() => {
      const year = selectedDate.getFullYear()
      const month = (selectedDate.getMonth() + 1).toString().padStart(2, '0')
      const day = selectedDate.getDate().toString().padStart(2, '0')
      return `${year}-${month}-${day}`
    })() : (() => {
      const today = new Date()
      const year = today.getFullYear()
      const month = (today.getMonth() + 1).toString().padStart(2, '0')
      const day = today.getDate().toString().padStart(2, '0')
      return `${year}-${month}-${day}`
    })(),
    endTime: '10:00',
    colorId: '1',
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  // Synchroniser les dates et heures avec le jour/heure sélectionné
  useEffect(() => {
    if (selectedDate && isOpen) {
      // Utiliser une méthode qui évite les problèmes de fuseau horaire
      const year = selectedDate.getFullYear()
      const month = (selectedDate.getMonth() + 1).toString().padStart(2, '0')
      const day = selectedDate.getDate().toString().padStart(2, '0')
      const selectedDateString = `${year}-${month}-${day}`
      
      // Si une heure spécifique est sélectionnée (pas seulement la date), utiliser cette heure
      let startTime = '09:00'
      let endTime = '10:00'
      
      if (selectedDate.getHours() !== 0 || selectedDate.getMinutes() !== 0) {
        // Une heure spécifique a été sélectionnée
        const selectedHour = selectedDate.getHours()
        const selectedMinute = selectedDate.getMinutes()
        
        startTime = `${selectedHour.toString().padStart(2, '0')}:${selectedMinute.toString().padStart(2, '0')}`
        
        // Heure de fin = heure de début + 1 heure
        const endDate = new Date(selectedDate)
        endDate.setHours(selectedHour + 1, selectedMinute)
        endTime = `${endDate.getHours().toString().padStart(2, '0')}:${endDate.getMinutes().toString().padStart(2, '0')}`
      }
      
      setFormData(prev => ({
        ...prev,
        startDate: selectedDateString,
        endDate: selectedDateString,
        startTime: startTime,
        endTime: endTime
      }))
    }
  }, [selectedDate, isOpen])

  // Empêcher le scroll de l'arrière-plan quand le modal est ouvert 
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

  const handleInputChange = (field, value) => {
    setFormData(prev => {
      const newData = {
        ...prev,
        [field]: value
      }
      
      // Si on change l'heure de début, ajuster automatiquement l'heure de fin (+1h)
      if (field === 'startTime') {
        const [hours, minutes] = value.split(':').map(Number)
        const endHours = (hours + 1) % 24 // Gestion du passage à minuit
        const endTime = `${endHours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`
        newData.endTime = endTime
        
        // Si on dépasse minuit, ajuster la date de fin
        if (hours + 1 >= 24) {
          const startDate = new Date(prev.startDate)
          const endDate = new Date(startDate)
          endDate.setDate(endDate.getDate() + 1)
          const endDateString = endDate.toISOString().split('T')[0]
          newData.endDate = endDateString
        } else {
          // Sinon, garder la même date que le début
          newData.endDate = prev.startDate
        }
      }
      
      return newData
    })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      // Validation
      if (!formData.summary.trim()) {
        throw new Error('Le titre est obligatoire')
      }

      // Construire les dates ISO
      const startISO = `${formData.startDate}T${formData.startTime}:00`
      const endISO = `${formData.endDate}T${formData.endTime}:00`

      // Vérifier que la date de fin est après la date de début
      if (new Date(endISO) <= new Date(startISO)) {
        throw new Error('La date de fin doit être postérieure à la date de début')
      }

      const eventData = {
        summary: formData.summary.trim(),
        description: formData.description.trim(),
        location: formData.location.trim(),
        start: startISO,
        end: endISO,
        colorId: formData.colorId,
      }

      await onSave(eventData)
      
      // Attendre que l'événement soit visible avant de fermer le modal
      await new Promise(resolve => setTimeout(resolve, 600))
      
      // Réinitialiser le formulaire
      setFormData({
        summary: '',
        description: '',
        location: '',
        startDate: selectedDate ? selectedDate.toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
        startTime: '09:00',
        endDate: selectedDate ? selectedDate.toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
        endTime: '10:00',
        colorId: '1',
      })
      
      onClose()
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  if (!isOpen) return null

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
          className="bg-gradient-to-br from-[#2a2d3e] to-[#212332] rounded-3xl w-full max-w-sm sm:max-w-md md:max-w-lg lg:max-w-xl xl:max-w-2xl shadow-2xl border border-gray-600/20 max-h-[90vh] overflow-y-auto"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-600/20">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-r from-green-600 to-emerald-600 rounded-xl flex items-center justify-center">
                <FaCalendarAlt className="w-5 h-5 text-white" />
              </div>
              <h2 className="text-xl font-bold text-white">Nouvel Événement</h2>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-full hover:bg-gray-700/50 transition-colors text-gray-400 hover:text-white"
            >
              <FaTimes className="w-4 h-4" />
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="p-4 sm:p-6">
            {error && (
              <div className="mb-6 p-4 bg-red-500/20 border border-red-500/30 rounded-xl text-red-300 text-sm">
                {error}
              </div>
            )}

            <div className="space-y-4 sm:space-y-6">
              {/* Titre */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Titre
                </label>
                <input
                  type="text"
                  value={formData.summary}
                  onChange={(e) => handleInputChange('summary', e.target.value)}
                  className="w-full bg-gray-700/30 border border-gray-600/30 rounded-xl px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50"
                  placeholder="Nom de l'événement"
                  required
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  <FaAlignLeft className="inline w-4 h-4 mr-2" />
                  Description
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  className="w-full bg-gray-700/30 border border-gray-600/30 rounded-xl px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 resize-none h-[120px]"
                  rows={6}
                  placeholder="Description de l'événement (optionnel)"
                />
              </div>

              {/* Lieu */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  <FaMapMarkerAlt className="inline w-4 h-4 mr-2" />
                  Lieu
                </label>
                <input
                  type="text"
                  value={formData.location}
                  onChange={(e) => handleInputChange('location', e.target.value)}
                  className="w-full bg-gray-700/30 border border-gray-600/30 rounded-xl px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50"
                  placeholder="Lieu de l'événement (optionnel)"
                />
              </div>

              {/* Couleur */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-3">
                  <FaPalette className="inline w-4 h-4 mr-2" />
                  Couleur de l'événement
                </label>
                <ColorPicker
                  selectedColorId={formData.colorId}
                  onColorChange={(colorId) => handleInputChange('colorId', colorId)}
                />
              </div>

              {/* Date et heure de début */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Date de début
                  </label>
                  <input
                    type="date"
                    value={formData.startDate}
                    onChange={(e) => handleInputChange('startDate', e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'ArrowUp' || e.key === 'ArrowDown') {
                        e.preventDefault()
                        const currentDate = new Date(formData.startDate)
                        const delta = e.key === 'ArrowUp' ? 1 : -1
                        currentDate.setDate(currentDate.getDate() + delta)
                        
                        const newDateString = currentDate.toISOString().split('T')[0]
                        handleInputChange('startDate', newDateString)
                        
                        // Sync end date if it's the same
                        if (formData.startDate === formData.endDate) {
                          handleInputChange('endDate', newDateString)
                        }
                      }
                    }}
                    className="w-full bg-gray-700/30 border border-gray-600/30 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 cursor-pointer hover:bg-gray-600/30 transition-colors"
                    style={{ colorScheme: 'dark' }}
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    <FaClock className="inline w-4 h-4 mr-2" />
                    Heure de début
                  </label>
                  <div className="flex gap-2">
                    <select
                      value={formData.startTime.split(':')[0]}
                      onChange={(e) => {
                        const hours = e.target.value
                        const minutes = formData.startTime.split(':')[1] || '00'
                        handleInputChange('startTime', `${hours}:${minutes}`)
                      }}
                      className="flex-1 bg-gray-700/30 border border-gray-600/30 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 cursor-pointer"
                      style={{ colorScheme: 'dark' }}
                      required
                    >
                      {Array.from({ length: 24 }, (_, i) => (
                        <option key={i} value={i.toString().padStart(2, '0')}>
                          {i.toString().padStart(2, '0')}h
                        </option>
                      ))}
                    </select>
                    <select
                      value={formData.startTime.split(':')[1] || '00'}
                      onChange={(e) => {
                        const hours = formData.startTime.split(':')[0]
                        const minutes = e.target.value
                        handleInputChange('startTime', `${hours}:${minutes}`)
                      }}
                      className="flex-1 bg-gray-700/30 border border-gray-600/30 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 cursor-pointer"
                      style={{ colorScheme: 'dark' }}
                      required
                    >
                      {['00', '15', '30', '45'].map(minute => (
                        <option key={minute} value={minute}>{minute}min</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              {/* Date et heure de fin */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Date de fin
                  </label>
                  <input
                    type="date"
                    value={formData.endDate}
                    onChange={(e) => handleInputChange('endDate', e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'ArrowUp' || e.key === 'ArrowDown') {
                        e.preventDefault()
                        const currentDate = new Date(formData.endDate)
                        const delta = e.key === 'ArrowUp' ? 1 : -1
                        currentDate.setDate(currentDate.getDate() + delta)
                        
                        const newDateString = currentDate.toISOString().split('T')[0]
                        handleInputChange('endDate', newDateString)
                      }
                    }}
                    className="w-full bg-gray-700/30 border border-gray-600/30 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 cursor-pointer hover:bg-gray-600/30 transition-colors"
                    style={{ colorScheme: 'dark' }}
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    <FaClock className="inline w-4 h-4 mr-2" />
                    Heure de fin
                  </label>
                  <div className="flex gap-2">
                    <select
                      value={formData.endTime.split(':')[0]}
                      onChange={(e) => {
                        const hours = e.target.value
                        const minutes = formData.endTime.split(':')[1] || '00'
                        handleInputChange('endTime', `${hours}:${minutes}`)
                      }}
                      className="flex-1 bg-gray-700/30 border border-gray-600/30 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 cursor-pointer"
                      style={{ colorScheme: 'dark' }}
                      required
                    >
                      {Array.from({ length: 24 }, (_, i) => (
                        <option key={i} value={i.toString().padStart(2, '0')}>
                          {i.toString().padStart(2, '0')}h
                        </option>
                      ))}
                    </select>
                    <select
                      value={formData.endTime.split(':')[1] || '00'}
                      onChange={(e) => {
                        const hours = formData.endTime.split(':')[0]
                        const minutes = e.target.value
                        handleInputChange('endTime', `${hours}:${minutes}`)
                      }}
                      className="flex-1 bg-gray-700/30 border border-gray-600/30 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 cursor-pointer"
                      style={{ colorScheme: 'dark' }}
                      required
                    >
                      {['00', '15', '30', '45'].map(minute => (
                        <option key={minute} value={minute}>{minute}min</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex flex-col sm:flex-row gap-3 mt-6 sm:mt-8">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 bg-gray-600/30 text-gray-300 py-3 rounded-xl font-medium hover:bg-gray-600/50 transition-all duration-200"
                disabled={loading}
              >
                Annuler
              </button>
              <button
                type="submit"
                disabled={loading || !formData.summary.trim()}
                className="flex-1 bg-gradient-to-r from-green-600 to-emerald-600 text-white py-3 rounded-xl font-medium hover:from-green-700 hover:to-emerald-700 transition-all duration-200 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 flex items-center justify-center gap-2"
              >
                {loading ? (
                  <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
                ) : (
                  <>
                    <FaSave className="w-4 h-4" />
                    Créer l'événement
                  </>
                )}
              </button>
            </div>
          </form>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}

export default AddEventModal