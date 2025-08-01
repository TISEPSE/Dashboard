"use client"

import { motion } from 'framer-motion'
import { FaRedo, FaExclamationTriangle } from 'react-icons/fa'

export default function NotFound() {
  const handleReload = () => {
    window.location.reload()
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0f0f23] via-[#1a1a2e] to-[#16213e] flex flex-col justify-center items-center p-6">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center"
      >
        {/* Icône d'erreur */}
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
          className="mb-8"
        >
          <div className="w-24 h-24 mx-auto bg-gradient-to-r from-red-500 to-red-600 rounded-full flex items-center justify-center shadow-2xl">
            <FaExclamationTriangle className="w-12 h-12 text-white" />
          </div>
        </motion.div>

        {/* Titre */}
        <motion.h1
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="text-4xl sm:text-5xl font-bold text-white mb-4"
        >
          404
        </motion.h1>

        {/* Description */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="text-lg text-slate-400 mb-8 max-w-md"
        >
          Oups, cette page n'existe pas ou une erreur s'est produite.
        </motion.p>

        {/* Bouton reload */}
        <motion.button
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          onClick={handleReload}
          className="flex items-center justify-center gap-3 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white px-6 py-3 rounded-xl font-medium transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105"
        >
          <FaRedo className="w-5 h-5" />
          <span>Recharger la page</span>
        </motion.button>
      </motion.div>
    </div>
  )
}
