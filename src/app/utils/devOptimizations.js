"use client"

import { useRef, useCallback } from 'react'

// Optimisations spécifiques pour le développement

// Optimisations de développement non-intrusives
let refreshTimeout
let refreshCount = 0
const MAX_REFRESHES_PER_SECOND = 3

// Surveillance des performances en mode développement
if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
  // Débouncer simple pour les événements de performance
  window.devOptimizations = {
    lastRefresh: 0,
    refreshCount: 0,
    
    shouldThrottle() {
      const now = Date.now()
      if (now - this.lastRefresh < 1000) {
        this.refreshCount++
        return this.refreshCount > MAX_REFRESHES_PER_SECOND
      } else {
        this.refreshCount = 0
        this.lastRefresh = now
        return false
      }
    }
  }
}

// Hook pour des callbacks stables
export const useStableCallback = (callback, deps = []) => {
  const callbackRef = useRef(callback)
  const depsRef = useRef(deps)
  
  // Vérifier si les dépendances ont changé
  const hasChanged = !depsRef.current || 
    deps.length !== depsRef.current.length ||
    deps.some((dep, i) => dep !== depsRef.current[i])
  
  if (hasChanged) {
    callbackRef.current = callback
    depsRef.current = deps
  }
  
  return useCallback((...args) => callbackRef.current(...args), [])
}

// Hook pour éviter les re-renders inutiles
export const useShallowMemo = (factory, deps) => {
  const prevDeps = useRef()
  const memoizedValue = useRef()
  
  const hasChanged = !prevDeps.current || 
    deps.length !== prevDeps.current.length ||
    deps.some((dep, i) => dep !== prevDeps.current[i])
  
  if (hasChanged) {
    memoizedValue.current = factory()
    prevDeps.current = deps
  }
  
  return memoizedValue.current
}

// Cache pour éviter les recalculs
const computationCache = new Map()

export const useMemoizedComputation = (key, computation, deps) => {
  const depsString = JSON.stringify(deps)
  const cacheKey = `${key}-${depsString}`
  
  if (computationCache.has(cacheKey)) {
    return computationCache.get(cacheKey)
  }
  
  const result = computation()
  computationCache.set(cacheKey, result)
  
  // Nettoyer le cache après 5 minutes
  setTimeout(() => {
    computationCache.delete(cacheKey)
  }, 5 * 60 * 1000)
  
  return result
}

export default {
  useStableCallback,
  useShallowMemo,
  useMemoizedComputation
}