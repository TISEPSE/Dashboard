"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { FaTimes, FaCalendarAlt, FaClock, FaMapMarkerAlt, FaAlignLeft, FaSave } from "react-icons/fa"

const AddEventModal = ({ isOpen, onClose, onSave, selectedDate = null }) => {
  const [formData, setFormData] = useState({
    summary: '',
    description: '',
    location: '',
    startDate: selectedDate ? selectedDate.toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
    startTime: '09:00',
    endDate: selectedDate ? selectedDate.toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
    endTime: '10:00',
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
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
      }

      await onSave(eventData)
      
      // Réinitialiser le formulaire
      setFormData({
        summary: '',
        description: '',
        location: '',
        startDate: selectedDate ? selectedDate.toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
        startTime: '09:00',
        endDate: selectedDate ? selectedDate.toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
        endTime: '10:00',
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
          className="bg-gradient-to-br from-[#2a2d3e] to-[#212332] rounded-3xl max-w-lg w-full shadow-2xl border border-gray-600/20"
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
          <form onSubmit={handleSubmit} className="p-6">
            {error && (
              <div className="mb-6 p-4 bg-red-500/20 border border-red-500/30 rounded-xl text-red-300 text-sm">
                {error}
              </div>
            )}

            <div className="space-y-6">
              {/* Titre */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Titre *
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
                  className="w-full bg-gray-700/30 border border-gray-600/30 rounded-xl px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 resize-none"
                  rows={3}
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

              {/* Date et heure de début */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Date de début
                  </label>
                  <input
                    type="date"
                    value={formData.startDate}
                    onChange={(e) => handleInputChange('startDate', e.target.value)}
                    className="w-full bg-gray-700/30 border border-gray-600/30 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    <FaClock className="inline w-4 h-4 mr-2" />
                    Heure de début
                  </label>
                  <input
                    type="time"
                    value={formData.startTime}
                    onChange={(e) => handleInputChange('startTime', e.target.value)}
                    className="w-full bg-gray-700/30 border border-gray-600/30 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50"
                    required
                  />
                </div>
              </div>

              {/* Date et heure de fin */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Date de fin
                  </label>
                  <input
                    type="date"
                    value={formData.endDate}
                    onChange={(e) => handleInputChange('endDate', e.target.value)}
                    className="w-full bg-gray-700/30 border border-gray-600/30 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    <FaClock className="inline w-4 h-4 mr-2" />
                    Heure de fin
                  </label>
                  <input
                    type="time"
                    value={formData.endTime}
                    onChange={(e) => handleInputChange('endTime', e.target.value)}
                    className="w-full bg-gray-700/30 border border-gray-600/30 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50"
                    required
                  />
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-3 mt-8">
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