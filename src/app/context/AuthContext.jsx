"use client"
import { createContext, useContext, useState, useEffect } from 'react'

const AuthContext = createContext({})

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [authenticated, setAuthenticated] = useState(false)

  // Charger la session au démarrage
  useEffect(() => {
    checkSession()
  }, [])

  const checkSession = async () => {
    try {
      // Récupérer le cookie côté client
      const getCookie = (name) => {
        const value = `; ${document.cookie}`
        const parts = value.split(`; ${name}=`)
        if (parts.length === 2) return parts.pop().split(';').shift()
        return null
      }
      
      const sessionCookie = getCookie('auth-session')
      
      if (!sessionCookie) {
        setUser(null)
        setAuthenticated(false)
        setLoading(false)
        return
      }
      
      try {
        const sessionData = JSON.parse(decodeURIComponent(sessionCookie))
        
        // Vérifier si le token n'est pas expiré
        if (Date.now() > sessionData.expiresAt) {
          // Token expiré, supprimer le cookie
          document.cookie = 'auth-session=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;'
          setUser(null)
          setAuthenticated(false)
        } else {
          // Session valide
          setUser(sessionData.user)
          setAuthenticated(true)
        }
      } catch (parseError) {
        console.error('❌ Erreur parsing session:', parseError)
        setUser(null)
        setAuthenticated(false)
      }
    } catch (error) {
      console.error('❌ Erreur vérification session:', error)
      setUser(null)
      setAuthenticated(false)
    } finally {
      setLoading(false)
    }
  }

  const signIn = () => {
    window.location.href = '/api/auth/google'
  }

  const signOut = async () => {
    try {
      // Supprimer le cookie côté client
      document.cookie = 'auth-session=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;'
      setUser(null)
      setAuthenticated(false)
      window.location.reload()
    } catch (error) {
      console.error('❌ Erreur déconnexion:', error)
    }
  }

  const value = {
    user,
    loading,
    authenticated,
    signIn,
    signOut,
    checkSession
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}