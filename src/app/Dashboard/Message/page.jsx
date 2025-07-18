"use client"

import { useState, useEffect } from "react"
import { useSession, signIn, signOut } from "next-auth/react"
import Loader from "../../components/Loader"

export default function MessagePage() {
  const { data: session, status } = useSession()
  const [emails, setEmails] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [selectedCategory, setSelectedCategory] = useState("primary")
  const [selectedEmail, setSelectedEmail] = useState(null)
  const [showLogoutModal, setShowLogoutModal] = useState(false)

  const categories = [
    { id: "primary", name: "Principal", icon: "📨", color: "bg-green-500" },
    { id: "social", name: "Réseaux sociaux", icon: "👥", color: "bg-purple-500" },
    { id: "promotions", name: "Promotions", icon: "🏷️", color: "bg-orange-500" },
    { id: "updates", name: "Mises à jour", icon: "🔄", color: "bg-cyan-500" },
    { id: "notifications", name: "Notifications", icon: "🔔", color: "bg-yellow-500" }
  ]

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

  const filteredEmails = selectedCategory === "primary" 
    ? emails.filter(email => !['social', 'promotions', 'updates', 'notifications'].includes(email.category))
    : emails.filter(email => email.category === selectedCategory)

  const formatDate = (dateString) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffTime = Math.abs(now - date)
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    
    if (diffDays === 1) return "Aujourd'hui"
    if (diffDays === 2) return "Hier"
    if (diffDays <= 7) return `Il y a ${diffDays} jours`
    return date.toLocaleDateString()
  }

  const getCategoryCount = (categoryId) => {
    if (categoryId === "primary") {
      return emails.filter(email => !['social', 'promotions', 'updates', 'notifications'].includes(email.category)).length
    }
    return emails.filter(email => email.category === categoryId).length
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
    <div className="min-h-screen bg-[#212332] text-white">
      <div className="max-w-7xl mx-auto p-6">
        <style jsx>{`
          .scrollbar-thin {
            scrollbar-width: thin;
          }
          
          .scrollbar-thumb-gray-600::-webkit-scrollbar {
            width: 8px;
          }
          
          .scrollbar-thumb-gray-600::-webkit-scrollbar-track {
            background: #1f2937;
          }
          
          .scrollbar-thumb-gray-600::-webkit-scrollbar-thumb {
            background: #4b5563;
            border-radius: 4px;
          }
          
          .scrollbar-thumb-gray-600::-webkit-scrollbar-thumb:hover {
            background: #6b7280;
          }
        `}</style>
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-3">
            <img 
              src={session?.user?.image || "https://upload.wikimedia.org/wikipedia/commons/7/7e/Gmail_icon_%282020%29.svg"} 
              alt="Profil" 
              className="w-8 h-8 rounded-full"
            />
            <div>
              <h1 className="text-2xl font-bold text-white">Messagerie</h1>
              <p className="text-gray-400 text-sm">{session?.user?.email}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button 
              onClick={fetchEmails}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors duration-200 flex items-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              Actualiser
            </button>
            <button 
              onClick={() => setShowLogoutModal(true)}
              className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg transition-colors duration-200 flex items-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
              Se déconnecter
            </button>
          </div>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-600/20 border border-red-500 text-red-300 rounded-lg">
            {error}
          </div>
        )}

        {/* Main Content - Email List */}
        <div className="bg-[#2a2d3e] rounded-xl border border-gray-600/30 overflow-hidden shadow-lg">
          <div className="p-6 border-b border-gray-600/30">
            <div className="flex flex-col gap-4">
              <h3 className="text-xl font-semibold text-white">
                {categories.find(c => c.id === selectedCategory)?.name || "Principal"} 
                <span className="text-gray-400 ml-2">({filteredEmails.length})</span>
              </h3>
              
              {/* Sélecteur de catégorie intégré - Plus grand */}
              <div className="flex items-center gap-3">
                <span className="text-base text-gray-400 font-medium">Filtrer:</span>
                <div className="flex items-center gap-2 flex-wrap">
                  {categories.map((category) => (
                    <button
                      key={category.id}
                      onClick={() => setSelectedCategory(category.id)}
                      className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 flex items-center gap-2 transform hover:scale-105 ${
                        selectedCategory === category.id
                          ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-lg'
                          : 'bg-gray-700 text-gray-300 hover:bg-gray-600 hover:text-white'
                      }`}
                    >
                      <span className="text-base">{category.icon}</span>
                      <span className="hidden sm:inline">{category.name}</span>
                      <span className={`px-2 py-1 rounded-full text-xs font-bold ${
                        selectedCategory === category.id
                          ? 'bg-white/20 text-white'
                          : 'bg-gray-600 text-white'
                      }`}>
                        {getCategoryCount(category.id)}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
          
          {/* Container des emails avec effet slide */}
          <div className="h-[calc(100vh-200px)] overflow-y-auto scrollbar-thin scrollbar-thumb-gray-600 scrollbar-track-gray-800">
            {filteredEmails.length === 0 ? (
              <div className="text-center text-gray-400 py-16">
                <span className="text-6xl mb-6 block">📭</span>
                <p className="text-lg">Aucun email dans cette catégorie</p>
              </div>
            ) : (
              <div className="space-y-1">
                {filteredEmails.map((email, index) => (
                  <div
                    key={email.id}
                    className={`p-3 border-b border-gray-600/20 hover:bg-gray-700/30 cursor-pointer transition-all duration-300 transform hover:translate-x-1 hover:shadow-md ${
                      email.isUnread ? 'bg-blue-600/5 border-l-4 border-l-blue-500' : ''
                    }`}
                    onClick={() => setSelectedEmail(email)}
                    style={{
                      animationDelay: `${index * 0.05}s`
                    }}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-3 flex-1">
                        {/* Avatar */}
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold text-xs shadow-md">
                          {email.from.charAt(0).toUpperCase()}
                        </div>
                        
                        {/* Email Content */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <span className={`font-medium text-sm ${email.isUnread ? 'text-white' : 'text-gray-300'}`}>
                              {email.from}
                            </span>
                            {email.isImportant && (
                              <span className="text-yellow-400 text-xs">⭐</span>
                            )}
                            <span className="text-gray-500 text-xs">
                              {email.email}
                            </span>
                          </div>
                          
                          <h4 className={`font-medium mb-1 text-sm ${email.isUnread ? 'text-white' : 'text-gray-300'}`}>
                            {email.subject}
                          </h4>
                          
                          <p className="text-gray-400 text-xs line-clamp-1">
                            {email.snippet}
                          </p>
                        </div>
                      </div>
                      
                      {/* Date and Category */}
                      <div className="flex flex-col items-end gap-1 ml-4">
                        <span className="text-gray-400 text-xs">
                          {formatDate(email.date)}
                        </span>
                        <span className={`text-xs px-2 py-1 rounded-full shadow-sm ${
                          categories.find(c => c.id === email.category)?.color || 'bg-gray-600'
                        } text-white`}>
                          {categories.find(c => c.id === email.category)?.icon}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>


        {/* Modal de confirmation de déconnexion */}
        {showLogoutModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-[#2a2d3e] border border-gray-600/30 rounded-xl p-6 max-w-md w-full mx-4">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-red-600 rounded-full flex items-center justify-center">
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-white">Confirmer la déconnexion</h3>
              </div>
              
              <p className="text-gray-300 mb-6">
                Êtes-vous sûr de vouloir vous déconnecter ? Vous devrez vous reconnecter pour accéder à nouveau à vos emails.
              </p>
              
              <div className="flex gap-3 justify-end">
                <button 
                  onClick={() => setShowLogoutModal(false)}
                  className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg transition-colors duration-200"
                >
                  Annuler
                </button>
                <button 
                  onClick={() => {
                    setShowLogoutModal(false)
                    signOut()
                  }}
                  className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg transition-colors duration-200"
                >
                  Se déconnecter
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}