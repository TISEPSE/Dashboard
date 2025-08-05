"use client"

// Optimisations de performance globales pour l'application

// Debounce function pour limiter les appels excessifs
export const debounce = (func, wait) => {
  let timeout
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout)
      func(...args)
    }
    clearTimeout(timeout)
    timeout = setTimeout(later, wait)
  }
}

// Throttle function pour limiter la fréquence des appels
export const throttle = (func, limit) => {
  let inThrottle
  return function() {
    const args = arguments
    const context = this
    if (!inThrottle) {
      func.apply(context, args)
      inThrottle = true
      setTimeout(() => inThrottle = false, limit)
    }
  }
}

// Cache simple avec expiration
export class SimpleCache {
  constructor(ttl = 5000) {
    this.cache = new Map()
    this.ttl = ttl
  }

  set(key, value) {
    this.cache.set(key, {
      value,
      timestamp: Date.now()
    })
  }

  get(key) {
    const item = this.cache.get(key)
    if (!item) return null
    
    if (Date.now() - item.timestamp > this.ttl) {
      this.cache.delete(key)
      return null
    }
    
    return item.value
  }

  clear() {
    this.cache.clear()
  }

  has(key) {
    const item = this.cache.get(key)
    if (!item) return false
    
    if (Date.now() - item.timestamp > this.ttl) {
      this.cache.delete(key)
      return false
    }
    
    return true
  }
}

// Optimisation des événements de scroll
export const optimizeScrollEvents = () => {
  let ticking = false
  
  return (callback) => {
    return (event) => {
      if (!ticking) {
        requestAnimationFrame(() => {
          callback(event)
          ticking = false
        })
        ticking = true
      }
    }
  }
}

// Optimisation des re-renders avec comparaison shallow
export const shallowEqual = (obj1, obj2) => {
  const keys1 = Object.keys(obj1)
  const keys2 = Object.keys(obj2)
  
  if (keys1.length !== keys2.length) {
    return false
  }
  
  for (let key of keys1) {
    if (obj1[key] !== obj2[key]) {
      return false
    }
  }
  
  return true
}

// Hook pour prévenir les re-renders inutiles
export const usePrevious = (value) => {
  const ref = useRef()
  useEffect(() => {
    ref.current = value
  })
  return ref.current
}

// Optimisation des images lazy loading
export const createImageObserver = (callback) => {
  if (typeof window === 'undefined') return null
  
  return new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        callback(entry.target)
      }
    })
  }, {
    rootMargin: '50px'
  })
}

// Suppression des logs en production
export const isDevelopment = process.env.NODE_ENV === 'development'

export const safeLog = isDevelopment ? console.log : () => {}
export const safeWarn = isDevelopment ? console.warn : () => {}
export const safeError = isDevelopment ? console.error : () => {}

// Cache global pour les préférences
export const PreferencesCache = new SimpleCache(10000) // 10 secondes

// Optimisation pour Fast Refresh
if (typeof window !== 'undefined' && isDevelopment) {
  // Réduire la fréquence des Fast Refresh
  let refreshTimeout
  const originalHotReload = window.__webpack_require__?.hot?.accept
  
  if (originalHotReload) {
    window.__webpack_require__.hot.accept = (...args) => {
      clearTimeout(refreshTimeout)
      refreshTimeout = setTimeout(() => {
        originalHotReload.apply(this, args)
      }, 100) // Debounce de 100ms
    }
  }
}