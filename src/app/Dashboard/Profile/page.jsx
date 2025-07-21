"use client"

import { useState, useEffect } from "react"
import { useSession, signIn, signOut } from 'next-auth/react'
import Loader from "../../components/Loader"

export default function Profile(){
    const [isLoading, setIsLoading] = useState(true)
    const { data: session, status } = useSession()
    const [isSigningIn, setIsSigningIn] = useState(false)
    const [isSigningOut, setIsSigningOut] = useState(false)

    useEffect(() => {
        const timer = setTimeout(() => setIsLoading(false), 1000)
        return () => clearTimeout(timer)
    }, [])

    const handleSignIn = async () => {
        setIsSigningIn(true)
        try {
            await signIn('google')
        } catch (error) {
            console.error('Erreur de connexion:', error)
        } finally {
            setIsSigningIn(false)
        }
    }

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

    if (isLoading) {
        return <Loader />
    }

    return(
        <div className="min-h-screen bg-gradient-to-br from-[#1a1d29] to-[#212332] px-6">
            <div className="max-w-7xl mx-auto">
                <div className="flex flex-col justify-center items-center min-h-screen"> 
                    <h1 className="font-bold text-4xl text-white mb-8">Page du Profile</h1>
                    
                    {!session && (
                        <div className="flex flex-col items-center gap-6">
                            <p className="text-gray-300 text-center mb-4">
                                Connectez-vous pour accéder à votre profil
                            </p>
                            <button
                                onClick={handleSignIn}
                                disabled={isSigningIn}
                                className="flex items-center justify-center gap-3 bg-white hover:bg-gray-50 text-gray-700 px-4 py-2.5 rounded-lg border border-gray-300 hover:border-gray-400 transition-all duration-200 disabled:opacity-50 shadow-sm hover:shadow-md w-full max-w-[280px]"
                            >
                                <svg className="w-5 h-5" viewBox="0 0 24 24">
                                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                                </svg>
                                <span className="font-medium text-sm">
                                    {isSigningIn ? 'Connexion...' : 'Se connecter avec Google'}
                                </span>
                            </button>
                        </div>
                    )}

                    {session && (
                        <div className="flex flex-col items-center gap-6">
                            <div className="flex items-center gap-4 bg-[#2a2d3e] px-6 py-4 rounded-lg border border-gray-600/30">
                                <img 
                                    src={session.user.image} 
                                    alt={session.user.name}
                                    className="w-16 h-16 rounded-full"
                                />
                                <div>
                                    <h2 className="text-xl font-semibold text-white">{session.user.name}</h2>
                                    <p className="text-gray-400">{session.user.email}</p>
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