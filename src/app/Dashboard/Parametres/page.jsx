"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { FaCog, FaExclamationTriangle, FaPaperPlane, FaCheckCircle, FaSpinner, FaHome, FaBitcoin, FaComments, FaCloudSun, FaHeartbeat, FaChartLine, FaCalendarAlt, FaUser, FaEye, FaEyeSlash, FaUndo } from "react-icons/fa"
import { useNavbarPreferences } from '../../hooks/useNavbarPreferences'
import NavbarOrderSettings from '../../components/Settings/NavbarOrderSettings'

export default function Parametres() {
    const [formData, setFormData] = useState({
        nom: '',
        prenom: '',
        description: ''
    })
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [submitStatus, setSubmitStatus] = useState(null) // 'success' | 'error' | null
    const { preferences, togglePreference, resetToDefault } = useNavbarPreferences()

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

    // Configuration des pages disponibles
    const pageConfigs = [
        { key: 'home', label: 'Accueil', icon: <FaHome className="text-emerald-400" />, description: 'Page d\'accueil principale' },
        { key: 'crypto', label: 'Cryptos', icon: <FaBitcoin className="text-orange-400" />, description: 'Suivi des crypto-monnaies' },
        { key: 'message', label: 'Messages', icon: <FaComments className="text-blue-400" />, description: 'Messagerie et communications' },
        { key: 'meteo', label: 'Météo', icon: <FaCloudSun className="text-yellow-400" />, description: 'Prévisions météorologiques' },
        { key: 'sante', label: 'Santé', icon: <FaHeartbeat className="text-red-400" />, description: 'Suivi de santé et fitness' },
        { key: 'finances', label: 'Finances', icon: <FaChartLine className="text-green-400" />, description: 'Gestion financière' },
        { key: 'calendrier', label: 'Calendrier', icon: <FaCalendarAlt className="text-purple-400" />, description: 'Gestion du calendrier' },
        { key: 'profile', label: 'Profil', icon: <FaUser className="text-indigo-400" />, description: 'Profil utilisateur' },
    ]

    return (
        <div className="min-h-screen bg-gradient-to-br from-[#0f0f23] via-[#1a1a2e] to-[#16213e] p-3 sm:p-4 md:p-6 lg:p-8">
            <div className="max-w-6xl mx-auto">
                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-6 sm:mb-8"
                >
                    <div className="flex items-center gap-3 sm:gap-4 mb-4">
                        <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-r from-slate-600 to-slate-700 rounded-xl flex items-center justify-center shadow-lg flex-shrink-0">
                            <FaCog className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                        </div>
                        <div className="min-w-0 flex-1">
                            <h1 className="text-2xl sm:text-3xl font-bold text-white truncate">Paramètres</h1>
                            <p className="text-slate-400 text-sm sm:text-base">Configuration et support de l'application</p>
                        </div>
                    </div>
                </motion.div>


                {/* Section Personnalisation navbar */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="mb-6 sm:mb-8"
                >
                    <NavbarOrderSettings />
                </motion.div>

                {/* Section Contact & Support */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                    className="bg-gradient-to-br from-[#1e293b] to-[#0f172a] rounded-2xl sm:rounded-3xl p-4 sm:p-6 md:p-8 shadow-2xl border border-slate-700/50 backdrop-blur-xl"
                >
                    <div className="flex items-center gap-3 mb-6">
                        <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-r from-slate-600 to-slate-700 rounded-xl flex items-center justify-center shadow-lg flex-shrink-0">
                            <FaExclamationTriangle className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                        </div>
                        <div className="min-w-0 flex-1">
                            <h3 className="text-lg sm:text-xl font-bold text-white">Contact & Support</h3>
                            <p className="text-slate-400 text-xs sm:text-sm">Un problème ? Une suggestion ? Contactez-nous</p>
                        </div>
                    </div>

                    {/* Formulaire */}
                    <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
                        {/* Nom et Prénom */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-300 mb-2">
                                    Prénom
                                </label>
                                <input
                                    type="text"
                                    value={formData.prenom}
                                    onChange={(e) => handleInputChange('prenom', e.target.value)}
                                    className="w-full bg-slate-700/30 border border-slate-600/30 rounded-xl px-3 sm:px-4 py-2.5 sm:py-3 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-500/50 focus:border-slate-500/50 transition-all backdrop-blur-sm text-sm sm:text-base"
                                    placeholder="Votre prénom"
                                    disabled={isSubmitting}
                                    required
                                />
                            </div>
                            
                            <div>
                                <label className="block text-sm font-medium text-slate-300 mb-2">
                                    Nom
                                </label>
                                <input
                                    type="text"
                                    value={formData.nom}
                                    onChange={(e) => handleInputChange('nom', e.target.value)}
                                    className="w-full bg-slate-700/30 border border-slate-600/30 rounded-xl px-3 sm:px-4 py-2.5 sm:py-3 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-500/50 focus:border-slate-500/50 transition-all backdrop-blur-sm text-sm sm:text-base"
                                    placeholder="Votre nom de famille"
                                    disabled={isSubmitting}
                                    required
                                />
                            </div>
                        </div>

                        {/* Description du problème */}
                        <div>
                            <label className="block text-sm font-medium text-slate-300 mb-2">
                                Description du problème ou suggestion
                            </label>
                            <textarea
                                value={formData.description}
                                onChange={(e) => handleInputChange('description', e.target.value)}
                                className="w-full bg-slate-700/30 border border-slate-600/30 rounded-xl px-3 sm:px-4 py-2.5 sm:py-3 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 resize-none transition-all backdrop-blur-sm text-sm sm:text-base"
                                rows={4}
                                placeholder="Décrivez votre problème, votre bug rencontré, ou votre suggestion d'amélioration..."
                                disabled={isSubmitting}
                                required
                            />
                            <p className="text-xs text-slate-400 mt-2">
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
                                className="flex items-center justify-center gap-2 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white px-4 sm:px-6 py-2.5 sm:py-3 rounded-xl font-medium transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg text-sm sm:text-base w-full sm:w-auto"
                            >
                                {isSubmitting ? (
                                    <>
                                        <FaSpinner className="w-4 h-4 animate-spin" />
                                        <span className="whitespace-nowrap">Envoi en cours...</span>
                                    </>
                                ) : (
                                    <>
                                        <FaPaperPlane className="w-4 h-4" />
                                        <span className="whitespace-nowrap">Envoyer le message</span>
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