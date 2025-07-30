import React, { useState, useEffect } from 'react'

const Toast = ({ message, type = 'success', isVisible, onClose, duration = 3000, needsAuth = false }) => {
  const [shouldRender, setShouldRender] = useState(false)
  const [animationClass, setAnimationClass] = useState('')

  useEffect(() => {
    if (isVisible) {
      setShouldRender(true)
      // Petite attente pour déclencher l'animation d'entrée
      setTimeout(() => {
        setAnimationClass(needsAuth ? 'animate-toast-in animate-shake' : 'animate-toast-in')
      }, 10)
      
      const timer = setTimeout(() => {
        setAnimationClass('animate-toast-out')
        // Attendre la fin de l'animation avant de masquer
        setTimeout(() => {
          setShouldRender(false)
          onClose()
        }, 300)
      }, needsAuth ? duration * 1.5 : duration) // Plus long pour les erreurs d'auth
      return () => clearTimeout(timer)
    }
  }, [isVisible, onClose, duration, needsAuth])

  if (!shouldRender) return null

  const getToastStyles = () => {
    const baseStyles = `fixed top-4 right-4 z-50 px-4 py-3 rounded-lg shadow-lg transform transition-all duration-300 ease-in-out flex items-center gap-3 max-w-sm ${animationClass}`
    
    switch (type) {
      case 'success':
        return `${baseStyles} bg-emerald-600 text-white border border-emerald-500`
      case 'error':
        return `${baseStyles} ${needsAuth ? 'bg-gradient-to-r from-blue-600 to-indigo-600' : 'bg-red-600'} text-white border ${needsAuth ? 'border-blue-500' : 'border-red-500'}`
      case 'info':
        return `${baseStyles} bg-blue-600 text-white border border-blue-500`
      default:
        return `${baseStyles} bg-gray-600 text-white border border-gray-500`
    }
  }

  const getIcon = () => {
    switch (type) {
      case 'success':
        return '✓'
      case 'error':
        return '✕'
      case 'info':
        return 'ℹ'
      default:
        return '•'
    }
  }

  return (
    <div className={getToastStyles()}>
      <div className="flex-shrink-0 w-5 h-5 rounded-full bg-white/20 flex items-center justify-center text-sm font-bold">
        {getIcon()}
      </div>
      <div className="flex-1 text-sm font-medium">
        {message}
      </div>
    </div>
  )
}

export default Toast