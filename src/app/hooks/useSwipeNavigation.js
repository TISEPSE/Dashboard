import { useEffect, useRef, useState } from 'react'

export const useSwipeNavigation = (onSwipeLeft, onSwipeRight, enabled = true) => {
  const touchStartX = useRef(null)
  const touchStartY = useRef(null)
  const elementRef = useRef(null)
  const [isSwiping, setIsSwiping] = useState(false)

  useEffect(() => {
    if (!enabled) return

    const element = elementRef.current
    if (!element) return

    const handleTouchStart = (e) => {
      // Ne pas déclencher si on touche un élément interactif
      if (e.target.closest('button, a, input, select, textarea, .no-swipe')) {
        return
      }

      touchStartX.current = e.touches[0].clientX
      touchStartY.current = e.touches[0].clientY
      setIsSwiping(false)
    }

    const handleTouchMove = (e) => {
      if (touchStartX.current === null || touchStartY.current === null) {
        return
      }

      const touchEndX = e.touches[0].clientX
      const touchEndY = e.touches[0].clientY
      const diffX = touchStartX.current - touchEndX
      const diffY = touchStartY.current - touchEndY

      // Vérifier si c'est un swipe horizontal (plus horizontal que vertical)
      if (Math.abs(diffX) > Math.abs(diffY) && Math.abs(diffX) > 30) {
        setIsSwiping(true)
        // Prévenir le scroll horizontal si c'est un swipe valide
        e.preventDefault()
      }
    }

    const handleTouchEnd = (e) => {
      if (touchStartX.current === null || touchStartY.current === null) {
        return
      }

      const touchEndX = e.changedTouches[0].clientX
      const touchEndY = e.changedTouches[0].clientY
      const diffX = touchStartX.current - touchEndX
      const diffY = touchStartY.current - touchEndY

      // Seuils pour déclencher le swipe
      const minSwipeDistance = 50 // Distance minimum
      const maxVerticalDistance = 100 // Distance verticale maximum pour valider un swipe horizontal

      // Vérifier si c'est un swipe horizontal valide
      if (Math.abs(diffX) > minSwipeDistance && Math.abs(diffY) < maxVerticalDistance) {
        if (diffX > 0) {
          // Swipe vers la gauche (aller vers le futur)
          onSwipeLeft && onSwipeLeft()
        } else {
          // Swipe vers la droite (aller vers le passé)
          onSwipeRight && onSwipeRight()
        }
      }

      // Reset
      touchStartX.current = null
      touchStartY.current = null
      setIsSwiping(false)
    }

    // Ajouter les event listeners avec options pour améliorer les performances
    const options = { passive: false }
    element.addEventListener('touchstart', handleTouchStart, options)
    element.addEventListener('touchmove', handleTouchMove, options)
    element.addEventListener('touchend', handleTouchEnd, options)

    return () => {
      element.removeEventListener('touchstart', handleTouchStart, options)
      element.removeEventListener('touchmove', handleTouchMove, options)
      element.removeEventListener('touchend', handleTouchEnd, options)
    }
  }, [onSwipeLeft, onSwipeRight, enabled])

  return { elementRef, isSwiping }
}