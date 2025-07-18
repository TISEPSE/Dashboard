import React, { useState, useEffect } from 'react'

const Toast = ({ message, type = 'success', isVisible, onClose, duration = 3000 }) => {
  useEffect(() => {
    if (isVisible) {
      const timer = setTimeout(() => {
        onClose()
      }, duration)
      return () => clearTimeout(timer)
    }
  }, [isVisible, onClose, duration])

  if (!isVisible) return null

  const getToastStyles = () => {
    const baseStyles = "fixed top-4 right-4 z-50 px-4 py-3 rounded-lg shadow-lg transform transition-all duration-300 ease-in-out flex items-center gap-3 max-w-sm"
    
    switch (type) {
      case 'success':
        return `${baseStyles} bg-emerald-600 text-white border border-emerald-500`
      case 'error':
        return `${baseStyles} bg-red-600 text-white border border-red-500`
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
      <button
        onClick={onClose}
        className="flex-shrink-0 w-5 h-5 rounded-full hover:bg-white/20 flex items-center justify-center text-xs transition-colors"
      >
        ✕
      </button>
    </div>
  )
}

export default Toast