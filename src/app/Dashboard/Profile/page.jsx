"use client"

import { useState, useEffect } from "react"
import { useAuth } from "../../context/AuthContext"
import { FaUser } from "react-icons/fa"
import LoaderPortal from "../../components/LoaderPortal"
import GoogleSignInButton from "../../components/GoogleSignInButton"

export default function Profile(){
    const [isLoading, setIsLoading] = useState(true)
    const { user, authenticated, loading, signIn, signOut } = useAuth()
    const [isSigningOut, setIsSigningOut] = useState(false)

    console.log('🔍 [Profile Debug]', 'Authenticated:', authenticated)
    console.log('🔍 [Profile Debug]', 'User:', user)
    console.log('🔍 [Profile Debug]', 'Loading:', loading)

    useEffect(() => {
        const timer = setTimeout(() => setIsLoading(false), 1000)
        return () => clearTimeout(timer)
    }, [])

    const handleSignOut = async () => {
        setIsSigningOut(true)
        try {
            await signOut()
        } catch (error) {
            console.error('Erreur de déconnexion:', error)
        } finally {
            setIsSigningOut(false)
        }
    }

    const handleSignIn = () => {
        signIn()
    }

    if (isLoading || loading) {
        return <LoaderPortal />
    }

    return(
        <div className="min-h-screen bg-gradient-to-br from-[#1a1d29] to-[#212332] px-6">
            <div className="max-w-7xl mx-auto">
                <div className="flex flex-col justify-center items-center min-h-screen"> 
                    <h1 className="font-bold text-4xl text-white mb-8">Page du Profile</h1>
                    
                    {!authenticated && (
                        <div className="flex flex-col items-center gap-6">
                            <p className="text-gray-300 text-center mb-4">
                                Connectez-vous pour accéder à votre profil
                            </p>
                            <GoogleSignInButton 
                                onClick={handleSignIn}
                                size="large"
                            />
                        </div>
                    )}

                    {authenticated && user && (
                        <div className="flex flex-col items-center gap-6">
                            <div className="flex items-center gap-4 bg-[#2a2d3e] px-6 py-4 rounded-lg border border-gray-600/30">
                                <div className="w-16 h-16 rounded-full flex items-center justify-center bg-gradient-to-br from-[#3A6FF8] to-[#2952d3] overflow-hidden">
                                    {user.image ? (
                                        <img 
                                            src={user.image} 
                                            alt={user.name}
                                            className="w-full h-full object-cover"
                                        />
                                    ) : (
                                        <FaUser className="w-7 h-7 text-white" />
                                    )}
                                </div>
                                <div>
                                    <h2 className="text-xl font-semibold text-white">{user.name}</h2>
                                    <p className="text-gray-400">{user.email}</p>
                                </div>
                            </div>
                            <p className="text-gray-300 text-center mb-4">
                                Profil connecté avec succès
                            </p>
                            <button
                                onClick={handleSignOut}
                                disabled={isSigningOut}
                                className="flex items-center justify-center gap-3 bg-red-600/80 hover:bg-red-600 text-white px-6 py-3 rounded-lg transition-colors disabled:opacity-50 shadow-sm hover:shadow-md"
                            >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                                </svg>
                                <span className="font-medium">
                                    {isSigningOut ? 'Déconnexion...' : 'Se déconnecter'}
                                </span>
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}