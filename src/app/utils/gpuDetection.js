"use client"

// Détection des capacités GPU et optimisations automatiques

let gpuCapabilities = null

export const detectGPUCapabilities = () => {
  if (typeof window === 'undefined') return null
  
  if (gpuCapabilities !== null) {
    return gpuCapabilities
  }
  
  const canvas = document.createElement('canvas')
  const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl')
  
  if (!gl) {
    gpuCapabilities = {
      hasWebGL: false,
      hasBackdropFilter: false,
      shouldUseGPU: false,
      maxTextureSize: 0
    }
    return gpuCapabilities
  }
  
  // Tester le support backdrop-filter
  const testElement = document.createElement('div')
  testElement.style.backdropFilter = 'blur(1px)'
  const hasBackdropFilter = testElement.style.backdropFilter !== ''
  
  // Obtenir les limites GPU
  const maxTextureSize = gl.getParameter(gl.MAX_TEXTURE_SIZE)
  const renderer = gl.getParameter(gl.RENDERER)
  
  // Détecter les GPU faibles
  const isLowEndGPU = /Intel.*HD|Mali|Adreno [0-9][0-9][0-9]|PowerVR/.test(renderer)
  
  gpuCapabilities = {
    hasWebGL: true,
    hasBackdropFilter,
    shouldUseGPU: !isLowEndGPU && maxTextureSize >= 4096,
    maxTextureSize,
    renderer,
    isLowEndGPU
  }
  
  // Nettoyer
  canvas.remove()
  testElement.remove()
  
  return gpuCapabilities
}

export const applyGPUOptimizations = () => {
  if (typeof window === 'undefined') return
  
  const capabilities = detectGPUCapabilities()
  
  if (!capabilities.shouldUseGPU) {
    // Ajouter une classe CSS pour désactiver les effets GPU
    document.documentElement.classList.add('no-gpu')
    
    // Supprimer les backdrop-filter
    const style = document.createElement('style')
    style.textContent = `
      .backdrop-blur-sm,
      .backdrop-blur-md,
      .backdrop-blur-lg,
      .backdrop-blur-xl {
        backdrop-filter: none !important;
        background-color: rgba(0, 0, 0, 0.9) !important;
      }
    `
    document.head.appendChild(style)
  }
  
  // Stocker la configuration pour d'autres parties de l'app
  window.gpuOptimizations = {
    capabilities,
    shouldUseGPU: capabilities.shouldUseGPU,
    isLowEndGPU: capabilities.isLowEndGPU
  }
}

// Initialiser au chargement
if (typeof window !== 'undefined') {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', applyGPUOptimizations)
  } else {
    applyGPUOptimizations()
  }
}

export default {
  detectGPUCapabilities,
  applyGPUOptimizations
}