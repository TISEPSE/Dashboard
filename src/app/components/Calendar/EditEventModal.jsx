"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { FaTimes, FaCalendarAlt, FaMapMarkerAlt, FaAlignLeft, FaClock, FaPalette, FaTrash } from "react-icons/fa"
import ColorPicker from "./ColorPicker"

const EditEventModal = ({ isOpen, onClose, onSave, onDelete, event }) => {
  const [formData, setFormData] = useState({
    summary: '',
    description: '',
    location: '',
    startDate: '',
    startTime: '',
    endDate: '',
    endTime: '',
    colorId: '1'
  })
  const [isLoading, setIsLoading] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)

  useEffect(() => {
    if (event && isOpen) {
      // Préparer les données du formulaire
      let startDate = '', startTime = '', endDate = '', endTime = ''
      
      if (event.start?.dateTime) {
        const start = new Date(event.start.dateTime)
        startDate = start.toISOString().split('T')[0]
        startTime = start.toTimeString().slice(0, 5)
      }
      
      if (event.end?.dateTime) {
        const end = new Date(event.end.dateTime)
        endDate = end.toISOString().split('T')[0]
        endTime = end.toTimeString().slice(0, 5)
      }

      setFormData({
        summary: event.summary || '',
        description: event.description || '',
        location: event.location || '',
        startDate,
        startTime,
        endDate,
        endTime,
        colorId: event.colorId || '1'
      })
    }
  }, [event, isOpen])

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

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!formData.summary.trim() || !formData.startDate || !formData.startTime || !formData.endDate || !formData.endTime) {
      alert('Veuillez remplir tous les champs obligatoires')
      return
    }

    // Construire les dates ISO
    const startISO = `${formData.startDate}T${formData.startTime}:00`
    const endISO = `${formData.endDate}T${formData.endTime}:00`

    if (new Date(endISO) <= new Date(startISO)) {
      alert('La date de fin doit être après la date de début')
      return
    }

    setIsLoading(true)
    try {
      const eventDataToSave = {
        ...formData,
        id: event.id,
        start: startISO,
        end: endISO
      }
      await onSave(eventDataToSave)
      
      // Attendre que les modifications soient visibles avant de fermer le modal
      await new Promise(resolve => setTimeout(resolve, 600))
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
      setShowDeleteConfirm(false)
      onClose()
    }
  }

  const handleDelete = async () => {
    if (!onDelete || !event) return
    
    setIsLoading(true)
    try {
      await onDelete(event.id)
      setShowDeleteConfirm(false)
      onClose()
    } catch (error) {
      console.error('Erreur lors de la suppression:', error)
      alert(`Erreur lors de la suppression: ${error.message}`)
    } finally {
      setIsLoading(false)
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
          className="bg-gradient-to-br from-[#2a2d3e] to-[#212332] rounded-3xl w-full max-w-2xl shadow-2xl border border-gray-600/20 max-h-[90vh] overflow-y-auto scrollbar-hide"
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
                </div>
              </div>
              <div className="flex items-center gap-2">
                {/* Bouton de suppression dans le header */}
                {!showDeleteConfirm ? (
                  <button
                    type="button"
                    onClick={() => setShowDeleteConfirm(true)}
                    disabled={isLoading}
                    className="p-2 rounded-full hover:bg-red-600/20 transition-colors text-red-400 hover:text-red-300 disabled:opacity-50"
                    title="Supprimer l'événement"
                  >
                    <FaTrash className="w-4 h-4" />
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={handleDelete}
                    disabled={isLoading}
                    className="px-3 py-2 rounded-lg bg-red-600 hover:bg-red-700 text-white text-sm font-medium transition-all duration-200 disabled:opacity-50 flex items-center gap-2"
                  >
                    <FaTrash className="w-3 h-3" />
                    Confirmer
                  </button>
                )}
                <button
                  onClick={handleClose}
                  disabled={isLoading}
                  className="p-2 rounded-full hover:bg-gray-700/50 transition-colors text-gray-400 hover:text-white disabled:opacity-50"
                >
                  <FaTimes className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            {/* Titre */}
            <div>
              <label className="block text-gray-300 text-sm font-medium mb-2">
                Titre
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

            {/* Programmation de l'événement */}
            <div className="space-y-6">
              <div className="text-center">
                <h3 className="text-lg font-semibold text-white mb-1">Programmation</h3>
                <p className="text-gray-400 text-sm">Définissez les dates et heures de votre événement</p>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Section Dates */}
                <div className="bg-[#3a3d4e]/40 rounded-xl p-5 border border-gray-600/30">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-8 h-8 bg-gray-600 rounded-lg flex items-center justify-center">
                      <FaCalendarAlt className="w-4 h-4 text-gray-200" />
                    </div>
                    <div>
                      <h4 className="text-gray-200 font-medium">Dates</h4>
                    </div>
                  </div>
                  
                  <div className="space-y-3">
                    <div>
                      <label className="block text-gray-300 text-sm font-medium mb-2">
                        Début
                      </label>
                      <input
                        type="date"
                        value={formData.startDate}
                        onChange={(e) => setFormData(prev => ({ ...prev, startDate: e.target.value }))}
                        className="w-full bg-[#4a4d5e] border border-gray-600/50 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-[#3A6FF8] focus:border-[#3A6FF8] transition-all"
                        disabled={isLoading}
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-gray-300 text-sm font-medium mb-2">
                        Fin
                      </label>
                      <input
                        type="date"
                        value={formData.endDate}
                        onChange={(e) => setFormData(prev => ({ ...prev, endDate: e.target.value }))}
                        className="w-full bg-[#4a4d5e] border border-gray-600/50 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-[#3A6FF8] focus:border-[#3A6FF8] transition-all"
                        disabled={isLoading}
                        required
                      />
                    </div>
                  </div>
                </div>

                {/* Section Heures */}
                <div className="bg-[#3a3d4e]/40 rounded-xl p-5 border border-gray-600/30">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-8 h-8 bg-gray-600 rounded-lg flex items-center justify-center">
                      <FaClock className="w-4 h-4 text-gray-200" />
                    </div>
                    <div>
                      <h4 className="text-gray-200 font-medium">Heures</h4>
                    </div>
                  </div>
                  
                  <div className="space-y-3">
                    <div>
                      <label className="block text-gray-300 text-sm font-medium mb-2">
                        Début
                      </label>
                      <input
                        type="time"
                        value={formData.startTime}
                        onChange={(e) => setFormData(prev => ({ ...prev, startTime: e.target.value }))}
                        className="w-full bg-[#4a4d5e] border border-gray-600/50 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-[#3A6FF8] focus:border-[#3A6FF8] transition-all"
                        disabled={isLoading}
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-gray-300 text-sm font-medium mb-2">
                        Fin
                      </label>
                      <input
                        type="time"
                        value={formData.endTime}
                        onChange={(e) => setFormData(prev => ({ ...prev, endTime: e.target.value }))}
                        className="w-full bg-[#4a4d5e] border border-gray-600/50 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-[#3A6FF8] focus:border-[#3A6FF8] transition-all"
                        disabled={isLoading}
                        required
                      />
                    </div>
                  </div>
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
                  className="w-full bg-[#3a3d4e] border border-gray-600/50 rounded-xl pl-10 pr-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#3A6FF8] focus:border-transparent resize-none h-[120px]"
                  placeholder="Détails de l'événement..."
                  rows="6"
                  disabled={isLoading}
                />
              </div>
            </div>

            {/* Couleur */}
            <div>
              <label className="block text-gray-300 text-sm font-medium mb-3">
                <FaPalette className="inline w-4 h-4 mr-2" />
                Couleur de l'événement
              </label>
              <ColorPicker
                selectedColorId={formData.colorId}
                onColorChange={(colorId) => setFormData(prev => ({ ...prev, colorId }))}
              />
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
                {isLoading ? 'Enregistrement...' : 'Enregistrer'}
              </button>
            </div>
          </form>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}

export default EditEventModal