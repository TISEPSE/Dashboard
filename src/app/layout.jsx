"use client"
import { useState, memo, useCallback } from "react"
import { AuthProvider } from "./context/AuthContext"
import Navbar from "./components/navbar"
import PageTransition from "./components/PageTransition"
import { CryptoProvider } from "./context/CryptoContext"
import { FavoritesProvider } from "./context/FavoritesContext"
import ErrorBoundary from "./components/ErrorBoundary"
import { Geist, Geist_Mono } from "next/font/google"
import "./globals.css"
import "./utils/gpuOptimizations.css"
import "./utils/performanceOptimizations"
import "./utils/simpleOptimizations"
// import { SpeedInsights } from "@vercel/speed-insights/next"
// import "./utils/suppressDevErrors" // Désactivé temporairement

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] })
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] })

const RootLayout = memo(function RootLayout({ children }) {
  const [isOpen, setIsOpen] = useState(false)
  
  // Optimiser les callbacks pour éviter les re-renders
  const handleNavbarToggle = useCallback((newState) => {
    setIsOpen(newState)
  }, [])

  return (
    <html lang="fr">
      <body className={`${geistSans.variable} ${geistMono.variable}`}>
        <ErrorBoundary>
          <AuthProvider>
            <FavoritesProvider>
              <CryptoProvider>
                <Navbar isOpen={isOpen} setIsOpen={handleNavbarToggle} />
                <main
                  className={`transition-all duration-300 ease-in-out ${
                    isOpen ? "md:ml-64" : "md:ml-16"
                  } pb-20 md:pb-0`}
                >
                  <PageTransition>
                    {children}
                  </PageTransition>
                </main>
              </CryptoProvider>
            </FavoritesProvider>
          </AuthProvider>
        </ErrorBoundary>
        {/* <SpeedInsights /> */}
      </body>
    </html>
  )
})

export default RootLayout