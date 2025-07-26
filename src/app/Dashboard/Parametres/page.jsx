"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { FaCog, FaExclamationTriangle, FaPaperPlane, FaCheckCircle, FaSpinner, FaHome, FaBitcoin, FaComments, FaCloudSun, FaHeartbeat, FaChartLine, FaCalendarAlt, FaUser, FaEye, FaEyeSlash, FaUndo } from "react-icons/fa"
import { useNavbarPreferences } from '../../hooks/useNavbarPreferences'

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
        <div className="min-h-screen bg-gradient-to-br from-[#0f0f23] via-[#1a1a2e] to-[#16213e] p-4 sm:p-6 lg:p-8">
            <div className="max-w-6xl mx-auto">
                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-8"
                >
                    <div className="flex items-center gap-4 mb-4">
                        <div className="w-12 h-12 bg-gradient-to-r from-slate-600 to-slate-700 rounded-xl flex items-center justify-center shadow-lg">
                            <FaCog className="w-6 h-6 text-white" />
                        </div>
                        <div>
                            <h1 className="text-3xl font-bold text-white">Paramètres</h1>
                            <p className="text-slate-400">Configuration et support de l'application</p>
                        </div>
                    </div>
                </motion.div>

                {/* Section Personnalisation de la navbar */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="bg-gradient-to-br from-[#1e293b] to-[#0f172a] rounded-3xl p-6 sm:p-8 shadow-2xl border border-slate-700/50 mb-8 backdrop-blur-xl"
                >
                    <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-gradient-to-r from-slate-600 to-slate-700 rounded-xl flex items-center justify-center shadow-lg">
                                <FaEye className="w-5 h-5 text-white" />
                            </div>
                            <div>
                                <h2 className="text-xl font-bold text-white">Personnalisation de la navbar</h2>
                                <p className="text-slate-400 text-sm">Choisissez les pages à afficher dans votre navigation</p>
                            </div>
                        </div>
                        <button
                            onClick={resetToDefault}
                            className="flex items-center gap-2 px-4 py-2 bg-slate-800/50 hover:bg-slate-700/60 text-slate-300 rounded-xl transition-all duration-200 text-sm shadow-lg border border-slate-600/30"
                        >
                            <FaUndo className="w-3 h-3" />
                            Réinitialiser
                        </button>
                    </div>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                        {pageConfigs.map((page) => (
                            <div
                                key={page.key}
                                className={`relative p-6 rounded-xl border transition-all duration-200 cursor-pointer backdrop-blur-sm ${
                                    preferences[page.key] 
                                        ? 'bg-gradient-to-br from-slate-600/30 to-slate-700/30 border-slate-500/60 shadow-lg' 
                                        : 'bg-gradient-to-br from-slate-700/40 to-slate-800/40 border-slate-600/30 hover:border-slate-500/50 hover:from-slate-600/50 hover:to-slate-700/50'
                                }`}
                                onClick={() => togglePreference(page.key)}
                            >
                                <div className="flex items-start gap-3">
                                    <div className={`text-2xl transition-opacity duration-200 ${preferences[page.key] ? 'opacity-100' : 'opacity-50'}`}>
                                        {page.icon}
                                    </div>
                                    <div className="flex-1">
                                        <div className="flex items-center justify-between mb-2">
                                            <h3 className={`text-lg font-semibold transition-colors duration-200 ${
                                                preferences[page.key] ? 'text-white' : 'text-slate-400'
                                            }`}>
                                                {page.label}
                                            </h3>
                                            <div className={`transition-all duration-200 ${
                                                preferences[page.key] ? 'text-slate-300' : 'text-slate-500'
                                            }`}>
                                                {preferences[page.key] ? <FaEye className="w-5 h-5" /> : <FaEyeSlash className="w-5 h-5" />}
                                            </div>
                                        </div>
                                        <p className={`text-sm transition-colors duration-200 ${
                                            preferences[page.key] ? 'text-slate-300' : 'text-slate-500'
                                        }`}>
                                            {page.description}
                                        </p>
                                    </div>
                                </div>
                                
                            </div>
                        ))}
                    </div>
                    
                    <div className="mt-8 p-4 bg-slate-700/20 border border-slate-600/30 rounded-xl backdrop-blur-sm">
                        <p className="text-slate-300 text-sm flex items-center gap-2">
                            <FaCog className="w-4 h-4" />
                            Les modifications sont sauvegardées automatiquement et prennent effet immédiatement.
                        </p>
                    </div>
                </motion.div>

                {/* Section Contact & Support */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                    className="bg-gradient-to-br from-[#1e293b] to-[#0f172a] rounded-3xl p-6 sm:p-8 shadow-2xl border border-slate-700/50 backdrop-blur-xl"
                >
                    <div className="flex items-center gap-3 mb-6">
                        <div className="w-10 h-10 bg-gradient-to-r from-slate-600 to-slate-700 rounded-xl flex items-center justify-center shadow-lg">
                            <FaExclamationTriangle className="w-5 h-5 text-white" />
                        </div>
                        <div>
                            <h3 className="text-xl font-bold text-white">Contact & Support</h3>
                            <p className="text-slate-400 text-sm">Un problème ? Une suggestion ? Contactez-nous</p>
                        </div>
                    </div>

                    {/* Formulaire */}
                    <form onSubmit={handleSubmit} className="space-y-6">
                        {/* Nom et Prénom */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-300 mb-2">
                                    Nom
                                </label>
                                <input
                                    type="text"
                                    value={formData.nom}
                                    onChange={(e) => handleInputChange('nom', e.target.value)}
                                    className="w-full bg-slate-700/30 border border-slate-600/30 rounded-xl px-4 py-3 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-500/50 focus:border-slate-500/50 transition-all backdrop-blur-sm"
                                    placeholder="Votre nom de famille"
                                    disabled={isSubmitting}
                                    required
                                />
                            </div>
                            
                            <div>
                                <label className="block text-sm font-medium text-slate-300 mb-2">
                                    Prénom
                                </label>
                                <input
                                    type="text"
                                    value={formData.prenom}
                                    onChange={(e) => handleInputChange('prenom', e.target.value)}
                                    className="w-full bg-slate-700/30 border border-slate-600/30 rounded-xl px-4 py-3 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-500/50 focus:border-slate-500/50 transition-all backdrop-blur-sm"
                                    placeholder="Votre prénom"
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
                                className="w-full bg-slate-700/30 border border-slate-600/30 rounded-xl px-4 py-3 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 resize-none transition-all backdrop-blur-sm"
                                rows={5}
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
                                className="flex items-center gap-2 bg-gradient-to-r from-slate-600 to-slate-700 hover:from-slate-700 hover:to-slate-800 text-white px-6 py-3 rounded-xl font-medium transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
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