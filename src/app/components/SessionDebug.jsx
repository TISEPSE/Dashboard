"use client"
import { useAuth } from '../context/AuthContext'

export default function SessionDebug() {
  const { user, authenticated, loading } = useAuth()
  
  if (process.env.NODE_ENV !== 'development') return null
  
  return (
    <div className="fixed top-4 right-4 z-[999] bg-black/80 text-white p-4 rounded-lg text-xs max-w-sm">
      <div className="font-bold mb-2">Auth Debug:</div>
      <div>Loading: <span className="text-yellow-300">{loading ? 'Oui' : 'Non'}</span></div>
      <div>Authenticated: {authenticated ? '✅ Oui' : '❌ Non'}</div>
      {user && (
        <>
          <div>Nom: <span className="text-green-300">{user.name || 'N/A'}</span></div>
          <div>Email: <span className="text-green-300">{user.email || 'N/A'}</span></div>
          <div>Image: {user.image ? '✅ Oui' : '❌ Non'}</div>
        </>
      )}
    </div>
  )
}