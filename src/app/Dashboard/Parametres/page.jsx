"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { FaCog, FaExclamationTriangle, FaPaperPlane, FaCheckCircle, FaSpinner } from "react-icons/fa"

export default function Parametres() {
    const [formData, setFormData] = useState({
        nom: '',
        prenom: '',
        description: ''
    })
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [submitStatus, setSubmitStatus] = useState(null) // 'success' | 'error' | null

    const handleInputChange = (field, value) => {
        setFormData(prev => ({
            ...prev,
            [field]: value
        }))
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        
        // Validation
        if (!formData.nom.trim() || !formData.prenom.trim() || !formData.description.trim()) {
            setSubmitStatus('error')
            setTimeout(() => setSubmitStatus(null), 3000)
            return
        }

        setIsSubmitting(true)
        setSubmitStatus(null)

        try {
            const response = await fetch('/api/contact/discord', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(formData)
            })

            if (response.ok) {
                setSubmitStatus('success')
                setFormData({ nom: '', prenom: '', description: '' })
            } else {
                throw new Error('Erreur lors de l\'envoi')
            }
        } catch (error) {
            console.error('Erreur envoi formulaire:', error)
            setSubmitStatus('error')
        } finally {
            setIsSubmitting(false)
            setTimeout(() => setSubmitStatus(null), 5000)
        }
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-[#1a1d29] to-[#2a2d3e] p-4 sm:p-6 lg:p-8">
            <div className="max-w-4xl mx-auto">
                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-8"
                >
                    <div className="flex items-center gap-4 mb-4">
                        <div className="w-12 h-12 bg-gradient-to-r from-slate-600 to-gray-700 rounded-xl flex items-center justify-center">
                            <FaCog className="w-6 h-6 text-white" />
                        </div>
                        <div>
                            <h1 className="text-3xl font-bold text-white">Paramètres</h1>
                            <p className="text-gray-400">Configuration et support de l'application</p>
                        </div>
                    </div>
                </motion.div>

                {/* Section Autres paramètres */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="bg-gradient-to-br from-[#2a2d3e] to-[#212332] rounded-3xl p-6 sm:p-8 shadow-2xl border border-gray-600/20 mb-8"
                >
                    <div className="flex items-center gap-3 mb-4">
                        <div className="w-10 h-10 bg-gradient-to-r from-slate-600 to-slate-700 rounded-xl flex items-center justify-center">
                            <FaCog className="w-5 h-5 text-white" />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-white">Autres paramètres</h2>
                            <p className="text-gray-400 text-sm">Fonctionnalités à venir...</p>
                        </div>
                    </div>
                    
                    <div className="text-center py-8">
                        <p className="text-gray-500">D'autres options de configuration seront disponibles prochainement.</p>
                    </div>
                </motion.div>

                {/* Section Signaler un problème - Déplacée en bas et plus discrète */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                    className="bg-gradient-to-br from-gray-800/30 to-gray-900/30 rounded-2xl p-4 sm:p-6 shadow-xl border border-gray-700/30"
                >
                    <div className="flex items-center gap-2 mb-4">
                        <div className="w-8 h-8 bg-gradient-to-r from-gray-600 to-gray-700 rounded-lg flex items-center justify-center">
                            <FaExclamationTriangle className="w-4 h-4 text-gray-300" />
                        </div>
                        <div>
                            <h3 className="text-lg font-semibold text-gray-300">Signaler un problème</h3>
                            <p className="text-gray-500 text-xs">Un bug ? Une difficulté ?</p>
                        </div>
                    </div>

                    {/* Formulaire */}
                    <form onSubmit={handleSubmit} className="space-y-4">
                        {/* Nom et Prénom */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <div>
                                <label className="block text-xs font-medium text-gray-400 mb-1">
                                    Nom
                                </label>
                                <input
                                    type="text"
                                    value={formData.nom}
                                    onChange={(e) => handleInputChange('nom', e.target.value)}
                                    className="w-full bg-gray-800/40 border border-gray-700/40 rounded-lg px-3 py-2 text-gray-200 placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-gray-500/50 focus:border-gray-500/50 transition-all text-sm"
                                    placeholder="ex: Dupont"
                                    disabled={isSubmitting}
                                    required
                                />
                            </div>
                            
                            <div>
                                <label className="block text-xs font-medium text-gray-400 mb-1">
                                    Prénom
                                </label>
                                <input
                                    type="text"
                                    value={formData.prenom}
                                    onChange={(e) => handleInputChange('prenom', e.target.value)}
                                    className="w-full bg-gray-800/40 border border-gray-700/40 rounded-lg px-3 py-2 text-gray-200 placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-gray-500/50 focus:border-gray-500/50 transition-all text-sm"
                                    placeholder="ex: Jean"
                                    disabled={isSubmitting}
                                    required
                                />
                            </div>
                        </div>

                        {/* Description du problème */}
                        <div>
                            <label className="block text-xs font-medium text-gray-400 mb-1">
                                Description du problème
                            </label>
                            <textarea
                                value={formData.description}
                                onChange={(e) => handleInputChange('description', e.target.value)}
                                className="w-full bg-gray-800/40 border border-gray-700/40 rounded-lg px-3 py-2 text-gray-200 placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-gray-500/50 focus:border-gray-500/50 resize-none transition-all text-sm"
                                rows={4}
                                placeholder="Essayez de décrire votre problème le plus précisément possible..."
                                disabled={isSubmitting}
                                required
                            />
                            <p className="text-xs text-gray-600 mt-1">
                                Plus votre description est détaillée, plus nous pourrons vous aider rapidement.
                            </p>
                        </div>

                        {/* Status messages */}
                        {submitStatus === 'success' && (
                            <motion.div
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className="flex items-center gap-2 p-3 bg-green-500/10 border border-green-500/20 rounded-lg text-green-400 text-sm"
                            >
                                <FaCheckCircle className="w-4 h-4" />
                                <span>Signalement envoyé avec succès !</span>
                            </motion.div>
                        )}

                        {submitStatus === 'error' && (
                            <motion.div
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className="flex items-center gap-2 p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-sm"
                            >
                                <FaExclamationTriangle className="w-4 h-4" />
                                <span>Erreur lors de l'envoi. Réessayez.</span>
                            </motion.div>
                        )}

                        {/* Bouton d'envoi */}
                        <div className="flex justify-end">
                            <button
                                type="submit"
                                disabled={isSubmitting || !formData.nom.trim() || !formData.prenom.trim() || !formData.description.trim()}
                                className="flex items-center gap-2 bg-gray-700 hover:bg-gray-600 text-gray-200 px-4 py-2 rounded-lg font-medium transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                            >
                                {isSubmitting ? (
                                    <>
                                        <FaSpinner className="w-3 h-3 animate-spin" />
                                        Envoi...
                                    </>
                                ) : (
                                    <>
                                        <FaPaperPlane className="w-3 h-3" />
                                        Envoyer
                                    </>
                                )}
                            </button>
                        </div>
                    </form>
                </motion.div>
            </div>
        </div>
    )
}