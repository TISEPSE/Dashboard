"use client"

import { useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { FaCheck, FaExclamationTriangle, FaInfo, FaTimes } from "react-icons/fa"

const Notification = ({ notification, onClose }) => {
  useEffect(() => {
    if (notification) {
      const timer = setTimeout(() => {
        onClose()
      }, 3000)
      
      return () => clearTimeout(timer)
    }
  }, [notification, onClose])

  if (!notification) return null

  const getIcon = () => {
    switch (notification.type) {
      case 'success':
        return <FaCheck className="w-5 h-5" />
      case 'warning':
        return <FaExclamationTriangle className="w-5 h-5" />
      case 'info':
        return <FaInfo className="w-5 h-5" />
      default:
        return <FaCheck className="w-5 h-5" />
    }
  }

  const getColors = () => {
    switch (notification.type) {
      case 'success':
        return 'from-green-600 to-green-700 text-white border-green-500'
      case 'warning':
        return 'from-yellow-600 to-yellow-700 text-white border-yellow-500'
      case 'info':
        return 'from-blue-600 to-blue-700 text-white border-blue-500'
      default:
        return 'from-green-600 to-green-700 text-white border-green-500'
    }
  }

  return (
    <AnimatePresence>
      <motion.div
        key={notification.id}
        initial={{ opacity: 0, y: -50, scale: 0.9 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: -50, scale: 0.9 }}
        className="fixed top-6 right-6 z-[10000]"
      >
        <div className={`bg-gradient-to-r ${getColors()} rounded-xl px-6 py-4 shadow-2xl border-l-4 min-w-[320px] max-w-md`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex-shrink-0">
                {getIcon()}
              </div>
              <p className="text-sm font-medium">
                {notification.message}
              </p>
            </div>
            <button
              onClick={onClose}
              className="flex-shrink-0 ml-3 p-1 rounded-full hover:bg-white/20 transition-colors"
            >
              <FaTimes className="w-4 h-4" />
            </button>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  )
}

export default Notification