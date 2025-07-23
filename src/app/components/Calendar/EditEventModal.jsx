"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { FaTimes, FaCalendarAlt, FaMapMarkerAlt, FaAlignLeft, FaClock } from "react-icons/fa"

const EditEventModal = ({ isOpen, onClose, onSave, event }) => {
  const [formData, setFormData] = useState({
    summary: '',
    description: '',
    location: '',
    start: '',
    end: ''
  })
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    if (event && isOpen) {
      // Préparer les données du formulaire
      const startDate = event.start?.dateTime ? 
        new Date(event.start.dateTime).toISOString().slice(0, 16) : 
        ''
      const endDate = event.end?.dateTime ? 
        new Date(event.end.dateTime).toISOString().slice(0, 16) : 
        ''

      setFormData({
        summary: event.summary || '',
        description: event.description || '',
        location: event.location || '',
        start: startDate,
        end: endDate
      })
    }
  }, [event, isOpen])

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!formData.summary.trim() || !formData.start || !formData.end) {
      alert('Veuillez remplir tous les champs obligatoires')
      return
    }

    if (new Date(formData.start) >= new Date(formData.end)) {
      alert('La date de fin doit être après la date de début')
      return
    }

    setIsLoading(true)
    try {
      await onSave({
        ...formData,
        id: event.id,
        start: new Date(formData.start).toISOString(),
        end: new Date(formData.end).toISOString()
      })
      onClose()
    } catch (error) {
      console.error('Erreur lors de la modification:', error)
      alert(`Erreur lors de la modification: ${error.message}`)
    } finally {
      setIsLoading(false)
    }
  }

  const handleClose = () => {
    if (!isLoading) {
      onClose()
    }
  }

  if (!isOpen || !event) return null

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[9999] flex items-center justify-center p-4"
        onClick={handleClose}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          className="bg-gradient-to-br from-[#2a2d3e] to-[#212332] rounded-3xl w-full max-w-md shadow-2xl border border-gray-600/20 max-h-[90vh] overflow-y-auto scrollbar-hide"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="sticky top-0 bg-gradient-to-r from-[#2a2d3e] to-[#212332] border-b border-gray-600/20 p-6 z-10 backdrop-blur-sm">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-[#3A6FF8] rounded-xl flex items-center justify-center">
                  <FaCalendarAlt className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-white">Modifier l'événement</h2>
                  <p className="text-gray-400 text-sm">Mettez à jour les informations</p>
                </div>
              </div>
              <button
                onClick={handleClose}
                disabled={isLoading}
                className="p-2 rounded-full hover:bg-gray-700/50 transition-colors text-gray-400 hover:text-white disabled:opacity-50"
              >
                <FaTimes className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            {/* Titre */}
            <div>
              <label className="block text-gray-300 text-sm font-medium mb-2">
                Titre *
              </label>
              <div className="relative">
                <FaCalendarAlt className="absolute left-3 top-3 w-4 h-4 text-[#3A6FF8]" />
                <input
                  type="text"
                  value={formData.summary}
                  onChange={(e) => setFormData(prev => ({ ...prev, summary: e.target.value }))}
                  className="w-full bg-[#3a3d4e] border border-gray-600/50 rounded-xl pl-10 pr-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#3A6FF8] focus:border-transparent"
                  placeholder="Nom de l'événement"
                  disabled={isLoading}
                  required
                />
              </div>
            </div>

            {/* Dates */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-gray-300 text-sm font-medium mb-2">
                  Début *
                </label>
                <div className="relative">
                  <FaClock className="absolute left-3 top-3 w-4 h-4 text-[#3A6FF8]" />
                  <input
                    type="datetime-local"
                    value={formData.start}
                    onChange={(e) => setFormData(prev => ({ ...prev, start: e.target.value }))}
                    className="w-full bg-[#3a3d4e] border border-gray-600/50 rounded-xl pl-10 pr-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-[#3A6FF8] focus:border-transparent"
                    disabled={isLoading}
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-gray-300 text-sm font-medium mb-2">
                  Fin *
                </label>
                <div className="relative">
                  <FaClock className="absolute left-3 top-3 w-4 h-4 text-[#3A6FF8]" />
                  <input
                    type="datetime-local"
                    value={formData.end}
                    onChange={(e) => setFormData(prev => ({ ...prev, end: e.target.value }))}
                    className="w-full bg-[#3a3d4e] border border-gray-600/50 rounded-xl pl-10 pr-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-[#3A6FF8] focus:border-transparent"
                    disabled={isLoading}
                    required
                  />
                </div>
              </div>
            </div>

            {/* Lieu */}
            <div>
              <label className="block text-gray-300 text-sm font-medium mb-2">
                Lieu
              </label>
              <div className="relative">
                <FaMapMarkerAlt className="absolute left-3 top-3 w-4 h-4 text-[#3A6FF8]" />
                <input
                  type="text"
                  value={formData.location}
                  onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
                  className="w-full bg-[#3a3d4e] border border-gray-600/50 rounded-xl pl-10 pr-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#3A6FF8] focus:border-transparent"
                  placeholder="Adresse ou lieu"
                  disabled={isLoading}
                />
              </div>
            </div>

            {/* Description */}
            <div>
              <label className="block text-gray-300 text-sm font-medium mb-2">
                Description
              </label>
              <div className="relative">
                <FaAlignLeft className="absolute left-3 top-3 w-4 h-4 text-[#3A6FF8]" />
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  className="w-full bg-[#3a3d4e] border border-gray-600/50 rounded-xl pl-10 pr-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#3A6FF8] focus:border-transparent resize-none"
                  placeholder="Détails de l'événement..."
                  rows="3"
                  disabled={isLoading}
                />
              </div>
            </div>

            {/* Boutons */}
            <div className="flex gap-3 pt-4">
              <button
                type="button"
                onClick={handleClose}
                disabled={isLoading}
                className="flex-1 bg-gray-600 hover:bg-gray-700 text-white py-3 rounded-xl font-medium transition-all duration-200 disabled:opacity-50"
              >
                Annuler
              </button>
              <button
                type="submit"
                disabled={isLoading}
                className="flex-1 bg-[#3A6FF8] hover:bg-[#2952d3] text-white py-3 rounded-xl font-medium transition-all duration-200 transform hover:scale-105 disabled:opacity-50 disabled:transform-none"
              >
                {isLoading ? 'Modification...' : 'Modifier'}
              </button>
            </div>
          </form>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}

export default EditEventModal