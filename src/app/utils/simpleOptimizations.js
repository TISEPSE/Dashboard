"use client"

// Optimisations simples sans modification d'objets globaux

// Cache simple pour éviter les recalculs
const cache = new Map()

export const memoize = (fn, keyFn = (...args) => JSON.stringify(args)) => {
  return (...args) => {
    const key = keyFn(...args)
    if (cache.has(key)) {
      return cache.get(key)
    }
    const result = fn(...args)
    cache.set(key, result)
    
    // Nettoyer le cache après 5 minutes
    setTimeout(() => cache.delete(key), 5 * 60 * 1000)
    
    return result
  }
}

// Debounce simple
export const debounceSimple = (fn, delay) => {
  let timeoutId
  return (...args) => {
    clearTimeout(timeoutId)
    timeoutId = setTimeout(() => fn(...args), delay)
  }
}

// Throttle simple
export const throttleSimple = (fn, limit) => {
  let inThrottle
  return (...args) => {
    if (!inThrottle) {
      fn.apply(this, args)
      inThrottle = true
      setTimeout(() => inThrottle = false, limit)
    }
  }
}

// Optimisations CSS pour GPU faibles
if (typeof window !== 'undefined') {
  // Détecter les GPU faibles de manière simple
  const canvas = document.createElement('canvas')
  const gl = canvas.getContext('webgl')
  
  if (gl) {
    const renderer = gl.getParameter(gl.RENDERER) || ''
    const isLowEndGPU = /Intel.*HD|Mali|Adreno [0-9][0-9][0-9]|PowerVR/i.test(renderer)
    
    if (isLowEndGPU) {
      // Ajouter du CSS pour optimiser les GPU faibles
      const style = document.createElement('style')
      style.textContent = `
        .backdrop-blur-sm,
        .backdrop-blur-md,
        .backdrop-blur-lg,
        .backdrop-blur-xl {
          backdrop-filter: none !important;
          background-color: rgba(0, 0, 0, 0.85) !important;
        }
        
        .shadow-lg,
        .shadow-xl,
        .shadow-2xl {
          box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2) !important;
        }
      `
      document.head.appendChild(style)
      document.documentElement.classList.add('low-end-gpu')
    }
  }
  
  canvas.remove()
}

export default {
  memoize,
  debounceSimple,
  throttleSimple
}