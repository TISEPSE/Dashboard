"use client"

import { useState, useEffect } from "react"
import { useSession, signIn } from "next-auth/react"
import Loader from "../../components/Loader"

export default function MessagePage() {
  const { data: session, status } = useSession()
  const [emails, setEmails] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (status === "authenticated") {
      fetchEmails()
    } else if (status === "loading") {
      setLoading(true)
    } else {
      setLoading(false)
    }
  }, [status])

  const fetchEmails = async () => {
    try {
      setLoading(true)
      setError(null)
      
      const response = await fetch('/api/gmail')
      if (!response.ok) {
        throw new Error('Erreur lors de la récupération des emails')
      }
      
      const data = await response.json()
      setEmails(data.messages || [])
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return <Loader />
  }

  if (status === "unauthenticated") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#1a1d29] to-[#212332] p-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col justify-center items-center min-h-screen">
            <h1 className="font-bold text-4xl text-white mb-4">Messagerie Gmail</h1>
            <p className="text-gray-300 mb-6">Connectez-vous pour accéder à vos emails</p>
            <button 
              onClick={() => signIn('google')}
              className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
            >
              Se connecter avec Google
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#1a1d29] to-[#212332] p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-6">
          <h1 className="font-bold text-4xl text-white mb-4">Messagerie Gmail</h1>
          <p className="text-gray-300">Connecté en tant que: {session?.user?.email}</p>
          <button 
            onClick={fetchEmails}
            className="mt-4 bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded"
          >
            Actualiser
          </button>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-600 text-white rounded">
            Erreur: {error}
          </div>
        )}

        <div className="grid gap-4">
          {emails.length === 0 ? (
            <div className="text-center text-gray-300 py-8">
              Aucun email trouvé
            </div>
          ) : (
            emails.map((email) => (
              <div key={email.id} className="bg-[#2a2d3a] rounded-lg p-4 border border-gray-600">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="text-white font-semibold text-lg">{email.subject}</h3>
                  <span className="text-gray-400 text-sm">{new Date(email.date).toLocaleDateString()}</span>
                </div>
                <p className="text-gray-300 text-sm mb-2">De: {email.from}</p>
                <p className="text-gray-400 text-sm">{email.snippet}</p>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  )
}