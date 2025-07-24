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

                {/* Section Contact & Support */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                    className="bg-gradient-to-br from-[#2a2d3e] to-[#212332] rounded-3xl p-6 sm:p-8 shadow-2xl border border-gray-600/20"
                >
                    <div className="flex items-center gap-3 mb-6">
                        <div className="w-10 h-10 bg-gradient-to-r from-[#3A6FF8] to-[#2952d3] rounded-xl flex items-center justify-center">
                            <FaExclamationTriangle className="w-5 h-5 text-white" />
                        </div>
                        <div>
                            <h3 className="text-xl font-bold text-white">Contact & Support</h3>
                            <p className="text-gray-400 text-sm">Un problème ? Une suggestion ? Contactez-nous</p>
                        </div>
                    </div>

                    {/* Formulaire */}
                    <form onSubmit={handleSubmit} className="space-y-6">
                        {/* Nom et Prénom */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-2">
                                    Nom
                                </label>
                                <input
                                    type="text"
                                    value={formData.nom}
                                    onChange={(e) => handleInputChange('nom', e.target.value)}
                                    className="w-full bg-gray-700/30 border border-gray-600/30 rounded-xl px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#3A6FF8]/50 focus:border-[#3A6FF8]/50 transition-all"
                                    placeholder="Votre nom de famille"
                                    disabled={isSubmitting}
                                    required
                                />
                            </div>
                            
                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-2">
                                    Prénom
                                </label>
                                <input
                                    type="text"
                                    value={formData.prenom}
                                    onChange={(e) => handleInputChange('prenom', e.target.value)}
                                    className="w-full bg-gray-700/30 border border-gray-600/30 rounded-xl px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#3A6FF8]/50 focus:border-[#3A6FF8]/50 transition-all"
                                    placeholder="Votre prénom"
                                    disabled={isSubmitting}
                                    required
                                />
                            </div>
                        </div>

                        {/* Description du problème */}
                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2">
                                Description du problème ou suggestion
                            </label>
                            <textarea
                                value={formData.description}
                                onChange={(e) => handleInputChange('description', e.target.value)}
                                className="w-full bg-gray-700/30 border border-gray-600/30 rounded-xl px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#3A6FF8]/50 focus:border-[#3A6FF8]/50 resize-none transition-all"
                                rows={5}
                                placeholder="Décrivez votre problème, votre bug rencontré, ou votre suggestion d'amélioration..."
                                disabled={isSubmitting}
                                required
                            />
                            <p className="text-xs text-gray-400 mt-2">
                                💡 Plus votre description est détaillée, plus nous pourrons vous aider rapidement.
                            </p>
                        </div>

                        {/* Status messages */}
                        {submitStatus === 'success' && (
                            <motion.div
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className="flex items-center gap-3 p-4 bg-green-600/20 border border-green-500/30 rounded-xl text-green-300"
                            >
                                <FaCheckCircle className="w-5 h-5 flex-shrink-0" />
                                <div>
                                    <p className="font-medium">Message envoyé avec succès !</p>
                                    <p className="text-sm text-green-400/80">Nous vous répondrons dans les plus brefs délais.</p>
                                </div>
                            </motion.div>
                        )}

                        {submitStatus === 'error' && (
                            <motion.div
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className="flex items-center gap-3 p-4 bg-red-600/20 border border-red-500/30 rounded-xl text-red-300"
                            >
                                <FaExclamationTriangle className="w-5 h-5 flex-shrink-0" />
                                <div>
                                    <p className="font-medium">Erreur lors de l'envoi</p>
                                    <p className="text-sm text-red-400/80">Veuillez vérifier les champs et réessayer.</p>
                                </div>
                            </motion.div>
                        )}

                        {/* Bouton d'envoi */}
                        <div className="flex justify-end pt-2">
                            <button
                                type="submit"
                                disabled={isSubmitting || !formData.nom.trim() || !formData.prenom.trim() || !formData.description.trim()}
                                className="flex items-center gap-2 bg-gradient-to-r from-[#3A6FF8] to-[#2952d3] hover:from-[#2952d3] hover:to-[#1e3ba8] text-white px-6 py-3 rounded-xl font-medium transition-all duration-200 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 shadow-lg"
                            >
                                {isSubmitting ? (
                                    <>
                                        <FaSpinner className="w-4 h-4 animate-spin" />
                                        Envoi en cours...
                                    </>
                                ) : (
                                    <>
                                        <FaPaperPlane className="w-4 h-4" />
                                        Envoyer le message
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