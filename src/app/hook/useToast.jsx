import { useState, useCallback } from 'react'

export const useToast = () => {
  const [toast, setToast] = useState({ 
    isVisible: false, 
    message: '', 
    type: 'success' 
  })

  const showToast = useCallback((message, type = 'success', needsAuth = false) => {
    setToast({ isVisible: true, message, type, needsAuth })
  }, [])

  const hideToast = useCallback(() => {
    setToast(prev => ({ ...prev, isVisible: false }))
  }, [])

  return {
    toast,
    showToast,
    hideToast
  }
}